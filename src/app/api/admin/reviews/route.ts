import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { reviews, users, courses } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "pending";

    let condition;
    switch (filter) {
      case "approved":
        condition = and(eq(reviews.isApproved, true), eq(reviews.isFeatured, false));
        break;
      case "rejected":
        condition = eq(reviews.isApproved, false);
        break;
      case "featured":
        condition = eq(reviews.isFeatured, true);
        break;
      case "pending":
      default:
        condition = and(eq(reviews.isApproved, false), eq(reviews.aiModerated, false));
        break;
    }

    const reviewList = await db
      .select({
        id: reviews.id,
        studentName: users.fullName,
        courseName: courses.nameEn,
        rating: reviews.rating,
        reviewText: reviews.reviewText,
        isApproved: reviews.isApproved,
        isFeatured: reviews.isFeatured,
        aiSpamScore: reviews.aiSpamScore,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.studentId, users.id))
      .leftJoin(courses, eq(reviews.courseId, courses.id))
      .where(filter === "pending" ? undefined : condition)
      .orderBy(sql`${reviews.createdAt} DESC`)
      .limit(50);

    return NextResponse.json({ reviews: reviewList });
  } catch (error) {
    console.error("Admin reviews error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
