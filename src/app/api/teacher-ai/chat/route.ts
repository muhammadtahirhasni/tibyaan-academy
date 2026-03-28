import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { teacherAiChats, users } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { getTeacherAssistantPrompt } from "@/lib/claude/teacher-assistant";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify teacher role
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
    const { message, sessionId, taskContext } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    const systemPrompt = getTeacherAssistantPrompt();

    // Load persisted history for this session
    const persisted = await db
      .select()
      .from(teacherAiChats)
      .where(
        and(
          eq(teacherAiChats.sessionId, sessionId),
          eq(teacherAiChats.teacherId, user.id)
        )
      )
      .orderBy(asc(teacherAiChats.createdAt));

    const messages: Array<{ role: string; content: string }> = persisted
      .slice(-20)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    messages.push({ role: "user", content: message });

    // Save user message to DB
    await db.insert(teacherAiChats).values({
      teacherId: user.id,
      sessionId,
      role: "user",
      content: message,
      taskContext: taskContext || "chat",
    });

    // Call Claude API with streaming
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2048,
        system: systemPrompt,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", errorText);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    // Stream the response back, collecting full text for DB persistence
    let fullAssistantText = "";
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6).trim();
                if (data === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                    fullAssistantText += parsed.delta.text;
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`)
                    );
                  }
                  if (parsed.type === "message_stop") {
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
        } finally {
          // Save assistant response to DB
          if (fullAssistantText) {
            try {
              await db.insert(teacherAiChats).values({
                teacherId: user.id,
                sessionId,
                role: "assistant",
                content: fullAssistantText,
                taskContext: taskContext || "chat",
              });
            } catch (err) {
              console.error("Failed to save assistant message:", err);
            }
          }
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Teacher AI chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
