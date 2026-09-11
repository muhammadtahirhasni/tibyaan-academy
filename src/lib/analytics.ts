"use client";

import { sendGAEvent } from "@next/third-parties/google";

/**
 * GA4 custom events. No-ops when NEXT_PUBLIC_GA_ID is unset (local dev,
 * preview builds) because the gtag script is never injected there.
 */

/**
 * Whether GA is actually loaded on this page.
 *
 * Deliberately NOT `process.env.NEXT_PUBLIC_GA_ID`. This module is a client
 * module, so that variable is inlined at BUILD time — but the <GoogleAnalytics>
 * tag is rendered by a server component and reads the variable at REQUEST time.
 * If the id is set in the environment after the build, the script loads and
 * pageviews are recorded while every custom event is silently dropped.
 * Checking for the dataLayer the script itself creates keeps the two in step.
 */
function gaReady(): boolean {
  return (
    typeof window !== "undefined" &&
    Array.isArray((window as { dataLayer?: unknown[] }).dataLayer)
  );
}

function track(name: string, params: Record<string, string | number>) {
  if (!gaReady()) return;
  try {
    sendGAEvent("event", name, params);
  } catch {
    // Analytics must never break a user action.
  }
}

/** Fired from every WhatsApp button or link. */
export function trackWhatsAppClick(pageLocale: string, pagePath: string) {
  track("whatsapp_click", { page_locale: pageLocale, page_path: pagePath });
}

/** Fired when the enrollment form is submitted. */
export function trackEnrollmentSubmit(country: string, course: string) {
  track("enrollment_submit", { country, course });
}
