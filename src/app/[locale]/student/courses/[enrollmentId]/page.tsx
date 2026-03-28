import { createClient } from "@/lib/supabase/server";
import { getEnrollmentById, getEnrollmentLessons } from "@/lib/db/queries";
import { CourseDetailClient } from "./course-detail-client";
import { redirect, notFound } from "next/navigation";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; enrollmentId: string }>;
}) {
  const { locale, enrollmentId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  let enrollmentData: Awaited<ReturnType<typeof getEnrollmentById>> | null = null;
  let lessonsData: Awaited<ReturnType<typeof getEnrollmentLessons>> = [];

  try {
    enrollmentData = await getEnrollmentById(enrollmentId, user.id);
    if (enrollmentData) {
      lessonsData = await getEnrollmentLessons(enrollmentId);
    }
  } catch (error) {
    console.error("Course detail fetch error:", error);
  }

  if (!enrollmentData) {
    notFound();
  }

  const courseName = locale === "ar" ? enrollmentData.course.nameAr
    : locale === "fr" ? enrollmentData.course.nameFr
    : locale === "id" ? enrollmentData.course.nameId
    : locale === "ur" ? enrollmentData.course.nameUr
    : enrollmentData.course.nameEn;

  const courseDesc = locale === "ar" ? enrollmentData.course.descriptionAr
    : locale === "fr" ? enrollmentData.course.descriptionFr
    : locale === "id" ? enrollmentData.course.descriptionId
    : locale === "ur" ? enrollmentData.course.descriptionUr
    : enrollmentData.course.descriptionEn;

  const lessons = lessonsData.map((l) => ({
    id: l.id,
    lessonNumber: l.lessonNumber,
    title: locale === "ar" ? (l.titleAr || l.titleEn || `Lesson ${l.lessonNumber}`)
      : locale === "ur" ? (l.titleUr || l.titleEn || `Lesson ${l.lessonNumber}`)
      : (l.titleEn || `Lesson ${l.lessonNumber}`),
    isCompleted: l.isCompleted,
    completedAt: l.completedAt?.toISOString() ?? null,
    lessonType: l.lessonType,
  }));

  const completedCount = lessons.filter((l) => l.isCompleted).length;
  const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <CourseDetailClient
      courseName={courseName}
      courseDescription={courseDesc ?? ""}
      courseType={enrollmentData.course.courseType}
      status={enrollmentData.enrollment.status}
      planType={enrollmentData.enrollment.planType}
      lessons={lessons}
      progress={progress}
      completedCount={completedCount}
      totalCount={lessons.length}
    />
  );
}
