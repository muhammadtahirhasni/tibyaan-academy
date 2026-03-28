import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTeacherLessons } from "@/lib/db/teacher-queries";
import { LessonsClient } from "./lessons-client";

export default async function TeacherLessonsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  let lessons: Array<{
    id: string;
    studentName: string;
    courseName: string;
    courseType: string;
    lessonNumber: number;
    lessonType: string;
    isCompleted: boolean;
    completedAt: string | null;
    teacherNotes: string | null;
  }> = [];

  try {
    const raw = await getTeacherLessons(user.id);
    const localeKey = `name${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof raw[0]["course"];
    lessons = raw.map((r) => ({
      id: r.lesson.id,
      studentName: r.student.fullName,
      courseName: (r.course[localeKey] as string) || r.course.nameEn,
      courseType: r.course.courseType,
      lessonNumber: r.lesson.lessonNumber,
      lessonType: r.lesson.lessonType,
      isCompleted: r.lesson.isCompleted,
      completedAt: r.lesson.completedAt?.toISOString() ?? null,
      teacherNotes: r.lesson.teacherNotes,
    }));
  } catch (err) {
    console.error("Failed to load lessons:", err);
  }

  return <LessonsClient lessons={lessons} />;
}
