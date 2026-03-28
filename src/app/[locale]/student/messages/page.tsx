import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getStudentMatches } from "@/lib/db/teacher-queries";
import { StudentMessagesClient } from "./student-messages-client";

export default async function StudentMessagesPage({
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

  let matches: Array<{
    id: string;
    teacherName: string;
    courseName: string;
    status: string;
    createdAt: string;
  }> = [];

  try {
    const raw = await getStudentMatches(user.id);
    const nameKey = `name${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof raw[0]["course"];

    matches = raw.map((r) => ({
      id: r.match.id,
      teacherName: r.teacher.fullName,
      courseName: (r.course[nameKey] as string) || r.course.nameEn,
      status: r.match.status,
      createdAt: r.match.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("Failed to load student matches:", err);
  }

  return <StudentMessagesClient matches={matches} currentUserId={user.id} />;
}
