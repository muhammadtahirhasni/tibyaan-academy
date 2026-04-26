"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  DollarSign,
  Globe,
  Bot,
  Clock,
  GraduationCap,
  LogIn,
} from "lucide-react";

const benefits = [
  { icon: DollarSign, key: "benefit1" as const, color: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300" },
  { icon: Globe, key: "benefit2" as const, color: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300" },
  { icon: Bot, key: "benefit3" as const, color: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300" },
  { icon: Clock, key: "benefit4" as const, color: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" },
];

export function TeacherCtaSection() {
  const t = useTranslations("teacherCta");

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-background dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text & CTA */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <GraduationCap className="w-4 h-4" />
                Teachers
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {t("title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("subtitle")}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <GraduationCap className="w-5 h-5" />
                    {t("joinButton")}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    {t("alreadyTeacher")}
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right: Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 bg-white/80 dark:bg-card/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${benefit.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-foreground leading-snug">
                      {t(benefit.key)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
