import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { scheduleRequests, users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// TBA-XXXXXXXX format (8 hex chars after TBA-)
const SHORT_ID_REGEX = /^TBA-([0-9a-f]{8})$/i;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teacherId: rawTeacherId, courseId, timezone, preferredDays, preferredTime } =
      await request.json();

    if (!rawTeacherId || !courseId || !timezone) {
      return NextResponse.json(
        { error: "teacherId, courseId, and timezone are required" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Resolve teacher ID — accept UUID or TBA-XXXXXXXX short ID
    let resolvedTeacherId: string;
    if (UUID_REGEX.test(rawTeacherId)) {
      resolvedTeacherId = rawTeacherId;
    } else {
      const shortMatch = SHORT_ID_REGEX.exec(rawTeacherId);
      if (!shortMatch) {
        return NextResponse.json(
          { error: "Invalid teacher ID format. Use UUID or TBA-XXXXXXXX format." },
          { status: 400 }
        );
      }
      // Find teacher whose UUID starts with the 8 hex chars
      const prefix = shortMatch[1].toLowerCase();
      const [foundTeacher] = await db
        .select({ id: users.id })
        .from(users)
        .where(sql`lower(${users.id}::text) like ${prefix + "%"}`)
        .limit(1);

      if (!foundTeacher) {
        return NextResponse.json(
          { error: "Teacher not found with that ID." },
          { status: 404 }
        );
      }
      resolvedTeacherId = foundTeacher.id;
    }

    if (!UUID_REGEX.test(courseId)) {
      return NextResponse.json(
        { error: "courseId must be a valid UUID" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(scheduleRequests)
      .values({
        studentId: user.id,
        teacherId: resolvedTeacherId,
        courseId,
        timezone,
        preferredDays: preferredDays || [],
        preferredTime: preferredTime || { start: "09:00", end: "17:00" },
        status: "pending",
      })
      .returning();

    return NextResponse.json(created);
  } catch (error) {
    console.error("Schedule request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
