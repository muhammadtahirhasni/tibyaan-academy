import { NextResponse } from "next/server";
import { sendFailureAlert } from "@/lib/alerts";

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

/** Did this request come from Vercel Cron rather than a random caller? */
function isVercelCron(request: Request): boolean {
  return (
    request.headers.get("x-vercel-cron") !== null ||
    (request.headers.get("user-agent") ?? "").startsWith("vercel-cron/")
  );
}

/**
 * Wraps a cron route handler with auth and failure alerting.
 *
 * Alerts on three things:
 *  - a rejected request that Vercel Cron itself made (the silent-401 case: a
 *    missing or rotated CRON_SECRET, which is how the dars job went unnoticed
 *    from May to September),
 *  - a thrown exception,
 *  - a non-2xx response returned by the handler.
 *
 * A 401 from an ordinary caller is NOT alerted — otherwise anyone could fill
 * the inbox by curling the endpoint.
 */
export function withCron(
  name: string,
  handler: (request: Request) => Promise<Response>,
  options: { allowAdminSecret?: boolean } = {}
) {
  return async function cronRoute(request: Request): Promise<Response> {
    const denied = assertCronAuth(request, options);
    if (denied) {
      if (isVercelCron(request)) {
        await sendFailureAlert({
          source: `cron:${name}`,
          summary: `${name} rejected its own scheduled call (401)`,
          error: new Error(
            "Vercel Cron called this route but the Authorization header did not " +
              "match CRON_SECRET. Check CRON_SECRET in the project environment."
          ),
          context: { route: name, status: 401 },
        });
      }
      return denied;
    }

    try {
      const response = await handler(request);

      if (!response.ok) {
        let bodyText = "";
        try {
          bodyText = (await response.clone().text()).slice(0, 500);
        } catch {
          // body already consumed or not readable — the status is enough
        }
        await sendFailureAlert({
          source: `cron:${name}`,
          summary: `${name} returned ${response.status}`,
          error: new Error(bodyText || `HTTP ${response.status}`),
          context: { route: name, status: response.status },
        });
      }

      return response;
    } catch (error) {
      await sendFailureAlert({
        source: `cron:${name}`,
        summary: `${name} threw`,
        error,
        context: { route: name },
      });
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
