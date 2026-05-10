import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, studentAssignments } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    let rows;
    if (dbUser.role === "teacher") {
      const result = await db.execute(sql`
        SELECT sa.id, sa.student_id, sa.teacher_id, sa.type, sa.title, sa.description,
               sa.frequency, sa.due_date, sa.status, sa.created_at,
               s.full_name AS student_name, t.full_name AS teacher_name
        FROM student_assignments sa
        JOIN users s ON sa.student_id = s.id
        JOIN users t ON sa.teacher_id = t.id
        WHERE sa.teacher_id = ${authUser.id}
        ORDER BY sa.created_at DESC
        LIMIT 200
      `);
      rows = result.rows;
    } else if (dbUser.role === "student") {
      const result = await db.execute(sql`
        SELECT sa.id, sa.student_id, sa.teacher_id, sa.type, sa.title, sa.description,
               sa.frequency, sa.due_date, sa.status, sa.created_at,
               s.full_name AS student_name, t.full_name AS teacher_name
        FROM student_assignments sa
        JOIN users s ON sa.student_id = s.id
        JOIN users t ON sa.teacher_id = t.id
        WHERE sa.student_id = ${authUser.id}
        ORDER BY sa.created_at DESC
        LIMIT 200
      `);
      rows = result.rows;
    } else if (dbUser.role === "admin") {
      const baseQuery = studentId
        ? sql`WHERE sa.student_id = ${studentId}`
        : sql`WHERE 1=1`;
      const result = await db.execute(sql`
        SELECT sa.id, sa.student_id, sa.teacher_id, sa.type, sa.title, sa.description,
               sa.frequency, sa.due_date, sa.status, sa.created_at,
               s.full_name AS student_name, t.full_name AS teacher_name
        FROM student_assignments sa
        JOIN users s ON sa.student_id = s.id
        JOIN users t ON sa.teacher_id = t.id
        ORDER BY sa.created_at DESC
        LIMIT 500
      `);
      rows = result.rows;
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const assignments = (rows as Array<Record<string, unknown>>).map((r) => ({
      id: r.id as string,
      studentId: r.student_id as string,
      studentName: r.student_name as string,
      teacherId: r.teacher_id as string,
      teacherName: r.teacher_name as string,
      type: r.type as string,
      title: r.title as string,
      description: (r.description as string | null) ?? null,
      frequency: r.frequency as string,
      dueDate: r.due_date ? new Date(r.due_date as string).toISOString() : null,
      status: r.status as string,
      createdAt: new Date(r.created_at as string).toISOString(),
    }));

    return NextResponse.json({ assignments });
  } catch (err) {
    console.error("GET assignments error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden — teachers only" }, { status: 403 });
    }

    const { studentId, type, title, description, frequency, dueDate } = await request.json();
    if (!studentId || !type || !title || !frequency) {
      return NextResponse.json({ error: "studentId, type, title, frequency are required" }, { status: 400 });
    }

    const [assignment] = await db.insert(studentAssignments).values({
      teacherId: authUser.id,
      studentId,
      type,
      title,
      description: description || null,
      frequency,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: "pending",
    }).returning();

    return NextResponse.json({ success: true, assignment });
  } catch (err) {
    console.error("POST assignments error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });

    await db.update(studentAssignments)
      .set({ status })
      .where(and(eq(studentAssignments.id, id), eq(studentAssignments.teacherId, authUser.id)));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH assignments error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
