import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { dailyDars } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/dars/recent
 * Returns 3 most recent published daily dars records.
 * No auth required.
 */
export async function GET() {
  try {
    const db = getDb();

    const rows = await db
      .select({
        id: dailyDars.id,
        slug: dailyDars.slug,
        titleEn: dailyDars.titleEn,
        titleUr: dailyDars.titleUr,
        titleAr: dailyDars.titleAr,
        titleFr: dailyDars.titleFr,
        titleId: dailyDars.titleId,
        contentEn: dailyDars.contentEn,
        contentUr: dailyDars.contentUr,
        category: dailyDars.category,
        publishedAt: dailyDars.publishedAt,
        createdAt: dailyDars.createdAt,
      })
      .from(dailyDars)
      .where(eq(dailyDars.isPublished, true))
      .orderBy(desc(dailyDars.createdAt))
      .limit(3);

    const darsItems = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      titleEn: r.titleEn,
      titleUr: r.titleUr,
      titleAr: r.titleAr,
      titleFr: r.titleFr,
      titleId: r.titleId,
      // Provide a short excerpt from English content
      excerptEn: r.contentEn ? r.contentEn.substring(0, 100) : null,
      excerptUr: r.contentUr ? r.contentUr.substring(0, 100) : null,
      category: r.category,
      publishedAt: r.publishedAt?.toISOString() ?? r.createdAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({ dars: darsItems });
  } catch (err) {
    console.error("Dars recent fetch error:", err);
    return NextResponse.json({ dars: [] });
  }
}
