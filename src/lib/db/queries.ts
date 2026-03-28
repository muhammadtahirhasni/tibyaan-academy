import { getDb } from ".";
import {
  users,
  studentProfiles,
  enrollments,
  courses,
  classes,
  lessons,
  hifzTracker,
} from "./schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";

/**
 * Get user record from Neon DB by Supabase auth ID
 */
export async function getUserById(userId: string) {
  const db = getDb();
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Get student's enrolled courses with course info
 */
export async function getStudentEnrollments(studentId: string) {
  const db = getDb();
  return db
    .select({
      enrollment: enrollments,
      course: courses,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.studentId, studentId))
    .orderBy(desc(enrollments.createdAt));
}

/**
 * Get single enrollment with course details
 */
export async function getEnrollmentById(enrollmentId: string, studentId: string) {
  const db = getDb();
  const result = await db
    .select({
      enrollment: enrollments,
      course: courses,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(
      and(
        eq(enrollments.id, enrollmentId),
        eq(enrollments.studentId, studentId)
      )
    )
    .limit(1);
  return result[0] ?? null;
}

/**
 * Get lessons for an enrollment
 */
export async function getEnrollmentLessons(enrollmentId: string) {
  const db = getDb();
  return db
    .select()
    .from(lessons)
    .where(eq(lessons.enrollmentId, enrollmentId))
    .orderBy(lessons.lessonNumber);
}

/**
 * Get upcoming classes for a student
 */
export async function getUpcomingClasses(studentId: string) {
  const db = getDb();
  const now = new Date();
  return db
    .select({
      class_: classes,
      enrollment: enrollments,
      course: courses,
    })
    .from(classes)
    .innerJoin(enrollments, eq(classes.enrollmentId, enrollments.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(
      and(
        eq(enrollments.studentId, studentId),
        gte(classes.scheduledAt, now),
        eq(classes.status, "scheduled")
      )
    )
    .orderBy(classes.scheduledAt)
    .limit(5);
}

/**
 * Count completed lessons for a student across all enrollments
 */
export async function getStudentStats(studentId: string) {
  const db = getDb();

  const completedLessonsResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(lessons)
    .innerJoin(enrollments, eq(lessons.enrollmentId, enrollments.id))
    .where(
      and(
        eq(enrollments.studentId, studentId),
        eq(lessons.isCompleted, true)
      )
    );

  const totalLessonsResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(lessons)
    .innerJoin(enrollments, eq(lessons.enrollmentId, enrollments.id))
    .where(eq(enrollments.studentId, studentId));

  const hifzResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(hifzTracker)
    .where(
      and(
        eq(hifzTracker.studentId, studentId),
        eq(hifzTracker.status, "completed")
      )
    );

  return {
    completedLessons: completedLessonsResult[0]?.count ?? 0,
    totalLessons: totalLessonsResult[0]?.count ?? 0,
    completedHifzEntries: hifzResult[0]?.count ?? 0,
  };
}

/**
 * Get student profile
 */
export async function getStudentProfile(userId: string) {
  const db = getDb();
  const result = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, userId))
    .limit(1);
  return result[0] ?? null;
}
