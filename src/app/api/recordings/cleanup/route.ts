import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { classRecordings } from "@/lib/db/schema";
import { and, eq, lte } from "drizzle-orm";
import { deleteFromStorage } from "@/lib/r2/client";

/**
 * GET /api/recordings/cleanup — Vercel Cron: auto-delete expired recordings
 * Runs daily at midnight UTC (configured in vercel.json)
 */
export async function GET(request: NextRequest) {
  // Vercel Cron auth
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const now = new Date();

  // Find expired recordings that haven't been deleted yet
  const expired = await db
    .select()
    .from(classRecordings)
    .where(
      and(
        lte(classRecordings.expiresAt, now),
        eq(classRecordings.isDeletedBySystem, false)
      )
    );

  let deletedCount = 0;
  const errors: string[] = [];

  for (const recording of expired) {
    try {
      // Extract storage key from URL
      const url = new URL(recording.recordingUrl);
      const pathParts = url.pathname.split("/storage/v1/object/public/recordings/");
      const key = pathParts[1] || url.pathname.replace(/^\//, "");

      if (key) {
        await deleteFromStorage(key, "recordings");
      }

      await db
        .update(classRecordings)
        .set({ isDeletedBySystem: true })
        .where(eq(classRecordings.id, recording.id));

      deletedCount++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      errors.push(`${recording.id}: ${msg}`);

      // Still mark as deleted to avoid re-processing
      await db
        .update(classRecordings)
        .set({ isDeletedBySystem: true })
        .where(eq(classRecordings.id, recording.id));
    }
  }

  return NextResponse.json({
    found: expired.length,
    deleted: deletedCount,
    errors: errors.length > 0 ? errors : undefined,
  });
}
