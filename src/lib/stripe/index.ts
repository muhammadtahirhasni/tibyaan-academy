import Stripe from "stripe";
import { PRICING } from "@/lib/pricing";

// Lazy initialization to avoid build-time errors when env vars are empty
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return _stripe;
}

// Course pricing configuration (monthly USD).
// Derived from the single pricing source of truth so billed amounts can never
// drift from the amounts advertised on the site.
export const COURSE_PRICES = {
  nazra:  { plan1: PRICING.nazra.human_ai,  plan2: PRICING.nazra.ai_only },
  hifz:   { plan1: PRICING.hifz.human_ai,   plan2: PRICING.hifz.ai_only },
  arabic: { plan1: PRICING.arabic.human_ai, plan2: PRICING.arabic.ai_only },
  aalim:  { plan1: PRICING.aalim.human_ai,  plan2: PRICING.aalim.ai_only },
} as const;

export type CourseType = keyof typeof COURSE_PRICES;
export type PlanType = "plan1" | "plan2";

// Yearly = 10 months price (2 months free)
export function getYearlyPrice(monthlyPrice: number): number {
  return monthlyPrice * 10;
}

// Family discount percentages
export const FAMILY_DISCOUNTS = {
  2: 0.2, // 2nd student: 20% off
  3: 0.3, // 3rd+ student: 30% off
} as const;

export function getFamilyDiscount(studentIndex: number): number {
  if (studentIndex >= 3) return FAMILY_DISCOUNTS[3];
  if (studentIndex === 2) return FAMILY_DISCOUNTS[2];
  return 0;
}

// Create a Stripe Checkout Session
export async function createCheckoutSession({
  customerEmail,
  courseType,
  planType,
  billingInterval,
  successUrl,
  cancelUrl,
  studentId,
  enrollmentId,
  discountPercent = 0,
}: {
  customerEmail: string;
  courseType: CourseType;
  planType: PlanType;
  billingInterval: "month" | "year";
  successUrl: string;
  cancelUrl: string;
  studentId: string;
  enrollmentId: string;
  discountPercent?: number;
}) {
  const stripe = getStripe();
  const plan = planType === "plan1" ? "plan1" : "plan2";
  const monthlyPrice = COURSE_PRICES[courseType][plan];
  const unitAmount =
    billingInterval === "year"
      ? getYearlyPrice(monthlyPrice) * 100 // cents
      : monthlyPrice * 100;

  // Apply family discount
  const discountedAmount = Math.round(unitAmount * (1 - discountPercent));

  const session = await stripe.checkout.sessions.create({
    customer_email: customerEmail,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Tibyaan Academy — ${courseType.charAt(0).toUpperCase() + courseType.slice(1)} (${planType === "plan1" ? "Human + AI" : "AI Only"})`,
            description: `${billingInterval === "year" ? "Annual" : "Monthly"} subscription`,
          },
          unit_amount: discountedAmount,
          recurring: {
            interval: billingInterval,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      studentId,
      enrollmentId,
      courseType,
      planType,
      billingInterval,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        studentId,
        enrollmentId,
        courseType,
        planType,
      },
    },
  });

  return session;
}

// Cancel a Stripe subscription
export async function cancelSubscription(subscriptionId: string) {
  return getStripe().subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

// Reactivate a cancelled subscription (before period end)
export async function reactivateSubscription(subscriptionId: string) {
  return getStripe().subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  return getStripe().subscriptions.retrieve(subscriptionId);
}

// Create a billing portal session for the customer
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  return getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
