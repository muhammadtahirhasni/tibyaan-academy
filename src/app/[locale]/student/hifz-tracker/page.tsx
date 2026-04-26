"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  BookOpen,
  Flame,
  ChevronLeft,
  ChevronRight,
  Save,
  Calendar,
  BarChart3,
  TrendingUp,
} from "lucide-react";

// Sample data for Quran Juz
const juzData = Array.from({ length: 30 }, (_, i) => ({
  juz: i + 1,
  memorized: 0,
}));

// Sample surahs
const surahs = [
  "Al-Fatiha",
  "Al-Baqarah",
  "Aal-e-Imran",
  "An-Nisa",
  "Al-Ma'idah",
  "Al-An'am",
  "Al-A'raf",
  "Al-Anfal",
  "At-Tawbah",
  "Yunus",
  "Hud",
  "Yusuf",
  "Ar-Ra'd",
  "Ibrahim",
  "Al-Hijr",
  "An-Nahl",
  "Al-Isra",
  "Al-Kahf",
  "Maryam",
  "Ta-Ha",
];

// Calendar data
const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month: number, year: number) {
  return new Date(year, month, 1).getDay();
}

// Sample calendar entries
const calendarEntries: Record<string, "sabaq" | "sabqi" | "manzil" | "missed"> = {
  "2026-03-01": "sabaq",
  "2026-03-02": "sabqi",
  "2026-03-03": "manzil",
  "2026-03-04": "sabaq",
  "2026-03-05": "sabaq",
  "2026-03-06": "missed",
  "2026-03-07": "sabqi",
  "2026-03-08": "sabaq",
  "2026-03-09": "manzil",
  "2026-03-10": "sabaq",
  "2026-03-11": "sabqi",
  "2026-03-12": "sabaq",
  "2026-03-13": "sabaq",
  "2026-03-14": "manzil",
  "2026-03-15": "sabaq",
  "2026-03-16": "sabqi",
  "2026-03-17": "sabaq",
  "2026-03-18": "sabaq",
  "2026-03-19": "missed",
  "2026-03-20": "sabqi",
  "2026-03-21": "sabaq",
  "2026-03-22": "sabaq",
};

const calendarColors = {
  sabaq: "bg-emerald-500",
  sabqi: "bg-blue-500",
  manzil: "bg-amber-500",
  missed: "bg-red-400",
};

