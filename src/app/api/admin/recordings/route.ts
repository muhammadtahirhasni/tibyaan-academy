import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, classRecordings, teacherStudentMatches, enrollments } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { studentId, teacherId, recordingUrl, sessionDate, durationMinutes, description } = await request.json();
    if (!studentId || !teacherId || !recordingUrl || !sessionDate) {
      return NextResponse.json({ error: "studentId, teacherId, recordingUrl, sessionDate are required" }, { status: 400 });
    }

    // Find the match to get matchId (optional, we can proceed without it)
    const [match] = await db
      .select({ id: teacherStudentMatches.id })
      .from(teacherStudentMatches)
      .where(
        and(
          eq(teacherStudentMatches.studentId, studentId),
          eq(teacherStudentMatches.teacherId, teacherId),
        )
      )
      .limit(1);

    // If no match found, find any enrollment to create a fallback match
    let matchId = match?.id;
    if (!matchId) {
      // Create a minimal match record
      const [enrollment] = await db
        .select({ id: enrollments.id, courseId: enrollments.courseId })
        .from(enrollments)
        .where(eq(enrollments.studentId, studentId))
        .limit(1);

      if (enrollment) {
        const [nm] = await db.insert(teacherStudentMatches).values({
          studentId,
          teacherId,
          courseId: enrollment.courseId,
          status: "active",
          requestedAt: new Date(),
          respondedAt: new Date(),
        }).returning({ id: teacherStudentMatches.id });
        matchId = nm.id;
      }
    }

    if (!matchId) {
      return NextResponse.json({ error: "No enrollment found for this student-teacher pair" }, { status: 400 });
    }

    const sessionAt = new Date(sessionDate);
    const expiresAt = new Date(sessionAt.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const [recording] = await db.insert(classRecordings).values({
      matchId,
      teacherId,
      studentId,
      recordingUrl,
      duration: durationMinutes ? durationMinutes * 60 : null,
      sessionDate: sessionAt,
      expiresAt,
    }).returning();

    return NextResponse.json({ success: true, recording });
  } catch (err) {
    console.error("Admin add recording error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET — list all students and teachers for the upload form
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const allUsers = await db
      .select({ id: users.id, fullName: users.fullName, role: users.role })
      .from(users)
      .where(sql`${users.role} IN ('student', 'teacher')`)
      .orderBy(users.fullName);

    const students = allUsers.filter((u) => u.role === "student");
    const teachers = allUsers.filter((u) => u.role === "teacher");

    return NextResponse.json({ students, teachers });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
