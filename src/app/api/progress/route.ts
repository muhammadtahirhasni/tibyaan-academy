import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, progressEntries } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// GET — fetch progress entries (role-filtered)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const url = new URL(request.url);
    const studentFilter = url.searchParams.get("studentId");
    const teacherFilter = url.searchParams.get("teacherId");

    if (dbUser.role === "teacher") {
      // Teachers see only their own entries
      const rows = await db.execute(sql`
        SELECT
          pe.id, pe.lesson_covered, pe.rating, pe.notes, pe.session_date, pe.created_at,
          pe.teacher_id, pe.student_id,
          s.full_name AS student_name,
          t.full_name AS teacher_name
        FROM progress_entries pe
        JOIN users s ON pe.student_id = s.id
        JOIN users t ON pe.teacher_id = t.id
        WHERE pe.teacher_id = ${authUser.id}
        ORDER BY pe.session_date DESC
        LIMIT 200
      `);
      return NextResponse.json({ entries: rows.rows });
    }

    if (dbUser.role === "student") {
      // Students see only their own progress
      const rows = await db.execute(sql`
        SELECT
          pe.id, pe.lesson_covered, pe.rating, pe.notes, pe.session_date, pe.created_at,
          pe.teacher_id, pe.student_id,
          s.full_name AS student_name,
          t.full_name AS teacher_name
        FROM progress_entries pe
        JOIN users s ON pe.student_id = s.id
        JOIN users t ON pe.teacher_id = t.id
        WHERE pe.student_id = ${authUser.id}
        ORDER BY pe.session_date DESC
        LIMIT 200
      `);
      return NextResponse.json({ entries: rows.rows });
    }

    if (dbUser.role === "admin") {
      // Admins see everything, with optional filters
      let query = `
        SELECT
          pe.id, pe.lesson_covered, pe.rating, pe.notes, pe.session_date, pe.created_at,
          pe.teacher_id, pe.student_id,
          s.full_name AS student_name,
          t.full_name AS teacher_name
        FROM progress_entries pe
        JOIN users s ON pe.student_id = s.id
        JOIN users t ON pe.teacher_id = t.id
        WHERE 1=1
      `;
      const binds: string[] = [];
      if (studentFilter) { query += ` AND pe.student_id = '${studentFilter.replace(/'/g, "''")}'`; }
      if (teacherFilter) { query += ` AND pe.teacher_id = '${teacherFilter.replace(/'/g, "''")}'`; }
      query += " ORDER BY pe.session_date DESC LIMIT 500";
      const rows = await db.execute(sql.raw(query));
      return NextResponse.json({ entries: rows.rows });
    }

    return NextResponse.json({ entries: [] });
  } catch (err) {
    console.error("Get progress error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST — teacher creates a progress entry
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "teacher") {
      return NextResponse.json({ error: "Only teachers can record progress" }, { status: 403 });
    }

    const { studentId, lessonCovered, rating, notes } = await request.json();
    if (!studentId || !lessonCovered || !rating) {
      return NextResponse.json({ error: "studentId, lessonCovered, and rating are required" }, { status: 400 });
    }

    const validRatings = ["excellent", "good", "needs_improvement"];
    if (!validRatings.includes(rating)) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const [entry] = await db.insert(progressEntries).values({
      teacherId: authUser.id,
      studentId,
      lessonCovered,
      rating,
      notes: notes ?? null,
      sessionDate: new Date(),
    }).returning();

    return NextResponse.json({ success: true, entry });
  } catch (err) {
    console.error("Create progress error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
