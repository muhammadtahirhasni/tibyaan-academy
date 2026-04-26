import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, studentProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/parent-reports/lookup?studentId=xxx
 * Looks up a student by:
 * - Short ID format: TBA-XXXXXXXX (first 8 chars of UUID)
 * - Raw UUID
 * Returns { student: { id, name, email, parentWhatsapp } }
 * Requires admin auth.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const [adminUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (adminUser?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const studentIdParam = searchParams.get("studentId")?.trim();

  if (!studentIdParam) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  try {
    // Resolve TBA-XXXXXXXX format to a prefix for UUID lookup
    let resolvedId = studentIdParam;
    if (studentIdParam.toUpperCase().startsWith("TBA-")) {
      resolvedId = studentIdParam.substring(4); // Strip "TBA-"
    }

    // Try to find by exact UUID first, then by UUID prefix (first 8 chars)
    const allStudents = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        parentWhatsapp: studentProfiles.parentWhatsapp,
      })
      .from(users)
      .leftJoin(studentProfiles, eq(users.id, studentProfiles.userId))
      .where(eq(users.role, "student"));

    // Filter by UUID prefix match (case-insensitive)
    const prefix = resolvedId.toLowerCase();
    const matched = allStudents.filter(
      (s) => s.id.toLowerCase().startsWith(prefix)
    );

    if (matched.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const student = matched[0];
    return NextResponse.json({
      student: {
        id: student.id,
        name: student.fullName || student.email,
        email: student.email,
        parentWhatsapp: student.parentWhatsapp || null,
        studentCode: `TBA-${student.id.substring(0, 8).toUpperCase()}`,
      },
    });
  } catch (err) {
    console.error("Student lookup error:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
