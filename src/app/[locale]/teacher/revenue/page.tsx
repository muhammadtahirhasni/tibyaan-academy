import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTeacherRevenue } from "@/lib/db/teacher-queries";
import { RevenueClient } from "./revenue-client";

export default async function TeacherRevenuePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  let earnings: Array<{
    studentName: string;
    courseName: string;
    planType: string;
    monthlyAmount: number;
  }> = [];

  try {
    const raw = await getTeacherRevenue(user.id);
    const localeKey = `name${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof raw[0]["course"];
    earnings = raw.map((r) => ({
      studentName: r.student.fullName,
      courseName: (r.course[localeKey] as string) || r.course.nameEn,
      planType: r.subscription.planType,
      monthlyAmount: parseFloat(r.subscription.amountUsd ?? "0"),
    }));
  } catch (err) {
    console.error("Failed to load revenue:", err);
  }

  return <RevenueClient earnings={earnings} />;
}
