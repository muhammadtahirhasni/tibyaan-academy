import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClassroomClient } from "./classroom-client";

export default async function ClassroomPage({
  params,
}: {
  params: Promise<{ locale: string; classId: string }>;
}) {
  const { locale, classId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  return <ClassroomClient classId={classId} userId={user.id} locale={locale} />;
}
