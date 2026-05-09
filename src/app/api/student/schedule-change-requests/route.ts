import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, scheduleChangeRequests, teacherStudentMatches } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "student") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const requests = await db
      .select()
      .from(scheduleChangeRequests)
      .where(eq(scheduleChangeRequests.studentId, authUser.id))
      .orderBy(desc(scheduleChangeRequests.createdAt));

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Student schedule-change-requests GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "student") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { matchId, newSchedule, reason } = await request.json();
    if (!matchId || !newSchedule) {
      return NextResponse.json({ error: "matchId and newSchedule are required" }, { status: 400 });
    }

    const [match] = await db
      .select()
      .from(teacherStudentMatches)
      .where(and(
        eq(teacherStudentMatches.id, matchId),
        eq(teacherStudentMatches.studentId, authUser.id)
      ))
      .limit(1);

    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    const [changeRequest] = await db
      .insert(scheduleChangeRequests)
      .values({
        matchId,
        studentId: authUser.id,
        teacherId: match.teacherId,
        newSchedule,
        reason: reason ?? null,
        status: "pending",
      })
      .returning();

    return NextResponse.json({ changeRequest });
  } catch (error) {
    console.error("Student schedule-change-requests POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
