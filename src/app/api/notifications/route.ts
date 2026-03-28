import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userNotifications: typeof notifications.$inferSelect[] = [];
    try {
      const db = getDb();
      userNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, user.id))
        .orderBy(sql`${notifications.createdAt} DESC`)
        .limit(50);
    } catch {
      // DB connection may fail in dev (WSL2/network issues) — return empty
      return NextResponse.json({ notifications: [] });
    }

    return NextResponse.json({ notifications: userNotifications });
  } catch (error) {
    console.error("Notifications get error:", error);
    return NextResponse.json({ notifications: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const db = getDb();

    const [notification] = await db.insert(notifications).values({
      userId: body.userId || user.id,
      type: body.type || "system",
      titleEn: body.titleEn,
      titleUr: body.titleUr || null,
      titleAr: body.titleAr || null,
      message: body.message,
      link: body.link || null,
    }).returning();

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("Notification create error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
