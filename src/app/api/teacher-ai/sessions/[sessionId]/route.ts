import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { teacherAiChats, users } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

/**
 * GET /api/teacher-ai/sessions/[sessionId] — Load messages for a teacher AI session
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

  // Verify teacher role
  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!dbUser || dbUser.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden: teachers only" }, { status: 403 });
  }

  const messages = await db
    .select()
    .from(teacherAiChats)
    .where(
      and(
        eq(teacherAiChats.sessionId, sessionId),
        eq(teacherAiChats.teacherId, user.id)
      )
    )
    .orderBy(asc(teacherAiChats.createdAt));

  return NextResponse.json({ messages });
}
