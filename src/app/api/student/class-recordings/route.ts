import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, adminClassRecordings } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "student") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const recordings = await db
      .select({ recording: adminClassRecordings })
      .from(adminClassRecordings)
      .where(eq(adminClassRecordings.studentId, authUser.id))
      .orderBy(desc(adminClassRecordings.classDate))
      .limit(100);

    return NextResponse.json({ recordings: recordings.map((r) => r.recording) });
  } catch (error) {
    console.error("Student class-recordings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
