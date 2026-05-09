import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, progressEntries } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "student") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const entries = await db
      .select({ entry: progressEntries, teacher: users })
      .from(progressEntries)
      .innerJoin(users, eq(progressEntries.teacherId, users.id))
      .where(eq(progressEntries.studentId, authUser.id))
      .orderBy(desc(progressEntries.entryDate))
      .limit(100);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Student progress GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
