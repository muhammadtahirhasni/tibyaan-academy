import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { BookOpen } from "lucide-react";

const BASE_URL = "https://tibyaan.com";

type LocaleKey = "en" | "ur" | "ar" | "fr" | "id";

const blogMeta: Record<string, { title: string; description: string }> = {
  ur: {
    title: "بلاگ — اسلامی تعلیم اور قرآن سیکھنے کے مشورے",
    description:
      "قرآن، حفظ، عربی اور اسلامی تعلیم کے بارے میں مفید مضامین پڑھیں — تبیان اکیڈمی بلاگ۔",
  },
  ar: {
    title: "المدونة — مقالات التعليم الإسلامي وتعلم القرآن",
    description:
      "اقرأ مقالات مفيدة عن القرآن والحفظ والعربية والتعليم الإسلامي — مدونة أكاديمية تبيان.",
  },
  en: {
    title: "Blog — Islamic Education Insights & Quran Tips",
    description:
      "Read helpful articles about Quran, Hifz, Arabic & Islamic education — Tibyaan Academy Blog.",
  },
  fr: {
    title: "Blog — Éducation islamique et conseils pour le Coran",
    description:
      "Lisez des articles utiles sur le Coran, le Hifz, l'arabe et l'éducation islamique — Blog Tibyaan Academy.",
  },
  id: {
    title: "Blog — Wawasan Pendidikan Islam & Tips Quran",
    description:
      "Baca artikel bermanfaat tentang Quran, Hifz, Bahasa Arab & pendidikan Islam — Blog Tibyaan Academy.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = blogMeta[locale] || blogMeta.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}/blog`,
    },
  };
}

interface BlogPost {
  slug: string;
  titleEn: string | null;
  titleUr: string | null;
  titleAr: string | null;
  titleFr: string | null;
  titleId: string | null;
  contentEn: string | null;
  contentUr: string | null;
  contentAr: string | null;
  contentFr: string | null;
  contentId: string | null;
  keywords: string[] | null;
  publishedAt: Date | null;
  aiGenerated: boolean;
}

function getTitle(post: BlogPost, locale: string): string {
  const map: Record<LocaleKey, string | null> = {
    en: post.titleEn,
    ur: post.titleUr,
    ar: post.titleAr,
    fr: post.titleFr,
    id: post.titleId,
  };
  return map[locale as LocaleKey] || post.titleEn || "Untitled";
}

function getExcerpt(post: BlogPost, locale: string): string {
  const map: Record<LocaleKey, string | null> = {
    en: post.contentEn,
    ur: post.contentUr,
    ar: post.contentAr,
    fr: post.contentFr,
    id: post.contentId,
  };
  const content = map[locale as LocaleKey] || post.contentEn || "";
  // Strip markdown and take first 150 chars
  const plain = content
    .replace(/#{1,3}\s/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^>\s/gm, "")
    .replace(/^-\s/gm, "");
  return plain.slice(0, 150) + (plain.length > 150 ? "..." : "");
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("blog");

  let posts: BlogPost[] = [];
  try {
    const { getDb } = await import("@/lib/db");
    const { blogPosts } = await import("@/lib/db/schema");
    const { eq, desc } = await import("drizzle-orm");

    const db = getDb();
    posts = await db
      .select({
        slug: blogPosts.slug,
        titleEn: blogPosts.titleEn,
        titleUr: blogPosts.titleUr,
        titleAr: blogPosts.titleAr,
        titleFr: blogPosts.titleFr,
        titleId: blogPosts.titleId,
        contentEn: blogPosts.contentEn,
        contentUr: blogPosts.contentUr,
        contentAr: blogPosts.contentAr,
        contentFr: blogPosts.contentFr,
        contentId: blogPosts.contentId,
        keywords: blogPosts.keywords,
        publishedAt: blogPosts.publishedAt,
        aiGenerated: blogPosts.aiGenerated,
      })
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt));
  } catch {
    // DB unavailable — show empty state
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-20">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNDAgMEw0MCA4ME0wIDQwTDgwIDQwTTAgMEw4MCA4ME04MCAwTDAgODBNMjAgMEwyMCA4ME02MCAwTDYwIDgwTTAgMjBMODAgMjBNMCA2MEw4MCA2MCIgc3Ryb2tlPSIjMUI0MzMyIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-primary">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <BlogCard
                    key={post.slug}
                    slug={post.slug}
                    title={getTitle(post, locale)}
                    excerpt={getExcerpt(post, locale)}
                    publishedAt={post.publishedAt}
                    keywords={post.keywords}
                    aiGenerated={post.aiGenerated}
                    readMoreLabel={t("readMore")}
                    minuteReadLabel={t("minuteRead")}
                    aiGeneratedLabel={t("aiGenerated")}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="mt-4 text-muted-foreground">{t("noResults")}</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold">
              {t("startTrial")}
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              {t("startTrialDesc")}
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="mt-8 h-12 px-8 bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg"
              >
                {t("startTrialButton")}
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
