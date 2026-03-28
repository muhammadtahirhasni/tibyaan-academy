"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface XpBarProps {
  level: number;
  totalPoints: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  progressToNextLevel: number;
}

export function XpBar({
  level,
  totalPoints,
  currentLevelPoints,
  nextLevelPoints,
  progressToNextLevel,
}: XpBarProps) {
  const t = useTranslations("gamification");

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Star className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t("level")} {level}
            </p>
            <p className="text-xs text-muted-foreground">
              {totalPoints.toLocaleString()} {t("totalXP")}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {nextLevelPoints - totalPoints} {t("xpToNextLevel")}
        </p>
      </div>
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressToNextLevel}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground">
          {currentLevelPoints.toLocaleString()}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {nextLevelPoints.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
