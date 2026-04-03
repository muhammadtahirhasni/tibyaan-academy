"use server";

import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import {
  studentProfiles,
  enrollments,
  courses,
  users,
  teacherProfiles,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function completeOnboarding(formData: {
  age: number;
  country: string;
  courseType: string;
  planType: "human_ai" | "pure_ai";
  classesPerWeek: number;
  locale: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const db = getDb();

  try {
    // 1. Upsert user record (in case Supabase trigger didn't fire)
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: user.id,
        email: user.email!,
        fullName:
          user.user_metadata?.full_name || user.email!.split("@")[0],
        role:
          (user.user_metadata?.role as "student" | "teacher" | "admin") ||
          "student",
        preferredLanguage:
          (user.user_metadata?.preferred_language as
            | "ur"
            | "ar"
            | "en"
            | "fr"
            | "id") || "ur",
      });
    }

    // 2. Create or update student profile
    const existingProfile = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, user.id))
      .limit(1);

    if (existingProfile.length > 0) {
      await db
        .update(studentProfiles)
        .set({
          age: formData.age,
          country: formData.country,
          planType: formData.planType,
          classesPerWeek:
            formData.planType === "human_ai" ? formData.classesPerWeek : null,
        })
        .where(eq(studentProfiles.userId, user.id));
    } else {
      await db.insert(studentProfiles).values({
        userId: user.id,
        age: formData.age,
        country: formData.country,
        planType: formData.planType,
        classesPerWeek:
          formData.planType === "human_ai" ? formData.classesPerWeek : null,
      });
    }

    // 3. Find the selected course and create enrollment
    const courseList = await db
      .select()
      .from(courses)
      .where(
        eq(
          courses.courseType,
          formData.courseType as "nazra" | "hifz" | "arabic" | "aalim"
        )
      )
      .limit(1);

    if (courseList.length > 0) {
      const now = new Date();
      const trialEnd = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days

      await db.insert(enrollments).values({
        studentId: user.id,
        courseId: courseList[0].id,
        planType: formData.planType,
        classesPerWeek:
          formData.planType === "human_ai" ? formData.classesPerWeek : null,
        status: "trial",
        trialStartDate: now,
        trialEndDate: trialEnd,
      });
    }

    // 4. Mark onboarding complete in Supabase metadata
    await supabase.auth.updateUser({
      data: { needs_onboarding: false },
    });

    return { success: true };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { error: "Failed to save onboarding data. Please try again." };
  }
}

export async function completeTeacherOnboarding(formData: {
  bio: string;
  specializations: string[];
  yearsExperience: number;
  locale: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const db = getDb();

  try {
    // 1. Upsert user record
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: user.id,
        email: user.email!,
        fullName:
          user.user_metadata?.full_name || user.email!.split("@")[0],
        role: "teacher",
        preferredLanguage:
          (user.user_metadata?.preferred_language as
            | "ur"
            | "ar"
            | "en"
            | "fr"
            | "id") || "ur",
      });
    } else if (existingUser[0].role !== "teacher") {
      await db
        .update(users)
        .set({ role: "teacher" })
        .where(eq(users.id, user.id));
    }

    // 2. Create or update teacher profile
    const existingProfile = await db
      .select()
      .from(teacherProfiles)
      .where(eq(teacherProfiles.userId, user.id))
      .limit(1);

    if (existingProfile.length > 0) {
      await db
        .update(teacherProfiles)
        .set({
          bio: formData.bio,
          specializations: formData.specializations,
          yearsExperience: formData.yearsExperience,
        })
        .where(eq(teacherProfiles.userId, user.id));
    } else {
      await db.insert(teacherProfiles).values({
        userId: user.id,
        bio: formData.bio,
        specializations: formData.specializations,
        yearsExperience: formData.yearsExperience,
      });
    }

    // 3. Mark onboarding complete in Supabase metadata
    await supabase.auth.updateUser({
      data: { needs_onboarding: false },
    });

    return { success: true };
  } catch (error) {
    console.error("Teacher onboarding error:", error);
    return { error: "Failed to save onboarding data. Please try again." };
  }
}
