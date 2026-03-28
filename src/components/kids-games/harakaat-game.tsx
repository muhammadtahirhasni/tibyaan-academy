"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Star } from "lucide-react";

const rounds = [
  { letter: "ب", harakah: "َ", combined: "بَ", name: "Fatha", sound: "Ba" },
  { letter: "ب", harakah: "ِ", combined: "بِ", name: "Kasra", sound: "Bi" },
  { letter: "ب", harakah: "ُ", combined: "بُ", name: "Damma", sound: "Bu" },
  { letter: "ت", harakah: "َ", combined: "تَ", name: "Fatha", sound: "Ta" },
  { letter: "ت", harakah: "ْ", combined: "تْ", name: "Sukoon", sound: "T" },
  { letter: "ن", harakah: "َ", combined: "نَ", name: "Fatha", sound: "Na" },
  { letter: "ن", harakah: "ُ", combined: "نُ", name: "Damma", sound: "Nu" },
  { letter: "م", harakah: "ِ", combined: "مِ", name: "Kasra", sound: "Mi" },
  { letter: "س", harakah: "َ", combined: "سَ", name: "Fatha", sound: "Sa" },
  { letter: "ل", harakah: "ُ", combined: "لُ", name: "Damma", sound: "Lu" },
];

const harakaatOptions = [
  { symbol: "َ", name: "Fatha (Zabar)" },
  { symbol: "ِ", name: "Kasra (Zer)" },
  { symbol: "ُ", name: "Damma (Pesh)" },
  { symbol: "ْ", name: "Sukoon" },
];

interface Props {
  onBack: () => void;
  onScore: (s: number) => void;
}

export function HarakaatGame({ onBack, onScore }: Props) {
  const t = useTranslations("kidsActivities");
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedHarakah, setSelectedHarakah] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const round = rounds[roundIdx];

  const handleSelect = (harakah: string) => {
    if (feedback) return;
    setSelectedHarakah(harakah);

    if (harakah === round.harakah) {
      setScore((s) => s + 10);
      onScore(10);
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }

    setTimeout(() => {
      if (roundIdx + 1 >= rounds.length) {
        setGameOver(true);
      } else {
        setRoundIdx((i) => i + 1);
        setFeedback(null);
        setSelectedHarakah(null);
      }
    }, 1000);
  };

  const resetGame = () => {
    setRoundIdx(0);
    setScore(0);
    setFeedback(null);
    setSelectedHarakah(null);
    setGameOver(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> {t("back")}
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm">{roundIdx + 1}/{rounds.length}</span>
          <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
            <Star className="w-4 h-4 fill-amber-400" /> {score}
          </span>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">{t("harakaatGame")}</h2>
        <p className="text-sm text-muted-foreground">{t("placeHarakaat")}</p>
      </div>

      {gameOver ? (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-12">
          <div className="text-5xl mb-4">✨</div>
          <h3 className="text-2xl font-bold text-primary">{t("roundComplete")}</h3>
          <p className="text-muted-foreground mt-2">{t("score")}: {score}/{rounds.length * 10}</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button onClick={resetGame} className="bg-primary gap-2">{t("playAgain")}</Button>
            <Button variant="outline" onClick={onBack}>{t("back")}</Button>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-sm mx-auto">
          {/* Target display */}
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">
              Make it say: <strong>&quot;{round.sound}&quot;</strong>
            </p>
            <div className="w-32 h-32 mx-auto rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border-2 border-cyan-300 flex items-center justify-center">
              <span className="text-7xl font-bold text-cyan-700 dark:text-cyan-400">
                {round.letter}
              </span>
            </div>
          </div>

          {/* Harakaat options */}
          <div className="grid grid-cols-2 gap-3">
            {harakaatOptions.map((opt) => (
              <motion.button
                key={opt.symbol}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(opt.symbol)}
                disabled={!!feedback}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  feedback && selectedHarakah === opt.symbol
                    ? opt.symbol === round.harakah
                      ? "bg-green-100 border-green-500 dark:bg-green-900"
                      : "bg-red-100 border-red-500 dark:bg-red-900"
                    : feedback && opt.symbol === round.harakah
                      ? "bg-green-100 border-green-500 dark:bg-green-900"
                      : "bg-card border-border hover:border-cyan-400 hover:shadow-md"
                }`}
              >
                <span className="text-3xl font-bold block">{opt.symbol}</span>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {opt.name}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Result preview */}
          {feedback === "correct" && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-6 text-center"
            >
              <span className="text-5xl font-bold text-green-500">
                {round.combined}
              </span>
              <p className="text-sm text-green-500 font-bold mt-2">{t("correct")} ⭐</p>
            </motion.div>
          )}
          {feedback === "wrong" && (
            <motion.p
              initial={{ scale: 0.5 }} animate={{ scale: 1 }}
              className="mt-4 text-center text-xl font-bold text-red-500"
            >
              {t("tryAgain")}
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
}
