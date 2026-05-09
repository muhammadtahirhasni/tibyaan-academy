import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, scheduleChangeRequests } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const students = alias(users, "students");
    const teachers = alias(users, "teachers");

    const requests = await db
      .select({
        request: scheduleChangeRequests,
        studentName: students.fullName,
        teacherName: teachers.fullName,
      })
      .from(scheduleChangeRequests)
      .innerJoin(students, eq(scheduleChangeRequests.studentId, students.id))
      .innerJoin(teachers, eq(scheduleChangeRequests.teacherId, teachers.id))
      .orderBy(desc(scheduleChangeRequests.createdAt))
      .limit(100);

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Admin schedule-change-requests GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
