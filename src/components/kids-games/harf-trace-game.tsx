"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Star, RotateCcw } from "lucide-react";

const traceLetters = [
  { letter: "ا", path: "M60,20 L60,140" },
  { letter: "ب", path: "M30,80 Q60,100 90,80 Q120,60 150,80" },
  { letter: "ت", path: "M30,90 Q60,110 90,90 Q120,70 150,90" },
  { letter: "ج", path: "M40,40 Q80,30 90,60 Q100,90 70,100" },
  { letter: "س", path: "M20,80 Q50,60 60,80 Q70,100 80,80 Q90,60 100,80 Q110,100 140,80" },
  { letter: "ع", path: "M40,30 Q70,40 80,70 Q90,100 60,110 Q30,100 40,80" },
];

interface Props {
  onBack: () => void;
  onScore: (s: number) => void;
}

export function HarfTraceGame({ onBack, onScore }: Props) {
  const t = useTranslations("kidsActivities");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [letterIdx, setLetterIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [stars, setStars] = useState(0);
  const [traceComplete, setTraceComplete] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);

  const letter = traceLetters[letterIdx];

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw letter outline (dashed)
    ctx.save();
    ctx.font = "bold 120px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#C9A84C";
    ctx.lineWidth = 2;
    ctx.strokeText(letter.letter, canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }, [letter.letter]);

  useEffect(() => {
    clearCanvas();
    setStrokeCount(0);
    setTraceComplete(false);
  }, [letterIdx, clearCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = "#1B4332";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.setLineDash([]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    setIsDrawing(false);
    setStrokeCount((c) => c + 1);

    // After 3 strokes, consider it traced
    if (strokeCount >= 2) {
      setTraceComplete(true);
      const earnedStars = Math.min(stars + 1, 3);
      setStars(earnedStars);
      setScore((s) => s + 10);
      onScore(10);
    }
  };

  const nextLetter = () => {
    if (letterIdx + 1 >= traceLetters.length) {
      setLetterIdx(0);
    } else {
      setLetterIdx(letterIdx + 1);
    }
    setStars(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> {t("back")}
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm">{letterIdx + 1}/{traceLetters.length}</span>
          <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
            <Star className="w-4 h-4 fill-amber-400" /> {score}
          </span>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">{t("harfTrace")}</h2>
        <p className="text-sm text-muted-foreground">{t("traceTheLetter")}</p>
      </div>

      {/* Stars progress */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <Star
            key={s}
            className={`w-8 h-8 ${
              s <= stars
                ? "text-yellow-400 fill-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Canvas */}
      <div className="flex justify-center">
        <div className="relative rounded-2xl border-2 border-dashed border-primary/30 bg-card overflow-hidden">
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
            className="touch-none cursor-crosshair"
          />
        </div>
      </div>

      {traceComplete && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <p className="text-xl font-bold text-green-500">{t("wellDone")} ⭐</p>
        </motion.div>
      )}

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={clearCanvas} className="gap-2">
          <RotateCcw className="w-4 h-4" /> {t("tryAgain")}
        </Button>
        {traceComplete && (
          <Button onClick={nextLetter} className="bg-primary gap-2">
            {t("nextLevel")} →
          </Button>
        )}
      </div>
    </div>
  );
}
