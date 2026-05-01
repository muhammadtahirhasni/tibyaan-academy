import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, classes, enrollments, courses } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params;
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const rows = await db.execute(sql`
    SELECT
      c.id, c.scheduled_at, c.duration_minutes, c.status, c.meeting_link,
      s.id AS student_id, s.full_name AS student_name,
      t.id AS teacher_id, t.full_name AS teacher_name,
      co.name_en AS course_name_en, co.name_ur AS course_name_ur,
      co.name_ar AS course_name_ar
    FROM classes c
    JOIN enrollments e ON c.enrollment_id = e.id
    JOIN users s ON e.student_id = s.id
    JOIN users t ON c.teacher_id = t.id
    JOIN courses co ON e.course_id = co.id
    WHERE c.id = ${classId}
    LIMIT 1
  `);

  const row = (rows.rows as Array<Record<string, unknown>>)[0];
  if (!row) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  // Only the student or teacher of this class may access it
  if (authUser.id !== row.student_id && authUser.id !== row.teacher_id) {
    const [dbUser] = await db.select({ role: users.role }).from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json({
    id: row.id,
    scheduledAt: row.scheduled_at,
    durationMinutes: row.duration_minutes,
    status: row.status,
    meetingLink: row.meeting_link,
    studentId: row.student_id,
    studentName: row.student_name,
    teacherId: row.teacher_id,
    teacherName: row.teacher_name,
    courseNameEn: row.course_name_en,
    courseNameUr: row.course_name_ur,
    courseNameAr: row.course_name_ar,
  });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params;
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const [cls] = await db.select({
    teacherId: classes.teacherId,
    enrollmentId: classes.enrollmentId,
  }).from(classes).where(eq(classes.id, classId)).limit(1);

  if (!cls) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only teacher or admin may end a class
  const [dbUser] = await db.select({ role: users.role }).from(users).where(eq(users.id, authUser.id)).limit(1);
  if (authUser.id !== cls.teacherId && dbUser?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.update(classes)
    .set({ status: "completed" })
    .where(eq(classes.id, classId));

  return NextResponse.json({ success: true });
}
