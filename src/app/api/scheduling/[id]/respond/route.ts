import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { scheduleRequests, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await request.json();

    if (!action || !["confirmed", "rejected"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'confirmed' or 'rejected'" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify teacher owns this request
    const [schedReq] = await db
      .select()
      .from(scheduleRequests)
      .where(
        and(
          eq(scheduleRequests.id, id),
          eq(scheduleRequests.teacherId, user.id)
        )
      )
      .limit(1);

    if (!schedReq) {
      return NextResponse.json(
        { error: "Schedule request not found" },
        { status: 404 }
      );
    }

    await db
      .update(scheduleRequests)
      .set({
        status: action,
        updatedAt: new Date(),
      })
      .where(eq(scheduleRequests.id, id));

    return NextResponse.json({ success: true, status: action });
  } catch (error) {
    console.error("Schedule respond error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
