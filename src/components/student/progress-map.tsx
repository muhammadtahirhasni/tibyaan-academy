"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

interface ProgressMapProps {
  juzData: Array<{ juz: number; memorized: number }>;
}

const JUZ_COLORS = {
  complete: "fill-primary stroke-primary",
  partial: "fill-primary/20 stroke-primary/50",
  empty: "fill-muted stroke-muted-foreground/20",
};

export function ProgressMap({ juzData }: ProgressMapProps) {
  const t = useTranslations("gamification");

  const totalMemorized = juzData.filter((j) => j.memorized === 100).length;
  const totalPartial = juzData.filter(
    (j) => j.memorized > 0 && j.memorized < 100
  ).length;

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t("quranMap")}
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-primary" />
            {t("complete")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-primary/20" />
            {t("inProgress")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-muted" />
            {t("notStarted")}
          </span>
        </div>
      </div>

      {/* SVG grid of 30 paras */}
      <svg viewBox="0 0 600 200" className="w-full">
        {juzData.map((juz, i) => {
          const col = i % 10;
          const row = Math.floor(i / 10);
          const x = col * 58 + 10;
          const y = row * 62 + 10;

          const colorClass =
            juz.memorized === 100
              ? JUZ_COLORS.complete
              : juz.memorized > 0
                ? JUZ_COLORS.partial
                : JUZ_COLORS.empty;

          return (
            <motion.g
              key={juz.juz}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
            >
              <rect
                x={x}
                y={y}
                width="50"
                height="50"
                rx="8"
                className={`${colorClass} transition-all cursor-pointer hover:opacity-80`}
                strokeWidth="1.5"
              />
              {/* Juz number */}
              <text
                x={x + 25}
                y={y + 22}
                textAnchor="middle"
                className="fill-foreground text-[11px] font-bold"
              >
                {juz.juz}
              </text>
              {/* Percentage */}
              {juz.memorized > 0 && (
                <text
                  x={x + 25}
                  y={y + 38}
                  textAnchor="middle"
                  className="fill-foreground text-[9px]"
                >
                  {juz.memorized}%
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>

      <div className="mt-4 flex items-center gap-6 text-sm">
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">{totalMemorized}</span>{" "}
          {t("juzComplete")}
        </p>
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">{totalPartial}</span>{" "}
          {t("juzInProgress")}
        </p>
      </div>
    </div>
  );
}
