import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { referrals, users } from "@/lib/db/schema";
import { eq, count, sum, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

function generateReferralCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "TIB";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}${random}`;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // Get user's referral stats
    const [totalRef] = await db
      .select({ count: count() })
      .from(referrals)
      .where(eq(referrals.referrerId, user.id));

    const [successfulRef] = await db
      .select({ count: count() })
      .from(referrals)
      .where(and(eq(referrals.referrerId, user.id), eq(referrals.isRewarded, true)));

    const [monthsEarned] = await db
      .select({ total: sum(referrals.rewardMonths) })
      .from(referrals)
      .where(and(eq(referrals.referrerId, user.id), eq(referrals.isRewarded, true)));

    // Get or create referral code
    const existingReferrals = await db
      .select({ referralCode: referrals.referralCode })
      .from(referrals)
      .where(eq(referrals.referrerId, user.id))
      .limit(1);

    let referralCode = existingReferrals[0]?.referralCode;

    // If no referral code exists, generate one
    if (!referralCode) {
      const [userData] = await db.select({ fullName: users.fullName }).from(users).where(eq(users.id, user.id));
      referralCode = generateReferralCode(userData?.fullName || "User");
    }

    return NextResponse.json({
      referralCode,
      totalReferrals: totalRef.count,
      successfulReferrals: successfulRef.count,
      monthsEarned: Number(monthsEarned.total) || 0,
    });
  } catch (error) {
    console.error("Referral stats error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const [userData] = await db.select({ fullName: users.fullName }).from(users).where(eq(users.id, user.id));
    const referralCode = generateReferralCode(userData?.fullName || "User");

    return NextResponse.json({ referralCode });
  } catch (error) {
    console.error("Referral generate error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
