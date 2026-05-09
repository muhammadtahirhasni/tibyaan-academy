import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, studentComplaints } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const complaints = await db
      .select({ complaint: studentComplaints, student: users })
      .from(studentComplaints)
      .innerJoin(users, eq(studentComplaints.studentId, users.id))
      .orderBy(desc(studentComplaints.createdAt))
      .limit(200);

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error("Admin complaints GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
