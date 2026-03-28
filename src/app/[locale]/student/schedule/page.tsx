"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Globe,
  Sparkles,
  CheckCircle2,
  Send,
} from "lucide-react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface Suggestion {
  day: string;
  time: string;
  score: number;
  reason: string;
}

export default function StudentSchedulePage() {
  const t = useTranslations("scheduling");

  const [timezone, setTimezone] = useState("");
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [teacherId, setTeacherId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Auto-detect timezone
  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const toggleDay = (day: string) => {
    setPreferredDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmitRequest = async () => {
    if (!teacherId || !courseId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/scheduling/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId,
          courseId,
          timezone,
          preferredDays,
          preferredTime: { start: startTime, end: endTime },
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setRequestId(data.id);

      // Get AI suggestions
      const sugRes = await fetch(
        `/api/scheduling/suggestions?requestId=${data.id}`
      );
      if (sugRes.ok) {
        const sugData = await sugRes.json();
        setSuggestions(sugData.suggestions || []);
      }
    } catch {
      alert(t("errorSubmitting"));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSlot = async (slot: { day: string; time: string }) => {
    if (!requestId) return;
    setConfirming(true);
    try {
      const res = await fetch("/api/scheduling/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, selectedSlot: slot }),
      });
      if (res.ok) {
        setConfirmed(true);
      }
    } catch {
      alert(t("errorConfirming"));
    } finally {
      setConfirming(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/30";
    if (score >= 0.5) return "text-amber-600 bg-amber-100 dark:bg-amber-950/30";
    return "text-red-600 bg-red-100 dark:bg-red-950/30";
  };

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mb-4"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("confirmed")}
        </h2>
        <p className="text-muted-foreground">{t("confirmedDesc")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      {suggestions.length === 0 ? (
        /* Preference Form */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border bg-card p-6 space-y-6"
        >
          {/* Timezone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Globe className="w-4 h-4" />
              {t("timezone")}
            </label>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              readOnly
            />
          </div>

          {/* Teacher & Course IDs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                {t("teacherId")}
              </label>
              <input
                type="text"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                placeholder={t("teacherIdPlaceholder")}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                {t("courseId")}
              </label>
              <input
                type="text"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder={t("courseIdPlaceholder")}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Preferred Days */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Calendar className="w-4 h-4" />
              {t("preferredDays")}
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    preferredDays.includes(day)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Time */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Clock className="w-4 h-4" />
              {t("preferredTime")}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-muted-foreground">{t("to")}</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmitRequest}
            disabled={loading || !teacherId || !courseId}
            className="w-full gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? t("findingSlots") : t("getAISuggestions")}
          </Button>
        </motion.div>
      ) : (
        /* AI Suggestions */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              {t("aiSuggestions")}
            </h3>
          </div>

          {suggestions.map((sug, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {sug.day} — {sug.time}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {sug.reason}
                  </p>
                </div>
                <Badge className={getScoreColor(sug.score)}>
                  {Math.round(sug.score * 100)}% {t("match")}
                </Badge>
              </div>
              <Button
                onClick={() =>
                  handleConfirmSlot({ day: sug.day, time: sug.time })
                }
                disabled={confirming}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {t("selectSlot")}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
