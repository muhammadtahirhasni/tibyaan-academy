import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTeacherStudents } from "@/lib/db/teacher-queries";
import { StudentsClient } from "./students-client";

export default async function TeacherStudentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  let students: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    courseName: string;
    courseType: string;
    planType: string;
    status: string;
    enrolledAt: string;
  }> = [];

  try {
    const raw = await getTeacherStudents(user.id);
    const localeKey = `name${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof raw[0]["course"];
    students = raw.map((r) => ({
      id: r.student.id,
      name: r.student.fullName,
      email: r.student.email,
      avatarUrl: r.student.avatarUrl,
      courseName: (r.course[localeKey] as string) || r.course.nameEn,
      courseType: r.course.courseType,
      planType: r.enrollment.planType,
      status: r.enrollment.status,
      enrolledAt: r.enrollment.createdAt?.toISOString() ?? "",
    }));
  } catch (err) {
    console.error("Failed to load students:", err);
  }

  return <StudentsClient students={students} />;
}
