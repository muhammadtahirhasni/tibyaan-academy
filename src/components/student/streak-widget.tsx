"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakWidget({
  currentStreak,
  longestStreak,
}: StreakWidgetProps) {
  const t = useTranslations("gamification");

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center"
        >
          <Flame className="w-6 h-6 text-amber-500" />
        </motion.div>
        <div>
          <p className="text-2xl font-bold text-foreground">{currentStreak}</p>
          <p className="text-xs text-muted-foreground">{t("dayStreak")}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span>{t("longestStreak")}:</span>
        <span className="font-semibold text-foreground">{longestStreak}</span>
        <span>{t("days")}</span>
      </div>
    </div>
  );
}
