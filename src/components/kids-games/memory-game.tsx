"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock } from "lucide-react";

const letterPairs = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د"];

interface Card {
  id: number;
  letter: string;
  flipped: boolean;
  matched: boolean;
}

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

function createCards(): Card[] {
  const pairs = letterPairs.slice(0, 6);
  const doubled = [...pairs, ...pairs];
  return shuffleArray(doubled).map((letter, i) => ({
    id: i,
    letter,
    flipped: false,
    matched: false,
  }));
}

export function MemoryGame({ onBack, onScore }: Props) {
  const t = useTranslations("kidsActivities");
  const [cards, setCards] = useState<Card[]>(createCards);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  const handleFlip = (id: number) => {
    if (flippedIds.length >= 2) return;
    const card = cards[id];
    if (card.matched || card.flipped) return;

    if (!gameStarted) setGameStarted(true);

    const newCards = cards.map((c) =>
      c.id === id ? { ...c, flipped: true } : c
    );
    setCards(newCards);
    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (newCards[first].letter === newCards[second].letter) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first || c.id === second ? { ...c, matched: true } : c
            )
          );
          setScore((s) => s + 20);
          onScore(20);
          setFlippedIds([]);

          // Check game over
          const allMatched = newCards.every(
            (c) => c.matched || c.id === first || c.id === second
          );
          if (allMatched) setGameOver(true);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first || c.id === second ? { ...c, flipped: false } : c
            )
          );
          setFlippedIds([]);
        }, 800);
      }
    }
  };

  const resetGame = () => {
    setCards(createCards());
    setFlippedIds([]);
    setMoves(0);
    setScore(0);
    setTimer(0);
    setGameStarted(false);
    setGameOver(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> {t("back")}
        </button>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-sm">
            <Clock className="w-3.5 h-3.5" /> {timer}s
          </span>
          <span className="text-sm">Moves: {moves}</span>
          <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
            <Star className="w-4 h-4 fill-amber-400" /> {score}
          </span>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">{t("memoryGame")}</h2>
        <p className="text-sm text-muted-foreground">{t("matchPairs")}</p>
      </div>

      {gameOver ? (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-12">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold text-primary">{t("wellDone")}</h3>
          <p className="text-muted-foreground mt-2">
            {moves} moves • {timer}s • {t("score")}: {score}
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button onClick={resetGame} className="bg-primary gap-2">{t("playAgain")}</Button>
            <Button variant="outline" onClick={onBack}>{t("back")}</Button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-md mx-auto">
          {cards.map((card) => (
            <motion.button
              key={card.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFlip(card.id)}
              className={`aspect-square rounded-xl text-3xl font-bold flex items-center justify-center transition-all ${
                card.matched
                  ? "bg-green-100 border-2 border-green-400 text-green-600 dark:bg-green-900"
                  : card.flipped
                    ? "bg-primary/10 border-2 border-primary text-primary"
                    : "bg-purple-500 border-2 border-purple-600 text-purple-500 hover:bg-purple-400 cursor-pointer"
              }`}
            >
              {card.flipped || card.matched ? card.letter : "?"}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
