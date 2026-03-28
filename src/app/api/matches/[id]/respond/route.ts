import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, teacherStudentMatches, notifications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * PATCH /api/matches/[id]/respond — Teacher accepts/rejects match
 * Body: { action: "accept" | "reject" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!dbUser[0] || dbUser[0].role !== "teacher") {
    return NextResponse.json({ error: "Teachers only" }, { status: 403 });
  }

  const { action } = await request.json();
  if (!["accept", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const match = await db
    .select()
    .from(teacherStudentMatches)
    .where(eq(teacherStudentMatches.id, id))
    .limit(1);

  if (!match[0] || match[0].teacherId !== authUser.id) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(teacherStudentMatches)
    .set({
      status: action === "accept" ? "accepted" : "rejected",
      respondedAt: new Date(),
    })
    .where(eq(teacherStudentMatches.id, id))
    .returning();

  // Notify student
  const notifType = action === "accept" ? "match_accepted" : "match_rejected";
  await db.insert(notifications).values({
    userId: match[0].studentId,
    type: notifType as "match_accepted" | "match_rejected",
    titleEn: action === "accept" ? "Teacher Accepted!" : "Request Declined",
    message:
      action === "accept"
        ? `${dbUser[0].fullName} accepted your request. You can now chat!`
        : `${dbUser[0].fullName} declined your request.`,
    link: "/student/messages",
  });

  return NextResponse.json({ match: updated });
}
