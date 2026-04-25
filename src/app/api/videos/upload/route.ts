import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, teacherVideos } from "@/lib/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { uploadToStorage, getVideoKey } from "@/lib/r2/client";
import { randomUUID } from "crypto";

/**
 * POST /api/videos/upload
 * Teacher uploads a video file directly.
 * Uses multipart form data: title, description?, file
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
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || null;
    const file = formData.get("file") as File | null;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "Video file is required" },
        { status: 400 }
      );
    }

    // Max 100MB
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum 100MB." },
        { status: 400 }
      );
    }

    const videoId = randomUUID();
    const ext = file.type === "video/webm" ? "webm" : "mp4";
    const key = getVideoKey(authUser.id, videoId, ext);
    const contentType = file.type || "video/mp4";

    // Upload file to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadToStorage(key, buffer, contentType);

    // Create DB record
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
      videoId: video.id,
      videoUrl: publicUrl,
    });
  } catch (err) {
    console.error("Video upload error:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
