import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { subscriptions, enrollments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const {
          studentId,
          enrollmentId,
          courseType,
          planType,
        } = session.metadata || {};

        if (!studentId || !enrollmentId) break;

        // Activate enrollment
        await db
          .update(enrollments)
          .set({
            status: "active",
            stripeSubscriptionId: session.subscription as string,
            subscriptionStartDate: new Date(),
          })
          .where(eq(enrollments.id, enrollmentId));

        // Create subscription record
        await db.insert(subscriptions).values({
          studentId,
          courseId: enrollmentId, // Will be resolved to actual courseId in production
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          planType: planType === "plan1" ? "human_ai" : "pure_ai",
          amountUsd: session.amount_total
            ? (session.amount_total / 100).toString()
            : "0",
          status: "active",
          currentPeriodStart: new Date(),
        });

        console.log(`Enrollment ${enrollmentId} activated for student ${studentId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const subId = subscription.id;

        const newStatus = subscription.cancel_at_period_end
          ? "cancelled"
          : subscription.status === "active"
            ? "active"
            : subscription.status === "past_due"
              ? "past_due"
              : "active";

        // In Stripe v20, period dates are on subscription items
        const firstItem = subscription.items?.data?.[0];
        const updateData: Record<string, unknown> = {
          status: newStatus as "active" | "cancelled" | "past_due" | "trialing",
        };
        if (firstItem) {
          updateData.currentPeriodStart = new Date(
            firstItem.current_period_start * 1000
          );
          updateData.currentPeriodEnd = new Date(
            firstItem.current_period_end * 1000
          );
        }

        await db
          .update(subscriptions)
          .set(updateData)
          .where(eq(subscriptions.stripeSubscriptionId, subId));

        console.log(`Subscription ${subId} updated to ${newStatus}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const subId = subscription.id;

        // Mark subscription as cancelled
        await db
          .update(subscriptions)
          .set({ status: "cancelled" })
          .where(eq(subscriptions.stripeSubscriptionId, subId));

        // Deactivate enrollment
        await db
          .update(enrollments)
          .set({ status: "cancelled" })
          .where(eq(enrollments.stripeSubscriptionId, subId));

        console.log(`Subscription ${subId} deleted — enrollment deactivated`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // In Stripe v20, subscription is under parent.subscription_details
        const parentSub = invoice.parent?.subscription_details?.subscription;
        const subId =
          typeof parentSub === "string" ? parentSub : parentSub?.id;

        if (subId) {
          await db
            .update(subscriptions)
            .set({ status: "past_due" })
            .where(eq(subscriptions.stripeSubscriptionId, subId));

          console.log(`Payment failed for subscription ${subId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return Response.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return Response.json({ received: true });
}
