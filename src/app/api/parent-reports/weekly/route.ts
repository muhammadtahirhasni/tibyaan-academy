import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users, studentProfiles, parentReports } from "@/lib/db/schema";
import { eq, isNotNull } from "drizzle-orm";
import { generateWeeklyReport } from "@/lib/whatsapp/generate-report";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send-message";

// Cron endpoint: GET /api/parent-reports/weekly
// Runs every Sunday at 8 AM UTC
export async function GET() {
  try {
    const db = getDb();

    // Find all students with parent whatsapp numbers
    const students = await db
      .select({
        userId: studentProfiles.userId,
        parentWhatsapp: studentProfiles.parentWhatsapp,
      })
      .from(studentProfiles)
      .innerJoin(users, eq(studentProfiles.userId, users.id))
      .where(isNotNull(studentProfiles.parentWhatsapp));

    let sent = 0;
    let failed = 0;

    for (const student of students) {
      if (!student.parentWhatsapp) continue;

      try {
        const { reportData } = await generateWeeklyReport(student.userId);

        const sendResult = await sendWhatsAppMessage(
          student.parentWhatsapp,
          reportData.summary
        );

        await db.insert(parentReports).values({
          studentId: student.userId,
          parentWhatsapp: student.parentWhatsapp,
          reportData,
          status: sendResult.success ? "sent" : "failed",
          sentAt: sendResult.success ? new Date() : null,
        });

        if (sendResult.success) {
          sent++;
        } else {
          failed++;
        }
      } catch (err) {
        console.error(
          `Failed to send report for student ${student.userId}:`,
          err
        );
        failed++;
      }
    }

    return NextResponse.json({
      totalStudents: students.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error("Weekly reports cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
