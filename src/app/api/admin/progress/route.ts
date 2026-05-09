import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, progressEntries } from "@/lib/db/schema";
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

    const teachers = alias(users, "teachers");
    const students = alias(users, "students");

    const entries = await db
      .select({
        entry: progressEntries,
        teacherName: teachers.fullName,
        studentName: students.fullName,
      })
      .from(progressEntries)
      .innerJoin(teachers, eq(progressEntries.teacherId, teachers.id))
      .innerJoin(students, eq(progressEntries.studentId, students.id))
      .orderBy(desc(progressEntries.entryDate))
      .limit(200);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Admin progress GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
