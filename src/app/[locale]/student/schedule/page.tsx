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
  CheckCircle2,
  Send,
  Info,
} from "lucide-react";
import { COURSES } from "@/lib/data/courses";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Comprehensive world timezones list
const WORLD_TIMEZONES = [
  "Pacific/Midway",
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Caracas",
  "America/Halifax",
  "America/St_Johns",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "America/Noronha",
  "Atlantic/Azores",
  "Atlantic/Cape_Verde",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Rome",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kabul",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Kathmandu",
  "Asia/Dhaka",
  "Asia/Yangon",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Pacific/Fiji",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Nairobi",
  "Africa/Lagos",
  "Africa/Accra",
];

export default function StudentSchedulePage() {
  const t = useTranslations("scheduling");

  const [timezone, setTimezone] = useState("");
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [teacherId, setTeacherId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(COURSES[0].id);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const toggleDay = (day: string) => {
    setPreferredDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmitRequest = async () => {
    if (!teacherId.trim() || !selectedCourseId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/scheduling/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacherId.trim(),
          courseId: selectedCourseId,
          timezone,
          preferredDays,
          preferredTime: { start: startTime, end: endTime },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || t("errorSubmitting"));
        return;
      }
      setSubmitted(true);
    } catch {
      alert(t("errorSubmitting"));
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = COURSES.find((c) => c.id === selectedCourseId);

  if (submitted) {
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
          Request Submitted!
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          Your schedule request has been sent to the Admin for approval. You will be notified once it is approved and your class is scheduled.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => setSubmitted(false)}
        >
          Submit Another Request
        </Button>
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

      {/* Course IDs Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border bg-primary/5 border-primary/20 p-4"
      >
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Course IDs for Reference</p>
            <div className="flex flex-wrap gap-2">
              {COURSES.map((c) => (
                <span key={c.id} className="inline-flex items-center gap-1.5 text-xs bg-background border rounded-full px-3 py-1">
                  <span className="font-mono font-bold text-primary">{c.shortId}</span>
                  <span className="text-muted-foreground">→ {c.nameEn}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Form */}
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
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            {WORLD_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Teacher ID & Course Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              {t("teacherId")}
            </label>
            <p className="text-xs text-muted-foreground mb-1">Enter your teacher&apos;s ID (ask your teacher or Admin)</p>
            <input
              type="text"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              placeholder="TBA-XXXXXXXX or UUID"
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">
              Select Course
            </label>
            <p className="text-xs text-muted-foreground mb-1">Choose the course you want to schedule</p>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              {COURSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shortId} — {c.nameEn}
                </option>
              ))}
            </select>
            {selectedCourse && (
              <p className="mt-1 text-xs text-primary font-mono">{selectedCourse.shortId}</p>
            )}
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

        {/* Preferred Time (24-hour) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Clock className="w-4 h-4" />
            {t("preferredTime")} (24-hour format)
          </label>
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">From</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                min="00:00"
                max="23:59"
                className="rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <span className="text-muted-foreground mt-5">{t("to")}</span>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">To</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                min="00:00"
                max="23:59"
                className="rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">All times are in your selected timezone: <span className="font-medium text-foreground">{timezone}</span></p>
        </div>

        {/* Info about Admin approval */}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Your schedule request will be reviewed and approved by the Admin. You will be notified once your class time is confirmed.
          </p>
        </div>

        <Button
          onClick={handleSubmitRequest}
          disabled={loading || !teacherId.trim() || !selectedCourseId}
          className="w-full gap-2"
        >
          <Send className="w-4 h-4" />
          {loading ? "Submitting..." : "Submit Schedule Request"}
        </Button>
      </motion.div>

      {/* Summary */}
      {selectedCourse && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card p-4"
        >
          <p className="text-xs font-medium text-muted-foreground mb-2">Request Summary</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Course: {selectedCourse.nameEn} ({selectedCourse.shortId})
            </Badge>
            {preferredDays.length > 0 && (
              <Badge variant="outline">
                Days: {preferredDays.map((d) => d.slice(0, 3)).join(", ")}
              </Badge>
            )}
            <Badge variant="outline">
              Time: {startTime} – {endTime}
            </Badge>
            <Badge variant="outline">
              TZ: {timezone}
            </Badge>
          </div>
        </motion.div>
      )}
    </div>
  );
}
