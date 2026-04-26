import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { darsCircles, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AdminDarsCirclesClient } from "./dars-circles-client";

export default async function AdminDarsCirclesPage({
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

  let circles: Array<{
    id: string;
    title: string;
    category: string;
    teacherName: string;
    scheduledAt: string | null;
    status: string;
    maxStudents: number;
    currentStudents: number;
  }> = [];

  try {
    const rows = await db
      .select({
        id: darsCircles.id,
        titleEn: darsCircles.titleEn,
        titleUr: darsCircles.titleUr,
        category: darsCircles.category,
        teacherId: darsCircles.teacherId,
        scheduledAt: darsCircles.scheduledAt,
        status: darsCircles.status,
        maxStudents: darsCircles.maxStudents,
        currentStudents: darsCircles.currentStudents,
        teacherName: users.fullName,
      })
      .from(darsCircles)
      .leftJoin(users, eq(darsCircles.teacherId, users.id))
      .orderBy(desc(darsCircles.createdAt))
      .limit(50);

    circles = rows.map((r) => ({
      id: r.id,
      title: r.titleEn ?? r.titleUr ?? "Untitled",
      category: r.category ?? "quran",
      teacherName: r.teacherName ?? "Unknown",
      scheduledAt: r.scheduledAt ? String(r.scheduledAt) : null,
      status: r.status ?? "upcoming",
      maxStudents: r.maxStudents,
      currentStudents: r.currentStudents,
    }));
  } catch {
    // DB unavailable
  }

  return <AdminDarsCirclesClient circles={circles} />;
}
