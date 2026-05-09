import { NextRequest, NextResponse } from "next/server";
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
    if (!dbUser || dbUser.role !== "student") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const complaints = await db
      .select()
      .from(studentComplaints)
      .where(eq(studentComplaints.studentId, authUser.id))
      .orderBy(desc(studentComplaints.createdAt));

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error("Student complaints GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "student") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { subject, category, description } = await request.json();
    if (!subject || !category || !description) {
      return NextResponse.json({ error: "subject, category, description are required" }, { status: 400 });
    }

    const [complaint] = await db
      .insert(studentComplaints)
      .values({
        studentId: authUser.id,
        subject,
        category,
        description,
        status: "new",
      })
      .returning();

    return NextResponse.json({ complaint });
  } catch (error) {
    console.error("Student complaints POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
