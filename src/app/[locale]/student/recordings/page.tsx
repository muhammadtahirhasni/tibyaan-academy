import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { classRecordings, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { RecordingsClient } from "../../teacher/recordings/recordings-client";

export default async function StudentRecordingsPage({
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

  let recordings: Array<{
    id: string;
    studentName: string;
    recordingUrl: string;
    duration: number | null;
    sessionDate: string;
    expiresAt: string;
  }> = [];

  try {
    const db = getDb();
    const raw = await db
      .select({
        recording: classRecordings,
        teacher: users,
      })
      .from(classRecordings)
      .innerJoin(users, eq(classRecordings.teacherId, users.id))
      .where(
        and(
          eq(classRecordings.studentId, user.id),
          eq(classRecordings.isDeletedBySystem, false)
        )
      )
      .orderBy(desc(classRecordings.sessionDate));

    recordings = raw.map((r) => ({
      id: r.recording.id,
      studentName: r.teacher.fullName, // For students, show teacher name
      recordingUrl: r.recording.recordingUrl,
      duration: r.recording.duration,
      sessionDate: r.recording.sessionDate.toISOString(),
      expiresAt: r.recording.expiresAt.toISOString(),
    }));
  } catch (err) {
    console.error("Failed to load student recordings:", err);
  }

  return <RecordingsClient recordings={recordings} />;
}
