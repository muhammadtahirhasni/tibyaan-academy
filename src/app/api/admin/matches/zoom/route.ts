import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, teacherStudentMatches, classes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const matches = await db
      .select({
        id: teacherStudentMatches.id,
        status: teacherStudentMatches.status,
        schedule: teacherStudentMatches.schedule,
        zoomLink: teacherStudentMatches.zoomLink,
        createdAt: teacherStudentMatches.createdAt,
        studentId: teacherStudentMatches.studentId,
        teacherId: teacherStudentMatches.teacherId,
        courseId: teacherStudentMatches.courseId,
      })
      .from(teacherStudentMatches)
      .where(eq(teacherStudentMatches.status, "active"))
      .orderBy(teacherStudentMatches.createdAt);

    return NextResponse.json({ matches });
  } catch (err) {
    console.error("Get matches error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { matchId, zoomLink } = await request.json();
    if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });

    const [updated] = await db
      .update(teacherStudentMatches)
      .set({ zoomLink: zoomLink || null })
      .where(eq(teacherStudentMatches.id, matchId))
      .returning({ id: teacherStudentMatches.id, zoomLink: teacherStudentMatches.zoomLink });

    // Also update all future scheduled classes for this match with the zoom link
    if (updated) {
      const match = await db
        .select({ studentId: teacherStudentMatches.studentId, teacherId: teacherStudentMatches.teacherId, courseId: teacherStudentMatches.courseId })
        .from(teacherStudentMatches)
        .where(eq(teacherStudentMatches.id, matchId))
        .limit(1);

      if (match[0]) {
        // Update meeting link on all scheduled classes for this teacher's student
        await db
          .update(classes)
          .set({ meetingLink: zoomLink || null })
          .where(
            and(
              eq(classes.teacherId, match[0].teacherId),
              eq(classes.status, "scheduled"),
            )
          );
      }
    }

    return NextResponse.json({ success: true, match: updated });
  } catch (err) {
    console.error("Update zoom link error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
