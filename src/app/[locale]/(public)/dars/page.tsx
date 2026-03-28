import { getDb } from "@/lib/db";
import { dailyDars } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Link } from "@/i18n/navigation";
import { BookOpen, Calendar } from "lucide-react";

const categoryColors: Record<string, string> = {
  quran: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  hadith: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  fiqh: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  seerah: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  dua: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
};

const categoryLabels: Record<string, Record<string, string>> = {
  quran: { en: "Quran", ur: "قرآن", ar: "القرآن", fr: "Coran", id: "Al-Quran" },
  hadith: { en: "Hadith", ur: "حدیث", ar: "الحديث", fr: "Hadith", id: "Hadits" },
  fiqh: { en: "Fiqh", ur: "فقہ", ar: "الفقه", fr: "Fiqh", id: "Fikih" },
  seerah: { en: "Seerah", ur: "سیرت", ar: "السيرة", fr: "Sira", id: "Sirah" },
  dua: { en: "Dua", ur: "دعا", ar: "الدعاء", fr: "Doua", id: "Doa" },
};

export default async function DarsListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const db = getDb();

  let posts: Array<typeof dailyDars.$inferSelect> = [];
  try {
    posts = await db
      .select()
      .from(dailyDars)
      .where(eq(dailyDars.isPublished, true))
      .orderBy(desc(dailyDars.publishedAt))
      .limit(50);
  } catch (err) {
    console.error("Failed to load dars:", err);
  }

  const titleKey = `title${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof posts[0];

  const pageTitle: Record<string, string> = {
    en: "Daily Dars",
    ur: "یومیہ درس",
    ar: "الدرس اليومي",
    fr: "Dars Quotidien",
    id: "Dars Harian",
  };

  const pageSubtitle: Record<string, string> = {
    en: "Daily Islamic knowledge - Quran, Hadith, Fiqh, Seerah & Dua",
    ur: "روزانہ اسلامی علم - قرآن، حدیث، فقہ، سیرت اور دعا",
    ar: "المعرفة الإسلامية اليومية - القرآن والحديث والفقه والسيرة والدعاء",
    fr: "Savoir islamique quotidien - Coran, Hadith, Fiqh, Sira et Doua",
    id: "Pengetahuan Islam harian - Al-Quran, Hadits, Fikih, Sirah & Doa",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-7 h-7 text-emerald-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {pageTitle[locale] ?? pageTitle.en}
        </h1>
        <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
          {pageSubtitle[locale] ?? pageSubtitle.en}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No dars posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const title = (post[titleKey] as string) || post.titleEn || "Untitled";
            return (
              <Link key={post.id} href={`/dars/${post.slug}`}>
                <div className="rounded-xl border bg-card p-5 hover:bg-muted/30 transition-colors group">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[post.category] ?? "bg-muted text-muted-foreground"}`}>
                          {categoryLabels[post.category]?.[locale] ?? post.category}
                        </span>
                        {post.publishedAt && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold text-foreground group-hover:text-emerald-600 transition-colors">
                        {title}
                      </h2>
                      {post.sourceReference && (
                        <p className="text-xs text-muted-foreground mt-1">{post.sourceReference}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
