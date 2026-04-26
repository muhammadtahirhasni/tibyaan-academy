import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, teacherVideos } from "@/lib/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { getPresignedUploadUrl, getPublicUrl, getVideoKey } from "@/lib/r2/client";
import { randomUUID } from "crypto";

/**
 * POST /api/videos/upload
 * Teacher requests a presigned upload URL for direct browser upload.
 * Body (JSON): { title, description?, contentType, fileName }
 * Returns: { signedUrl, videoId, key }
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

  // Daily upload limit: 1 video per teacher per day (admins exempt)
  if (dbUser[0].role === "teacher") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayUploads = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(teacherVideos)
      .where(
        and(
          eq(teacherVideos.teacherId, authUser.id),
          gte(teacherVideos.createdAt, todayStart)
        )
      );

    if ((todayUploads[0]?.count ?? 0) >= 1) {
      return NextResponse.json(
        { error: "Daily limit reached. You can upload 1 video per day." },
        { status: 429 }
      );
    }
  }

  try {
    const body = await request.json();
    const { title, description, contentType, fileName } = body as {
      title: string;
      description?: string;
      contentType: string;
      fileName: string;
    };

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!contentType || !fileName) {
      return NextResponse.json(
        { error: "contentType and fileName are required" },
        { status: 400 }
      );
    }

    const videoId = randomUUID();
    const ext = contentType === "video/webm" ? "webm" : "mp4";
    const key = getVideoKey(authUser.id, videoId, ext);

    // Get a presigned signed upload URL for direct browser upload
    const signedUrl = await getPresignedUploadUrl(key, contentType);

    // Compute the future public URL
    const publicUrl = getPublicUrl(key);

    // Create DB record with status "pending"
    const [video] = await db
      .insert(teacherVideos)
      .values({
        id: videoId,
        teacherId: authUser.id,
        title: title.trim(),
        description: description?.trim() || null,
        videoUrl: publicUrl,
        status: "pending",
        isPublic: false,
      })
      .returning();

    return NextResponse.json({
      signedUrl,
      videoId: video.id,
      key,
    });
  } catch (err) {
    console.error("Video upload presign error:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
