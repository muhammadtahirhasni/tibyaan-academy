import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCircles, createCircle } from "@/lib/db/dars-circle-queries";

/**
 * GET /api/dars-circles — List circles with optional status/category filter
 * Query params: ?status=upcoming&category=quran
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as
    | "upcoming"
    | "live"
    | "completed"
    | "cancelled"
    | null;
  const category = searchParams.get("category") as
    | "quran"
    | "hadith"
    | "fiqh"
    | "seerah"
    | "dua"
    | null;

  try {
    const filter: Parameters<typeof getCircles>[0] = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const circles = await getCircles(
      Object.keys(filter).length > 0 ? filter : undefined
    );
    return NextResponse.json({ circles });
  } catch (error) {
    console.error("Failed to fetch circles:", error);
    return NextResponse.json(
      { error: "Failed to fetch circles" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dars-circles — Teacher creates a new circle
 * Body: { titleUr, titleAr, titleEn, titleFr, titleId, descriptionUr, ..., category, meetingLink, scheduledAt, maxStudents }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!dbUser[0] || dbUser[0].role !== "teacher") {
    return NextResponse.json({ error: "Teachers only" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      titleUr,
      titleAr,
      titleEn,
      titleFr,
      titleId,
      descriptionUr,
      descriptionAr,
      descriptionEn,
      descriptionFr,
      descriptionId,
      category,
      meetingLink,
      scheduledAt,
      maxStudents,
    } = body;

    if (!category || !scheduledAt) {
      return NextResponse.json(
        { error: "category and scheduledAt are required" },
        { status: 400 }
      );
    }

    const validCategories = ["quran", "hadith", "fiqh", "seerah", "dua"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    const circle = await createCircle({
      teacherId: authUser.id,
      titleUr: titleUr || null,
      titleAr: titleAr || null,
      titleEn: titleEn || null,
      titleFr: titleFr || null,
      titleId: titleId || null,
      descriptionUr: descriptionUr || null,
      descriptionAr: descriptionAr || null,
      descriptionEn: descriptionEn || null,
      descriptionFr: descriptionFr || null,
      descriptionId: descriptionId || null,
      category,
      meetingLink: meetingLink || null,
      scheduledAt: new Date(scheduledAt),
      maxStudents: maxStudents ? Number(maxStudents) : 30,
    });

    return NextResponse.json({ circle });
  } catch (error) {
    console.error("Failed to create circle:", error);
    return NextResponse.json(
      { error: "Failed to create circle" },
      { status: 500 }
    );
  }
}
