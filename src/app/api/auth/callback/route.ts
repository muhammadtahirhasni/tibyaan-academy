import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const locale = searchParams.get("locale") || "ur";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user is new (needs onboarding)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.user_metadata?.needs_onboarding !== false) {
        return NextResponse.redirect(
          new URL(`/${locale}/onboarding`, origin)
        );
      }

      return NextResponse.redirect(
        new URL(`/${locale}/student/dashboard`, origin)
      );
    }
  }

  // Auth error — redirect to login
  return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
}
