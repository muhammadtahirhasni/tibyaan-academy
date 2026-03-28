import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};
  let healthy = true;

  // Check database connectivity
  try {
    const db = getDb();
    await db.execute(sql`SELECT 1`);
    checks.database = "ok";
  } catch {
    checks.database = "error";
    healthy = false;
  }

  // Check critical environment variables
  const requiredEnvVars = [
    "DATABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "ANTHROPIC_API_KEY",
    "STRIPE_SECRET_KEY",
  ];

  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
  checks.environment = missingVars.length === 0 ? "ok" : "error";
  if (missingVars.length > 0) healthy = false;

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      checks,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
