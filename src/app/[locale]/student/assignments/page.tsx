import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { StudentAssignmentsClient } from "./student-assignments-client";

export default async function StudentAssignmentsPage({
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
  if (!dbUser || dbUser.role !== "student") redirect(`/${locale}`);

  let assignments: Array<{
    id: string;
    teacherName: string;
    type: string;
    title: string;
    description: string | null;
    frequency: string;
    dueDate: string | null;
    status: string;
    createdAt: string;
  }> = [];

  try {
    const result = await db.execute(sql`
      SELECT sa.id, sa.type, sa.title, sa.description,
             sa.frequency, sa.due_date, sa.status, sa.created_at,
             t.full_name AS teacher_name
      FROM student_assignments sa
      JOIN users t ON sa.teacher_id = t.id
      WHERE sa.student_id = ${user.id}
      ORDER BY sa.created_at DESC
      LIMIT 200
    `);
    assignments = (result.rows as Array<Record<string, unknown>>).map((r) => ({
      id: r.id as string,
      teacherName: r.teacher_name as string,
      type: r.type as string,
      title: r.title as string,
      description: (r.description as string | null) ?? null,
      frequency: r.frequency as string,
      dueDate: r.due_date ? new Date(r.due_date as string).toISOString() : null,
      status: r.status as string,
      createdAt: new Date(r.created_at as string).toISOString(),
    }));
  } catch (err) {
    console.error("Failed to load student assignments:", err);
  }

  return <StudentAssignmentsClient assignments={assignments} />;
}
