import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { aiChatHistory } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

/**
 * GET /api/ai-ustaz/sessions — List chat sessions for the current student
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

  // Get distinct sessions with their first user message as title
  const sessions = await db
    .select({
      sessionId: aiChatHistory.sessionId,
      courseContext: aiChatHistory.courseContext,
      language: aiChatHistory.language,
      createdAt: sql<string>`min(${aiChatHistory.createdAt})`,
      lastMessageAt: sql<string>`max(${aiChatHistory.createdAt})`,
      messageCount: sql<number>`count(*)::int`,
      firstMessage: sql<string>`min(case when ${aiChatHistory.role} = 'user' then ${aiChatHistory.content} end)`,
    })
    .from(aiChatHistory)
    .where(eq(aiChatHistory.studentId, user.id))
    .groupBy(aiChatHistory.sessionId, aiChatHistory.courseContext, aiChatHistory.language)
    .orderBy(desc(sql`max(${aiChatHistory.createdAt})`))
    .limit(30);

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.sessionId,
      title: s.firstMessage?.substring(0, 60) || "New Chat",
      courseContext: s.courseContext,
      language: s.language,
      messageCount: s.messageCount,
      createdAt: s.createdAt,
      lastMessageAt: s.lastMessageAt,
    })),
  });
}
