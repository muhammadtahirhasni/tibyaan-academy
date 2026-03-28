import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import {
  users,
  hifzTracker,
  lessons,
  weeklyTests,
  enrollments,
  courses,
  studentStreaks,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getStudentAnalysisPrompt } from "@/lib/claude/teacher-assistant";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // Verify teacher role
    const [dbUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!dbUser || dbUser.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden: teachers only" }, { status: 403 });
    }

    const body = await request.json();
    const { studentId } = body;

    if (!studentId || typeof studentId !== "string") {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    // Fetch student info
    const [student] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, studentId))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Fetch hifz records
    const hifzRecords = await db
      .select()
      .from(hifzTracker)
      .where(eq(hifzTracker.studentId, studentId))
      .orderBy(desc(hifzTracker.createdAt))
      .limit(50);

    // Fetch enrollments with course info
    const studentEnrollments = await db
      .select({
        enrollmentId: enrollments.id,
        courseType: courses.courseType,
        courseName: courses.nameEn,
        status: enrollments.status,
        createdAt: enrollments.createdAt,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.studentId, studentId));

    // Fetch lessons (via enrollments)
    const enrollmentIds = studentEnrollments.map((e) => e.enrollmentId);
    let studentLessons: Array<{
      id: string;
      lessonNumber: number;
      lessonType: string;
      isCompleted: boolean;
      completedAt: Date | null;
      teacherNotes: string | null;
    }> = [];

    if (enrollmentIds.length > 0) {
      // Fetch lessons for each enrollment
      for (const eid of enrollmentIds) {
        const eLessons = await db
          .select({
            id: lessons.id,
            lessonNumber: lessons.lessonNumber,
            lessonType: lessons.lessonType,
            isCompleted: lessons.isCompleted,
            completedAt: lessons.completedAt,
            teacherNotes: lessons.teacherNotes,
          })
          .from(lessons)
          .where(eq(lessons.enrollmentId, eid))
          .orderBy(desc(lessons.createdAt))
          .limit(20);
        studentLessons = [...studentLessons, ...eLessons];
      }
    }

    // Fetch weekly tests
    let testResults: Array<{
      weekNumber: number;
      totalQuestions: number | null;
      correctAnswers: number | null;
      scorePercentage: string | null;
      testDate: Date | null;
    }> = [];

    if (enrollmentIds.length > 0) {
      for (const eid of enrollmentIds) {
        const eTests = await db
          .select({
            weekNumber: weeklyTests.weekNumber,
            totalQuestions: weeklyTests.totalQuestions,
            correctAnswers: weeklyTests.correctAnswers,
            scorePercentage: weeklyTests.scorePercentage,
            testDate: weeklyTests.testDate,
          })
          .from(weeklyTests)
          .where(eq(weeklyTests.enrollmentId, eid))
          .orderBy(desc(weeklyTests.createdAt))
          .limit(20);
        testResults = [...testResults, ...eTests];
      }
    }

    // Fetch streak data
    const [streakData] = await db
      .select()
      .from(studentStreaks)
      .where(eq(studentStreaks.studentId, studentId))
      .limit(1);

    // Build context for Claude
    const studentContext = {
      student: {
        name: student.fullName,
        memberSince: student.createdAt,
      },
      enrollments: studentEnrollments.map((e) => ({
        course: e.courseName,
        courseType: e.courseType,
        status: e.status,
      })),
      hifzProgress: hifzRecords.map((h) => ({
        surah: h.surahNumber,
        ayahRange: `${h.ayahFrom}-${h.ayahTo}`,
        type: h.type,
        status: h.status,
        score: h.score,
        lastRecited: h.lastRecitedAt,
      })),
      lessons: studentLessons.map((l) => ({
        number: l.lessonNumber,
        type: l.lessonType,
        completed: l.isCompleted,
        completedAt: l.completedAt,
        teacherNotes: l.teacherNotes,
      })),
      testScores: testResults.map((t) => ({
        week: t.weekNumber,
        score: t.scorePercentage,
        correct: t.correctAnswers,
        total: t.totalQuestions,
        date: t.testDate,
      })),
      streak: streakData
        ? {
            current: streakData.currentStreak,
            longest: streakData.longestStreak,
            totalPoints: streakData.totalPoints,
            level: streakData.level,
          }
        : null,
    };

    const systemPrompt = getStudentAnalysisPrompt();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Analyze the following student data and provide a comprehensive report:\n\n${JSON.stringify(studentContext, null, 2)}\n\nRespond with ONLY the JSON object.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", errorText);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const result = await response.json();
    const content = result.content?.[0]?.text || "";

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json(
          { error: "Failed to parse analysis response" },
          { status: 500 }
        );
      }
      const analysis = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        studentName: student.fullName,
        analysis,
      });
    } catch {
      console.error("Failed to parse analysis JSON:", content);
      return NextResponse.json(
        { error: "Failed to parse analysis response" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Analyze student error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
