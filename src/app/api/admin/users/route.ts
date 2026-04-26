import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, studentProfiles, enrollments } from "@/lib/db/schema";
import { like, eq, count, or, sql, inArray } from "drizzle-orm";

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
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        isBanned: users.isBanned,
        createdAt: users.createdAt,
        parentWhatsapp: studentProfiles.parentWhatsapp,
      })
      .from(users)
      .leftJoin(studentProfiles, eq(users.id, studentProfiles.userId))
      .where(where)
      .orderBy(sql`${users.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    // Get enrolled course IDs per student
    const userIds = userList.map((u) => u.id);
    const enrollmentMap: Record<string, string[]> = {};
    if (userIds.length > 0) {
      const enrollmentRows = await db
        .select({ studentId: enrollments.studentId, courseId: enrollments.courseId })
        .from(enrollments)
        .where(inArray(enrollments.studentId, userIds));
      for (const row of enrollmentRows) {
        if (!enrollmentMap[row.studentId]) enrollmentMap[row.studentId] = [];
        if (row.courseId) enrollmentMap[row.studentId].push(row.courseId);
      }
    }

    const [totalCount] = await db.select({ count: count() }).from(users).where(where);

    const enriched = userList.map((u) => ({
      ...u,
      courseIds: enrollmentMap[u.id] || [],
      teacherId: u.role === "teacher" ? `TBA-${u.id.substring(0, 8).toUpperCase()}` : null,
      studentId: u.role === "student" ? `TBA-${u.id.substring(0, 8).toUpperCase()}` : null,
    }));

    return NextResponse.json({
      users: enriched,
      total: totalCount.count,
      page,
      limit,
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
