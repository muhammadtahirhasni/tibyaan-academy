import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, teacherVideos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * PATCH /api/videos/[id]/approve
 * Admin approves or rejects a video.
 * Body: { action: "approve" | "reject", adminNotes?: string }
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
  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!dbUser[0] || dbUser[0].role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await request.json();
  const { action, adminNotes } = body;

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "Invalid action. Use 'approve' or 'reject'" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(teacherVideos)
    .set({
      status: action === "approve" ? "approved" : "rejected",
      isPublic: action === "approve",
      adminNotes: adminNotes?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(teacherVideos.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  return NextResponse.json({ video: updated });
}