export default function HifzTrackerPage() {
  const t = useTranslations("hifzTracker");
  const [selectedSurah, setSelectedSurah] = useState("");
  const [fromAyah, setFromAyah] = useState("");
  const [toAyah, setToAyah] = useState("");
  const [assessment, setAssessment] = useState<"good" | "okay" | "difficult" | "">("");
  const [notes, setNotes] = useState("");
  const [calMonth, setCalMonth] = useState(currentMonth);
  const [calYear, setCalYear] = useState(currentYear);

  const totalAyaat = 6666;
  const memorizedAyaat = 0;
  const memorizedPercentage = Math.round((memorizedAyaat / totalAyaat) * 100);

  const daysInMonth = getDaysInMonth(calMonth, calYear);
  const firstDay = getFirstDayOfMonth(calMonth, calYear);
  const monthName = new Date(calYear, calMonth).toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });

  const handleSaveSabaq = () => {
    // In production, this would save to the database
    alert("Sabaq saved! (Demo)");
    setSelectedSurah("");
    setFromAyah("");
    setToAyah("");
    setAssessment("");
    setNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("overallProgress")}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-card border rounded-xl px-4 py-3">
          <Flame className="w-6 h-6 text-amber-500" />
          <div>
            <p className="text-lg font-bold text-foreground">0</p>
            <p className="text-xs text-muted-foreground">{t("streak")}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: t("ayaatMemorized"),
            value: `${memorizedAyaat}/${totalAyaat}`,
            extra: `${memorizedPercentage}%`,
          },
          { label: t("surahsComplete"), value: "0", extra: "/114" },
          { label: t("juzComplete"), value: "0", extra: "/30" },
          { label: t("streak"), value: "0", extra: "days" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-xl border bg-card p-4 text-center"
          >
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Overall Progress Circle + Today's Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quran Progress Circle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-xl border bg-card p-6 flex flex-col items-center"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t("overallProgress")}
          </h3>
          {/* Circular Progress */}
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted/50"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={`${memorizedPercentage * 3.27} ${327 - memorizedPercentage * 3.27}`}
                strokeLinecap="round"
                className="text-primary transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {memorizedPercentage}%
              </span>
              <span className="text-xs text-muted-foreground">
                {t("memorized")}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 rounded-xl border bg-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t("todaysTasks")}
          </h3>
          <div className="space-y-3">
            {/* Sabaq */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{t("sabaq")}</p>
                  <Badge className="bg-emerald-600 text-white text-xs">
                    New
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("sabaqDesc")} — Surah Al-Mulk, Ayah 11-15
                </p>
              </div>
            </div>

            {/* Sabqi */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{t("sabqi")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("sabqiDesc")} — Surah Al-Mulk, Ayah 1-10
                </p>
              </div>
            </div>

            {/* Manzil */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{t("manzil")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("manzilDesc")} — Surah An-Naba, Surah An-Naziat
                </p>
              </div>
            </div>
          </div>

          {/* Tomorrow's Plan */}
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">
                {t("tomorrowPlan")}:
              </span>
              <span className="text-muted-foreground">
                Surah Al-Mulk, Ayah 16-20
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Log Sabaq + Calendar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Log Sabaq Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t("logSabaq")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                {t("selectSurah")}
              </label>
              <select
                value={selectedSurah}
                onChange={(e) => setSelectedSurah(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{t("selectSurah")}...</option>
                {surahs.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t("fromAyah")}
                </label>
                <input
                  type="number"
                  min={1}
                  value={fromAyah}
                  onChange={(e) => setFromAyah(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t("toAyah")}
                </label>
                <input
                  type="number"
                  min={1}
                  value={toAyah}
                  onChange={(e) => setToAyah(e.target.value)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                {t("selfAssessment")}
              </label>
              <div className="mt-2 flex gap-2">
                {(["good", "okay", "difficult"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAssessment(a)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      assessment === a
                        ? a === "good"
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : a === "okay"
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-red-500 text-white border-red-500"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    {t(
                      a === "good"
                        ? "assessGood"
                        : a === "okay"
                          ? "assessOkay"
                          : "assessDifficult"
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                {t("notes")}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("notesPlaceholder")}
                rows={3}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <Button
              onClick={handleSaveSabaq}
              className="w-full bg-primary hover:bg-primary/90 gap-2"
            >
              <Save className="w-4 h-4" />
              {t("saveSabaq")}
            </Button>
          </div>
        </motion.div>

        {/* Revision Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t("revisionCalendar")}
          </h3>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (calMonth === 0) {
                  setCalMonth(11);
                  setCalYear(calYear - 1);
                } else {
                  setCalMonth(calMonth - 1);
                }
              }}
              className="p-1 rounded hover:bg-muted"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-foreground">
              {monthName}
            </span>
            <button
              onClick={() => {
                if (calMonth === 11) {
                  setCalMonth(0);
                  setCalYear(calYear + 1);
                } else {
                  setCalMonth(calMonth + 1);
                }
              }}
              className="p-1 rounded hover:bg-muted"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                className="text-center text-xs font-medium text-muted-foreground py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const entry = calendarEntries[dateStr];
              const isToday =
                day === today.getDate() &&
                calMonth === today.getMonth() &&
                calYear === today.getFullYear();

              return (
                <div
                  key={day}
                  className={`relative aspect-square flex items-center justify-center rounded-lg text-xs ${
                    isToday
                      ? "ring-2 ring-primary font-bold"
                      : ""
                  }`}
                >
                  <span className="text-foreground">{day}</span>
                  {entry && (
                    <span
                      className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${calendarColors[entry]}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            {(
              [
                { key: "sabaqColor", color: "bg-emerald-500" },
                { key: "sabqiColor", color: "bg-blue-500" },
                { key: "manzilColor", color: "bg-amber-500" },
                { key: "missedColor", color: "bg-red-400" },
              ] as const
            ).map((item) => (
              <div key={item.key} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-xs text-muted-foreground">
                  {t(item.key)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Surah Progress Map (30 Juz Grid) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="rounded-xl border bg-card p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("surahProgress")}
        </h3>
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-15 gap-2">
          {juzData.map((juz) => (
            <div
              key={juz.juz}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div
                className={`w-full aspect-square rounded-lg border flex items-center justify-center text-xs font-bold transition-all group-hover:scale-105 ${
                  juz.memorized === 100
                    ? "bg-primary text-primary-foreground border-primary"
                    : juz.memorized > 0
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "bg-muted text-muted-foreground border-muted-foreground/20"
                }`}
              >
                {juz.memorized > 0 ? `${juz.memorized}%` : ""}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {t("juz")} {juz.juz}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-xl border bg-gradient-to-r from-primary/5 to-accent/5 p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t("weeklyReport")}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("weeklyReportDesc")}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4 text-center">
            <p className="text-xl font-bold text-emerald-600">25</p>
            <p className="text-xs text-muted-foreground">{t("memorized")}</p>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <p className="text-xl font-bold text-blue-600">42</p>
            <p className="text-xs text-muted-foreground">{t("revised")}</p>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <p className="text-xl font-bold text-red-500">2</p>
            <p className="text-xs text-muted-foreground">{t("missed")}</p>
          </div>
          <div className="bg-card border rounded-lg p-4 text-center">
            <p className="text-xl font-bold text-accent">+15%</p>
            <p className="text-xs text-muted-foreground">{t("improvement")}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
