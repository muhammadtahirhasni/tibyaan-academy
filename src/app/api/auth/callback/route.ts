import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getDashboardPath } from "@/lib/auth/get-dashboard-path";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const locale = searchParams.get("locale") || "ur";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // New users need onboarding
        if (user.user_metadata?.needs_onboarding !== false) {
          return NextResponse.redirect(
            new URL(`/${locale}/onboarding`, origin)
          );
        }

        // Existing users go to their role-specific dashboard
        const dashboardPath = await getDashboardPath(user.id, locale);
        return NextResponse.redirect(new URL(dashboardPath, origin));
      }
    }
  }

  // Auth error — redirect to login
  return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
}
