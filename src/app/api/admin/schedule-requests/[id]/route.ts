import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, scheduleRequests, notifications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status } = await request.json();
    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
    }

    const [updated] = await db
      .update(scheduleRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(scheduleRequests.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Fetch full request details for notifications
    const [req] = await db
      .select({
        studentId: scheduleRequests.studentId,
        teacherId: scheduleRequests.teacherId,
        preferredDays: scheduleRequests.preferredDays,
        preferredTime: scheduleRequests.preferredTime,
        timezone: scheduleRequests.timezone,
        studentName: users.fullName,
      })
      .from(scheduleRequests)
      .innerJoin(users, eq(scheduleRequests.studentId, users.id))
      .where(eq(scheduleRequests.id, id))
      .limit(1);

    const [teacher] = await db
      .select({ name: users.fullName })
      .from(users)
      .where(eq(users.id, updated.teacherId))
      .limit(1);

    const days = Array.isArray(req?.preferredDays)
      ? (req.preferredDays as string[]).join(", ")
      : "";
    const time =
      req?.preferredTime &&
      typeof req.preferredTime === "object" &&
      "start" in (req.preferredTime as object)
        ? `${(req.preferredTime as { start: string; end: string }).start} – ${(req.preferredTime as { start: string; end: string }).end}`
        : "";

    if (status === "approved") {
      // Notify student
      await db.insert(notifications).values({
        userId: updated.studentId,
        type: "match_accepted",
        titleEn: "Schedule Request Approved",
        titleUr: "شیڈول درخواست منظور ہو گئی",
        titleAr: "تمت الموافقة على طلب الجدول",
        message: `Your schedule request has been approved. Teacher: ${teacher?.name ?? "Assigned Teacher"}, Days: ${days}, Time: ${time} (${req?.timezone ?? ""})`,
        link: "/student/schedule",
      });

      // Notify teacher
      await db.insert(notifications).values({
        userId: updated.teacherId,
        type: "match_request",
        titleEn: "New Class Scheduled",
        titleUr: "نئی کلاس شیڈول ہو گئی",
        titleAr: "تمت جدولة فصل جديد",
        message: `A new class has been confirmed for you. Student: ${req?.studentName ?? "Student"}, Days: ${days}, Time: ${time} (${req?.timezone ?? ""})`,
        link: "/teacher/schedule",
      });
    } else {
      // Notify student of rejection
      await db.insert(notifications).values({
        userId: updated.studentId,
        type: "match_rejected",
        titleEn: "Schedule Request Rejected",
        titleUr: "شیڈول درخواست مسترد ہو گئی",
        titleAr: "تم رفض طلب الجدول",
        message: "Your schedule request was not approved. Please submit a new request with different preferences.",
        link: "/student/schedule",
      });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("Admin schedule request update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
