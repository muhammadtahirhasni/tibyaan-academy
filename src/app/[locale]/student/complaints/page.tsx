import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { StudentComplaintsClient } from "./student-complaints-client";

export default async function StudentComplaintsPage({
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

  let complaints: Array<{
    id: string;
    subject: string;
    category: string;
    description: string;
    status: string;
    adminNote: string | null;
    createdAt: string;
  }> = [];

  try {
    const result = await db.execute(sql`
      SELECT id, subject, category, description, status, admin_note, created_at
      FROM student_complaints
      WHERE student_id = ${user.id}
      ORDER BY created_at DESC
    `);
    complaints = (result.rows as Array<Record<string, unknown>>).map((r) => ({
      id: r.id as string,
      subject: r.subject as string,
      category: r.category as string,
      description: r.description as string,
      status: r.status as string,
      adminNote: (r.admin_note as string | null) ?? null,
      createdAt: new Date(r.created_at as string).toISOString(),
    }));
  } catch (err) {
    console.error("Failed to load complaints:", err);
  }

  return <StudentComplaintsClient complaints={complaints} />;
}
