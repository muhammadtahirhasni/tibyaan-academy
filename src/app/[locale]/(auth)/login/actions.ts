"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getDashboardPath } from "@/lib/auth/get-dashboard-path";

export async function loginWithEmail(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const locale = formData.get("locale") as string;

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Also mark onboarding as done for returning users
  if (data.user.user_metadata?.needs_onboarding !== false) {
    await supabase.auth.updateUser({
      data: { needs_onboarding: false },
    });
  }

  const metadataRole = data.user.user_metadata?.role as string | undefined;
  const dashboardPath = await getDashboardPath(
    data.user.id,
    locale,
    metadataRole
  );
  redirect(dashboardPath);
}

export async function loginWithGoogle(locale: string) {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_APP_URL;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback?locale=${locale}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}
