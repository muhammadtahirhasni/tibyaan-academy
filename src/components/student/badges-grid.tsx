"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  BookOpen,
  Flame,
  Star,
  Trophy,
  Award,
  Mic,
  Clock,
  Moon,
  Users,
  Target,
  Heart,
  Zap,
  Crown,
  Shield,
  Sparkles,
  Medal,
  GraduationCap,
} from "lucide-react";

const BADGE_ICONS: Record<string, React.ElementType> = {
  first_sabaq: BookOpen,
  first_juz: Star,
  five_juz: Trophy,
  ten_juz: Award,
  twenty_juz: Crown,
  hafiz: GraduationCap,
  streak_7: Flame,
  streak_30: Zap,
  streak_100: Shield,
  tajweed_star: Mic,
  tajweed_master: Sparkles,
  perfect_score: Target,
  early_bird: Clock,
  night_owl: Moon,
  social_learner: Users,
  quiz_champion: Medal,
  dedicated_student: Heart,
};

const BADGE_COLORS: Record<string, string> = {
  first_sabaq: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50",
  first_juz: "bg-blue-100 text-blue-600 dark:bg-blue-950/50",
  five_juz: "bg-purple-100 text-purple-600 dark:bg-purple-950/50",
  ten_juz: "bg-amber-100 text-amber-600 dark:bg-amber-950/50",
  twenty_juz: "bg-rose-100 text-rose-600 dark:bg-rose-950/50",
  hafiz: "bg-yellow-100 text-yellow-600 dark:bg-yellow-950/50",
  streak_7: "bg-orange-100 text-orange-600 dark:bg-orange-950/50",
  streak_30: "bg-red-100 text-red-600 dark:bg-red-950/50",
  streak_100: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50",
  tajweed_star: "bg-teal-100 text-teal-600 dark:bg-teal-950/50",
  tajweed_master: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950/50",
  perfect_score: "bg-lime-100 text-lime-600 dark:bg-lime-950/50",
  early_bird: "bg-sky-100 text-sky-600 dark:bg-sky-950/50",
  night_owl: "bg-violet-100 text-violet-600 dark:bg-violet-950/50",
  social_learner: "bg-pink-100 text-pink-600 dark:bg-pink-950/50",
  quiz_champion: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-950/50",
  dedicated_student: "bg-rose-100 text-rose-600 dark:bg-rose-950/50",
};

const ALL_BADGES = [
  "first_sabaq",
  "first_juz",
  "five_juz",
  "ten_juz",
  "twenty_juz",
  "hafiz",
  "streak_7",
  "streak_30",
  "streak_100",
  "tajweed_star",
  "tajweed_master",
  "perfect_score",
  "early_bird",
  "night_owl",
  "social_learner",
  "quiz_champion",
  "dedicated_student",
];

interface BadgesGridProps {
  earnedBadges: Array<{ badge: string; earnedAt: Date | string }>;
}

export function BadgesGrid({ earnedBadges }: BadgesGridProps) {
  const t = useTranslations("gamification");
  const earnedSet = new Set(earnedBadges.map((b) => b.badge));

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {t("badges")} ({earnedBadges.length}/{ALL_BADGES.length})
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {ALL_BADGES.map((badge, i) => {
          const Icon = BADGE_ICONS[badge] ?? Star;
          const earned = earnedSet.has(badge);
          const colors = BADGE_COLORS[badge] ?? "bg-muted text-muted-foreground";

          return (
            <motion.div
              key={badge}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                earned
                  ? "border-primary/20 shadow-sm"
                  : "opacity-40 grayscale"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  earned ? colors : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-center font-medium text-foreground leading-tight">
                {t(`badge_${badge}`)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
