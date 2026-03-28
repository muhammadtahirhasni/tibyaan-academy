"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Bot,
  Video,
  Gamepad2,
  Languages,
  Brain,
  GraduationCap,
} from "lucide-react";

const features = [
  { key: "f1", icon: Bot, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" },
  { key: "f2", icon: Video, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" },
  { key: "f3", icon: Gamepad2, color: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300" },
  { key: "f4", icon: Languages, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300" },
  { key: "f5", icon: Brain, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" },
  { key: "f6", icon: GraduationCap, color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300" },
] as const;

export function FeaturesSection() {
  const t = useTranslations("features");

  return (
    <section className="py-20 bg-background">
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

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 rounded-xl border border-border/50 bg-card hover:shadow-lg hover:border-primary/20 transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {t(`${feature.key}Title`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`${feature.key}Desc`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
