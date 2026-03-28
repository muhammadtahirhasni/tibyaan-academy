import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTeacherCertificates } from "@/lib/db/teacher-queries";
import { CertificatesClient } from "./certificates-client";

export default async function TeacherCertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  let certificates: Array<{
    id: string;
    studentName: string;
    courseName: string;
    certificateType: string;
    issuedAt: string;
    certificateUrl: string | null;
  }> = [];

  try {
    const raw = await getTeacherCertificates(user.id);
    const localeKey = `name${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof raw[0]["course"];
    certificates = raw.map((r) => ({
      id: r.certificate.id,
      studentName: r.student.fullName,
      courseName: (r.course[localeKey] as string) || r.course.nameEn,
      certificateType: r.certificate.certificateType,
      issuedAt: r.certificate.issuedAt.toISOString(),
      certificateUrl: r.certificate.certificateUrl,
    }));
  } catch (err) {
    console.error("Failed to load certificates:", err);
  }

  return <CertificatesClient certificates={certificates} />;
}
