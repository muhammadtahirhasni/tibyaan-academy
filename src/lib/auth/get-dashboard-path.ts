import { getUserById } from "@/lib/db/queries";

/**
 * Returns the correct dashboard path based on the user's role in the DB.
 * Falls back to student dashboard if no DB record exists yet.
 */
export async function getDashboardPath(
  userId: string,
  locale: string
): Promise<string> {
  const dbUser = await getUserById(userId);
  const role = dbUser?.role ?? "student";

  switch (role) {
    case "admin":
      return `/${locale}/admin/dashboard`;
    case "teacher":
      return `/${locale}/teacher/dashboard`;
    default:
      return `/${locale}/student/dashboard`;
  }
}
