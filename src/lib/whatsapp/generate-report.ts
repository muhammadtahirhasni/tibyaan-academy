import { getDb } from "@/lib/db";
import {
  users,
  studentProfiles,
  classes,
  lessons,
  hifzTracker,
  weeklyTests,
  enrollments,
  studentStreaks,
} from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

interface WeeklyReportData {
  weekStart: string;
  weekEnd: string;
  attendance: { present: number; total: number };
  lessonsCompleted: number;
  hifzProgress: { newAyaat: number; revised: number };
  testScores: number[];
  streak: number;
  summary: string;
}

export async function generateWeeklyReport(
  studentId: string
): Promise<{ reportData: WeeklyReportData; parentWhatsapp: string | null }> {
  const db = getDb();
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weekStart = weekAgo.toISOString().split("T")[0];
  const weekEnd = now.toISOString().split("T")[0];

  // Get student profile for parent whatsapp
  const [profile] = await db
    .select({
      parentWhatsapp: studentProfiles.parentWhatsapp,
      fullName: users.fullName,
    })
    .from(studentProfiles)
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .where(eq(studentProfiles.userId, studentId))
    .limit(1);

  // Get enrollment IDs
  const studentEnrollments = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(eq(enrollments.studentId, studentId));

  const enrollmentIds = studentEnrollments.map((e) => e.id);

  // Attendance (classes in the past week)
  let attendance = { present: 0, total: 0 };
  if (enrollmentIds.length > 0) {
    const weekClasses = await db
      .select()
      .from(classes)
      .where(
        and(
          gte(classes.scheduledAt, weekAgo),
          lte(classes.scheduledAt, now)
        )
      );

    const studentClasses = weekClasses.filter((c) =>
      enrollmentIds.includes(c.enrollmentId)
    );
    attendance = {
      total: studentClasses.length,
      present: studentClasses.filter((c) => c.status === "completed").length,
    };
  }

  // Lessons completed this week
  let lessonsCompleted = 0;
  if (enrollmentIds.length > 0) {
    const weekLessons = await db
      .select()
      .from(lessons)
      .where(
        and(
          gte(lessons.completedAt, weekAgo),
          lte(lessons.completedAt, now)
        )
      );

    lessonsCompleted = weekLessons.filter(
      (l) => l.isCompleted && enrollmentIds.includes(l.enrollmentId)
    ).length;
  }

  // Hifz progress this week
  const hifzRecords = await db
    .select()
    .from(hifzTracker)
    .where(
      and(
        eq(hifzTracker.studentId, studentId),
        gte(hifzTracker.createdAt, weekAgo)
      )
    );

  const newAyaat = hifzRecords
    .filter((h) => h.type === "sabaq")
    .reduce((sum, h) => sum + (h.ayahTo - h.ayahFrom + 1), 0);
  const revised = hifzRecords.filter(
    (h) => h.type === "sabqi" || h.type === "manzil"
  ).length;

  // Test scores
  const testScores: number[] = [];
  if (enrollmentIds.length > 0) {
    const weekTests = await db
      .select()
      .from(weeklyTests)
      .where(
        and(
          gte(weeklyTests.createdAt, weekAgo),
          lte(weeklyTests.createdAt, now)
        )
      );

    for (const test of weekTests) {
      if (
        enrollmentIds.includes(test.enrollmentId) &&
        test.scorePercentage
      ) {
        testScores.push(parseFloat(test.scorePercentage));
      }
    }
  }

  // Streak
  const [streakData] = await db
    .select()
    .from(studentStreaks)
    .where(eq(studentStreaks.studentId, studentId))
    .limit(1);

  const streak = streakData?.currentStreak ?? 0;

  // Generate summary text
  const studentName = profile?.fullName ?? "Student";
  const avgScore =
    testScores.length > 0
      ? Math.round(
          testScores.reduce((a, b) => a + b, 0) / testScores.length
        )
      : null;

  let summary = `📊 *Weekly Report - ${studentName}*\n`;
  summary += `📅 ${weekStart} to ${weekEnd}\n\n`;
  summary += `📚 *Attendance:* ${attendance.present}/${attendance.total} classes\n`;
  summary += `✅ *Lessons Completed:* ${lessonsCompleted}\n`;
  summary += `📖 *New Ayaat Memorized:* ${newAyaat}\n`;
  summary += `🔄 *Revisions Done:* ${revised}\n`;
  if (avgScore !== null) {
    summary += `📝 *Test Average:* ${avgScore}%\n`;
  }
  summary += `🔥 *Current Streak:* ${streak} days\n\n`;
  summary += `_Tibyaan Academy - Digital Madrasah_`;

  const reportData: WeeklyReportData = {
    weekStart,
    weekEnd,
    attendance,
    lessonsCompleted,
    hifzProgress: { newAyaat, revised },
    testScores,
    streak,
    summary,
  };

  return {
    reportData,
    parentWhatsapp: profile?.parentWhatsapp ?? null,
  };
}
