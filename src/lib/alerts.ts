import { SUPPORT_EMAIL, MAIL_FROM, SITE_NAME } from "@/lib/site-config";

/**
 * Failure alerting: one email to SUPPORT_EMAIL when a scheduled job fails.
 *
 * The problem this solves: a cron with a wrong CRON_SECRET returns 401 and
 * nothing anywhere notices. The daily dars job stopped in May and was found in
 * September. Any failure now produces mail.
 *
 * Deliberately minimal — no dashboard, no new service, no new dependency. It
 * reuses the Resend key that already sends transactional mail.
 */

export interface FailureAlert {
  /** Where it failed, e.g. "cron:/api/dars/generate" or "inngest:blog-queue-manager". */
  source: string;
  /** One-line summary shown in the subject. */
  summary: string;
  /** Error object or message. */
  error?: unknown;
  /** Anything else worth having in the mail body. */
  context?: Record<string, unknown>;
}

function describeError(error: unknown): string {
  if (!error) return "(no error object)";
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n\n${error.stack ?? "(no stack)"}`;
  }
  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Never throws and never rejects — alerting must not be able to fail the job it
 * is reporting on, or turn one failure into two.
 */
export async function sendFailureAlert(alert: FailureAlert): Promise<void> {
  const { source, summary, error, context } = alert;

  const detail = describeError(error);
  const contextLines = context
    ? Object.entries(context)
        .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
        .join("\n")
    : "";

  // Always log, so the failure is visible in Vercel logs even if mail is down.
  console.error(
    `[alert] ${source} — ${summary}\n${contextLines}\n${detail}`
  );

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("[alert] RESEND_API_KEY not set — alert email not sent.");
    return;
  }

  const body = [
    `Source:   ${source}`,
    `When:     ${new Date().toISOString()}`,
    contextLines,
    "",
    detail,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: SUPPORT_EMAIL,
        subject: `[${SITE_NAME}] Job failed: ${summary}`,
        text: body,
        html: `<pre style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;line-height:1.5;white-space:pre-wrap">${escapeHtml(
          body
        )}</pre>`,
      }),
    });

    if (!response.ok) {
      console.error(
        "[alert] Resend rejected the alert email:",
        response.status,
        await response.text()
      );
    }
  } catch (err) {
    console.error("[alert] Failed to send alert email:", err);
  }
}

/**
 * `onFailure` handler for Inngest functions. Inngest calls this once, after all
 * retries for a run are exhausted — so one email per failed run, not per retry.
 *
 * Usage: `inngest.createFunction({ id: "x", onFailure: inngestFailureHandler("x"), ... })`
 */
export function inngestFailureHandler(functionId: string) {
  return async ({ error, event }: { error: unknown; event?: unknown }) => {
    const originalEvent = (event as { data?: { event?: { name?: string } } })
      ?.data?.event?.name;
    await sendFailureAlert({
      source: `inngest:${functionId}`,
      summary: `${functionId} failed after all retries`,
      error,
      context: originalEvent ? { triggeringEvent: originalEvent } : undefined,
    });
  };
}
