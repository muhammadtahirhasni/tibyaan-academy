import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { AdminProgressClient } from "./admin-progress-client";

export default async function AdminProgressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const db = getDb();
  const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  if (!dbUser || dbUser.role !== "admin") redirect(`/${locale}`);

  let entries: Array<{
    id: string;
    studentId: string;
    studentName: string;
    teacherId: string;
    teacherName: string;
    lessonCovered: string;
    rating: string;
    notes: string | null;
    sessionDate: string;
  }> = [];

  try {
    const rows = await db.execute(sql`
      SELECT
        pe.id,
        pe.student_id,
        pe.teacher_id,
        pe.lesson_covered,
        pe.rating,
        pe.notes,
        pe.session_date,
        s.full_name AS student_name,
        t.full_name AS teacher_name
      FROM progress_entries pe
      JOIN users s ON pe.student_id = s.id
      JOIN users t ON pe.teacher_id = t.id
      ORDER BY pe.session_date DESC
      LIMIT 500
    `);
    entries = (rows.rows as Array<Record<string, unknown>>).map((r) => ({
      id: r.id as string,
      studentId: r.student_id as string,
      studentName: r.student_name as string,
      teacherId: r.teacher_id as string,
      teacherName: r.teacher_name as string,
      lessonCovered: r.lesson_covered as string,
      rating: r.rating as string,
      notes: (r.notes as string | null) ?? null,
      sessionDate: new Date(r.session_date as string).toISOString(),
    }));
  } catch (err) {
    console.error("Failed to load progress:", err);
  }

  return <AdminProgressClient entries={entries} />;
}
