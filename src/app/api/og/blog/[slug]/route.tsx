import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { renderPoster } from "@/lib/og/poster";
import { STATIC_BLOG_POSTS } from "@/lib/data/blog-seed";

// Node runtime: the poster reads font files from disk.
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let title = "Tibyaan Academy Blog";
  let category: string | null = "Article";
  let citation: string | null = null;

  try {
    const db = getDb();
    const rows = await db
      .select({
        titleEn: blogPosts.titleEn,
        keywords: blogPosts.keywords,
      })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (rows[0]) {
      title = rows[0].titleEn || title;
      citation = rows[0].keywords?.[0] ?? null;
    }
  } catch {
    // fall through to the static seed
  }

  if (title === "Tibyaan Academy Blog") {
    const seed = STATIC_BLOG_POSTS.find((p) => p.slug === slug);
    if (seed) {
      title = seed.titles.en;
      category = seed.category;
    }
  }

  return renderPoster({ title, category, citation });
}
