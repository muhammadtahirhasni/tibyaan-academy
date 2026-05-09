import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, progressEntries, teacherStudentMatches } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "teacher") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    const whereClause = studentId
      ? and(eq(progressEntries.teacherId, authUser.id), eq(progressEntries.studentId, studentId))
      : eq(progressEntries.teacherId, authUser.id);

    const entries = await db
      .select({ entry: progressEntries, student: users })
      .from(progressEntries)
      .innerJoin(users, eq(progressEntries.studentId, users.id))
      .where(whereClause)
      .orderBy(desc(progressEntries.entryDate))
      .limit(100);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Teacher progress GET error:", error);
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

    const { studentId, lessonCovered, rating, notes } = await request.json();
    if (!studentId || !lessonCovered || !rating) {
      return NextResponse.json({ error: "studentId, lessonCovered, rating are required" }, { status: 400 });
    }

    // Get match ID if exists
    const [match] = await db
      .select()
      .from(teacherStudentMatches)
      .where(and(
        eq(teacherStudentMatches.teacherId, authUser.id),
        eq(teacherStudentMatches.studentId, studentId)
      ))
      .limit(1);

    const [entry] = await db
      .insert(progressEntries)
      .values({
        teacherId: authUser.id,
        studentId,
        matchId: match?.id ?? null,
        lessonCovered,
        rating,
        notes: notes ?? null,
        entryDate: new Date(),
      })
      .returning();

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Teacher progress POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
