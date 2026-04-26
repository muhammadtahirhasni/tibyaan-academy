"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DarsItem {
  id: string;
  slug: string;
  titleEn: string | null;
  titleUr: string | null;
  titleAr: string | null;
  titleFr: string | null;
  titleId: string | null;
  excerptEn: string | null;
  excerptUr: string | null;
  category: string;
  publishedAt: string;
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  fiqh: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  tafseer: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  hadith: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  seerah: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  aqeedah: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  akhlaq: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
};

export function DailyDarsSection() {
  const t = useTranslations("dailyDarsSection");
  const locale = useLocale();
  const [darsItems, setDarsItems] = useState<DarsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dars/recent")
      .then((res) => res.json())
      .then((data) => setDarsItems(data.dars ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && darsItems.length === 0) return null;

  function getDarsTitle(item: DarsItem): string {
    if (locale === "ur") return item.titleUr || item.titleEn || "Dars";
    if (locale === "ar") return item.titleAr || item.titleEn || "Dars";
    if (locale === "fr") return item.titleFr || item.titleEn || "Dars";
    if (locale === "id") return item.titleId || item.titleEn || "Dars";
    return item.titleEn || item.titleUr || "Dars";
  }

  function getDarsExcerpt(item: DarsItem): string {
    if (locale === "ur") return item.excerptUr || item.excerptEn || "";
    return item.excerptEn || item.excerptUr || "";
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            {t("title")}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("title")}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-6 animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {darsItems.map((item, i) => {
              const categoryColor = categoryColors[item.category] ?? categoryColors.akhlaq;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`text-xs font-medium ${categoryColor} border-0`}>
                      {item.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(item.publishedAt).toLocaleDateString(locale, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
                    {getDarsTitle(item)}
                  </h3>

                  {getDarsExcerpt(item) && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {getDarsExcerpt(item)}
                      {getDarsExcerpt(item).length >= 100 ? "..." : ""}
                    </p>
                  )}

                  <Link href={`/dars/${item.id}`} className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between text-primary hover:text-primary hover:bg-primary/5"
                    >
                      {t("readMore")}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && darsItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Link href="/dars">
              <Button variant="outline" className="gap-2">
                {t("viewAll")}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
