"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripHorizontal,
  PenTool,
  Volume2,
  Puzzle,
  Type,
  TextCursor,
  Zap,
  Layers,
  Star,
  Trophy,
  ArrowLeft,
  Coins,
  Flame,
} from "lucide-react";
import { HarfDragGame } from "@/components/kids-games/harf-drag-game";
import { SoundMatchGame } from "@/components/kids-games/sound-match-game";
import { MemoryGame } from "@/components/kids-games/memory-game";
import { HarfPuzzleGame } from "@/components/kids-games/harf-puzzle-game";
import { HarfTraceGame } from "@/components/kids-games/harf-trace-game";
import { WordBuilderGame } from "@/components/kids-games/word-builder-game";
import { HarakaatGame } from "@/components/kids-games/harakaat-game";
import { ReadingRaceGame } from "@/components/kids-games/reading-race-game";
import { RewardSystem } from "@/components/kids-games/reward-system";

const games = [
  { key: "harfDrag", icon: GripHorizontal, color: "bg-red-500", lightBg: "bg-red-50 dark:bg-red-950" },
  { key: "soundMatch", icon: Volume2, color: "bg-blue-500", lightBg: "bg-blue-50 dark:bg-blue-950" },
  { key: "memoryGame", icon: Layers, color: "bg-purple-500", lightBg: "bg-purple-50 dark:bg-purple-950" },
  { key: "harfPuzzle", icon: Puzzle, color: "bg-amber-500", lightBg: "bg-amber-50 dark:bg-amber-950" },
  { key: "harfTrace", icon: PenTool, color: "bg-emerald-500", lightBg: "bg-emerald-50 dark:bg-emerald-950" },
  { key: "wordBuilder", icon: Type, color: "bg-pink-500", lightBg: "bg-pink-50 dark:bg-pink-950" },
  { key: "harakaatGame", icon: TextCursor, color: "bg-cyan-500", lightBg: "bg-cyan-50 dark:bg-cyan-950" },
  { key: "readingRace", icon: Zap, color: "bg-orange-500", lightBg: "bg-orange-50 dark:bg-orange-950" },
];

const gameComponents: Record<string, React.ComponentType<{ onBack: () => void; onScore: (s: number) => void }>> = {
  harfDrag: HarfDragGame,
  soundMatch: SoundMatchGame,
  memoryGame: MemoryGame,
  harfPuzzle: HarfPuzzleGame,
  harfTrace: HarfTraceGame,
  wordBuilder: WordBuilderGame,
  harakaatGame: HarakaatGame,
  readingRace: ReadingRaceGame,
};

export default function KidsActivitiesPage() {
  const t = useTranslations("kidsActivities");
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [totalStars, setTotalStars] = useState(47);
  const [totalCoins, setTotalCoins] = useState(230);
  const [showRewards, setShowRewards] = useState(false);

  const handleScore = (points: number) => {
    setTotalStars((s) => s + Math.floor(points / 10));
    setTotalCoins((c) => c + points);
  };

  if (showRewards) {
    return (
      <RewardSystem
        stars={totalStars}
        coins={totalCoins}
        onBack={() => setShowRewards(false)}
      />
    );
  }

  if (activeGame) {
    const GameComponent = gameComponents[activeGame];
    return (
      <GameComponent
        onBack={() => setActiveGame(null)}
        onScore={handleScore}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-6 md:p-8 text-white"
      >
        <h1 className="text-2xl md:text-3xl font-bold">{t("title")} 🎮</h1>
        <p className="mt-2 text-white/80">{t("subtitle")}</p>

        {/* Stats Row */}
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={() => setShowRewards(true)}
            className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 hover:bg-white/30 transition"
          >
            <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            <span className="font-bold">{totalStars}</span>
            <span className="text-sm text-white/70">{t("stars")}</span>
          </button>
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
            <Coins className="w-5 h-5 text-yellow-300" />
            <span className="font-bold">{totalCoins}</span>
            <span className="text-sm text-white/70">{t("coins")}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
            <Flame className="w-5 h-5 text-orange-300" />
            <span className="font-bold">5</span>
            <span className="text-sm text-white/70">{t("streakDays")}</span>
          </div>
          <button
            onClick={() => setShowRewards(true)}
            className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 hover:bg-white/30 transition"
          >
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span className="text-sm">{t("badges")}</span>
          </button>
        </div>
      </motion.div>

      {/* Game Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {games.map((game, i) => {
          const Icon = game.icon;
          return (
            <motion.button
              key={game.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              onClick={() => setActiveGame(game.key)}
              className="group rounded-2xl border bg-card p-5 text-start hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div
                className={`w-12 h-12 rounded-xl ${game.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                {t(game.key)}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {t(`${game.key}Desc`)}
              </p>
              <div className="mt-3 flex items-center gap-1">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= 2
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Today's Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-blue-950/30 p-6"
      >
        <h3 className="text-lg font-bold text-foreground">
          {t("todayLearned")} 📚
        </h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {["ا", "ب", "ت", "ث", "ج", "ح"].map((letter) => (
            <div
              key={letter}
              className="w-12 h-12 rounded-xl bg-white dark:bg-card border flex items-center justify-center text-xl font-bold text-primary shadow-sm"
            >
              {letter}
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-white/60 dark:bg-card border">
            <p className="text-2xl font-bold text-primary">5</p>
            <p className="text-xs text-muted-foreground">
              {t("activitiesCompleted")}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/60 dark:bg-card border">
            <p className="text-2xl font-bold text-amber-500">12</p>
            <p className="text-xs text-muted-foreground">{t("todayStars")}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white/60 dark:bg-card border">
            <p className="text-2xl font-bold text-purple-500">95%</p>
            <p className="text-xs text-muted-foreground">{t("accuracy")}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
