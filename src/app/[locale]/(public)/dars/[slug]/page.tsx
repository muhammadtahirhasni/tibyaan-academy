import { getDb } from "@/lib/db";
import { dailyDars } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";

const categoryLabels: Record<string, Record<string, string>> = {
  quran: { en: "Quran", ur: "قرآن", ar: "القرآن", fr: "Coran", id: "Al-Quran" },
  hadith: { en: "Hadith", ur: "حدیث", ar: "الحديث", fr: "Hadith", id: "Hadits" },
  fiqh: { en: "Fiqh", ur: "فقہ", ar: "الفقه", fr: "Fiqh", id: "Fikih" },
  seerah: { en: "Seerah", ur: "سیرت", ar: "السيرة", fr: "Sira", id: "Sirah" },
  dua: { en: "Dua", ur: "دعا", ar: "الدعاء", fr: "Doua", id: "Doa" },
};

const categoryColors: Record<string, string> = {
  quran: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  hadith: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  fiqh: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  seerah: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  dua: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
};

export default async function DarsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const db = getDb();

  const result = await db
    .select()
    .from(dailyDars)
    .where(eq(dailyDars.slug, slug))
    .limit(1);

  const post = result[0];
  if (!post || !post.isPublished) notFound();

  const titleKey = `title${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof post;
  const contentKey = `content${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof post;

  const title = (post[titleKey] as string) || post.titleEn || "Untitled";
  const content = (post[contentKey] as string) || post.contentEn || "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/dars" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>{locale === "ur" ? "تمام درس" : locale === "ar" ? "جميع الدروس" : "All Dars"}</span>
      </Link>

      <article>
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[post.category] ?? "bg-muted"}`}>
            {categoryLabels[post.category]?.[locale] ?? post.category}
          </span>
          {post.publishedAt && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">{title}</h1>

        {post.sourceReference && (
          <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-muted/50 border">
            <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-sm text-muted-foreground">{post.sourceReference}</span>
          </div>
        )}

        <div
          className="prose dark:prose-invert prose-emerald max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground"
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br>") }}
        />
      </article>
    </div>
  );
}
