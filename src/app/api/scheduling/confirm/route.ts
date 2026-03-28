import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { scheduleRequests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, selectedSlot } = await request.json();

    if (!requestId || !selectedSlot) {
      return NextResponse.json(
        { error: "requestId and selectedSlot are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const [schedReq] = await db
      .select()
      .from(scheduleRequests)
      .where(
        and(
          eq(scheduleRequests.id, requestId),
          eq(scheduleRequests.studentId, user.id)
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
        selectedSlot,
        status: "confirmed",
        updatedAt: new Date(),
      })
      .where(eq(scheduleRequests.id, requestId));

    return NextResponse.json({ success: true, selectedSlot });
  } catch (error) {
    console.error("Schedule confirm error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
