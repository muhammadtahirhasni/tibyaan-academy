import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, darsCircles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCircleById, updateCircle } from "@/lib/db/dars-circle-queries";

/**
 * GET /api/dars-circles/[id] — Get single circle with details
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const circle = await getCircleById(id);

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    return NextResponse.json({ circle });
  } catch (error) {
    console.error("Failed to fetch circle:", error);
    return NextResponse.json(
      { error: "Failed to fetch circle" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/dars-circles/[id] — Update circle (teacher only)
 * Body: partial circle fields
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  // Verify teacher role
  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!dbUser[0] || dbUser[0].role !== "teacher") {
    return NextResponse.json({ error: "Teachers only" }, { status: 403 });
  }

  // Verify ownership
  const circle = await db
    .select()
    .from(darsCircles)
    .where(eq(darsCircles.id, id))
    .limit(1);

  if (!circle[0]) {
    return NextResponse.json({ error: "Circle not found" }, { status: 404 });
  }

  if (circle[0].teacherId !== authUser.id) {
    return NextResponse.json(
      { error: "Not your circle" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    const allowedFields = [
      "titleUr",
      "titleAr",
      "titleEn",
      "titleFr",
      "titleId",
      "descriptionUr",
      "descriptionAr",
      "descriptionEn",
      "descriptionFr",
      "descriptionId",
      "category",
      "meetingLink",
      "maxStudents",
      "status",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (body.scheduledAt) {
      updateData.scheduledAt = new Date(body.scheduledAt);
    }

    if (updateData.category) {
      const validCategories = ["quran", "hadith", "fiqh", "seerah", "dua"];
      if (!validCategories.includes(updateData.category as string)) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
      }
    }

    if (updateData.status) {
      const validStatuses = ["upcoming", "live", "completed", "cancelled"];
      if (!validStatuses.includes(updateData.status as string)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
    }

    const updated = await updateCircle(id, updateData as Parameters<typeof updateCircle>[1]);

    return NextResponse.json({ circle: updated });
  } catch (error) {
    console.error("Failed to update circle:", error);
    return NextResponse.json(
      { error: "Failed to update circle" },
      { status: 500 }
    );
  }
}
