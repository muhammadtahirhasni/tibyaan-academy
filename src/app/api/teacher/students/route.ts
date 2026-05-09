import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getTeacherStudents } from "@/lib/db/teacher-queries";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "teacher") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const raw = await getTeacherStudents(authUser.id);
    const students = raw.map((r) => ({ id: r.student.id, name: r.student.fullName }));

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Teacher students GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
