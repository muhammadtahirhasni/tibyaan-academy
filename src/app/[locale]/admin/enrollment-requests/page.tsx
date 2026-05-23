import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AdminShell } from "../admin-shell";
import EnrollmentRequestsClient from "./enrollment-requests-client";

export default async function EnrollmentRequestsPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const db = getDb();
  const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
  if (!dbUser || dbUser.role !== "admin") redirect("/");

  return (
    <AdminShell
      userName={dbUser.fullName || "Admin"}
      userEmail={dbUser.email}
      userInitial={(dbUser.fullName || "A")[0].toUpperCase()}
    >
      <EnrollmentRequestsClient />
    </AdminShell>
  );
}
