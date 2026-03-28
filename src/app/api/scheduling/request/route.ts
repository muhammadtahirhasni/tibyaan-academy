import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { scheduleRequests } from "@/lib/db/schema";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teacherId, courseId, timezone, preferredDays, preferredTime } =
      await request.json();

    if (!teacherId || !courseId || !timezone) {
      return NextResponse.json(
        { error: "teacherId, courseId, and timezone are required" },
        { status: 400 }
      );
    }

    if (!UUID_REGEX.test(teacherId) || !UUID_REGEX.test(courseId)) {
      return NextResponse.json(
        { error: "teacherId and courseId must be valid UUIDs" },
        { status: 400 }
      );
    }

    const db = getDb();
    const [created] = await db
      .insert(scheduleRequests)
      .values({
        studentId: user.id,
        teacherId,
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
