import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users, notifications } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AdminNotificationsClient } from "./admin-notifications-client";

export default async function AdminNotificationsPage({
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
  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!dbUser[0] || dbUser[0].role !== "admin") redirect(`/${locale}`);

  let notifs: Array<{
    id: string;
    userId: string;
    userName: string;
    type: string;
    title: string;
    message: string | null;
    isRead: boolean;
    createdAt: string;
  }> = [];

  try {
    const rows = await db
      .select({
        notification: notifications,
        user: users,
      })
      .from(notifications)
      .innerJoin(users, eq(notifications.userId, users.id))
      .orderBy(desc(notifications.createdAt))
      .limit(100);

    notifs = rows.map((r) => ({
      id: r.notification.id,
      userId: r.notification.userId,
      userName: r.user.fullName,
      type: r.notification.type,
      title: r.notification.titleEn,
      message: r.notification.message,
      isRead: r.notification.isRead,
      createdAt: r.notification.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("Failed to load notifications:", err);
  }

  return <AdminNotificationsClient notifications={notifs} />;
}
