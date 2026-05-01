import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users, teacherStudentMatches, courses } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { AdminMatchesClient } from "./admin-matches-client";

export default async function AdminMatchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const db = getDb();
  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!dbUser[0] || dbUser[0].role !== "admin") redirect(`/${locale}`);

  let matches: Array<{
    id: string;
    studentName: string;
    teacherName: string;
    courseName: string;
    status: string;
    days: string;
    time: string;
    timezone: string;
    createdAt: string;
    classCount: number;
  }> = [];

  try {
    // Use schedule_requests as the source of truth for student-teacher connections
    const rows = await db.execute(sql`
      SELECT
        sr.id,
        sr.status,
        sr.preferred_days,
        sr.preferred_time,
        sr.timezone,
        sr.created_at,
        s.full_name AS student_name,
        t.full_name AS teacher_name,
        c.name_en   AS course_name,
        COUNT(cl.id)::int AS class_count
      FROM schedule_requests sr
      JOIN users s ON sr.student_id = s.id
      JOIN users t ON sr.teacher_id = t.id
      JOIN courses c ON sr.course_id = c.id
      LEFT JOIN enrollments e ON (e.student_id = sr.student_id AND e.course_id = sr.course_id)
      LEFT JOIN classes cl ON (cl.enrollment_id = e.id AND cl.teacher_id = sr.teacher_id)
      GROUP BY sr.id, s.full_name, t.full_name, c.name_en
      ORDER BY sr.created_at DESC
      LIMIT 100
    `);

    matches = (rows.rows as Array<Record<string, unknown>>).map((r) => {
      const preferredDays = (r.preferred_days as string[] | null) ?? [];
      const preferredTime = r.preferred_time as { start?: string; end?: string } | null;
      return {
        id: r.id as string,
        studentName: r.student_name as string,
        teacherName: r.teacher_name as string,
        courseName: r.course_name as string,
        status: r.status as string,
        days: preferredDays.join(", "),
        time: preferredTime ? `${preferredTime.start ?? ""} – ${preferredTime.end ?? ""}` : "",
        timezone: (r.timezone as string) || "UTC",
        createdAt: new Date(r.created_at as string).toISOString(),
        classCount: (r.class_count as number) ?? 0,
      };
    });
  } catch (err) {
    console.error("Failed to load matches:", err);
  }

  return <AdminMatchesClient matches={matches} />;
}
