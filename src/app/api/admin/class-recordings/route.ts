import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { users, adminClassRecordings } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const [dbUser] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
    if (!dbUser || dbUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const recordings = await db
      .select({ recording: adminClassRecordings, student: users })
      .from(adminClassRecordings)
      .innerJoin(users, eq(adminClassRecordings.studentId, users.id))
      .orderBy(desc(adminClassRecordings.classDate))
      .limit(100);

    return NextResponse.json({ recordings });
  } catch (error) {
    console.error("Admin class-recordings GET error:", error);
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
    if (!dbUser || dbUser.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { studentId, title, recordingUrl, classDate, notes } = await request.json();
    if (!studentId || !title || !recordingUrl || !classDate) {
      return NextResponse.json({ error: "studentId, title, recordingUrl, classDate are required" }, { status: 400 });
    }

    const [recording] = await db
      .insert(adminClassRecordings)
      .values({
        studentId,
        uploadedBy: authUser.id,
        title,
        recordingUrl,
        classDate: new Date(classDate),
        notes: notes ?? null,
      })
      .returning();

    return NextResponse.json({ recording });
  } catch (error) {
    console.error("Admin class-recordings POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
