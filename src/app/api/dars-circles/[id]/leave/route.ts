import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { leaveCircle } from "@/lib/db/dars-circle-queries";

/**
 * POST /api/dars-circles/[id]/leave — Student leaves a circle
 */
export async function POST(
  _request: NextRequest,
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

  try {
    const result = await leaveCircle(id, authUser.id);

    if ("error" in result) {
      return NextResponse.json(
        { error: "Not enrolled in this circle" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to leave circle:", error);
    return NextResponse.json(
      { error: "Failed to leave circle" },
      { status: 500 }
    );
  }
}
