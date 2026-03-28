import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { messages, teacherStudentMatches, notifications } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/messages — Send a message
 * Body: { matchId, content }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matchId, content } = await request.json();
  if (!matchId || !content?.trim()) {
    return NextResponse.json({ error: "matchId and content required" }, { status: 400 });
  }

  const db = getDb();

  // Verify match exists and user is part of it
  const match = await db
    .select()
    .from(teacherStudentMatches)
    .where(eq(teacherStudentMatches.id, matchId))
    .limit(1);

  if (!match[0]) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const isStudent = match[0].studentId === authUser.id;
  const isTeacher = match[0].teacherId === authUser.id;

  if (!isStudent && !isTeacher) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only allow messaging for accepted/active matches
  if (!["accepted", "active"].includes(match[0].status)) {
    return NextResponse.json(
      { error: "Chat is only available for accepted matches" },
      { status: 400 }
    );
  }

  const receiverId = isStudent ? match[0].teacherId : match[0].studentId;

  const [msg] = await db
    .insert(messages)
    .values({
      senderId: authUser.id,
      receiverId,
      matchId,
      content: content.trim(),
    })
    .returning();

  // Create notification for receiver
  await db.insert(notifications).values({
    userId: receiverId,
    type: "new_message",
    titleEn: "New Message",
    message: content.trim().substring(0, 100),
    link: isStudent ? "/teacher/messages" : "/student/messages",
  });

  return NextResponse.json({ message: msg });
}
