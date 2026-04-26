"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notifyAdminNewSignup } from "@/lib/utils/notify-admin";

export async function signupWithEmail(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as string;
  const language = formData.get("language") as string;
  const locale = formData.get("locale") as string;
  const parentWhatsapp = (formData.get("parentWhatsapp") as string) || null;

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role || "student",
        preferred_language: language || "ur",
        needs_onboarding: true,
        parent_whatsapp: parentWhatsapp || null,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Notify admin about new signup (fire-and-forget)
  notifyAdminNewSignup({
    email,
    fullName,
    role: role || "student",
  }).catch(() => {});

  // If email confirmation is required, user won't have a session yet
  // Check if we got a session (auto-confirm enabled)
  if (data.session) {
    // User is logged in — go to onboarding
    redirect(`/${locale}/onboarding`);
  } else {
    // Email confirmation required — redirect to login with a message
    redirect(`/${locale}/login?confirmed=pending`);
  }
}
