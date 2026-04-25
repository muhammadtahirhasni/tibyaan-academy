"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, Zap } from "lucide-react";

const wordSets = [
  ["بسم", "الله", "الرحمن", "الرحيم"],
  ["الحمد", "لله", "رب", "العالمين"],
  ["قل", "هو", "الله", "احد"],
  ["الله", "الصمد", "لم", "يلد"],
  ["ولم", "يولد", "ولم", "يكن"],
];

interface Props {
  onBack: () => void;
  onScore: (s: number) => void;
}

export function ReadingRaceGame({ onBack, onScore }: Props) {
  const t = useTranslations("kidsActivities");
  const [setIdx, setSetIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [wordsRead, setWordsRead] = useState(0);
  const [combo, setCombo] = useState(0);

  const currentWords = wordSets[setIdx];

  useEffect(() => {
    if (!started || gameOver) return;
    if (timer <= 0) {
      startTransition(() => setGameOver(true));
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [started, gameOver, timer]);

  const handleWordClick = useCallback(() => {
    if (!started || gameOver) return;

    const newCombo = combo + 1;
    const points = 5 + (newCombo > 3 ? 5 : 0); // Combo bonus
    setScore((s) => s + points);
    onScore(points);
    setWordsRead((w) => w + 1);
    setCombo(newCombo);

    if (wordIdx + 1 >= currentWords.length) {
      // Next set
      if (setIdx + 1 >= wordSets.length) {
        setGameOver(true);
      } else {
        setSetIdx((s) => s + 1);
        setWordIdx(0);
      }
    } else {
      setWordIdx((w) => w + 1);
    }
  }, [started, gameOver, combo, wordIdx, currentWords.length, setIdx, onScore]);

  const startGame = () => {
    setStarted(true);
    setTimer(30);
    setScore(0);
    setWordsRead(0);
    setCombo(0);
    setSetIdx(0);
    setWordIdx(0);
    setGameOver(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> {t("back")}
        </button>
        <div className="flex items-center gap-4">
          {started && (
            <span className={`flex items-center gap-1 text-sm font-bold ${timer <= 10 ? "text-red-500" : "text-foreground"}`}>
              <Clock className="w-3.5 h-3.5" /> {timer}s
            </span>
          )}
          <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
            <Star className="w-4 h-4 fill-amber-400" /> {score}
          </span>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">{t("readingRace")}</h2>
        <p className="text-sm text-muted-foreground">{t("readTheWord")}</p>
      </div>

      {!started ? (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">{t("readingRaceDesc")}</h3>
          <p className="text-sm text-muted-foreground mt-2">30 seconds — Read & tap each word!</p>
          <Button onClick={startGame} className="mt-6 bg-orange-500 hover:bg-orange-600 gap-2">
            <Zap className="w-4 h-4" /> {t("startGame")}
          </Button>
        </div>
      ) : gameOver ? (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-12">
          <div className="text-5xl mb-4">{timer <= 0 ? "⏰" : "🏆"}</div>
          <h3 className="text-2xl font-bold text-primary">
            {timer <= 0 ? t("timeUp") : t("roundComplete")}
          </h3>
          <div className="mt-4 grid grid-cols-3 gap-3 max-w-xs mx-auto">
            <div className="p-3 rounded-lg bg-card border text-center">
              <p className="text-xl font-bold text-primary">{wordsRead}</p>
              <p className="text-xs text-muted-foreground">Words</p>
            </div>
            <div className="p-3 rounded-lg bg-card border text-center">
              <p className="text-xl font-bold text-amber-500">{score}</p>
              <p className="text-xs text-muted-foreground">{t("score")}</p>
            </div>
            <div className="p-3 rounded-lg bg-card border text-center">
              <p className="text-xl font-bold text-orange-500">{Math.round(wordsRead / 0.5)}</p>
              <p className="text-xs text-muted-foreground">WPM</p>
            </div>
          </div>
          <div className="mt-6 flex gap-3 justify-center">
            <Button onClick={startGame} className="bg-orange-500 hover:bg-orange-600 gap-2">
              {t("playAgain")}
            </Button>
            <Button variant="outline" onClick={onBack}>{t("back")}</Button>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-md mx-auto">
          {/* Combo indicator */}
          {combo > 3 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center mb-4"
            >
              <span className="text-sm font-bold text-orange-500">
                🔥 Combo x{combo}!
              </span>
            </motion.div>
          )}

          {/* Current word line */}
          <div className="flex justify-center gap-4 flex-wrap mb-6">
            {currentWords.map((word, i) => (
              <motion.div
                key={`${setIdx}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`text-3xl font-bold transition-colors ${
                  i < wordIdx
                    ? "text-green-500"
                    : i === wordIdx
                      ? "text-primary"
                      : "text-muted-foreground/40"
                }`}
              >
                {word}
              </motion.div>
            ))}
          </div>

          {/* Tap button */}
          <div className="flex justify-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleWordClick}
              className="w-32 h-32 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex flex-col items-center justify-center shadow-xl transition-colors"
            >
              <span className="text-3xl font-bold">{currentWords[wordIdx]}</span>
              <span className="text-xs mt-1 text-white/70">Tap!</span>
            </motion.button>
          </div>

          {/* Progress bar */}
          <div className="mt-6 h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-orange-500 transition-all"
              style={{
                width: `${((setIdx * currentWords.length + wordIdx) / (wordSets.length * 4)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
