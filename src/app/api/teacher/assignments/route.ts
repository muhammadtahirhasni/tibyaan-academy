import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, testsAssignments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "teacher") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const assignments = await db
      .select({ assignment: testsAssignments, student: users })
      .from(testsAssignments)
      .innerJoin(users, eq(testsAssignments.studentId, users.id))
      .where(eq(testsAssignments.teacherId, authUser.id))
      .orderBy(desc(testsAssignments.createdAt))
      .limit(100);

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Teacher assignments GET error:", error);
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
    if (!dbUser || dbUser.role !== "teacher") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { studentId, type, title, description, frequency, dueDate } = await request.json();
    if (!studentId || !type || !title) {
      return NextResponse.json({ error: "studentId, type, title are required" }, { status: 400 });
    }

    const [assignment] = await db
      .insert(testsAssignments)
      .values({
        teacherId: authUser.id,
        studentId,
        type,
        title,
        description: description ?? null,
        frequency: frequency ?? "once",
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "pending",
      })
      .returning();

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error("Teacher assignments POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
