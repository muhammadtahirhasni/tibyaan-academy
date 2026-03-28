import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLeaderboard } from "@/lib/db/gamification-queries";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lb = await getLeaderboard(20);
    return NextResponse.json(lb);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
