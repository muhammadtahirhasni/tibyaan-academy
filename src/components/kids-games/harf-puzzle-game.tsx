"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Star } from "lucide-react";

// Each puzzle: a letter split into parts that need to be assembled in order
const puzzles = [
  { letter: "ب", parts: ["ـبـ", "ـ", "·"], hint: "Ba" },
  { letter: "ت", parts: ["ـتـ", "·", "·"], hint: "Ta" },
  { letter: "ث", parts: ["ـثـ", "·", "·", "·"], hint: "Tha" },
  { letter: "ج", parts: ["جـ", "ـ", "·"], hint: "Jim" },
  { letter: "ح", parts: ["حـ", "ـ", "ـ"], hint: "Ha" },
  { letter: "خ", parts: ["خـ", "ـ", "·"], hint: "Kha" },
];

interface Props {
  onBack: () => void;
  onScore: (s: number) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function HarfPuzzleGame({ onBack, onScore }: Props) {
  const t = useTranslations("kidsActivities");
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedParts, setSelectedParts] = useState<number[]>([]);
  const [availableParts, setAvailableParts] = useState(() =>
    shuffleArray(puzzles[0].parts.map((_, i) => i))
  );
  const [completed, setCompleted] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const puzzle = puzzles[puzzleIdx];

  const handleSelectPart = (partIdx: number) => {
    if (completed) return;
    const expectedNext = selectedParts.length;

    if (partIdx === expectedNext) {
      // Correct order
      const newSelected = [...selectedParts, partIdx];
      setSelectedParts(newSelected);
      setAvailableParts((prev) => prev.filter((p) => p !== partIdx));

      if (newSelected.length === puzzle.parts.length) {
        setCompleted(true);
        setScore((s) => s + 15);
        onScore(15);
      }
    }
  };

  const nextPuzzle = () => {
    if (puzzleIdx + 1 >= puzzles.length) {
      setAllDone(true);
      return;
    }
    const nextIdx = puzzleIdx + 1;
    setPuzzleIdx(nextIdx);
    setSelectedParts([]);
    setAvailableParts(shuffleArray(puzzles[nextIdx].parts.map((_, i) => i)));
    setCompleted(false);
  };

  const resetGame = () => {
    setPuzzleIdx(0);
    setScore(0);
    setSelectedParts([]);
    setAvailableParts(shuffleArray(puzzles[0].parts.map((_, i) => i)));
    setCompleted(false);
    setAllDone(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> {t("back")}
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm">{puzzleIdx + 1}/{puzzles.length}</span>
          <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
            <Star className="w-4 h-4 fill-amber-400" /> {score}
          </span>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">{t("harfPuzzle")}</h2>
        <p className="text-sm text-muted-foreground">{t("harfPuzzleDesc")}</p>
      </div>

      {allDone ? (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-12">
          <div className="text-5xl mb-4">🧩</div>
          <h3 className="text-2xl font-bold text-primary">{t("congratulations")}</h3>
          <p className="text-muted-foreground mt-2">{t("score")}: {score}</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button onClick={resetGame} className="bg-primary gap-2">{t("playAgain")}</Button>
            <Button variant="outline" onClick={onBack}>{t("back")}</Button>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-sm mx-auto">
          {/* Target letter display */}
          <div className="text-center mb-8">
            <div className="w-28 h-28 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 flex items-center justify-center">
              <span className="text-6xl font-bold text-amber-600">
                {puzzle.letter}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{puzzle.hint}</p>
          </div>

          {/* Assembly area */}
          <div className="flex justify-center gap-2 mb-6 min-h-[60px]">
            {puzzle.parts.map((_, i) => (
              <div
                key={i}
                className={`w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center text-xl font-bold ${
                  selectedParts.includes(i)
                    ? "bg-green-100 border-green-400 text-green-600 dark:bg-green-900"
                    : "border-muted-foreground/30 text-muted-foreground/30"
                }`}
              >
                {selectedParts.includes(i) ? puzzle.parts[i] : i + 1}
              </div>
            ))}
          </div>

          {/* Available pieces */}
          {!completed && (
            <div className="flex justify-center gap-3 flex-wrap">
              {availableParts.map((partIdx) => (
                <motion.button
                  key={partIdx}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleSelectPart(partIdx)}
                  className="w-16 h-16 rounded-xl bg-card border-2 border-primary/30 flex items-center justify-center text-xl font-bold text-foreground hover:border-primary hover:shadow-lg transition-all"
                >
                  {puzzle.parts[partIdx]}
                </motion.button>
              ))}
            </div>
          )}

          {completed && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <p className="text-2xl font-bold text-green-500 mb-4">{t("correct")} 🎉</p>
              <Button onClick={nextPuzzle} className="bg-primary gap-2">
                {puzzleIdx + 1 < puzzles.length ? t("nextLevel") + " →" : t("gameOver")}
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
