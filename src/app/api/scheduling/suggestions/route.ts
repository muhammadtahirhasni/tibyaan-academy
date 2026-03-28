import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { scheduleRequests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { orchestrate } from "@/lib/agents/orchestrator";
import {
  getTeacherAvailability,
  getStudentExistingClasses,
} from "@/lib/scheduling/availability";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = request.nextUrl.searchParams.get("requestId");
    if (!requestId) {
      return NextResponse.json(
        { error: "requestId is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const [schedReq] = await db
      .select()
      .from(scheduleRequests)
      .where(
        and(
          eq(scheduleRequests.id, requestId),
          eq(scheduleRequests.studentId, user.id)
        )
      )
      .limit(1);

    if (!schedReq) {
      return NextResponse.json(
        { error: "Schedule request not found" },
        { status: 404 }
      );
    }

    // If suggestions already exist, return them
    if (schedReq.aiSuggestions && schedReq.aiSuggestions.length > 0) {
      return NextResponse.json({ suggestions: schedReq.aiSuggestions });
    }

    // Get availability data
    const [teacherSchedule, existingClasses] = await Promise.all([
      getTeacherAvailability(schedReq.teacherId),
      getStudentExistingClasses(user.id),
    ]);

    // Call scheduling agent
    const result = await orchestrate({
      taskType: "suggest_schedule",
      input: {
        studentTimezone: schedReq.timezone,
        preferredDays: schedReq.preferredDays || [],
        preferredTime: schedReq.preferredTime || {
          start: "09:00",
          end: "17:00",
        },
        teacherSchedule,
        existingClasses,
      },
    });

    if (result.status === "error") {
      return NextResponse.json(
        { error: "Failed to generate suggestions" },
        { status: 500 }
      );
    }

    const suggestions = result.output.suggestions as Array<{
      day: string;
      time: string;
      score: number;
      reason: string;
    }>;

    // Save suggestions to the request
    await db
      .update(scheduleRequests)
      .set({
        aiSuggestions: suggestions,
        status: "suggested",
        updatedAt: new Date(),
      })
      .where(eq(scheduleRequests.id, requestId));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Scheduling suggestions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
