"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Mic,
  Square,
  RotateCcw,
  History,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ThumbsUp,
} from "lucide-react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

const SURAHS = Array.from({ length: 114 }, (_, i) => ({
  number: i + 1,
  name: [
    "Al-Fatiha","Al-Baqarah","Aal-e-Imran","An-Nisa","Al-Ma'idah","Al-An'am",
    "Al-A'raf","Al-Anfal","At-Tawbah","Yunus","Hud","Yusuf","Ar-Ra'd",
    "Ibrahim","Al-Hijr","An-Nahl","Al-Isra","Al-Kahf","Maryam","Ta-Ha",
    "Al-Anbiya","Al-Hajj","Al-Mu'minun","An-Nur","Al-Furqan","Ash-Shu'ara",
    "An-Naml","Al-Qasas","Al-Ankabut","Ar-Rum","Luqman","As-Sajdah",
    "Al-Ahzab","Saba","Fatir","Ya-Sin","As-Saffat","Sad","Az-Zumar",
    "Ghafir","Fussilat","Ash-Shura","Az-Zukhruf","Ad-Dukhan","Al-Jathiyah",
    "Al-Ahqaf","Muhammad","Al-Fath","Al-Hujurat","Qaf","Adh-Dhariyat",
    "At-Tur","An-Najm","Al-Qamar","Ar-Rahman","Al-Waqi'ah","Al-Hadid",
    "Al-Mujadilah","Al-Hashr","Al-Mumtahanah","As-Saff","Al-Jumu'ah",
    "Al-Munafiqun","At-Taghabun","At-Talaq","At-Tahrim","Al-Mulk",
    "Al-Qalam","Al-Haqqah","Al-Ma'arij","Nuh","Al-Jinn","Al-Muzzammil",
    "Al-Muddaththir","Al-Qiyamah","Al-Insan","Al-Mursalat","An-Naba",
    "An-Nazi'at","Abasa","At-Takwir","Al-Infitar","Al-Mutaffifin",
    "Al-Inshiqaq","Al-Buruj","At-Tariq","Al-A'la","Al-Ghashiyah","Al-Fajr",
    "Al-Balad","Ash-Shams","Al-Lail","Ad-Duha","Ash-Sharh","At-Tin",
    "Al-Alaq","Al-Qadr","Al-Bayyinah","Az-Zalzalah","Al-Adiyat",
    "Al-Qari'ah","At-Takathur","Al-Asr","Al-Humazah","Al-Fil","Quraish",
    "Al-Ma'un","Al-Kawthar","Al-Kafirun","An-Nasr","Al-Masad","Al-Ikhlas",
    "Al-Falaq","An-Nas",
  ][i],
}));

interface TajweedResult {
  id: string;
  transcription: string;
  score: number;
  feedback: {
    errors: Array<{ type: string; word: string; expected: string; description: string }>;
    strengths: string[];
    suggestions: string[];
  };
  newBadges: string[];
}

interface HistoryEntry {
  id: string;
  surahNumber: number;
  ayahFrom: number;
  ayahTo: number;
  score: number;
  createdAt: string;
}

