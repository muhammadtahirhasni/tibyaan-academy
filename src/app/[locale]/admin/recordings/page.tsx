import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users, classRecordings } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { AdminRecordingsClient } from "./admin-recordings-client";

export default async function AdminRecordingsPage({
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

  let recordings: Array<{
    id: string;
    teacherName: string;
    studentName: string;
    recordingUrl: string;
    duration: number | null;
    sessionDate: string;
    expiresAt: string;
    isDeleted: boolean;
  }> = [];

  try {
    // Alias for the student join
    const rows = await db.execute(sql`
      SELECT
        cr.id,
        cr.recording_url,
        cr.duration,
        cr.session_date,
        cr.expires_at,
        cr.is_deleted_by_system,
        t.full_name AS teacher_name,
        s.full_name AS student_name
      FROM class_recordings cr
      JOIN users t ON cr.teacher_id = t.id
      JOIN users s ON cr.student_id = s.id
      ORDER BY cr.session_date DESC
      LIMIT 100
    `);

    recordings = (rows.rows as Array<Record<string, unknown>>).map((r) => ({
      id: r.id as string,
      teacherName: r.teacher_name as string,
      studentName: r.student_name as string,
      recordingUrl: r.recording_url as string,
      duration: r.duration as number | null,
      sessionDate: new Date(r.session_date as string).toISOString(),
      expiresAt: new Date(r.expires_at as string).toISOString(),
      isDeleted: r.is_deleted_by_system as boolean,
    }));
  } catch (err) {
    console.error("Failed to load admin recordings:", err);
  }

  return <AdminRecordingsClient recordings={recordings} />;
}
