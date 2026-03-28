"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Coins,
  Trophy,
  Medal,
  BookOpen,
  Sparkles,
  Puzzle,
  Type,
  Zap,
  Flame,
} from "lucide-react";

const badges = [
  { key: "badgeAlifChampion", icon: BookOpen, color: "bg-emerald-500", earned: true },
  { key: "badgeTajweedStar", icon: Sparkles, color: "bg-amber-500", earned: true },
  { key: "badgeHafizHero", icon: Medal, color: "bg-blue-500", earned: false },
  { key: "badgePuzzleMaster", icon: Puzzle, color: "bg-purple-500", earned: true },
  { key: "badgeWordWizard", icon: Type, color: "bg-pink-500", earned: false },
  { key: "badgeSpeedReader", icon: Zap, color: "bg-orange-500", earned: false },
];

interface Props {
  stars: number;
  coins: number;
  onBack: () => void;
}

export function RewardSystem({ stars, coins, onBack }: Props) {
  const t = useTranslations("kidsActivities");

  const earnedBadges = badges.filter((b) => b.earned).length;
  const nextBadgeProgress = 72; // percentage toward next badge

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> {t("back")}
        </button>
      </div>

      {/* Hero Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 p-6 md:p-8 text-white"
      >
        <h2 className="text-2xl font-bold">{t("badges")} & {t("stars")} 🌟</h2>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <Star className="w-8 h-8 mx-auto fill-white" />
            <p className="text-2xl font-bold mt-2">{stars}</p>
            <p className="text-xs text-white/70">{t("totalStars")}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <Coins className="w-8 h-8 mx-auto" />
            <p className="text-2xl font-bold mt-2">{coins}</p>
            <p className="text-xs text-white/70">{t("coins")}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <Flame className="w-8 h-8 mx-auto" />
            <p className="text-2xl font-bold mt-2">5</p>
            <p className="text-xs text-white/70">{t("streakDays")}</p>
          </div>
        </div>
      </motion.div>

      {/* Badges Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border bg-card p-6"
      >
        <h3 className="text-lg font-bold text-foreground mb-4">
          {t("badges")} ({earnedBadges}/{badges.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {badges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  badge.earned
                    ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20"
                    : "border-muted-foreground/20 opacity-40 grayscale"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full ${badge.color} flex items-center justify-center`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <p className="mt-2 text-sm font-bold text-foreground text-center">
                  {t(badge.key)}
                </p>
                {badge.earned && (
                  <span className="mt-1 text-xs text-amber-500 font-medium">
                    ✓ Earned
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Next Badge Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border bg-card p-6"
      >
        <h3 className="text-lg font-bold text-foreground mb-2">
          {t("nextBadge")}: {t("badgeHafizHero")}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("progress")}: {nextBadgeProgress}%
        </p>
        <div className="h-4 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${nextBadgeProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Medal className="w-5 h-5 text-blue-500" />
          <span className="text-xs text-muted-foreground">
            Complete 5 more Hifz sessions to unlock
          </span>
        </div>
      </motion.div>

      {/* Today's Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 border p-6"
      >
        <h3 className="text-lg font-bold text-foreground mb-4">
          {t("todayLearned")} 📚
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/60 dark:bg-card border text-center">
            <p className="text-3xl font-bold text-primary">5</p>
            <p className="text-xs text-muted-foreground">
              {t("activitiesCompleted")}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/60 dark:bg-card border text-center">
            <p className="text-3xl font-bold text-amber-500">12</p>
            <p className="text-xs text-muted-foreground">{t("todayStars")}</p>
          </div>
        </div>

        {/* Letters learned today */}
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Letters practiced:</p>
          <div className="flex flex-wrap gap-2">
            {["ا", "ب", "ت", "ث", "ج", "ح"].map((l) => (
              <div
                key={l}
                className="w-10 h-10 rounded-lg bg-white dark:bg-card border flex items-center justify-center text-lg font-bold text-primary"
              >
                {l}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
