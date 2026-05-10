import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import {
  users,
  scheduleRequests,
  notifications,
  enrollments,
  classes,
  teacherStudentMatches,
} from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// Generate all weekday (Mon-Fri) dates for the rest of the current month
function getMonthWeekdayDates(preferredDays: string[], timeStr: string, timezone: string): Date[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();

  const dayMap: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
  };

  const targetDays = new Set(preferredDays.map((d) => dayMap[d] ?? -1).filter((n) => n >= 0));
  const [h, m] = (timeStr || "09:00").split(":").map(Number);
  const dates: Date[] = [];

  for (let day = now.getDate() + 1; day <= lastDay; day++) {
    const candidate = new Date(year, month, day);
    const weekdayName = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
    }).format(candidate);
    const weekdayNum = dayMap[weekdayName] ?? -1;

    // Skip Saturday and Sunday
    if (weekdayNum === 0 || weekdayNum === 6) continue;
    // Only include preferred days (if specified)
    if (targetDays.size > 0 && !targetDays.has(weekdayNum)) continue;

    const localDateStr = candidate.toLocaleDateString("en-CA", { timeZone: timezone });
    const naiveUtc = new Date(
      `${localDateStr}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00Z`
    );
    const localStr = naiveUtc.toLocaleString("en-US", {
      timeZone: timezone,
      hour12: false,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    const localAsUtc = new Date(
      localStr.replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, "$3-$1-$2T$4:$5:$6Z")
        .replace("T24:", "T00:")
    );
    const offsetMs = naiveUtc.getTime() - localAsUtc.getTime();
    const scheduledAt = new Date(naiveUtc.getTime() + offsetMs);

    if (scheduledAt > now) dates.push(scheduledAt);
  }

  return dates;
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

    // Fetch full request details
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
        c.name_en   AS course_name,
        c.course_type
      FROM schedule_requests sr
      JOIN users s ON sr.student_id = s.id
      JOIN users t ON sr.teacher_id = t.id
      JOIN courses c ON sr.course_id = c.id
      WHERE sr.id = ${id}
      LIMIT 1
    `);

    const existing = (rows.rows as Array<Record<string, unknown>>)[0];
    if (!existing) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const preferredDays = (existing.preferred_days as string[]) ?? [];
    const preferredTime = existing.preferred_time as { start: string; end: string } | null;
    const timezone     = (existing.timezone as string) || "UTC";
    const studentId    = existing.student_id as string;
    const teacherId    = existing.teacher_id as string;
    const courseId     = existing.course_id as string;
    const studentName  = existing.student_name as string;
    const teacherName  = existing.teacher_name as string;
    const courseName   = existing.course_name as string;
    const courseType   = existing.course_type as string;
    const startTime    = preferredTime?.start ?? "09:00";

    const selectedSlot =
      status === "approved" && preferredDays.length > 0
        ? { day: preferredDays[0], time: startTime }
        : null;

    const [updated] = await db
      .update(scheduleRequests)
      .set({ status, ...(selectedSlot ? { selectedSlot } : {}), updatedAt: new Date() })
      .where(eq(scheduleRequests.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });

    // ── On approval ────────────────────────────────────────────────────────
    if (status === "approved" && preferredDays.length > 0) {
      // 1. Upsert teacher-student match (enables Teacher's "My Students" list)
      const [existingMatch] = await db
        .select({ id: teacherStudentMatches.id })
        .from(teacherStudentMatches)
        .where(
          and(
            eq(teacherStudentMatches.studentId, studentId),
            eq(teacherStudentMatches.teacherId, teacherId),
            eq(teacherStudentMatches.courseId, courseId),
          )
        )
        .limit(1);

      let matchId: string;
      if (existingMatch) {
        matchId = existingMatch.id;
        await db.update(teacherStudentMatches).set({
          status: "active",
          schedule: { days: preferredDays, time: startTime, timezone },
          respondedAt: new Date(),
        }).where(eq(teacherStudentMatches.id, matchId));
      } else {
        const [nm] = await db.insert(teacherStudentMatches).values({
          studentId, teacherId, courseId,
          status: "active",
          schedule: { days: preferredDays, time: startTime, timezone },
          requestedAt: new Date(),
          respondedAt: new Date(),
        }).returning({ id: teacherStudentMatches.id });
        matchId = nm.id;
      }

      // 2. Ensure enrollment exists, create trial if missing
      let enrollmentId: string | null = null;
      const [enrollment] = await db
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)))
        .limit(1);

      if (enrollment) {
        enrollmentId = enrollment.id;
      } else {
        const [newEnr] = await db.insert(enrollments).values({
          studentId, courseId,
          planType: "human_ai",
          status: "trial",
          trialStartDate: new Date(),
          trialEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        }).returning({ id: enrollments.id });
        enrollmentId = newEnr?.id ?? null;
      }

      // 3. Create weekday-only recurring classes for rest of month
      // No Jitsi/WebRTC — Admin will set Zoom link separately per match
      if (enrollmentId) {
        const scheduledDates = getMonthWeekdayDates(preferredDays, startTime, timezone);
        if (scheduledDates.length > 0) {
          await db.insert(classes).values(
            scheduledDates.map((scheduledAt) => ({
              enrollmentId: enrollmentId!,
              teacherId,
              scheduledAt,
              durationMinutes: 45,
              status: "scheduled" as const,
              meetingLink: null,
            }))
          );
        }
      }
    }

    // ── Notifications ──────────────────────────────────────────────────────
    const days = preferredDays.join(", ");
    const time = preferredTime ? `${preferredTime.start} – ${preferredTime.end}` : "";

    if (status === "approved") {
      await db.insert(notifications).values([
        {
          userId:  studentId,
          type:    "match_accepted" as const,
          titleEn: "Schedule Request Approved ✓",
          titleUr: "شیڈول درخواست منظور ہو گئی",
          titleAr: "تمت الموافقة على طلب الجدول",
          message: `Your class has been confirmed! Teacher: ${teacherName} | Course: ${courseName} | Days: ${days} | Time: ${time} (${timezone})`,
          link:    "/student/schedule",
        },
        {
          userId:  teacherId,
          type:    "match_request" as const,
          titleEn: "New Student Assigned",
          titleUr: "آپ کے پاس ایک نیا طالب علم تفویض ہوا ہے",
          titleAr: "تم تعيين طالب علم جديد إليك",
          message: `Aapke paas ek naya Student assign hua hai: ${studentName} (${courseType}) — Class: ${days} at ${startTime} (${timezone})`,
          link:    "/teacher/students",
        },
      ]);
    } else {
      await db.insert(notifications).values({
        userId:  studentId,
        type:    "match_rejected" as const,
        titleEn: "Schedule Request Rejected",
        titleUr: "شیڈول درخواست مسترد ہو گئی",
        titleAr: "تم رفض طلب الجدول",
        message: "Your schedule request was not approved. Please submit a new request with updated preferences.",
        link:    "/student/schedule",
      });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("Admin schedule request update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
