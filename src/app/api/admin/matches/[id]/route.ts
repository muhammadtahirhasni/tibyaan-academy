import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, teacherStudentMatches } from "@/lib/db/schema";
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

    const { zoomLink } = await request.json();

    const [updated] = await db
      .update(teacherStudentMatches)
      .set({ zoomLink: zoomLink ?? null })
      .where(eq(teacherStudentMatches.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    return NextResponse.json({ success: true, match: updated });
  } catch (error) {
    console.error("Admin match update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
