import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { tajweedChecks } from "@/lib/db/schema";
import { transcribeArabicAudio } from "@/lib/audio/transcribe";
import { orchestrate } from "@/lib/agents/orchestrator";
import {
  awardPoints,
  updateStreak,
  checkAndAwardBadges,
} from "@/lib/db/gamification-queries";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const surahNumber = parseInt(formData.get("surahNumber") as string);
    const ayahFrom = parseInt(formData.get("ayahFrom") as string);
    const ayahTo = parseInt(formData.get("ayahTo") as string);

    if (!audioFile || !surahNumber || !ayahFrom || !ayahTo) {
      return NextResponse.json(
        { error: "Missing required fields: audio, surahNumber, ayahFrom, ayahTo" },
        { status: 400 }
      );
    }

    // Convert to buffer for Whisper
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Transcribe with Whisper
    const { text: transcription } = await transcribeArabicAudio(
      buffer,
      "recitation.webm"
    );

    if (!transcription || transcription.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not transcribe audio. Please try again." },
        { status: 422 }
      );
    }

    // Analyze with Tajweed Agent
    const result = await orchestrate({
      taskType: "analyze_tajweed",
      input: {
        transcription,
        surahNumber,
        ayahFrom,
        ayahTo,
      },
    });

    if (result.status === "error") {
      return NextResponse.json(
        { error: "Analysis failed. Please try again." },
        { status: 500 }
      );
    }

    const feedback = result.output as {
      score: number;
      errors: Array<{
        type: string;
        word: string;
        expected: string;
        description: string;
      }>;
      strengths: string[];
      suggestions: string[];
    };

    // Save to DB
    const db = getDb();
    const [saved] = await db
      .insert(tajweedChecks)
      .values({
        studentId: user.id,
        transcription,
        surahNumber,
        ayahFrom,
        ayahTo,
        score: feedback.score,
        feedback,
        durationSeconds: Math.round(buffer.length / 16000), // approximate
      })
      .returning();

    // Award gamification points
    await awardPoints(user.id, "tajweed_check", saved.id);
    await updateStreak(user.id);
    const newBadges = await checkAndAwardBadges(user.id);

    return NextResponse.json({
      id: saved.id,
      transcription,
      score: feedback.score,
      feedback,
      newBadges,
    });
  } catch (error) {
    console.error("Tajweed check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
