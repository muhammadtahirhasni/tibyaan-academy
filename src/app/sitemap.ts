import type { MetadataRoute } from "next";

const BASE_URL = "https://tibyaan.com";

const locales = ["ur", "ar", "en", "fr", "id"];

const staticPages = [
  "",
  "/courses",
  "/pricing",
  "/blog",
  "/dars",
  "/about",
  "/teachers",
  "/reviews",
  "/dars-circles",
];

const courseSlugs = [
  "nazra-quran",
  "hifz-quran",
  "arabic-language",
  "aalim-course",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages per locale
  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1.0 : 0.8,
      });
    }
  }

  // Course detail pages per locale
  for (const slug of courseSlugs) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/courses/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  // Dynamic DB content (try/catch in case DB is unavailable at build)
  try {
    const { getDb } = await import("@/lib/db");
    const { blogPosts, dailyDars } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const db = getDb();

    const posts = await db
      .select({ slug: blogPosts.slug, publishedAt: blogPosts.publishedAt })
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true));

    for (const post of posts) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/blog/${post.slug}`,
          lastModified: post.publishedAt ?? new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }

    const darsPosts = await db
      .select({ slug: dailyDars.slug, publishedAt: dailyDars.publishedAt })
      .from(dailyDars)
      .where(eq(dailyDars.isPublished, true));

    for (const post of darsPosts) {
      for (const locale of locales) {
        entries.push({
          url: `${BASE_URL}/${locale}/dars/${post.slug}`,
          lastModified: post.publishedAt ?? new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  } catch {
    // DB not available during build — skip dynamic content
  }

  // Country-specific landing pages
  const countryPages = [
    { path: "uk", locales: ["en"] },
    { path: "usa", locales: ["en"] },
    { path: "uae", locales: ["en"] },
    { path: "canada", locales: ["en"] },
    { path: "australia", locales: ["en"] },
    { path: "indonesia", locales: ["id"] },
    { path: "germany", locales: ["en"] },
    { path: "saudi", locales: ["ar"] },
  ];

  for (const { path, locales: pagLocales } of countryPages) {
    for (const locale of pagLocales) {
      entries.push({
        url: `${BASE_URL}/${locale}/${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
