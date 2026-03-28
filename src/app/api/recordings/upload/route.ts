import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, classRecordings, teacherStudentMatches } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getRecordingKey, getPresignedUploadUrl, getPublicUrl } from "@/lib/r2/client";
import { randomUUID } from "crypto";

const RECORDINGS_BUCKET = "recordings";

/**
 * POST /api/recordings/upload
 * Teacher uploads a class recording.
 * Body: { matchId, contentType?, duration? }
 * Returns: { uploadUrl, recordingId, key }
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

  const { matchId, contentType = "video/mp4", duration } = await request.json();

  if (!matchId) {
    return NextResponse.json({ error: "matchId required" }, { status: 400 });
  }

  // Verify match exists and teacher is part of it
  const match = await db
    .select()
    .from(teacherStudentMatches)
    .where(eq(teacherStudentMatches.id, matchId))
    .limit(1);

  if (!match[0] || (match[0].teacherId !== authUser.id && dbUser[0].role !== "admin")) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const recordingId = randomUUID();
  const key = getRecordingKey(matchId, recordingId);

  const uploadUrl = await getPresignedUploadUrl(key, contentType, 3600, RECORDINGS_BUCKET);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const [recording] = await db
    .insert(classRecordings)
    .values({
      id: recordingId,
      matchId,
      teacherId: match[0].teacherId,
      studentId: match[0].studentId,
      recordingUrl: getPublicUrl(key, RECORDINGS_BUCKET),
      duration: duration ?? null,
      sessionDate: now,
      expiresAt,
    })
    .returning();

  return NextResponse.json({
    uploadUrl,
    recordingId: recording.id,
    key,
    expiresAt: expiresAt.toISOString(),
  });
}
