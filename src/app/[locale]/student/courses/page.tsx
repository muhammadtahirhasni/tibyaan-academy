import { createClient } from "@/lib/supabase/server";
import { getStudentEnrollments } from "@/lib/db/queries";
import { CoursesClient } from "./courses-client";
import { redirect } from "next/navigation";

export default async function MyCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  let enrollmentsData: Awaited<ReturnType<typeof getStudentEnrollments>> = [];
  try {
    enrollmentsData = await getStudentEnrollments(user.id);
  } catch (error) {
    console.error("Courses fetch error:", error);
  }

  const courses = enrollmentsData.map((e, i) => {
    const colors = [
      { color: "bg-emerald-500", bgColor: "bg-emerald-50 dark:bg-emerald-950", iconColor: "text-emerald-600" },
      { color: "bg-amber-500", bgColor: "bg-amber-50 dark:bg-amber-950", iconColor: "text-amber-600" },
      { color: "bg-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950", iconColor: "text-blue-600" },
      { color: "bg-purple-500", bgColor: "bg-purple-50 dark:bg-purple-950", iconColor: "text-purple-600" },
    ];
    const c = colors[i % colors.length];

    return {
      id: e.enrollment.id,
      name: locale === "ar" ? e.course.nameAr
        : locale === "fr" ? e.course.nameFr
        : locale === "id" ? e.course.nameId
        : locale === "ur" ? e.course.nameUr
        : e.course.nameEn,
      courseType: e.course.courseType,
      status: e.enrollment.status,
      planType: e.enrollment.planType,
      trialEndDate: e.enrollment.trialEndDate?.toISOString() ?? null,
      createdAt: e.enrollment.createdAt.toISOString(),
      ...c,
    };
  });

  return <CoursesClient courses={courses} locale={locale} />;
}
