import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { adminSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT_KEY = "ai_ustaz_system_prompt";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = getDb();
    const [setting] = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.key, SYSTEM_PROMPT_KEY));

    return NextResponse.json({
      systemPrompt: setting?.value ?? "",
    });
  } catch (error) {
    console.error("AI settings get error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const db = getDb();

    const [existing] = await db
      .select()
      .from(adminSettings)
      .where(eq(adminSettings.key, SYSTEM_PROMPT_KEY));

    if (existing) {
      await db
        .update(adminSettings)
        .set({
          value: body.systemPrompt,
          updatedAt: new Date(),
          updatedBy: user.id,
        })
        .where(eq(adminSettings.key, SYSTEM_PROMPT_KEY));
    } else {
      await db.insert(adminSettings).values({
        key: SYSTEM_PROMPT_KEY,
        value: body.systemPrompt,
        updatedBy: user.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("AI settings update error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
