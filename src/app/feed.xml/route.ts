import { getDb } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://tibyaan-academy.vercel.app";

export async function GET() {
  try {
    const db = getDb();
    const posts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(50);

    const items = posts
      .map((post) => {
        const title = escapeXml(post.titleEn || post.titleUr || "Untitled");
        const description = escapeXml(post.metaDescriptionEn || post.metaDescriptionUr || "");
        const link = `${SITE_URL}/en/blog/${post.slug}`;
        const pubDate = post.publishedAt
          ? new Date(post.publishedAt).toUTCString()
          : new Date(post.createdAt).toUTCString();

        return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${link}</guid>
      <category>islamic-education</category>
    </item>`;
      })
      .join("\n");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tibyaan Academy Blog</title>
    <link>${SITE_URL}/en/blog</link>
    <description>Islamic Education Insights, Quran Learning Tips, and Hifz Guidance from Tibyaan Academy</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/icons/icon-192x192.png</url>
      <title>Tibyaan Academy</title>
      <link>${SITE_URL}</link>
    </image>
${items}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("RSS feed generation error:", error);

    // Return a minimal valid RSS feed on error
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tibyaan Academy Blog</title>
    <link>${SITE_URL}/en/blog</link>
    <description>Islamic Education Insights from Tibyaan Academy</description>
  </channel>
</rss>`;

    return new Response(fallback, {
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
