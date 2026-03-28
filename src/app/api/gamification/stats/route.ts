import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentGamification } from "@/lib/db/gamification-queries";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getStudentGamification(user.id);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Gamification stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
