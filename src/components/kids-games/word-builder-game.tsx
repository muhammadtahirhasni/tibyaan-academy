"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Star, X } from "lucide-react";

const words = [
  { word: "بسم", letters: ["ب", "س", "م"], meaning: "Bism" },
  { word: "كتب", letters: ["ك", "ت", "ب"], meaning: "Kataba" },
  { word: "علم", letters: ["ع", "ل", "م"], meaning: "Ilm" },
  { word: "نور", letters: ["ن", "و", "ر"], meaning: "Noor" },
  { word: "حمد", letters: ["ح", "م", "د"], meaning: "Hamd" },
  { word: "رحم", letters: ["ر", "ح", "م"], meaning: "Rahm" },
];

const extraLetters = ["ا", "ت", "ث", "ج", "خ", "ذ", "ز", "ش", "ص", "ض"];

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

export function WordBuilderGame({ onBack, onScore }: Props) {
  const t = useTranslations("kidsActivities");
  const [wordIdx, setWordIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [allDone, setAllDone] = useState(false);

  const currentWord = words[wordIdx];
  const availableLetters = shuffleArray([
    ...currentWord.letters,
    ...shuffleArray(extraLetters).slice(0, 3),
  ]);

  const handleSelectLetter = (letter: string) => {
    if (feedback) return;
    setSelected((prev) => [...prev, letter]);
  };

  const handleRemoveLetter = (idx: number) => {
    if (feedback) return;
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  };

  const checkWord = () => {
    const built = selected.join("");
    if (built === currentWord.letters.join("")) {
      setScore((s) => s + 15);
      onScore(15);
      setFeedback("correct");
      setTimeout(() => {
        if (wordIdx + 1 >= words.length) {
          setAllDone(true);
        } else {
          setWordIdx((i) => i + 1);
          setSelected([]);
          setFeedback(null);
        }
      }, 1200);
    } else {
      setFeedback("wrong");
      setTimeout(() => {
        setSelected([]);
        setFeedback(null);
      }, 800);
    }
  };

  const resetGame = () => {
    setWordIdx(0);
    setScore(0);
    setSelected([]);
    setFeedback(null);
    setAllDone(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> {t("back")}
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm">{wordIdx + 1}/{words.length}</span>
          <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
            <Star className="w-4 h-4 fill-amber-400" /> {score}
          </span>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">{t("wordBuilder")}</h2>
        <p className="text-sm text-muted-foreground">{t("buildTheWord")}</p>
      </div>

      {allDone ? (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-12">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-2xl font-bold text-primary">{t("congratulations")}</h3>
          <p className="text-muted-foreground mt-2">{t("score")}: {score}</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button onClick={resetGame} className="bg-primary gap-2">{t("playAgain")}</Button>
            <Button variant="outline" onClick={onBack}>{t("back")}</Button>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-sm mx-auto">
          {/* Target word hint */}
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">Build: <strong>{currentWord.meaning}</strong></p>
            <div className="mt-2 flex justify-center gap-2">
              {currentWord.letters.map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-lg border-2 border-dashed border-muted-foreground/30"
                />
              ))}
            </div>
          </div>

          {/* Built word area */}
          <div className="flex justify-center gap-2 min-h-[56px] mb-6">
            {selected.map((letter, i) => (
              <motion.button
                key={`${letter}-${i}`}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                onClick={() => handleRemoveLetter(i)}
                className="w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary text-xl font-bold text-primary flex items-center justify-center hover:bg-red-100 hover:border-red-400 hover:text-red-500 transition-colors"
              >
                {letter}
              </motion.button>
            ))}
          </div>

          {/* Available letters */}
          <div className="flex justify-center gap-2 flex-wrap mb-6">
            {availableLetters.map((letter, i) => (
              <motion.button
                key={`avail-${letter}-${i}`}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSelectLetter(letter)}
                disabled={!!feedback}
                className="w-12 h-12 rounded-xl bg-card border-2 border-border text-xl font-bold text-foreground flex items-center justify-center hover:border-primary hover:shadow-md transition-all"
              >
                {letter}
              </motion.button>
            ))}
          </div>

          {/* Check button */}
          {selected.length > 0 && !feedback && (
            <div className="flex justify-center gap-3">
              <Button onClick={checkWord} className="bg-primary px-8">
                Check ✓
              </Button>
              <Button variant="outline" onClick={() => setSelected([])}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {feedback && (
            <motion.p
              initial={{ scale: 0.5 }} animate={{ scale: 1 }}
              className={`text-center text-xl font-bold ${
                feedback === "correct" ? "text-green-500" : "text-red-500"
              }`}
            >
              {feedback === "correct" ? t("correct") + " ⭐" : t("tryAgain")}
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
}
