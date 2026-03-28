import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const allowedFields = [
      "slug", "nameEn", "nameUr", "nameAr", "nameFr", "nameId",
      "descriptionEn", "descriptionUr", "descriptionAr", "descriptionFr", "descriptionId",
      "courseType", "durationMonths", "pricePlan1Monthly", "pricePlan2Monthly", "isActive",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    }

    await db.update(courses).set(updates).where(eq(courses.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin update course error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const db = getDb();

    // Soft-delete: deactivate instead of deleting
    await db.update(courses).set({ isActive: false }).where(eq(courses.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete course error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
