import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    switch (body.action) {
      case "approve":
        await db.update(reviews).set({ isApproved: true, aiModerated: true }).where(eq(reviews.id, id));
        break;
      case "reject":
        await db.update(reviews).set({ isApproved: false, aiModerated: true }).where(eq(reviews.id, id));
        break;
      case "feature":
        await db.update(reviews).set({ isApproved: true, isFeatured: true }).where(eq(reviews.id, id));
        break;
      case "unfeature":
        await db.update(reviews).set({ isFeatured: false }).where(eq(reviews.id, id));
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin review update error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
