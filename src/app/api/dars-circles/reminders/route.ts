import { NextResponse } from "next/server";
import { getUpcomingReminders } from "@/lib/db/dars-circle-queries";

/**
 * GET /api/dars-circles/reminders — Cron endpoint
 * Find circles starting within 1 hour, could be used to send notifications.
 * For now, just logs the upcoming circles.
 */
export async function GET() {
  try {
    const upcomingCircles = await getUpcomingReminders();

    if (upcomingCircles.length === 0) {
      console.log("[dars-circle-reminders] No circles starting within the next hour.");
      return NextResponse.json({
        message: "No upcoming circles",
        count: 0,
      });
    }

    for (const { circle, teacher } of upcomingCircles) {
      console.log(
        `[dars-circle-reminders] Circle "${circle.titleEn || circle.titleUr || circle.id}" ` +
        `by ${teacher.fullName} scheduled at ${circle.scheduledAt.toISOString()} ` +
        `(${circle.currentStudents}/${circle.maxStudents} students)`
      );
      // TODO: Send push notifications / emails to enrolled students
    }

    return NextResponse.json({
      message: `Found ${upcomingCircles.length} circle(s) starting soon`,
      count: upcomingCircles.length,
      circles: upcomingCircles.map(({ circle, teacher }) => ({
        id: circle.id,
        title: circle.titleEn || circle.titleUr,
        teacher: teacher.fullName,
        scheduledAt: circle.scheduledAt.toISOString(),
        currentStudents: circle.currentStudents,
      })),
    });
  } catch (error) {
    console.error("[dars-circle-reminders] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}
