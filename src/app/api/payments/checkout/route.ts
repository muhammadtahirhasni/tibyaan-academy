import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createCheckoutSession,
  type CourseType,
  type PlanType,
} from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      courseType,
      planType,
      billingInterval = "month",
      enrollmentId,
      discountPercent = 0,
    } = body as {
      courseType: CourseType;
      planType: PlanType;
      billingInterval: "month" | "year";
      enrollmentId: string;
      discountPercent?: number;
    };

    // Validate inputs
    if (!courseType || !planType || !enrollmentId) {
      return Response.json(
        { error: "Missing required fields: courseType, planType, enrollmentId" },
        { status: 400 }
      );
    }

    const validCourses: CourseType[] = ["nazra", "hifz", "arabic", "aalim"];
    const validPlans: PlanType[] = ["plan1", "plan2"];

    if (!validCourses.includes(courseType)) {
      return Response.json({ error: "Invalid course type" }, { status: 400 });
    }
    if (!validPlans.includes(planType)) {
      return Response.json({ error: "Invalid plan type" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await createCheckoutSession({
      customerEmail: user.email!,
      courseType,
      planType,
      billingInterval,
      successUrl: `${appUrl}/en/student/payments?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/en/student/payments?cancelled=true`,
      studentId: user.id,
      enrollmentId,
      discountPercent,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
