import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTeacherDashboardStats } from "@/lib/db/teacher-queries";
import { TeacherDashboardClient } from "./dashboard-client";

export default async function TeacherDashboardPage({
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

  let stats = {
    todayClasses: [] as Array<{
      studentName: string;
      courseName: string;
      time: string;
      status: string;
      meetingLink: string | null;
    }>,
    activeStudents: 0,
    pendingTests: 0,
    monthlyRevenue: 0,
  };

  try {
    const raw = await getTeacherDashboardStats(user.id);

    stats = {
      todayClasses: raw.todayClasses.map((c) => {
        const scheduledAt = new Date(c.class_.scheduledAt);
        const endTime = new Date(
          scheduledAt.getTime() + c.class_.durationMinutes * 60000
        );
        const fmtTime = (d: Date) =>
          d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        const fmtDate = (d: Date) =>
          d.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });

        const courseNameKey = `name${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof c.course;
        return {
          studentName: c.student.fullName,
          courseName: (c.course[courseNameKey] as string) || c.course.nameEn,
          time: `${fmtDate(scheduledAt)} · ${fmtTime(scheduledAt)} - ${fmtTime(endTime)}`,
          status: c.class_.status,
          meetingLink: c.class_.meetingLink,
        };
      }),
      activeStudents: raw.activeStudents,
      pendingTests: raw.pendingTests,
      monthlyRevenue: raw.monthlyRevenue,
    };
  } catch (err) {
    console.error("Failed to load teacher dashboard:", err);
  }

  return (
    <TeacherDashboardClient
      todayClasses={stats.todayClasses}
      activeStudents={stats.activeStudents}
      pendingTests={stats.pendingTests}
      monthlyRevenue={stats.monthlyRevenue}
    />
  );
}
