import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { scheduleRequests, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select({ role: users.role }).from(users).where(eq(users.id, user.id)).limit(1);
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (dbUser.role === "teacher") {
      // Return approved/confirmed requests for this teacher
      const rows = await db.execute(sql`
        SELECT
          sr.id,
          sr.status,
          sr.timezone,
          sr.preferred_days,
          sr.preferred_time,
          sr.selected_slot,
          sr.course_id,
          sr.student_id,
          sr.created_at,
          s.full_name AS student_name,
          c.name_en AS course_name
        FROM schedule_requests sr
        JOIN users s ON sr.student_id = s.id
        JOIN courses c ON sr.course_id = c.id
        WHERE sr.teacher_id = ${user.id}
          AND sr.status IN ('approved', 'confirmed')
        ORDER BY sr.created_at DESC
        LIMIT 50
      `);
      const reqs = (rows.rows as Array<Record<string, unknown>>).map((r) => ({
        id: r.id as string,
        status: r.status as string,
        timezone: r.timezone as string,
        preferredDays: (r.preferred_days as string[]) ?? [],
        preferredTime: r.preferred_time as { start: string; end: string } | null,
        selectedSlot: r.selected_slot as { day: string; time: string } | null,
        courseId: r.course_id as string,
        studentId: r.student_id as string,
        studentName: r.student_name as string,
        courseName: r.course_name as string,
        createdAt: r.created_at as string,
      }));
      return NextResponse.json(reqs);
    }

    // For students — return all their requests (all statuses)
    const rows = await db.execute(sql`
      SELECT
        sr.id,
        sr.status,
        sr.timezone,
        sr.preferred_days,
        sr.preferred_time,
        sr.selected_slot,
        sr.course_id,
        sr.teacher_id,
        sr.created_at,
        t.full_name AS teacher_name,
        c.name_en AS course_name
      FROM schedule_requests sr
      JOIN users t ON sr.teacher_id = t.id
      JOIN courses c ON sr.course_id = c.id
      WHERE sr.student_id = ${user.id}
      ORDER BY sr.created_at DESC
      LIMIT 50
    `);
    const reqs = (rows.rows as Array<Record<string, unknown>>).map((r) => ({
      id: r.id as string,
      status: r.status as string,
      timezone: r.timezone as string,
      preferredDays: (r.preferred_days as string[]) ?? [],
      preferredTime: r.preferred_time as { start: string; end: string } | null,
      selectedSlot: r.selected_slot as { day: string; time: string } | null,
      courseId: r.course_id as string,
      teacherId: r.teacher_id as string,
      teacherName: r.teacher_name as string,
      courseName: r.course_name as string,
      createdAt: r.created_at as string,
    }));
    return NextResponse.json(reqs);
  } catch (error) {
    console.error("GET schedule requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// TBA-XXXXXXXX format (8 hex chars after TBA-)
const SHORT_ID_REGEX = /^TBA-([0-9a-f]{8})$/i;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teacherId: rawTeacherId, courseId, timezone, preferredDays, preferredTime } =
      await request.json();

    if (!rawTeacherId || !courseId || !timezone) {
      return NextResponse.json(
        { error: "teacherId, courseId, and timezone are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Resolve teacher ID — accept UUID or TBA-XXXXXXXX short ID
    let resolvedTeacherId: string;
    if (UUID_REGEX.test(rawTeacherId)) {
      resolvedTeacherId = rawTeacherId;
    } else {
      const shortMatch = SHORT_ID_REGEX.exec(rawTeacherId);
      if (!shortMatch) {
        return NextResponse.json(
          { error: "Invalid teacher ID format. Use UUID or TBA-XXXXXXXX format." },
          { status: 400 }
        );
      }
      // Find teacher whose UUID starts with the 8 hex chars
      const prefix = shortMatch[1].toLowerCase();
      const [foundTeacher] = await db
        .select({ id: users.id })
        .from(users)
        .where(sql`lower(${users.id}::text) like ${prefix + "%"}`)
        .limit(1);

      if (!foundTeacher) {
        return NextResponse.json(
          { error: "Teacher not found with that ID." },
          { status: 404 }
        );
      }
      resolvedTeacherId = foundTeacher.id;
    }

    if (!UUID_REGEX.test(courseId)) {
      return NextResponse.json(
        { error: "courseId must be a valid UUID" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(scheduleRequests)
      .values({
        studentId: user.id,
        teacherId: resolvedTeacherId,
        courseId,
        timezone,
        preferredDays: preferredDays || [],
        preferredTime: preferredTime || { start: "09:00", end: "17:00" },
        status: "pending",
      })
      .returning();

    return NextResponse.json(created);
  } catch (error) {
    console.error("Schedule request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
