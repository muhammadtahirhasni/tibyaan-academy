import { getDb } from ".";
import {
  users,
  enrollments,
  courses,
  classes,
  lessons,
  weeklyTests,
  certificates,
  reviews,
  subscriptions,
  teacherProfiles,
  teacherVideos,
  teacherStudentMatches,
  messages,
  classRecordings,
} from "./schema";
import { eq, and, desc, gte, lte, sql, count, avg, inArray } from "drizzle-orm";

/**
 * Get or create teacher profile
 */
export async function getTeacherProfile(userId: string) {
  const db = getDb();
  const result = await db
    .select()
    .from(teacherProfiles)
    .where(eq(teacherProfiles.userId, userId))
    .limit(1);

  if (result[0]) return result[0];

  // Auto-create profile for teacher
  const created = await db
    .insert(teacherProfiles)
    .values({ userId })
    .returning();
  return created[0];
}

/**
 * Get teacher dashboard stats
 */
export async function getTeacherDashboardStats(teacherId: string) {
  const db = getDb();
  const now = new Date();
  const sevenDaysEnd = new Date(now.getTime() + 7 * 86400000);

  // Upcoming classes (next 7 days)
  const todayClasses = await db
    .select({
      class_: classes,
      enrollment: enrollments,
      course: courses,
      student: users,
    })
    .from(classes)
    .innerJoin(enrollments, eq(classes.enrollmentId, enrollments.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .where(
      and(
        eq(classes.teacherId, teacherId),
        gte(classes.scheduledAt, now),
        lte(classes.scheduledAt, sevenDaysEnd)
      )
    )
    .orderBy(classes.scheduledAt);

  // Active students count (distinct students in active enrollments taught by this teacher)
  const activeStudentsResult = await db
    .select({
      count: sql<number>`count(distinct ${enrollments.studentId})::int`,
    })
    .from(classes)
    .innerJoin(enrollments, eq(classes.enrollmentId, enrollments.id))
    .where(
      and(
        eq(classes.teacherId, teacherId),
        eq(enrollments.status, "active")
      )
    );

  // Pending tests (ungraded weekly tests for teacher's students)
  const pendingTestsResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(weeklyTests)
    .innerJoin(enrollments, eq(weeklyTests.enrollmentId, enrollments.id))
    .innerJoin(classes, eq(enrollments.id, classes.enrollmentId))
    .where(
      and(
        eq(classes.teacherId, teacherId),
        sql`${weeklyTests.scorePercentage} IS NULL`
      )
    );

  // Monthly revenue (sum of subscriptions for teacher's students this month)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const revenueResult = await db
    .select({ total: sql<string>`coalesce(sum(${subscriptions.amountUsd}), 0)` })
    .from(subscriptions)
    .innerJoin(enrollments, and(
      eq(subscriptions.studentId, enrollments.studentId),
      eq(subscriptions.courseId, enrollments.courseId)
    ))
    .innerJoin(classes, eq(enrollments.id, classes.enrollmentId))
    .where(
      and(
        eq(classes.teacherId, teacherId),
        eq(subscriptions.status, "active"),
        gte(subscriptions.currentPeriodStart, monthStart)
      )
    );

  return {
    todayClasses,
    activeStudents: activeStudentsResult[0]?.count ?? 0,
    pendingTests: pendingTestsResult[0]?.count ?? 0,
    monthlyRevenue: parseFloat(revenueResult[0]?.total ?? "0"),
  };
}

/**
 * Get teacher's students list
 */
export async function getTeacherStudents(teacherId: string) {
  const db = getDb();

  // Get distinct students that have classes with this teacher
  const studentRows = await db
    .select({
      student: users,
      enrollment: enrollments,
      course: courses,
    })
    .from(classes)
    .innerJoin(enrollments, eq(classes.enrollmentId, enrollments.id))
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(classes.teacherId, teacherId))
    .orderBy(desc(enrollments.createdAt));

  // Deduplicate by student ID
  const seen = new Set<string>();
  return studentRows.filter((row) => {
    if (seen.has(row.student.id)) return false;
    seen.add(row.student.id);
    return true;
  });
}

/**
 * Get teacher's schedule (upcoming classes)
 */
export async function getTeacherSchedule(teacherId: string) {
  const db = getDb();
  const now = new Date();

  return db
    .select({
      class_: classes,
      enrollment: enrollments,
      course: courses,
      student: users,
    })
    .from(classes)
    .innerJoin(enrollments, eq(classes.enrollmentId, enrollments.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .where(
      and(
        eq(classes.teacherId, teacherId),
        gte(classes.scheduledAt, now)
      )
    )
    .orderBy(classes.scheduledAt)
    .limit(50);
}

/**
 * Get teacher's lessons
 */
export async function getTeacherLessons(teacherId: string) {
  const db = getDb();

  return db
    .select({
      lesson: lessons,
      enrollment: enrollments,
      course: courses,
      student: users,
    })
    .from(lessons)
    .innerJoin(enrollments, eq(lessons.enrollmentId, enrollments.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .innerJoin(classes, eq(enrollments.id, classes.enrollmentId))
    .where(eq(classes.teacherId, teacherId))
    .orderBy(desc(lessons.createdAt))
    .limit(100);
}

/**
 * Get tests for teacher's students
 */
export async function getTeacherTests(teacherId: string) {
  const db = getDb();

  return db
    .select({
      test: weeklyTests,
      enrollment: enrollments,
      course: courses,
      student: users,
    })
    .from(weeklyTests)
    .innerJoin(enrollments, eq(weeklyTests.enrollmentId, enrollments.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .innerJoin(classes, eq(enrollments.id, classes.enrollmentId))
    .where(eq(classes.teacherId, teacherId))
    .orderBy(desc(weeklyTests.createdAt))
    .limit(50);
}

/**
 * Get certificates issued by this teacher
 */
export async function getTeacherCertificates(teacherId: string) {
  const db = getDb();

  return db
    .select({
      certificate: certificates,
      student: users,
      course: courses,
    })
    .from(certificates)
    .innerJoin(users, eq(certificates.studentId, users.id))
    .innerJoin(courses, eq(certificates.courseId, courses.id))
    .where(eq(certificates.verifiedBy, teacherId))
    .orderBy(desc(certificates.issuedAt));
}

/**
 * Get teacher's revenue data
 */
export async function getTeacherRevenue(teacherId: string) {
  const db = getDb();

  const studentSubs = await db
    .select({
      student: users,
      course: courses,
      subscription: subscriptions,
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.studentId, users.id))
    .innerJoin(courses, eq(subscriptions.courseId, courses.id))
    .innerJoin(enrollments, and(
      eq(subscriptions.studentId, enrollments.studentId),
      eq(subscriptions.courseId, enrollments.courseId)
    ))
    .innerJoin(classes, eq(enrollments.id, classes.enrollmentId))
    .where(
      and(
        eq(classes.teacherId, teacherId),
        eq(subscriptions.status, "active")
      )
    );

  // Deduplicate
  const seen = new Set<string>();
  return studentSubs.filter((row) => {
    const key = `${row.student.id}-${row.course.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Get reviews for teacher's courses
 */
export async function getTeacherReviews(teacherId: string) {
  const db = getDb();

  return db
    .select({
      review: reviews,
      student: users,
      course: courses,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.studentId, users.id))
    .innerJoin(courses, eq(reviews.courseId, courses.id))
    .innerJoin(enrollments, and(
      eq(reviews.studentId, enrollments.studentId),
      eq(reviews.courseId, enrollments.courseId)
    ))
    .innerJoin(classes, eq(enrollments.id, classes.enrollmentId))
    .where(eq(classes.teacherId, teacherId))
    .orderBy(desc(reviews.createdAt))
    .limit(50);
}

/**
 * Get teacher's videos
 */
export async function getTeacherVideosList(teacherId: string) {
  const db = getDb();

  return db
    .select()
    .from(teacherVideos)
    .where(eq(teacherVideos.teacherId, teacherId))
    .orderBy(desc(teacherVideos.createdAt));
}

/**
 * Get unread message count for teacher
 */
export async function getTeacherUnreadCount(teacherId: string) {
  const db = getDb();

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(messages)
    .where(
      and(
        eq(messages.receiverId, teacherId),
        eq(messages.isRead, false)
      )
    );

  return result[0]?.count ?? 0;
}

/**
 * Get teacher's active matches
 */
export async function getTeacherMatches(teacherId: string) {
  const db = getDb();

  return db
    .select({
      match: teacherStudentMatches,
      student: users,
      course: courses,
    })
    .from(teacherStudentMatches)
    .innerJoin(users, eq(teacherStudentMatches.studentId, users.id))
    .innerJoin(courses, eq(teacherStudentMatches.courseId, courses.id))
    .where(eq(teacherStudentMatches.teacherId, teacherId))
    .orderBy(desc(teacherStudentMatches.createdAt));
}

/**
 * Get student's matches (for student messages page)
 */
export async function getStudentMatches(studentId: string) {
  const db = getDb();

  return db
    .select({
      match: teacherStudentMatches,
      teacher: users,
      course: courses,
    })
    .from(teacherStudentMatches)
    .innerJoin(users, eq(teacherStudentMatches.teacherId, users.id))
    .innerJoin(courses, eq(teacherStudentMatches.courseId, courses.id))
    .where(eq(teacherStudentMatches.studentId, studentId))
    .orderBy(desc(teacherStudentMatches.createdAt));
}

/**
 * Get teacher's recordings
 */
export async function getTeacherRecordings(teacherId: string) {
  const db = getDb();

  return db
    .select({
      recording: classRecordings,
      student: users,
    })
    .from(classRecordings)
    .innerJoin(users, eq(classRecordings.studentId, users.id))
    .where(
      and(
        eq(classRecordings.teacherId, teacherId),
        eq(classRecordings.isDeletedBySystem, false)
      )
    )
    .orderBy(desc(classRecordings.sessionDate));
}
