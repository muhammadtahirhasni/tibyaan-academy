import { NextResponse } from "next/server";

/**
 * Shared auth gate for cron-triggered routes.
 *
 * Fails closed: if CRON_SECRET is not configured, every request is rejected.
 * The older inline check (`token !== process.env.CRON_SECRET`) fails OPEN when
 * the variable is unset — an unset secret and an absent header are both
 * `undefined`, so the comparison passes and the route runs for anyone.
 *
 * Accepts `Authorization: Bearer <secret>`, which is what Vercel Cron sends.
 * ADMIN_SECRET is also accepted where a route needs manual triggering.
 */
export function assertCronAuth(
  request: Request,
  { allowAdminSecret = false }: { allowAdminSecret?: boolean } = {}
): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;
  const adminSecret = process.env.ADMIN_SECRET;

  const accepted = [cronSecret, allowAdminSecret ? adminSecret : undefined]
    .filter((s): s is string => typeof s === "string" && s.length > 0);

  if (accepted.length === 0) {
    console.error(
      "[cron-auth] CRON_SECRET is not set — refusing the request. " +
        "Set it in the project environment or this endpoint stays disabled."
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token || !accepted.includes(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
