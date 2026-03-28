import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, parentReports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateWeeklyReport } from "@/lib/whatsapp/generate-report";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send-message";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const db = getDb();
    const [dbUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (dbUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { studentId } = await request.json();
    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    const { reportData, parentWhatsapp } =
      await generateWeeklyReport(studentId);

    if (!parentWhatsapp) {
      return NextResponse.json(
        { error: "No parent WhatsApp number found for this student" },
        { status: 404 }
      );
    }

    // Send via WhatsApp
    const sendResult = await sendWhatsAppMessage(
      parentWhatsapp,
      reportData.summary
    );

    // Save report to DB
    const [report] = await db
      .insert(parentReports)
      .values({
        studentId,
        parentWhatsapp,
        reportData,
        status: sendResult.success ? "sent" : "failed",
        sentAt: sendResult.success ? new Date() : null,
      })
      .returning();

    return NextResponse.json({
      id: report.id,
      status: report.status,
      reportData,
    });
  } catch (error) {
    console.error("Send parent report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
