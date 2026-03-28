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
    createdAt: string;
    respondedAt: string | null;
  }> = [];

  try {
    const rows = await db.execute(sql`
      SELECT
        m.id,
        m.status,
        m.created_at,
        m.responded_at,
        s.full_name AS student_name,
        t.full_name AS teacher_name,
        c.name_en AS course_name
      FROM teacher_student_matches m
      JOIN users s ON m.student_id = s.id
      JOIN users t ON m.teacher_id = t.id
      JOIN courses c ON m.course_id = c.id
      ORDER BY m.created_at DESC
      LIMIT 100
    `);

    matches = (rows.rows as Array<Record<string, unknown>>).map((r) => ({
      id: r.id as string,
      studentName: r.student_name as string,
      teacherName: r.teacher_name as string,
      courseName: r.course_name as string,
      status: r.status as string,
      createdAt: new Date(r.created_at as string).toISOString(),
      respondedAt: r.responded_at
        ? new Date(r.responded_at as string).toISOString()
        : null,
    }));
  } catch (err) {
    console.error("Failed to load matches:", err);
  }

  return <AdminMatchesClient matches={matches} />;
}
