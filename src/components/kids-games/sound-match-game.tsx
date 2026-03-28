"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Volume2 } from "lucide-react";

const allHaroof = [
  { letter: "ا", name: "Alif" },
  { letter: "ب", name: "Ba" },
  { letter: "ت", name: "Ta" },
  { letter: "ث", name: "Tha" },
  { letter: "ج", name: "Jim" },
  { letter: "ح", name: "Ha" },
  { letter: "خ", name: "Kha" },
  { letter: "د", name: "Dal" },
  { letter: "ذ", name: "Dhal" },
  { letter: "ر", name: "Ra" },
  { letter: "ز", name: "Zay" },
  { letter: "س", name: "Sin" },
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

function generateRound(questionIdx: number) {
  const correct = allHaroof[questionIdx % allHaroof.length];
  const others = shuffleArray(allHaroof.filter((h) => h.letter !== correct.letter)).slice(0, 3);
  const options = shuffleArray([correct, ...others]);
  return { correct, options };
}

export function SoundMatchGame({ onBack, onScore }: Props) {
  const t = useTranslations("kidsActivities");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [round, setRound] = useState(() => generateRound(0));
  const [score, setScore] = useState(0);
  const [totalQuestions] = useState(10);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const playSound = useCallback(() => {
    // In production, this would use Web Audio API to play the letter sound
    // For now, we use speech synthesis as a placeholder
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(round.correct.name);
      utterance.lang = "ar";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, [round.correct.name]);

  const handleAnswer = (letter: string) => {
    if (feedback) return;
    setSelectedLetter(letter);

    if (letter === round.correct.letter) {
      setScore((s) => s + 10);
      onScore(10);
      setFeedback("correct");
    } else {
      setFeedback("wrong");
    }

    setTimeout(() => {
      if (questionIdx + 1 >= totalQuestions) {
        setGameOver(true);
      } else {
        const nextIdx = questionIdx + 1;
        setQuestionIdx(nextIdx);
        setRound(generateRound(nextIdx));
        setFeedback(null);
        setSelectedLetter(null);
      }
    }, 1000);
  };

  const resetGame = () => {
    setQuestionIdx(0);
    setRound(generateRound(0));
    setScore(0);
    setFeedback(null);
    setSelectedLetter(null);
    setGameOver(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> {t("back")}
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm">{questionIdx + 1}/{totalQuestions}</span>
          <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
            <Star className="w-4 h-4 fill-amber-400" /> {score}
          </span>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">{t("soundMatch")}</h2>
        <p className="text-sm text-muted-foreground">{t("listenCarefully")}</p>
      </div>

      {gameOver ? (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-12">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-primary">{t("roundComplete")}</h3>
          <p className="text-muted-foreground mt-2">{t("score")}: {score}/{totalQuestions * 10}</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button onClick={resetGame} className="bg-primary gap-2">{t("playAgain")}</Button>
            <Button variant="outline" onClick={onBack}>{t("back")}</Button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Play Sound Button */}
          <div className="flex justify-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={playSound}
              className="w-24 h-24 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-xl transition-colors"
            >
              <Volume2 className="w-10 h-10" />
            </motion.button>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            🔊 {t("listenCarefully")} — &quot;{round.correct.name}&quot;
          </p>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {round.options.map((opt) => (
              <motion.button
                key={opt.letter}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(opt.letter)}
                disabled={!!feedback}
                className={`aspect-square rounded-2xl border-2 text-4xl font-bold flex items-center justify-center transition-all ${
                  feedback && selectedLetter === opt.letter
                    ? opt.letter === round.correct.letter
                      ? "bg-green-100 border-green-500 text-green-600 dark:bg-green-900"
                      : "bg-red-100 border-red-500 text-red-600 animate-shake dark:bg-red-900"
                    : feedback && opt.letter === round.correct.letter
                      ? "bg-green-100 border-green-500 text-green-600 dark:bg-green-900"
                      : "bg-card border-border hover:border-primary/50 text-foreground hover:shadow-lg"
                }`}
              >
                {opt.letter}
              </motion.button>
            ))}
          </div>

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
        </>
      )}
    </div>
  );
}
