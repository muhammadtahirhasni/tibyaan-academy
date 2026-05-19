import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = (await req.json()) as { status: string };
    const db = getDb();
    await db.execute(sql`
      UPDATE enrollment_requests SET status = ${status} WHERE id = ${id}
    `);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Enrollment request update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
