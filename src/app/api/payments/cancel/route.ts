import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cancelSubscription, reactivateSubscription } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscriptionId, reactivate = false } = await request.json();

    if (!subscriptionId) {
      return Response.json(
        { error: "Missing subscriptionId" },
        { status: 400 }
      );
    }

    if (reactivate) {
      const subscription = await reactivateSubscription(subscriptionId);
      return Response.json({
        message: "Subscription reactivated",
        subscription,
      });
    }

    const subscription = await cancelSubscription(subscriptionId);
    return Response.json({
      message: "Subscription will cancel at period end",
      subscription,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return Response.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
