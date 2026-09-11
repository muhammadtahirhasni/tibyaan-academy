import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, whatsapp, country, course, plan, message, locale } = body as {
      name: string;
      email: string;
      whatsapp: string;
      country: string;
      course: string;
      plan: string;
      message?: string;
      locale?: string;
    };

    if (!name || !email || !whatsapp || !country || !course || !plan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();

    await db.execute(sql`
      INSERT INTO enrollment_requests
        (name, email, whatsapp, country, course, plan, message, locale, status, created_at)
      VALUES
        (${name}, ${email}, ${whatsapp}, ${country}, ${course}, ${plan}, ${message ?? null}, ${locale ?? "en"}, 'pending', NOW())
    `);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Enrollment request error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Admin only: this returns every lead — name, email, WhatsApp number, country.
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const db = getDb();
    const rows = await db.execute(sql`
      SELECT * FROM enrollment_requests ORDER BY created_at DESC LIMIT 200
    `);
    return NextResponse.json({ requests: rows.rows });
  } catch (err) {
    console.error("Enrollment requests fetch error:", err);
    return NextResponse.json({ requests: [] });
  }
}
