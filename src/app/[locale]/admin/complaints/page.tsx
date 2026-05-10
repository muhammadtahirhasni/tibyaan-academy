import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { AdminComplaintsClient } from "./admin-complaints-client";

export default async function AdminComplaintsPage({
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

  let complaints: Array<{
    id: string;
    studentId: string;
    studentName: string;
    subject: string;
    category: string;
    description: string;
    status: string;
    adminNote: string | null;
    createdAt: string;
  }> = [];

  try {
    const result = await db.execute(sql`
      SELECT sc.id, sc.student_id, sc.subject, sc.category, sc.description,
             sc.status, sc.admin_note, sc.created_at,
             u.full_name AS student_name
      FROM student_complaints sc
      JOIN users u ON sc.student_id = u.id
      ORDER BY sc.created_at DESC
      LIMIT 500
    `);
    complaints = (result.rows as Array<Record<string, unknown>>).map((r) => ({
      id: r.id as string,
      studentId: r.student_id as string,
      studentName: r.student_name as string,
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

  return <AdminComplaintsClient complaints={complaints} />;
}
