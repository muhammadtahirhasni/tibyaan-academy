import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, enrollments, subscriptions, courses, studentProfiles } from "@/lib/db/schema";
import { eq, count, sum, sql, gte, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = getDb();

    // Total users
    const [userCount] = await db.select({ count: count() }).from(users);

    // Active subscriptions
    const [activeSubs] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));

    // Total revenue
    const [revenue] = await db
      .select({ total: sum(subscriptions.amountUsd) })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const [newUsers] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, startOfMonth));

    // Revenue by month (last 6 months)
    const revenueByMonth = await db.execute(sql`
      SELECT to_char(created_at, 'Mon') as month,
             COALESCE(SUM(amount_usd::numeric), 0) as amount
      FROM subscriptions
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY to_char(created_at, 'Mon'), date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at)
      LIMIT 6
    `);

    // Popular courses
    const popularCourses = await db
      .select({
        name: courses.nameEn,
        enrollments: count(enrollments.id),
      })
      .from(courses)
      .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
      .groupBy(courses.id, courses.nameEn)
      .orderBy(sql`count(${enrollments.id}) DESC`)
      .limit(5);

    // User growth (last 6 months)
    const userGrowth = await db.execute(sql`
      SELECT to_char(created_at, 'Mon') as month,
             COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY to_char(created_at, 'Mon'), date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at)
      LIMIT 6
    `);

    // Country distribution
    const countries = await db
      .select({
        country: studentProfiles.country,
        count: count(),
      })
      .from(studentProfiles)
      .groupBy(studentProfiles.country)
      .orderBy(sql`count(*) DESC`)
      .limit(10);

    // Conversion rate (trial → active)
    const [totalTrials] = await db.select({ count: count() }).from(enrollments);
    const [paidEnrollments] = await db
      .select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.status, "active"));
    const conversionRate = totalTrials.count > 0
      ? Math.round((paidEnrollments.count / totalTrials.count) * 100)
      : 0;

    return NextResponse.json({
      totalUsers: userCount.count,
      totalRevenue: Number(revenue.total) || 0,
      activeSubscriptions: activeSubs.count,
      newUsersThisMonth: newUsers.count,
      revenueByMonth: (revenueByMonth.rows as { month: string; amount: number }[]).map((r) => ({
        month: r.month,
        amount: Number(r.amount),
      })),
      popularCourses,
      userGrowth: (userGrowth.rows as { month: string; count: number }[]).map((g) => ({
        month: g.month,
        count: Number(g.count),
      })),
      countries: countries.map((c) => ({
        country: c.country || "Unknown",
        count: c.count,
      })),
      conversionRate,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
