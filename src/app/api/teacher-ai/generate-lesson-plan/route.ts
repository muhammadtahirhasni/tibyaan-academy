import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getLessonPlanPrompt } from "@/lib/claude/teacher-assistant";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const [dbUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!dbUser || dbUser.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden: teachers only" }, { status: 403 });
    }

    const body = await request.json();
    const { courseType, topic, level, duration } = body;

    if (!courseType || !topic || !level) {
      return NextResponse.json(
        { error: "courseType, topic, and level are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const durationMin = Math.min(Math.max(duration || 30, 15), 120);
    const systemPrompt = getLessonPlanPrompt(courseType, topic, level, durationMin);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Generate a ${durationMin}-minute lesson plan about "${topic}" for ${level} students in the ${courseType} course. Respond with ONLY the JSON object.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", errorText);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const result = await response.json();
    const content = result.content?.[0]?.text || "";

    // Parse the JSON from Claude's response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json(
          { error: "Failed to parse lesson plan response" },
          { status: 500 }
        );
      }
      const lessonPlan = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ lessonPlan });
    } catch {
      console.error("Failed to parse lesson plan JSON:", content);
      return NextResponse.json(
        { error: "Failed to parse lesson plan response" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Generate lesson plan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
