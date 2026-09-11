import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { postCountryLinks } from "@/lib/db/schema";

/** The eight country landing pages, with the locale each one is written for. */
export const COUNTRY_PAGES = [
  { country: "UK", path: "/en/uk", label: "online Quran classes in the UK" },
  { country: "USA", path: "/en/usa", label: "online Quran classes in the USA" },
  { country: "UAE", path: "/en/uae", label: "online Quran classes in the UAE" },
  { country: "Canada", path: "/en/canada", label: "online Quran classes in Canada" },
  { country: "Australia", path: "/en/australia", label: "online Quran classes in Australia" },
  { country: "Germany", path: "/en/germany", label: "online Quran classes in Germany" },
  { country: "Indonesia", path: "/id/indonesia", label: "kelas Quran online di Indonesia" },
  { country: "Saudi Arabia", path: "/ar/saudi", label: "تعلم القرآن أونلاين في السعودية" },
] as const;

export const COURSE_PAGES = [
  { key: "nazra", path: "/en/courses/nazra-quran", label: "Nazra Quran course" },
  { key: "hifz", path: "/en/courses/hifz-quran", label: "Hifz Quran course" },
  { key: "arabic", path: "/en/courses/arabic-language", label: "Arabic Language course" },
  { key: "aalim", path: "/en/courses/aalim-course", label: "Aalim course" },
] as const;

/** Dars category → the course that category most naturally leads into. */
const CATEGORY_TO_COURSE: Record<string, (typeof COURSE_PAGES)[number]["key"]> = {
  quran: "nazra",
  dua: "nazra",
  hadith: "aalim",
  fiqh: "aalim",
  seerah: "aalim",
};

export interface InternalLinkPlan {
  course: (typeof COURSE_PAGES)[number];
  country: (typeof COUNTRY_PAGES)[number];
}

export function pickCourseLink(categoryOrTopic: string): (typeof COURSE_PAGES)[number] {
  const direct = CATEGORY_TO_COURSE[categoryOrTopic.toLowerCase()];
  if (direct) return COURSE_PAGES.find((c) => c.key === direct)!;

  const haystack = categoryOrTopic.toLowerCase();
  if (haystack.includes("hifz") || haystack.includes("memoris") || haystack.includes("memoriz")) {
    return COURSE_PAGES.find((c) => c.key === "hifz")!;
  }
  if (haystack.includes("arabic")) return COURSE_PAGES.find((c) => c.key === "arabic")!;
  if (haystack.includes("aalim") || haystack.includes("nizami") || haystack.includes("scholar")) {
    return COURSE_PAGES.find((c) => c.key === "aalim")!;
  }
  return COURSE_PAGES.find((c) => c.key === "nazra")!;
}

/**
 * The country page that has gone longest without a link from a post — a country
 * that has never been linked wins outright. This is what stops every post from
 * pointing at all eight.
 */
export async function pickCountryLink(): Promise<(typeof COUNTRY_PAGES)[number]> {
  try {
    const db = getDb();
    const lastLinkedAt = new Map<string, number>();

    for (const entry of COUNTRY_PAGES) {
      const rows = await db
        .select({ createdAt: postCountryLinks.createdAt })
        .from(postCountryLinks)
        .where(eq(postCountryLinks.country, entry.country))
        .orderBy(desc(postCountryLinks.createdAt))
        .limit(1);

      if (rows.length === 0) return entry; // never linked — take it now
      lastLinkedAt.set(entry.country, rows[0].createdAt.getTime());
    }

    return [...COUNTRY_PAGES].sort(
      (a, b) => lastLinkedAt.get(a.country)! - lastLinkedAt.get(b.country)!
    )[0];
  } catch {
    // DB unreachable — rotate deterministically by day so it still varies.
    const day = Math.floor(Date.now() / 86_400_000);
    return COUNTRY_PAGES[day % COUNTRY_PAGES.length];
  }
}

export async function planInternalLinks(
  categoryOrTopic: string
): Promise<InternalLinkPlan> {
  return {
    course: pickCourseLink(categoryOrTopic),
    country: await pickCountryLink(),
  };
}

/** Record the country link so the next post picks a different one. */
export async function recordCountryLink(
  country: string,
  postType: "dars" | "blog",
  postSlug: string
): Promise<void> {
  try {
    const db = getDb();
    await db.insert(postCountryLinks).values({ country, postType, postSlug });
  } catch (err) {
    console.error("[internal-links] failed to record country link:", err);
  }
}

/**
 * Prompt fragment describing the exact links a post may contain. Deliberately
 * caps at two contextual links — the CTA block rendered by the page template is
 * separate and is not counted here.
 */
export function internalLinkInstructions(plan: InternalLinkPlan): string {
  return `Internal linking rules — follow exactly:
- Include AT MOST 3 and AT LEAST 2 contextual links in the body, woven into sentences where they genuinely help the reader.
- Exactly one link to this course page: ${plan.course.path} (anchor text describing the ${plan.course.label}).
- Exactly one link to this country page: ${plan.country.path} (anchor text about ${plan.country.label}).
- Do NOT link to any other country page. Do NOT list or mention all eight countries.
- Do NOT add a closing call-to-action block; the page template renders its own.`;
}
