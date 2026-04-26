import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { aiChatHistory, lessons, hifzTracker, weeklyTests, enrollments } from "@/lib/db/schema";
import { eq, and, asc, count, avg } from "drizzle-orm";
import { getUstazSystemPrompt, DAILY_MESSAGE_LIMIT } from "@/lib/claude/ustaz";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const {
      message,
      sessionId,
      studentName,
      courseName,
      courseType,
      currentLevel,
      preferredLanguage,
      chatHistory,
    } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    // Load persisted history if sessionId provided and user authenticated
    let messages: Array<{ role: string; content: string }> = [];
    let persistedHistory: typeof messages = [];

    if (user && sessionId) {
      const db = getDb();
      const persisted = await db
        .select()
        .from(aiChatHistory)
        .where(
          and(
            eq(aiChatHistory.sessionId, sessionId),
            eq(aiChatHistory.studentId, user.id)
          )
        )
        .orderBy(asc(aiChatHistory.createdAt));

      persistedHistory = persisted.slice(-20).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      messages = [...persistedHistory];
    } else if (chatHistory && Array.isArray(chatHistory)) {
      // Fallback to client-sent history for non-authenticated users
      for (const msg of chatHistory.slice(-20)) {
        persistedHistory.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        });
      }
      messages = [...persistedHistory];
    }

    // Determine if this is the first message in the conversation
    const isFirstMessage = persistedHistory.length === 0;

    // Try to fetch student activity for context
    let studentActivity: {
      lessonsCompleted: number;
      hifzEntries: number;
      testAvg: number | null;
      streak: number;
    } | undefined;

    if (user) {
      try {
        const db = getDb();
        // Get enrollment IDs
        const userEnrollments = await db
          .select({ id: enrollments.id })
          .from(enrollments)
          .where(eq(enrollments.studentId, user.id));

        if (userEnrollments.length > 0) {
          const enrollmentIds = userEnrollments.map((e) => e.id);

          // Count completed lessons
          const [lessonsResult] = await db
            .select({ count: count() })
            .from(lessons)
            .where(
              and(
                eq(lessons.isCompleted, true),
                eq(lessons.enrollmentId, enrollmentIds[0])
              )
            );

          // Count hifz entries
          const [hifzResult] = await db
            .select({ count: count() })
            .from(hifzTracker)
            .where(eq(hifzTracker.studentId, user.id));

          // Get test average
          const [testResult] = await db
            .select({ avg: avg(weeklyTests.scorePercentage) })
            .from(weeklyTests)
            .where(eq(weeklyTests.enrollmentId, enrollmentIds[0]));

          studentActivity = {
            lessonsCompleted: Number(lessonsResult?.count ?? 0),
            hifzEntries: Number(hifzResult?.count ?? 0),
            testAvg: testResult?.avg ? Math.round(parseFloat(testResult.avg)) : null,
            streak: 0,
          };
        }
      } catch {
        // If fetching activity fails, just proceed without it
      }
    }

    const systemPrompt = getUstazSystemPrompt({
      studentName: studentName || "Student",
      courseName: courseName || "Nazra Quran",
      courseType: courseType || "nazra",
      currentLevel: currentLevel || "Level 1",
      preferredLanguage: preferredLanguage || "English",
      isFirstMessage,
      studentActivity,
    });

    messages.push({ role: "user", content: message });

    // Save user message to DB
    if (user && sessionId) {
      const db = getDb();
      const langCode = preferredLanguage === "اردو" ? "ur"
        : preferredLanguage === "العربية" ? "ar"
        : preferredLanguage === "Français" ? "fr"
        : preferredLanguage === "Bahasa" ? "id"
        : "en";

      await db.insert(aiChatHistory).values({
        studentId: user.id,
        sessionId,
        role: "user",
        content: message,
        language: langCode as "ur" | "ar" | "en" | "fr" | "id",
        courseContext: courseType || "nazra",
      });
    }

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
        max_tokens: 1024,
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
          if (user && sessionId && fullAssistantText) {
            try {
              const db = getDb();
              const langCode = preferredLanguage === "اردو" ? "ur"
                : preferredLanguage === "العربية" ? "ar"
                : preferredLanguage === "Français" ? "fr"
                : preferredLanguage === "Bahasa" ? "id"
                : "en";

              await db.insert(aiChatHistory).values({
                studentId: user.id,
                sessionId,
                role: "assistant",
                content: fullAssistantText,
                language: langCode as "ur" | "ar" | "en" | "fr" | "id",
                courseContext: courseType || "nazra",
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
    console.error("AI Ustaz error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
