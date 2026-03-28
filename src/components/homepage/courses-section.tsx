"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Languages, GraduationCap } from "lucide-react";

const courses = [
  {
    key: "nazra",
    icon: BookOpen,
    price: "$18",
    color: "from-emerald-500/10 to-emerald-500/5 border-emerald-200 dark:border-emerald-800",
    iconColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    slug: "nazra-quran",
  },
  {
    key: "hifz",
    icon: Sparkles,
    price: "$22",
    color: "from-amber-500/10 to-amber-500/5 border-amber-200 dark:border-amber-800",
    iconColor: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    slug: "hifz-quran",
  },
  {
    key: "arabic",
    icon: Languages,
    price: "$20",
    color: "from-blue-500/10 to-blue-500/5 border-blue-200 dark:border-blue-800",
    iconColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    slug: "arabic-language",
  },
  {
    key: "aalim",
    icon: GraduationCap,
    price: "$25",
    color: "from-purple-500/10 to-purple-500/5 border-purple-200 dark:border-purple-800",
    iconColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    slug: "aalim-course",
  },
] as const;

export function CoursesSection() {
  const t = useTranslations("coursesSection");

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-center text-primary"
        >
          {t("title")}
        </motion.h2>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, i) => {
            const Icon = course.icon;
            return (
              <motion.div
                key={course.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`rounded-xl border bg-gradient-to-b ${course.color} p-6 hover:shadow-lg transition-all group`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${course.iconColor}`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="mt-4 text-lg font-bold text-foreground">
                  {t(`${course.key}Title`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`${course.key}Desc`)}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {t(`${course.key}Duration`)}
                  </Badge>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-xs text-muted-foreground">
                    {t("from")}
                  </span>
                  <span className="text-xl font-bold text-accent">
                    {course.price}
                  </span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </div>

                <Link href={`/courses/${course.slug}`} className="block mt-4">
                  <Button
                    variant="outline"
                    className="w-full border-primary/30 hover:bg-primary hover:text-primary-foreground"
                  >
                    {t("viewCourse")}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
