"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Star, RotateCcw } from "lucide-react";

const haroof = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س"];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Props {
  onBack: () => void;
  onScore: (s: number) => void;
}

export function HarfDragGame({ onBack, onScore }: Props) {
  const t = useTranslations("kidsActivities");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentSet, setCurrentSet] = useState(() => shuffleArray(haroof.slice(0, 6)));
  const [targets, setTargets] = useState(() => shuffleArray(haroof.slice(0, 6)));
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const handleSelect = (harf: string) => {
    if (matched.has(harf)) return;
    setSelected(harf);
  };

  const handleTarget = (harf: string) => {
    if (!selected || matched.has(harf)) return;
    if (selected === harf) {
      setMatched((prev) => new Set([...prev, harf]));
      setScore((s) => s + 10);
      onScore(10);
      setFeedback("correct");
      setTimeout(() => setFeedback(null), 800);
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 500);
    }
    setSelected(null);
  };

  const isComplete = matched.size === currentSet.length;

  const nextLevel = () => {
    const start = (level * 6) % haroof.length;
    const set = haroof.slice(start, start + 6).length >= 6
      ? haroof.slice(start, start + 6)
      : haroof.slice(0, 6);
    setCurrentSet(shuffleArray(set));
    setTargets(shuffleArray(set));
    setMatched(new Set());
    setLevel((l) => l + 1);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> {t("back")}
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{t("level")} {level}</span>
          <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
            <Star className="w-4 h-4 fill-amber-400" /> {score}
          </span>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">{t("harfDrag")}</h2>
        <p className="text-sm text-muted-foreground">{t("harfDragDesc")}</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`text-center text-2xl font-bold ${
            feedback === "correct" ? "text-green-500" : "text-red-500"
          }`}
        >
          {feedback === "correct" ? t("correct") + " ⭐" : t("tryAgain")}
        </motion.div>
      )}

      {isComplete ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-primary">{t("excellent")}</h3>
          <p className="text-muted-foreground mt-2">{t("score")}: {score}</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button onClick={nextLevel} className="bg-primary gap-2">
              {t("nextLevel")} →
            </Button>
            <Button variant="outline" onClick={onBack}>
              {t("back")}
            </Button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Haroof to select */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {currentSet.map((h) => (
              <motion.button
                key={`src-${h}`}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(h)}
                disabled={matched.has(h)}
                className={`aspect-square rounded-xl border-2 text-2xl font-bold transition-all flex items-center justify-center ${
                  matched.has(h)
                    ? "bg-green-100 border-green-400 text-green-600 dark:bg-green-900 dark:border-green-700"
                    : selected === h
                      ? "bg-primary/10 border-primary text-primary scale-105 shadow-lg"
                      : "bg-card border-border hover:border-primary/50 text-foreground hover:shadow-md"
                }`}
              >
                {h}
              </motion.button>
            ))}
          </div>

          <div className="text-center text-sm text-muted-foreground font-medium">
            ↓ {t("dragHere")} ↓
          </div>

          {/* Targets */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {targets.map((h) => (
              <motion.button
                key={`tgt-${h}`}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTarget(h)}
                disabled={matched.has(h)}
                className={`aspect-square rounded-xl border-2 border-dashed text-2xl font-bold transition-all flex items-center justify-center ${
                  matched.has(h)
                    ? "bg-green-100 border-green-400 text-green-600 dark:bg-green-900 dark:border-green-700"
                    : "bg-muted/30 border-muted-foreground/30 text-muted-foreground/50 hover:border-accent hover:bg-accent/5"
                }`}
              >
                {matched.has(h) ? h : "?"}
              </motion.button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
