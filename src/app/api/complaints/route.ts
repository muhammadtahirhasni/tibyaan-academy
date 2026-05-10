import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, studentComplaints } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let rows;
    if (dbUser.role === "student") {
      const result = await db.execute(sql`
        SELECT sc.id, sc.subject, sc.category, sc.description, sc.status, sc.admin_note, sc.created_at,
               u.full_name AS student_name
        FROM student_complaints sc
        JOIN users u ON sc.student_id = u.id
        WHERE sc.student_id = ${authUser.id}
        ORDER BY sc.created_at DESC
      `);
      rows = result.rows;
    } else if (dbUser.role === "admin") {
      const result = await db.execute(sql`
        SELECT sc.id, sc.student_id, sc.subject, sc.category, sc.description, sc.status, sc.admin_note, sc.created_at,
               u.full_name AS student_name
        FROM student_complaints sc
        JOIN users u ON sc.student_id = u.id
        ORDER BY sc.created_at DESC
        LIMIT 500
      `);
      rows = result.rows;
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const complaints = (rows as Array<Record<string, unknown>>).map((r) => ({
      id: r.id as string,
      studentId: (r.student_id as string | undefined) ?? authUser.id,
      studentName: r.student_name as string,
      subject: r.subject as string,
      category: r.category as string,
      description: r.description as string,
      status: r.status as string,
      adminNote: (r.admin_note as string | null) ?? null,
      createdAt: new Date(r.created_at as string).toISOString(),
    }));

    return NextResponse.json({ complaints });
  } catch (err) {
    console.error("GET complaints error:", err);
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
    if (!dbUser || dbUser.role !== "student") {
      return NextResponse.json({ error: "Forbidden — students only" }, { status: 403 });
    }

    const { subject, category, description } = await request.json();
    if (!subject || !category || !description) {
      return NextResponse.json({ error: "subject, category, and description are required" }, { status: 400 });
    }

    const [complaint] = await db.insert(studentComplaints).values({
      studentId: authUser.id,
      subject,
      category,
      description,
      status: "new",
    }).returning();

    return NextResponse.json({ success: true, complaint });
  } catch (err) {
    console.error("POST complaints error:", err);
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
    if (!dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden — admins only" }, { status: 403 });
    }

    const { id, status, adminNote } = await request.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await db.update(studentComplaints)
      .set({
        ...(status ? { status } : {}),
        ...(adminNote !== undefined ? { adminNote } : {}),
        updatedAt: new Date(),
      })
      .where(eq(studentComplaints.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH complaints error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
