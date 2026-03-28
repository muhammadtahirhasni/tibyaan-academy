import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/db/queries";
import { TeacherShell } from "./teacher-shell";

export default async function TeacherLayout({
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

  // Verify teacher role
  const dbUser = await getUserById(user.id);
  if (!dbUser || dbUser.role !== "teacher") {
    redirect(`/${locale}`);
  }

  const userName = dbUser.fullName || user.email?.split("@")[0] || "Teacher";
  const userEmail = user.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <TeacherShell
      userName={userName}
      userEmail={userEmail}
      userInitial={userInitial}
      userId={user.id}
      locale={locale}
    >
      {children}
    </TeacherShell>
  );
}
