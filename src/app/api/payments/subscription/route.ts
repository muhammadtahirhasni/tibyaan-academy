import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.studentId, user.id));

    return Response.json({ subscriptions: userSubscriptions });
  } catch (error) {
    console.error("Get subscription error:", error);
    return Response.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