export default function TajweedCheckerPage() {
  const t = useTranslations("tajweedChecker");
  const recorder = useAudioRecorder();

  const [surahNumber, setSurahNumber] = useState(1);
  const [ayahFrom, setAyahFrom] = useState(1);
  const [ayahTo, setAyahTo] = useState(7);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TajweedResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetch("/api/tajweed/history")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
      })
      .catch(() => {});
  }, [result]);

  const handleSubmit = async () => {
    if (!recorder.audioBlob) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("audio", recorder.audioBlob, "recitation.webm");
      formData.append("surahNumber", surahNumber.toString());
      formData.append("ayahFrom", ayahFrom.toString());
      formData.append("ayahTo", ayahTo.toString());

      const res = await fetch("/api/tajweed/check", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Check failed");
      }

      const data = await res.json();
      setResult(data);
    } catch {
      alert(t("errorMessage"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-100 dark:bg-emerald-950/30 border-emerald-200";
    if (score >= 60) return "bg-amber-100 dark:bg-amber-950/30 border-amber-200";
    return "bg-red-100 dark:bg-red-950/30 border-red-200";
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          className="gap-2"
        >
          <History className="w-4 h-4" />
          {t("history")}
        </Button>
      </motion.div>

      {showHistory ? (
        /* History View */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4">{t("pastChecks")}</h3>
          <div className="space-y-3">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {SURAHS[entry.surahNumber - 1]?.name} ({entry.ayahFrom}-{entry.ayahTo})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getScoreBg(entry.score ?? 0)}>
                  <span className={getScoreColor(entry.score ?? 0)}>
                    {entry.score}%
                  </span>
                </Badge>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                {t("noHistory")}
              </p>
            )}
          </div>
        </motion.div>
      ) : (
        <>
          {/* Surah/Ayah Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border bg-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t("selectPassage")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t("surah")}
                </label>
                <select
                  value={surahNumber}
                  onChange={(e) => setSurahNumber(parseInt(e.target.value))}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {SURAHS.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t("fromAyah")}
                </label>
                <input
                  type="number"
                  min={1}
                  value={ayahFrom}
                  onChange={(e) => setAyahFrom(parseInt(e.target.value) || 1)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  {t("toAyah")}
                </label>
                <input
                  type="number"
                  min={1}
                  value={ayahTo}
                  onChange={(e) => setAyahTo(parseInt(e.target.value) || 1)}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </motion.div>

          {/* Recording Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border bg-card p-6 text-center"
          >
            {recorder.error && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-950/30 text-red-600 text-sm">
                {recorder.error}
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              {/* Record Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={recorder.isRecording ? recorder.stop : recorder.start}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  recorder.isRecording
                    ? "bg-red-500 hover:bg-red-600 animate-pulse"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                {recorder.isRecording ? (
                  <Square className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-primary-foreground" />
                )}
              </motion.button>

              {/* Status */}
              <p className="text-sm text-muted-foreground">
                {recorder.isRecording
                  ? `${t("recording")} — ${formatDuration(recorder.duration)}`
                  : recorder.audioBlob
                    ? t("recordingComplete")
                    : t("tapToRecord")}
              </p>

              {/* Playback */}
              {recorder.audioUrl && (
                <audio controls src={recorder.audioUrl} className="mt-2" />
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {recorder.audioBlob && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        recorder.reset();
                        setResult(null);
                      }}
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {t("reRecord")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={isAnalyzing}
                      className="gap-2"
                    >
                      {isAnalyzing ? t("analyzing") : t("checkTajweed")}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Results */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Score */}
              <div
                className={`rounded-xl border p-6 text-center ${getScoreBg(result.score)}`}
              >
                <p className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("outOf100")}
                </p>
              </div>

              {/* Transcription */}
              <div className="rounded-xl border bg-card p-6">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  {t("transcription")}
                </h4>
                <p className="text-lg text-foreground font-arabic leading-loose" dir="rtl">
                  {result.transcription}
                </p>
              </div>

              {/* Errors */}
              {result.feedback.errors.length > 0 && (
                <div className="rounded-xl border bg-card p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h4 className="text-sm font-semibold text-foreground">
                      {t("errorsFound")} ({result.feedback.errors.length})
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {result.feedback.errors.map((err, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-muted/50 border"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {err.type}
                          </Badge>
                          <span className="text-sm font-arabic" dir="rtl">
                            {err.word}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {err.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {result.feedback.strengths.length > 0 && (
                <div className="rounded-xl border bg-card p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsUp className="w-5 h-5 text-emerald-500" />
                    <h4 className="text-sm font-semibold text-foreground">
                      {t("strengths")}
                    </h4>
                  </div>
                  <ul className="space-y-1">
                    {result.feedback.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {result.feedback.suggestions.length > 0 && (
                <div className="rounded-xl border bg-card p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-blue-500" />
                    <h4 className="text-sm font-semibold text-foreground">
                      {t("suggestions")}
                    </h4>
                  </div>
                  <ul className="space-y-1">
                    {result.feedback.suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <span className="text-blue-500 mt-0.5 shrink-0">
                          {i + 1}.
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* New Badges */}
              {result.newBadges.length > 0 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-xl border bg-gradient-to-r from-primary/10 to-accent/10 p-6 text-center"
                >
                  <p className="text-lg font-bold text-foreground">
                    {t("newBadgeEarned")}
                  </p>
                  <div className="flex justify-center gap-2 mt-2">
                    {result.newBadges.map((badge) => (
                      <Badge key={badge} className="bg-primary text-primary-foreground">
                        {badge.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
