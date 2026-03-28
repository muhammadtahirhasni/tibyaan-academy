import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTeacherSchedule } from "@/lib/db/teacher-queries";
import { ScheduleClient } from "./schedule-client";

export default async function TeacherSchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  let scheduleItems: Array<{
    id: string;
    studentName: string;
    courseName: string;
    scheduledAt: string;
    durationMinutes: number;
    status: string;
    meetingLink: string | null;
    notes: string | null;
  }> = [];

  try {
    const raw = await getTeacherSchedule(user.id);
    const localeKey = `name${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof raw[0]["course"];
    scheduleItems = raw.map((r) => ({
      id: r.class_.id,
      studentName: r.student.fullName,
      courseName: (r.course[localeKey] as string) || r.course.nameEn,
      scheduledAt: r.class_.scheduledAt.toISOString(),
      durationMinutes: r.class_.durationMinutes,
      status: r.class_.status,
      meetingLink: r.class_.meetingLink,
      notes: r.class_.notes,
    }));
  } catch (err) {
    console.error("Failed to load schedule:", err);
  }

  return <ScheduleClient scheduleItems={scheduleItems} />;
}
