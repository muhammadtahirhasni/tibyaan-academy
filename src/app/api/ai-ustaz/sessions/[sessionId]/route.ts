import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { aiChatHistory } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

/**
 * GET /api/ai-ustaz/sessions/[sessionId] — Load messages for a session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const messages = await db
    .select()
    .from(aiChatHistory)
    .where(
      and(
        eq(aiChatHistory.sessionId, sessionId),
        eq(aiChatHistory.studentId, user.id)
      )
    )
    .orderBy(asc(aiChatHistory.createdAt));

  return NextResponse.json({ messages });
}
