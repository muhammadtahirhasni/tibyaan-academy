import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getQuizGeneratorPrompt } from "@/lib/claude/teacher-assistant";

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
    const { courseType, topic, level, questionCount } = body;

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

    const count = Math.min(Math.max(questionCount || 5, 1), 20);
    const systemPrompt = getQuizGeneratorPrompt(courseType, topic, level);

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
            content: `Generate exactly ${count} quiz questions about "${topic}" for ${level} students. Respond with ONLY the JSON array.`,
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
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return NextResponse.json(
          { error: "Failed to parse quiz response" },
          { status: 500 }
        );
      }
      const quiz = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ quiz });
    } catch {
      console.error("Failed to parse quiz JSON:", content);
      return NextResponse.json(
        { error: "Failed to parse quiz response" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Generate quiz error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
