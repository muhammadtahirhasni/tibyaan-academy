import { getDb } from "@/lib/db";
import {
  studentPoints,
  studentStreaks,
  studentBadges,
  leaderboard,
  hifzTracker,
  users,
} from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

const POINTS_CONFIG: Record<string, number> = {
  sabaq_complete: 10,
  sabqi_review: 5,
  manzil_review: 8,
  tajweed_check: 15,
  streak_bonus: 5,
  test_pass: 20,
  daily_login: 2,
  badge_earned: 25,
  circle_join: 5,
  referral: 50,
};

const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5000, 6500, 8000, 10000,
  12500, 15000, 18000, 21000, 25000, 30000, 35000,
];

function calculateLevel(totalPoints: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export async function awardPoints(
  studentId: string,
  action: (typeof studentPoints.$inferInsert)["action"],
  referenceId?: string
) {
  const db = getDb();
  const pointsValue = POINTS_CONFIG[action] ?? 0;

  await db.insert(studentPoints).values({
    studentId,
    action,
    points: pointsValue,
    referenceId: referenceId ?? null,
  });

  // Update streak total points
  const existing = await db
    .select()
    .from(studentStreaks)
    .where(eq(studentStreaks.studentId, studentId))
    .limit(1);

  const newTotal = (existing[0]?.totalPoints ?? 0) + pointsValue;
  const newLevel = calculateLevel(newTotal);

  if (existing.length === 0) {
    await db.insert(studentStreaks).values({
      studentId,
      totalPoints: pointsValue,
      level: newLevel,
      currentStreak: 0,
      longestStreak: 0,
    });
  } else {
    await db
      .update(studentStreaks)
      .set({ totalPoints: newTotal, level: newLevel })
      .where(eq(studentStreaks.studentId, studentId));
  }

  // Update leaderboard
  const lbEntry = await db
    .select()
    .from(leaderboard)
    .where(eq(leaderboard.studentId, studentId))
    .limit(1);

  if (lbEntry.length === 0) {
    await db.insert(leaderboard).values({
      studentId,
      totalPoints: pointsValue,
    });
  } else {
    await db
      .update(leaderboard)
      .set({
        totalPoints: newTotal,
        updatedAt: new Date(),
      })
      .where(eq(leaderboard.studentId, studentId));
  }

  return { points: pointsValue, totalPoints: newTotal, level: newLevel };
}

export async function updateStreak(studentId: string) {
  const db = getDb();
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const existing = await db
    .select()
    .from(studentStreaks)
    .where(eq(studentStreaks.studentId, studentId))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(studentStreaks).values({
      studentId,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: now,
      totalPoints: 0,
      level: 1,
    });
    return { currentStreak: 1, longestStreak: 1 };
  }

  const streak = existing[0];
  const lastDate = streak.lastActiveDate
    ? new Date(streak.lastActiveDate).toISOString().split("T")[0]
    : null;

  if (lastDate === todayStr) {
    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
    };
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak: number;
  if (lastDate === yesterdayStr) {
    newStreak = streak.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, streak.longestStreak);

  await db
    .update(studentStreaks)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: now,
    })
    .where(eq(studentStreaks.studentId, studentId));

  // Award streak bonuses
  if (newStreak === 7 || newStreak === 30 || newStreak === 100) {
    await awardPoints(studentId, "streak_bonus");
  }

  return { currentStreak: newStreak, longestStreak: newLongest };
}

