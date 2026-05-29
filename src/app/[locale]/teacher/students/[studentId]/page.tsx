import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users, enrollments, courses, lessons, hifzTracker, kidsActivities, classes } from "@/lib/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { StudentDetailClient } from "./student-detail-client";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; studentId: string }>;
}) {
  const { locale, studentId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const db = getDb();

  // Fetch student user record
  const [student] = await db
    .select({ id: users.id, fullName: users.fullName, email: users.email, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1);

  if (!student) redirect(`/${locale}/teacher/students`);

  // Fetch enrollments + courses for this student that belong to this teacher
  const enrollmentRows = await db
    .select({
      enrollmentId: enrollments.id,
      courseNameEn: courses.nameEn,
      courseNameUr: courses.nameUr,
      enrollmentStatus: enrollments.status,
      planType: enrollments.planType,
      enrolledAt: enrollments.createdAt,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(classes, eq(classes.enrollmentId, enrollments.id))
    .where(
      and(
        eq(enrollments.studentId, studentId),
        eq(classes.teacherId, user.id),
      )
    )
    .limit(10);

  // Deduplicate by enrollmentId
  const seen = new Set<string>();
  const uniqueEnrollments = enrollmentRows.filter((e) => {
    if (seen.has(e.enrollmentId)) return false;
    seen.add(e.enrollmentId);
    return true;
  });

  const enrollmentIds = uniqueEnrollments.map((e) => e.enrollmentId);

  // Fetch lesson stats per enrollment
  let totalLessons = 0;
  let completedLessons = 0;
  let lessonNotes: Array<{ date: string; title: string; notes: string }> = [];

  if (enrollmentIds.length > 0) {
    const lessonRows = await db
      .select({
        isCompleted: lessons.isCompleted,
        completedAt: lessons.completedAt,
        titleEn: lessons.titleEn,
        teacherNotes: lessons.teacherNotes,
      })
      .from(lessons)
      .where(sql`${lessons.enrollmentId} = ANY(${enrollmentIds})`)
      .orderBy(sql`${lessons.completedAt} DESC NULLS LAST`)
      .limit(50);

    totalLessons = lessonRows.length;
    completedLessons = lessonRows.filter((l) => l.isCompleted).length;
    lessonNotes = lessonRows
      .filter((l) => l.teacherNotes)
      .map((l) => ({
        date: l.completedAt
          ? new Date(l.completedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : "",
        title: l.titleEn || "Lesson",
        notes: l.teacherNotes!,
      }));
  }

  // Hifz stats
  const hifzRows = await db
    .select({
      surahNumber: hifzTracker.surahNumber,
      ayahFrom: hifzTracker.ayahFrom,
      ayahTo: hifzTracker.ayahTo,
      score: hifzTracker.score,
      type: hifzTracker.type,
      createdAt: hifzTracker.createdAt,
    })
    .from(hifzTracker)
    .where(eq(hifzTracker.studentId, studentId))
    .orderBy(sql`${hifzTracker.createdAt} DESC`)
    .limit(50);

  const uniqueSurahs = new Set(hifzRows.map((h) => h.surahNumber)).size;
  const totalAyaatMemorized = hifzRows.reduce((sum, h) => sum + (h.ayahTo - h.ayahFrom + 1), 0);
  const avgScore = hifzRows.length > 0
    ? Math.round(hifzRows.filter((h) => h.score != null).reduce((s, h) => s + (h.score ?? 0), 0) / Math.max(1, hifzRows.filter((h) => h.score != null).length))
    : 0;

  // Kids activities stats
  const activityRows = await db
    .select({ count: count() })
    .from(kidsActivities)
    .where(eq(kidsActivities.studentId, studentId));
  const gamesPlayed = activityRows[0]?.count ?? 0;

  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const primaryEnrollment = uniqueEnrollments[0];

  return (
    <StudentDetailClient
      student={{
        id: student.id,
        name: student.fullName,
        email: student.email || "",
        enrolledDate: student.createdAt.toISOString(),
        course: primaryEnrollment?.courseNameEn ?? "—",
        plan: primaryEnrollment?.planType ?? "—",
        enrollmentStatus: primaryEnrollment?.enrollmentStatus ?? "active",
      }}
      progress={{
        completedLessons,
        totalLessons,
        progressPct,
      }}
      hifz={{
        uniqueSurahs,
        totalAyaatMemorized,
        avgScore,
        recentRecords: hifzRows.slice(0, 5).map((h) => ({
          surahNumber: Number(h.surahNumber),
          ayahFrom: Number(h.ayahFrom),
          ayahTo: Number(h.ayahTo),
          score: h.score != null ? Number(h.score) : null,
          type: h.type,
          date: new Date(h.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        })),
      }}
      activities={{ gamesPlayed: Number(gamesPlayed) }}
      notes={lessonNotes}
    />
  );
}
