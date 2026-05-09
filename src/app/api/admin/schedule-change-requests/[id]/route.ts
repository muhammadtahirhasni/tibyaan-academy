import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, scheduleChangeRequests, teacherStudentMatches, notifications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { status, adminNotes } = await request.json();
    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
    }

    const [updated] = await db
      .update(scheduleChangeRequests)
      .set({ status, adminNotes: adminNotes ?? null, updatedAt: new Date() })
      .where(eq(scheduleChangeRequests.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    if (status === "approved") {
      // Update the match schedule
      await db
        .update(teacherStudentMatches)
        .set({ schedule: updated.newSchedule })
        .where(eq(teacherStudentMatches.id, updated.matchId));

      // Notify teacher
      await db.insert(notifications).values({
        userId: updated.teacherId,
        type: "system",
        titleEn: "Schedule Change Approved",
        titleUr: "شیڈول تبدیلی منظور",
        message: "A student's schedule change request has been approved. Please check the updated schedule.",
        link: "/teacher/schedule",
      });

      // Notify student
      await db.insert(notifications).values({
        userId: updated.studentId,
        type: "system",
        titleEn: "Schedule Change Approved",
        titleUr: "شیڈول تبدیلی منظور",
        message: "Your schedule change request has been approved.",
        link: "/student/schedule",
      });
    } else {
      // Notify student of rejection
      await db.insert(notifications).values({
        userId: updated.studentId,
        type: "system",
        titleEn: "Schedule Change Request Declined",
        titleUr: "شیڈول تبدیلی کی درخواست مسترد",
        message: adminNotes
          ? `Your schedule change request was declined. Reason: ${adminNotes}`
          : "Your schedule change request was declined.",
        link: "/student/schedule",
      });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("Admin schedule-change-requests PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
