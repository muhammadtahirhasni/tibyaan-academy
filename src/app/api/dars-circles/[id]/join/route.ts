import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { joinCircle } from "@/lib/db/dars-circle-queries";

/**
 * POST /api/dars-circles/[id]/join — Student joins a circle
 * Checks auth, checks not already joined, checks maxStudents
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
    const result = await joinCircle(id, authUser.id);

    if ("error" in result) {
      const statusMap = {
        already_joined: { message: "Already joined this circle", status: 409 },
        not_found: { message: "Circle not found", status: 404 },
        circle_full: { message: "Circle is full", status: 409 },
      } as const;

      const info = statusMap[result.error as keyof typeof statusMap];
      return NextResponse.json(
        { error: info.message },
        { status: info.status }
      );
    }

    return NextResponse.json({ enrollment: result.enrollment });
  } catch (error) {
    console.error("Failed to join circle:", error);
    return NextResponse.json(
      { error: "Failed to join circle" },
      { status: 500 }
    );
  }
}
