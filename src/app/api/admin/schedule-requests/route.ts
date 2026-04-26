import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
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

    const rows = await db.execute(sql`
      SELECT
        sr.id,
        sr.status,
        sr.timezone,
        sr.preferred_days,
        sr.preferred_time,
        sr.created_at,
        sr.updated_at,
        s.full_name AS student_name,
        s.id AS student_id,
        t.full_name AS teacher_name,
        t.id AS teacher_id,
        c.name_en AS course_name,
        c.course_type
      FROM schedule_requests sr
      JOIN users s ON sr.student_id = s.id
      JOIN users t ON sr.teacher_id = t.id
      JOIN courses c ON sr.course_id = c.id
      ORDER BY sr.created_at DESC
      LIMIT 200
    `);

    const requests = (rows.rows as Array<Record<string, unknown>>).map((r) => ({
      id: r.id as string,
      status: r.status as string,
      timezone: r.timezone as string,
      preferredDays: (r.preferred_days as string[]) || [],
      preferredTime: r.preferred_time as { start: string; end: string } | null,
      createdAt: new Date(r.created_at as string).toISOString(),
      studentName: r.student_name as string,
      studentId: r.student_id as string,
      teacherName: r.teacher_name as string,
      teacherId: r.teacher_id as string,
      courseName: r.course_name as string,
      courseType: r.course_type as string,
    }));

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Admin schedule requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
