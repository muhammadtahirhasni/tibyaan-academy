import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Session guards for API routes.
 *
 * `requireAdmin` is for anything that reads or writes back-office data —
 * enrollment leads, review queues, user records. `requireUser` is for anything
 * that acts on behalf of a signed-in person, including endpoints that send mail
 * (an unauthenticated mail endpoint is an open relay).
 *
 * Both return a NextResponse to send back, or the user when access is allowed.
 */

type Guard =
  | { ok: true; user: { id: string; email?: string; role?: string } }
  | { ok: false; response: NextResponse };

export async function requireUser(): Promise<Guard> {
  let user: Awaited<
    ReturnType<Awaited<ReturnType<typeof createClient>>["auth"]["getUser"]>
  >["data"]["user"] = null;

  // Fail closed. If the Supabase client cannot be built (missing env) or the
  // lookup throws, deny — never let an infrastructure error surface as a 500
  // that leaves the caller's access state ambiguous.
  try {
    const supabase = await createClient();
    ({
      data: { user },
    } = await supabase.auth.getUser());
  } catch (err) {
    console.error("[api-auth] auth lookup failed — denying:", err);
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role as string | undefined,
    },
  };
}

export async function requireAdmin(): Promise<Guard> {
  const result = await requireUser();
  if (!result.ok) return result;

  if (result.user.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return result;
}
