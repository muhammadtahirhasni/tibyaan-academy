import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { reviews } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, rating, reviewText } = body;

    if (!courseId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // AI spam check
    let aiSpamScore = "0.00";
    let autoApproved = false;
    let autoRejected = false;

    if (reviewText) {
      try {
        const spamRes = await fetch(new URL("/api/admin/reviews/spam-check", request.url), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviewText }),
        });
        const spamData = await spamRes.json();
        aiSpamScore = spamData.spamScore || "0.50";
        const score = Number(aiSpamScore);
        if (score < 0.3) autoApproved = true;
        if (score > 0.7) autoRejected = true;
      } catch {
        aiSpamScore = "0.50";
      }
    }

    const db = getDb();
    const [newReview] = await db.insert(reviews).values({
      studentId: user.id,
      courseId,
      rating,
      reviewText: reviewText || null,
      isApproved: autoApproved,
      aiModerated: autoApproved || autoRejected,
      aiSpamScore,
    }).returning();

    return NextResponse.json({ review: newReview, autoApproved }, { status: 201 });
  } catch (error) {
    console.error("Review submit error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
