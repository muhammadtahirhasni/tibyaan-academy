import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, teacherVideos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getVideoKey, getPresignedUploadUrl, getPublicUrl } from "@/lib/r2/client";
import { randomUUID } from "crypto";

/**
 * POST /api/videos/upload
 * Teacher or admin requests a presigned upload URL.
 * Body: { title, description?, contentType? }
 * Returns: { uploadUrl, videoId, key }
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

  if (!dbUser[0] || !["teacher", "admin"].includes(dbUser[0].role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, contentType = "video/mp4" } = body;

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const videoId = randomUUID();
  const ext = contentType === "video/webm" ? "webm" : "mp4";
  const key = getVideoKey(authUser.id, videoId, ext);

  const uploadUrl = await getPresignedUploadUrl(key, contentType);

  // Create DB record with pending status
  const [video] = await db
    .insert(teacherVideos)
    .values({
      id: videoId,
      teacherId: authUser.id,
      title: title.trim(),
      description: description?.trim() || null,
      videoUrl: getPublicUrl(key),
      status: "pending",
      isPublic: false,
    })
    .returning();

  return NextResponse.json({
    uploadUrl,
    videoId: video.id,
    key,
  });
}
