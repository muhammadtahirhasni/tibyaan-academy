import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { like, eq, count, or, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(users.fullName, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }
    if (role) {
      conditions.push(eq(users.role, role as "student" | "teacher" | "admin"));
    }

    const where = conditions.length > 0
      ? conditions.length === 1
        ? conditions[0]
        : sql`${conditions[0]} AND ${conditions[1]}`
      : undefined;

    const userList = await db
      .select()
      .from(users)
      .where(where)
      .orderBy(sql`${users.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db.select({ count: count() }).from(users).where(where);

    return NextResponse.json({
      users: userList,
      total: totalCount.count,
      page,
      limit,
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
