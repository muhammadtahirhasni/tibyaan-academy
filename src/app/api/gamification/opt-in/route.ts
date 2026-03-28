import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toggleLeaderboardOptIn } from "@/lib/db/gamification-queries";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isOptedIn } = await request.json();

    if (typeof isOptedIn !== "boolean") {
      return NextResponse.json(
        { error: "isOptedIn must be a boolean" },
        { status: 400 }
      );
    }

    const result = await toggleLeaderboardOptIn(user.id, isOptedIn);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Opt-in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
