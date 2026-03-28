import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { aiUsageLogs, users } from "@/lib/db/schema";
import { eq, sum, count, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = getDb();

    // Total tokens and cost
    const [totals] = await db
      .select({
        totalTokens: sum(aiUsageLogs.tokensUsed),
        totalCostCents: sum(aiUsageLogs.estimatedCostCents),
      })
      .from(aiUsageLogs);

    // Flagged count
    const [flagged] = await db
      .select({ count: count() })
      .from(aiUsageLogs)
      .where(eq(aiUsageLogs.isFlagged, true));

    // Flagged conversations with student names
    const flaggedConversations = await db
      .select({
        id: aiUsageLogs.id,
        studentName: users.fullName,
        sessionId: aiUsageLogs.sessionId,
        flagReason: aiUsageLogs.flagReason,
        tokensUsed: aiUsageLogs.tokensUsed,
        createdAt: aiUsageLogs.createdAt,
      })
      .from(aiUsageLogs)
      .leftJoin(users, eq(aiUsageLogs.studentId, users.id))
      .where(eq(aiUsageLogs.isFlagged, true))
      .orderBy(sql`${aiUsageLogs.createdAt} DESC`)
      .limit(20);

    return NextResponse.json({
      totalTokens: Number(totals.totalTokens) || 0,
      totalCostCents: Number(totals.totalCostCents) || 0,
      flaggedCount: flagged.count,
      flaggedConversations,
    });
  } catch (error) {
    console.error("AI monitor error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
