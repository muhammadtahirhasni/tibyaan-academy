import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import {
  users,
  scheduleRequests,
  teacherStudentMatches,
  enrollments,
  classes,
  notifications,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

type Db = ReturnType<typeof getDb>;

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

    const body = await request.json();
    const status = body.status as string;
    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
    }

    const [updated] = await db
      .update(scheduleRequests)
      .set({ status: status as "approved" | "rejected", updatedAt: new Date() })
      .where(eq(scheduleRequests.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (status === "approved") {
      await handleApproval(db, updated);
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("Admin schedule request update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleApproval(db: Db, req: any) {
  const { studentId, teacherId, courseId, preferredDays, preferredTime, selectedSlot, timezone } =
    req as {
      studentId: string;
      teacherId: string;
      courseId: string;
      preferredDays: string[] | null;
      preferredTime: { start: string; end: string } | null;
      selectedSlot: { day: string; time: string } | null;
      timezone: string;
    };

  // 1. Find or create enrollment for student + course
  const [existingEnrollment] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)))
    .limit(1);

  let enrollmentId: string;
  if (existingEnrollment) {
    enrollmentId = existingEnrollment.id;
    if (existingEnrollment.status !== "active") {
      await db
        .update(enrollments)
        .set({ status: "active", subscriptionStartDate: new Date() })
        .where(eq(enrollments.id, existingEnrollment.id));
    }
  } else {
    const [newEnrollment] = await db
      .insert(enrollments)
      .values({
        studentId,
        courseId,
        planType: "human_ai",
        status: "active",
        subscriptionStartDate: new Date(),
      })
      .returning();
    enrollmentId = newEnrollment.id;
  }

  // 2. Create or activate teacher-student match
  const [existingMatch] = await db
    .select()
    .from(teacherStudentMatches)
    .where(
      and(
        eq(teacherStudentMatches.studentId, studentId),
        eq(teacherStudentMatches.teacherId, teacherId),
        eq(teacherStudentMatches.courseId, courseId)
      )
    )
    .limit(1);

  const schedule = {
    days: preferredDays ?? (selectedSlot?.day ? [selectedSlot.day] : []),
    time: selectedSlot?.time ?? preferredTime?.start ?? "10:00",
    timezone,
  };

  if (existingMatch) {
    await db
      .update(teacherStudentMatches)
      .set({ status: "active", respondedAt: new Date(), schedule })
      .where(eq(teacherStudentMatches.id, existingMatch.id));
  } else {
    await db.insert(teacherStudentMatches).values({
      studentId,
      teacherId,
      courseId,
      status: "active",
      respondedAt: new Date(),
      schedule,
    });
  }

  // 3. Generate class dates for current month based on schedule
  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const days = schedule.days.map((d) => d.toLowerCase());
  const [hourStr, minuteStr] = schedule.time.split(":");
  const hour = parseInt(hourStr ?? "10", 10);
  const minute = parseInt(minuteStr ?? "0", 10);

  const classDates: Date[] = [];
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= monthEnd && classDates.length < 20) {
    const dayName = cursor.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    if (days.length === 0 || days.includes(dayName)) {
      const classDate = new Date(cursor);
      classDate.setHours(hour, minute, 0, 0);
      if (classDate > now) classDates.push(classDate);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  if (classDates.length > 0) {
    await db.insert(classes).values(
      classDates.map((scheduledAt) => ({
        enrollmentId,
        teacherId,
        scheduledAt,
        durationMinutes: 30,
        status: "scheduled" as const,
      }))
    );
  }

  // 4. Notify teacher
  const [student] = await db
    .select({ fullName: users.fullName })
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1);

  const studentName = student?.fullName ?? "A student";
  const scheduleDesc = `${schedule.days.map((d) => d.slice(0, 3)).join(", ")} at ${schedule.time} (${timezone})`;

  await db.insert(notifications).values({
    userId: teacherId,
    type: "match_accepted",
    titleEn: "New Student Assigned",
    titleUr: "نیا طالب علم تفویض کیا گیا",
    message: `${studentName} has been assigned to you. Schedule: ${scheduleDesc}`,
    link: "/teacher/students",
  });
}
