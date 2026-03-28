import { NextRequest, NextResponse } from "next/server";
import { orchestrate } from "@/lib/agents/orchestrator";
import type { TaskType } from "@/lib/agents/types";

export async function POST(request: NextRequest) {
  try {
    // Auth check — admin or cron secret
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const validTokens = [
      process.env.CRON_SECRET,
      process.env.ADMIN_SECRET,
    ].filter(Boolean);

    if (!token || !validTokens.includes(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { taskType, input, priority } = body as {
      taskType: TaskType;
      input: Record<string, unknown>;
      priority?: "low" | "normal" | "high";
    };

    if (!taskType || !input) {
      return NextResponse.json(
        { error: "taskType and input are required" },
        { status: 400 }
      );
    }

    const result = await orchestrate({ taskType, input, priority });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Orchestrator] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
