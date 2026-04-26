import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { certificates, users, courses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AdminCertificatesClient } from "./certificates-client";

export default async function AdminCertificatesPage({
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

  const db = getDb();
  const [adminUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (adminUser?.role !== "admin") redirect(`/${locale}/login`);

  let certs: Array<{
    id: string;
    studentName: string;
    courseName: string;
    certificateType: string;
    issuedAt: string;
    certificateUrl: string | null;
  }> = [];

  try {
    const studentUsers = users;
    const rows = await db
      .select({
        id: certificates.id,
        certificateType: certificates.certificateType,
        issuedAt: certificates.issuedAt,
        certificateUrl: certificates.certificateUrl,
        studentId: certificates.studentId,
        courseId: certificates.courseId,
        studentName: studentUsers.fullName,
        courseName: courses.nameEn,
      })
      .from(certificates)
      .leftJoin(studentUsers, eq(certificates.studentId, studentUsers.id))
      .leftJoin(courses, eq(certificates.courseId, courses.id))
      .orderBy(desc(certificates.issuedAt))
      .limit(100);

    certs = rows.map((r) => ({
      id: r.id,
      studentName: r.studentName ?? "Unknown",
      courseName: r.courseName ?? "Unknown",
      certificateType: r.certificateType ?? "course_complete",
      issuedAt: r.issuedAt ? String(r.issuedAt) : new Date().toISOString(),
      certificateUrl: r.certificateUrl,
    }));
  } catch {
    // DB unavailable
  }

  return <AdminCertificatesClient certificates={certs} />;
}
