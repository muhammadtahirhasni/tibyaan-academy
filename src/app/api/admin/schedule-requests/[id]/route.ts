import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, scheduleRequests, notifications, enrollments, classes } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// Returns next UTC Date when dayName occurs at timeStr in the given timezone (starting tomorrow)
function nextOccurrenceUTC(dayName: string, timeStr: string, timezone: string): Date {
  const dayMap: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  };
  const target = dayMap[dayName] ?? 1;
  const [h, m] = (timeStr || "09:00").split(":").map(Number);

  const now = new Date();

  for (let i = 1; i <= 8; i++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + i);

    // Get weekday in target timezone
    const weekdayLong = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
    }).format(candidate);
    const localDayNum = dayMap[weekdayLong] ?? -1;

    if (localDayNum === target) {
      // Get the local date string (YYYY-MM-DD) in the target timezone
      const localDateStr = candidate.toLocaleDateString("en-CA", { timeZone: timezone });

      // Build a naive UTC date using local date + local time, then correct for offset
      const naiveUtc = new Date(`${localDateStr}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00Z`);

      // Compute offset: get what the timezone says this UTC time is (in UTC), vs the UTC time
      const localStr = naiveUtc.toLocaleString("en-US", {
        timeZone: timezone,
        hour12: false,
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
      // Parse "MM/DD/YYYY, HH:mm:ss" → treat as UTC to get offset
      const localAsUtc = new Date(
        localStr.replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, "$3-$1-$2T$4:$5:$6Z")
          .replace("T24:", "T00:") // handle midnight edge case
      );
      const offsetMs = naiveUtc.getTime() - localAsUtc.getTime();
      const scheduledAt = new Date(naiveUtc.getTime() + offsetMs);

      if (scheduledAt > now) return scheduledAt;
    }
  }

  // Fallback: 7 days from now at the requested time
  const fallback = new Date(now);
  fallback.setDate(now.getDate() + 7);
  fallback.setUTCHours(h, m, 0, 0);
  return fallback;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status } = await request.json();
    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
    }

    // Fetch full request details before updating
    const rows = await db.execute(sql`
      SELECT
        sr.student_id,
        sr.teacher_id,
        sr.course_id,
        sr.preferred_days,
        sr.preferred_time,
        sr.timezone,
        s.full_name AS student_name,
        t.full_name AS teacher_name,
        c.name_en   AS course_name
      FROM schedule_requests sr
      JOIN users s ON sr.student_id = s.id
      JOIN users t ON sr.teacher_id = t.id
      JOIN courses c ON sr.course_id = c.id
      WHERE sr.id = ${id}
      LIMIT 1
    `);

    const existing = (rows.rows as Array<Record<string, unknown>>)[0];
    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const preferredDays = (existing.preferred_days as string[]) ?? [];
    const preferredTime = existing.preferred_time as { start: string; end: string } | null;
    const timezone     = (existing.timezone as string) || "UTC";
    const studentId    = existing.student_id as string;
    const teacherId    = existing.teacher_id as string;
    const courseId     = existing.course_id as string;
    const studentName  = existing.student_name as string;
    const teacherName  = existing.teacher_name as string;
    const courseName   = existing.course_name as string;
    const startTime    = preferredTime?.start ?? "09:00";

    // Compute selectedSlot from first preferred day + start time
    const selectedSlot =
      status === "approved" && preferredDays.length > 0
        ? { day: preferredDays[0], time: startTime }
        : null;

    // Update schedule request
    const [updated] = await db
      .update(scheduleRequests)
      .set({
        status,
        ...(selectedSlot ? { selectedSlot } : {}),
        updatedAt: new Date(),
      })
      .where(eq(scheduleRequests.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });

    // ── On approval: create class records from enrollment ──────────────────
    if (status === "approved" && preferredDays.length > 0) {
      // Find the student's active enrollment for this course
      const [enrollment] = await db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(
          and(
            eq(enrollments.studentId, studentId),
            eq(enrollments.courseId, courseId),
          )
        )
        .limit(1);

      if (enrollment) {
        // Create one class per preferred day (next occurrence of each)
        for (const day of preferredDays) {
          const scheduledAt = nextOccurrenceUTC(day, startTime, timezone);
          const inserted = await db.insert(classes).values({
            enrollmentId:    enrollment.id,
            teacherId,
            scheduledAt,
            durationMinutes: 45,
            status:          "scheduled",
          }).returning({ id: classes.id });
          if (inserted[0]) {
            const room = `Tibyaan-${inserted[0].id.replace(/-/g, "").slice(0, 16)}`;
            await db.update(classes)
              .set({ meetingLink: `https://meet.jit.si/${room}` })
              .where(eq(classes.id, inserted[0].id));
          }
        }
      }
    }

    // ── Notifications ──────────────────────────────────────────────────────
    const days = preferredDays.join(", ");
    const time = preferredTime ? `${preferredTime.start} – ${preferredTime.end}` : "";

    if (status === "approved") {
      await db.insert(notifications).values({
        userId:   studentId,
        type:     "match_accepted",
        titleEn:  "Schedule Request Approved ✓",
        titleUr:  "شیڈول درخواست منظور ہو گئی",
        titleAr:  "تمت الموافقة على طلب الجدول",
        message:  `Your class has been confirmed! Teacher: ${teacherName} | Course: ${courseName} | Days: ${days} | Time: ${time} (${timezone})`,
        link:     "/student/schedule",
      });
      await db.insert(notifications).values({
        userId:   teacherId,
        type:     "match_request",
        titleEn:  "New Class Confirmed for You",
        titleUr:  "آپ کے لیے نئی کلاس کنفرم ہو گئی",
        titleAr:  "تم تأكيد فصل جديد لك",
        message:  `New scheduled class | Student: ${studentName} | Course: ${courseName} | Days: ${days} | Time: ${time} (${timezone})`,
        link:     "/teacher/schedule",
      });
    } else {
      await db.insert(notifications).values({
        userId:   studentId,
        type:     "match_rejected",
        titleEn:  "Schedule Request Rejected",
        titleUr:  "شیڈول درخواست مسترد ہو گئی",
        titleAr:  "تم رفض طلب الجدول",
        message:  "Your schedule request was not approved at this time. Please submit a new request with updated preferences.",
        link:     "/student/schedule",
      });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("Admin schedule request update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
