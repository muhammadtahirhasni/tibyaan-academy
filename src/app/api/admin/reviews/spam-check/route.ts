import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewText } = await request.json();
    if (!reviewText || typeof reviewText !== "string") {
      return NextResponse.json({ error: "reviewText required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ spamScore: "0.50" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 50,
        messages: [
          {
            role: "user",
            content: `Rate the following review text for spam/abuse on a scale of 0.00 to 1.00, where 0 is genuine and 1 is spam/abusive. Reply with ONLY a number like 0.15 or 0.85. No other text.\n\nReview: "${reviewText}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ spamScore: "0.50" });
    }

    const data = await response.json();
    const responseText = data.content?.[0]?.text?.trim() ?? "0.50";
    const score = Math.min(1, Math.max(0, parseFloat(responseText) || 0.5));

    return NextResponse.json({ spamScore: score.toFixed(2) });
  } catch (error) {
    console.error("Spam check error:", error);
    return NextResponse.json({ spamScore: "0.50" });
  }
}
