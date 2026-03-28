import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, teacherStudentMatches, notifications } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/matches — Student requests a teacher match
 * Body: { teacherId, courseId }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!dbUser[0] || dbUser[0].role !== "student") {
    return NextResponse.json({ error: "Students only" }, { status: 403 });
  }

  const { teacherId, courseId } = await request.json();
  if (!teacherId || !courseId) {
    return NextResponse.json({ error: "teacherId and courseId required" }, { status: 400 });
  }

  // Check for existing pending/active match
  const existing = await db
    .select()
    .from(teacherStudentMatches)
    .where(
      and(
        eq(teacherStudentMatches.studentId, authUser.id),
        eq(teacherStudentMatches.teacherId, teacherId),
        eq(teacherStudentMatches.courseId, courseId)
      )
    )
    .limit(1);

  if (existing[0] && ["requested", "accepted", "active"].includes(existing[0].status)) {
    return NextResponse.json(
      { error: "Match already exists", matchId: existing[0].id },
      { status: 409 }
    );
  }

  const [match] = await db
    .insert(teacherStudentMatches)
    .values({
      studentId: authUser.id,
      teacherId,
      courseId,
    })
    .returning();

  // Notify teacher
  await db.insert(notifications).values({
    userId: teacherId,
    type: "match_request",
    titleEn: "New Student Request",
    message: `${dbUser[0].fullName} wants to study with you`,
    link: "/teacher/messages",
  });

  return NextResponse.json({ match });
}
