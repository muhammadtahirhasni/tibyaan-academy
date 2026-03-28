import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { messages, teacherStudentMatches } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

/**
 * GET /api/messages/[matchId] — Get conversation messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  // Verify user is part of this match
  const match = await db
    .select()
    .from(teacherStudentMatches)
    .where(eq(teacherStudentMatches.id, matchId))
    .limit(1);

  if (!match[0]) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (match[0].studentId !== authUser.id && match[0].teacherId !== authUser.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.matchId, matchId))
    .orderBy(asc(messages.createdAt));

  // Mark unread messages as read
  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.matchId, matchId),
        eq(messages.receiverId, authUser.id),
        eq(messages.isRead, false)
      )
    );

  return NextResponse.json({ messages: msgs });
}