export async function checkAndAwardBadges(studentId: string) {
  const db = getDb();
  const awarded: string[] = [];

  const existingBadges = await db
    .select({ badge: studentBadges.badge })
    .from(studentBadges)
    .where(eq(studentBadges.studentId, studentId));

  const hasBadge = (badge: string) =>
    existingBadges.some((b) => b.badge === badge);

  // Check hifz-based badges
  const hifzRecords = await db
    .select()
    .from(hifzTracker)
    .where(
      and(
        eq(hifzTracker.studentId, studentId),
        eq(hifzTracker.status, "completed")
      )
    );

  if (hifzRecords.length >= 1 && !hasBadge("first_sabaq")) {
    await db
      .insert(studentBadges)
      .values({ studentId, badge: "first_sabaq" });
    awarded.push("first_sabaq");
  }

  // Check juz completion (approximate: completed entries covering a juz)
  const completedSurahs = new Set(hifzRecords.map((r) => r.surahNumber));
  if (completedSurahs.size >= 7 && !hasBadge("first_juz")) {
    await db
      .insert(studentBadges)
      .values({ studentId, badge: "first_juz" });
    awarded.push("first_juz");
  }

  // Streak badges
  const streakData = await db
    .select()
    .from(studentStreaks)
    .where(eq(studentStreaks.studentId, studentId))
    .limit(1);

  if (streakData.length > 0) {
    const s = streakData[0];
    if (s.longestStreak >= 7 && !hasBadge("streak_7")) {
      await db
        .insert(studentBadges)
        .values({ studentId, badge: "streak_7" });
      awarded.push("streak_7");
    }
    if (s.longestStreak >= 30 && !hasBadge("streak_30")) {
      await db
        .insert(studentBadges)
        .values({ studentId, badge: "streak_30" });
      awarded.push("streak_30");
    }
    if (s.longestStreak >= 100 && !hasBadge("streak_100")) {
      await db
        .insert(studentBadges)
        .values({ studentId, badge: "streak_100" });
      awarded.push("streak_100");
    }
  }

  // Award badge_earned points for new badges
  for (const badge of awarded) {
    await awardPoints(studentId, "badge_earned");
  }

  return awarded;
}

export async function getStudentGamification(studentId: string) {
  const db = getDb();

  const [streakData, badges, points, lbEntry] = await Promise.all([
    db
      .select()
      .from(studentStreaks)
      .where(eq(studentStreaks.studentId, studentId))
      .limit(1),
    db
      .select()
      .from(studentBadges)
      .where(eq(studentBadges.studentId, studentId)),
    db
      .select({
        total: sql<number>`COALESCE(SUM(${studentPoints.points}), 0)`,
      })
      .from(studentPoints)
      .where(eq(studentPoints.studentId, studentId)),
    db
      .select()
      .from(leaderboard)
      .where(eq(leaderboard.studentId, studentId))
      .limit(1),
  ]);

  const streak = streakData[0] ?? {
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    level: 1,
  };

  const currentLevelThreshold =
    LEVEL_THRESHOLDS[streak.level - 1] ?? 0;
  const nextLevelThreshold =
    LEVEL_THRESHOLDS[streak.level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 5000;
  const progressToNextLevel =
    nextLevelThreshold > currentLevelThreshold
      ? ((streak.totalPoints - currentLevelThreshold) /
          (nextLevelThreshold - currentLevelThreshold)) *
        100
      : 100;

  return {
    totalPoints: streak.totalPoints,
    level: streak.level,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    badges: badges.map((b) => ({ badge: b.badge, earnedAt: b.earnedAt })),
    rank: lbEntry[0]?.rank ?? null,
    progressToNextLevel: Math.min(Math.round(progressToNextLevel), 100),
    nextLevelPoints: nextLevelThreshold,
    currentLevelPoints: currentLevelThreshold,
  };
}

export async function getLeaderboard(limit = 20) {
  const db = getDb();

  const results = await db
    .select({
      studentId: leaderboard.studentId,
      totalPoints: leaderboard.totalPoints,
      rank: leaderboard.rank,
      isOptedIn: leaderboard.isOptedIn,
      fullName: users.fullName,
      avatarUrl: users.avatarUrl,
    })
    .from(leaderboard)
    .innerJoin(users, eq(leaderboard.studentId, users.id))
    .where(eq(leaderboard.isOptedIn, true))
    .orderBy(desc(leaderboard.totalPoints))
    .limit(limit);

  return results.map((r, i) => ({
    ...r,
    rank: i + 1,
  }));
}

export async function toggleLeaderboardOptIn(
  studentId: string,
  isOptedIn: boolean
) {
  const db = getDb();

  const existing = await db
    .select()
    .from(leaderboard)
    .where(eq(leaderboard.studentId, studentId))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(leaderboard).values({
      studentId,
      isOptedIn,
      totalPoints: 0,
    });
  } else {
    await db
      .update(leaderboard)
      .set({ isOptedIn, updatedAt: new Date() })
      .where(eq(leaderboard.studentId, studentId));
  }

  return { isOptedIn };
}

export { POINTS_CONFIG, LEVEL_THRESHOLDS, calculateLevel };
