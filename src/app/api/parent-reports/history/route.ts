import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, parentReports } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // Check admin role
    const [dbUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (dbUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reports = await db
      .select({
        id: parentReports.id,
        studentId: parentReports.studentId,
        studentName: users.fullName,
        parentWhatsapp: parentReports.parentWhatsapp,
        status: parentReports.status,
        sentAt: parentReports.sentAt,
        createdAt: parentReports.createdAt,
      })
      .from(parentReports)
      .innerJoin(users, eq(parentReports.studentId, users.id))
      .orderBy(desc(parentReports.createdAt))
      .limit(50);

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Report history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
