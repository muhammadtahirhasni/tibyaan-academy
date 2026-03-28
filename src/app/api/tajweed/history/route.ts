import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { tajweedChecks } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const history = await db
      .select()
      .from(tajweedChecks)
      .where(eq(tajweedChecks.studentId, user.id))
      .orderBy(desc(tajweedChecks.createdAt))
      .limit(20);

    return NextResponse.json(history);
  } catch (error) {
    console.error("Tajweed history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
