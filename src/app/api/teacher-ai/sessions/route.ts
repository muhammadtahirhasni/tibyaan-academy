import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { teacherAiChats, users } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

/**
 * GET /api/teacher-ai/sessions — List chat sessions for the current teacher
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  // Verify teacher role
  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!dbUser || dbUser.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden: teachers only" }, { status: 403 });
  }

  // Get distinct sessions with their first user message as title
  const sessions = await db
    .select({
      sessionId: teacherAiChats.sessionId,
      taskContext: teacherAiChats.taskContext,
      createdAt: sql<string>`min(${teacherAiChats.createdAt})`,
      lastMessageAt: sql<string>`max(${teacherAiChats.createdAt})`,
      messageCount: sql<number>`count(*)::int`,
      firstMessage: sql<string>`min(case when ${teacherAiChats.role} = 'user' then ${teacherAiChats.content} end)`,
    })
    .from(teacherAiChats)
    .where(eq(teacherAiChats.teacherId, user.id))
    .groupBy(teacherAiChats.sessionId, teacherAiChats.taskContext)
    .orderBy(desc(sql`max(${teacherAiChats.createdAt})`))
    .limit(30);

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.sessionId,
      title: s.firstMessage?.substring(0, 60) || "New Chat",
      taskContext: s.taskContext,
      messageCount: s.messageCount,
      createdAt: s.createdAt,
      lastMessageAt: s.lastMessageAt,
    })),
  });
}
