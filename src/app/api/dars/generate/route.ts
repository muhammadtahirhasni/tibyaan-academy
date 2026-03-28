import { NextRequest, NextResponse } from "next/server";
import { orchestrate } from "@/lib/agents/orchestrator";

const CATEGORIES = ["quran", "hadith", "fiqh", "seerah", "dua"] as const;

export async function GET(request: NextRequest) {
  // Vercel Cron auth
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return generateDars();
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  const validTokens = [process.env.CRON_SECRET, process.env.ADMIN_SECRET].filter(Boolean);

  if (!token || !validTokens.includes(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return generateDars();
}

async function generateDars() {
  try {
    // Rotate through categories based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const category = CATEGORIES[dayOfYear % CATEGORIES.length];

    const result = await orchestrate({
      taskType: "generate_daily_dars",
      input: { category },
      priority: "normal",
    });

    if (result.status === "error") {
      return NextResponse.json(
        { error: result.error ?? "Failed to generate dars" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      dars: result.output,
      tokensUsed: result.tokensUsed,
      durationMs: result.durationMs,
    });
  } catch (error) {
    console.error("[Dars Generation] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
