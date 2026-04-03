import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/db/queries";
import { StudentShell } from "./student-shell";

export default async function StudentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Verify student role
  const dbUser = await getUserById(user.id);
  if (dbUser && dbUser.role !== "student") {
    redirect(`/${locale}`);
  }

  const userName =
    dbUser?.fullName ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Student";
  const userEmail = user.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <StudentShell
      userName={userName}
      userEmail={userEmail}
      userInitial={userInitial}
      locale={locale}
    >
      {children}
    </StudentShell>
  );
}
