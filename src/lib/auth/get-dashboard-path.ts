import { getUserById } from "@/lib/db/queries";

/**
 * Returns the correct dashboard path based on the user's role in the DB.
 * Falls back to user_metadata role, then student dashboard.
 */
export async function getDashboardPath(
  userId: string,
  locale: string,
  metadataRole?: string
): Promise<string> {
  try {
    const dbUser = await getUserById(userId);
    const role = dbUser?.role ?? metadataRole ?? "student";

    switch (role) {
      case "admin":
        return `/${locale}/admin/dashboard`;
      case "teacher":
        return `/${locale}/teacher/dashboard`;
      default:
        return `/${locale}/student/dashboard`;
    }
  } catch (error) {
    console.error("getDashboardPath error:", error);
    // Fallback to metadata role if DB fails
    if (metadataRole === "admin") return `/${locale}/admin/dashboard`;
    if (metadataRole === "teacher") return `/${locale}/teacher/dashboard`;
    return `/${locale}/student/dashboard`;
  }
}
