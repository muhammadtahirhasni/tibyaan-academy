import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { enrollments, courses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AIUstazClient } from "./ai-ustaz-client";

export default async function AIUstazPage({
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

  let courseType = "nazra";
  let courseNameEn = "Nazra Quran";

  try {
    const db = getDb();
    const [enrollment] = await db
      .select({
        courseType: courses.courseType,
        courseNameEn: courses.nameEn,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.studentId, user.id))
      .orderBy(desc(enrollments.createdAt))
      .limit(1);

    if (enrollment) {
      courseType = enrollment.courseType;
      courseNameEn = enrollment.courseNameEn;
    }
  } catch {
    // use defaults
  }

  return (
    <AIUstazClient
      initialCourseType={courseType}
      initialCourseName={courseNameEn}
    />
  );
}
