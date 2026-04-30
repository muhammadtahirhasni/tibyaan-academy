import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, scheduleRequests, notifications } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

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

    // Fetch existing request with student, teacher, course details BEFORE updating
    const rows = await db.execute(sql`
      SELECT
        sr.student_id,
        sr.teacher_id,
        sr.preferred_days,
        sr.preferred_time,
        sr.timezone,
        s.full_name AS student_name,
        t.full_name AS teacher_name,
        c.name_en AS course_name
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
    const timezone = existing.timezone as string;
    const studentId = existing.student_id as string;
    const teacherId = existing.teacher_id as string;
    const studentName = existing.student_name as string;
    const teacherName = existing.teacher_name as string;
    const courseName = existing.course_name as string;

    // Compute selectedSlot from first preferred day + start time (for approval)
    const selectedSlot =
      status === "approved" && preferredDays.length > 0
        ? { day: preferredDays[0], time: preferredTime?.start ?? "09:00" }
        : null;

    // Update status (and selectedSlot on approval)
    const [updated] = await db
      .update(scheduleRequests)
      .set({
        status,
        ...(selectedSlot ? { selectedSlot } : {}),
        updatedAt: new Date(),
      })
      .where(eq(scheduleRequests.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    // Build human-readable schedule info
    const days = preferredDays.join(", ");
    const time = preferredTime
      ? `${preferredTime.start} – ${preferredTime.end}`
      : "";

    if (status === "approved") {
      // Notify student
      await db.insert(notifications).values({
        userId: studentId,
        type: "match_accepted",
        titleEn: "Schedule Request Approved ✓",
        titleUr: "شیڈول درخواست منظور ہو گئی",
        titleAr: "تمت الموافقة على طلب الجدول",
        message: `Your class has been confirmed! Teacher: ${teacherName} | Course: ${courseName} | Days: ${days} | Time: ${time} (${timezone})`,
        link: "/student/schedule",
      });

      // Notify teacher
      await db.insert(notifications).values({
        userId: teacherId,
        type: "match_request",
        titleEn: "New Class Confirmed for You",
        titleUr: "آپ کے لیے نئی کلاس کنفرم ہو گئی",
        titleAr: "تم تأكيد فصل جديد لك",
        message: `New scheduled class | Student: ${studentName} | Course: ${courseName} | Days: ${days} | Time: ${time} (${timezone})`,
        link: "/teacher/schedule",
      });
    } else {
      // Notify student of rejection
      await db.insert(notifications).values({
        userId: studentId,
        type: "match_rejected",
        titleEn: "Schedule Request Rejected",
        titleUr: "شیڈول درخواست مسترد ہو گئی",
        titleAr: "تم رفض طلب الجدول",
        message: "Your schedule request was not approved at this time. Please submit a new request with updated preferences.",
        link: "/student/schedule",
      });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("Admin schedule request update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
