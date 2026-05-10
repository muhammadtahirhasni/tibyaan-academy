import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { TeacherProgressClient } from "./teacher-progress-client";
import { getTeacherStudents } from "@/lib/db/teacher-queries";

export default async function TeacherProgressPage({
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
  if (!dbUser || dbUser.role !== "teacher") redirect(`/${locale}/login`);

  let students: Array<{ id: string; name: string }> = [];
  try {
    const raw = await getTeacherStudents(user.id);
    const seen = new Set<string>();
    students = raw
      .filter((r) => { if (seen.has(r.student.id)) return false; seen.add(r.student.id); return true; })
      .map((r) => ({ id: r.student.id, name: r.student.fullName }));
  } catch {}

  return <TeacherProgressClient students={students} />;
}
