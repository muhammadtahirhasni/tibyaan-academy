import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTeacherTests } from "@/lib/db/teacher-queries";
import { TestsClient } from "./tests-client";

export default async function TeacherTestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  let tests: Array<{
    id: string;
    studentName: string;
    courseName: string;
    weekNumber: number;
    testDate: string | null;
    totalQuestions: number | null;
    correctAnswers: number | null;
    scorePercentage: string | null;
    teacherFeedback: string | null;
    aiFeedback: string | null;
  }> = [];

  try {
    const raw = await getTeacherTests(user.id);
    const localeKey = `name${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof raw[0]["course"];
    tests = raw.map((r) => ({
      id: r.test.id,
      studentName: r.student.fullName,
      courseName: (r.course[localeKey] as string) || r.course.nameEn,
      weekNumber: r.test.weekNumber,
      testDate: r.test.testDate?.toISOString() ?? null,
      totalQuestions: r.test.totalQuestions,
      correctAnswers: r.test.correctAnswers,
      scorePercentage: r.test.scorePercentage,
      teacherFeedback: r.test.teacherFeedback,
      aiFeedback: r.test.aiFeedback,
    }));
  } catch (err) {
    console.error("Failed to load tests:", err);
  }

  return <TestsClient tests={tests} />;
}
