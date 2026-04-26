import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { teacherVideos, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/videos/public
 * Returns up to 4 most recent approved teacher videos joined with teacher info.
 * No auth required.
 */
export async function GET() {
  try {
    const db = getDb();

    const rows = await db
      .select({
        id: teacherVideos.id,
        title: teacherVideos.title,
        videoUrl: teacherVideos.videoUrl,
        thumbnailUrl: teacherVideos.thumbnailUrl,
        viewCount: teacherVideos.viewCount,
        createdAt: teacherVideos.createdAt,
        teacherId: teacherVideos.teacherId,
        teacherName: users.fullName,
      })
      .from(teacherVideos)
      .innerJoin(users, eq(teacherVideos.teacherId, users.id))
      .where(eq(teacherVideos.status, "approved"))
      .orderBy(desc(teacherVideos.createdAt))
      .limit(4);

    const videos = rows.map((r) => ({
      id: r.id,
      title: r.title,
      videoUrl: r.videoUrl,
      thumbnailUrl: r.thumbnailUrl,
      viewCount: r.viewCount,
      teacherId: r.teacherId,
      teacherName: r.teacherName || "Teacher",
      teacherCode: `TBA-${r.teacherId.substring(0, 8).toUpperCase()}`,
    }));

    return NextResponse.json({ videos });
  } catch (err) {
    console.error("Public videos fetch error:", err);
    return NextResponse.json({ videos: [] });
  }
}
