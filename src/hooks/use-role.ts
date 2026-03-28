"use client";

import { useUser } from "./use-user";

type UserRole = "student" | "teacher" | "admin";

export function useRole() {
  const { user, loading } = useUser();

  const role: UserRole =
    (user?.user_metadata?.role as UserRole) || "student";

  const isStudent = role === "student";
  const isTeacher = role === "teacher";
  const isAdmin = role === "admin";

  return { role, isStudent, isTeacher, isAdmin, loading };
}
