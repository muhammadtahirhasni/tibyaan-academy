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

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role || "student",
        preferred_language: language || "ur",
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

  redirect(`/${locale}/onboarding`);
}
