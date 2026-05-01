"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Globe,
  CheckCircle2,
  Send,
  Info,
  XCircle,
  Hourglass,
  Lock,
} from "lucide-react";
import { COURSES } from "@/lib/data/courses";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const WORLD_TIMEZONES = [
  "Pacific/Midway","Pacific/Honolulu","America/Anchorage","America/Los_Angeles",
  "America/Denver","America/Chicago","America/New_York","America/Caracas",
  "America/Halifax","America/St_Johns","America/Sao_Paulo",
  "America/Argentina/Buenos_Aires","America/Noronha","Atlantic/Azores",
  "Atlantic/Cape_Verde","Europe/London","Europe/Berlin","Europe/Paris",
  "Europe/Rome","Europe/Istanbul","Europe/Moscow","Asia/Dubai","Asia/Kabul",
  "Asia/Karachi","Asia/Kolkata","Asia/Kathmandu","Asia/Dhaka","Asia/Yangon",
  "Asia/Bangkok","Asia/Singapore","Asia/Shanghai","Asia/Tokyo","Asia/Seoul",
  "Australia/Sydney","Pacific/Auckland","Pacific/Fiji","Africa/Cairo",
  "Africa/Johannesburg","Africa/Nairobi","Africa/Lagos","Africa/Accra",
];

interface MyRequest {
  id: string;
  status: string;
  timezone: string;
  preferredDays: string[];
  preferredTime: { start: string; end: string } | null;
  selectedSlot: { day: string; time: string } | null;
  teacherName: string;
  teacherId: string;
  courseName: string;
  courseId: string;
  createdAt: string;
}

export default function StudentSchedulePage() {
  const t = useTranslations("scheduling");

  // Form state
  const [timezone, setTimezone]               = useState("");
  const [preferredDays, setPreferredDays]     = useState<string[]>([]);
  const [startTime, setStartTime]             = useState("09:00");
  const [endTime, setEndTime]                 = useState("17:00");
  const [teacherId, setTeacherId]             = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(COURSES[0].id);

  // UI state
  const [loading, setLoading]               = useState(false);
  const [successMsg, setSuccessMsg]         = useState("");
  const [errorMsg, setErrorMsg]             = useState("");

  // My requests
  const [myRequests, setMyRequests]         = useState<MyRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Derive locked teacher from first approved request
  const approvedRequests = myRequests.filter((r) => r.status === "approved" || r.status === "confirmed");
  const pendingRequests  = myRequests.filter((r) => r.status === "pending");
  const rejectedRequests = myRequests.filter((r) => r.status === "rejected");

  const lockedRequest = approvedRequests[0] ?? null;
  const teacherLocked = !!lockedRequest;
  const lockedTeacherId   = lockedRequest?.teacherId ?? "";
  const lockedTeacherName = lockedRequest?.teacherName ?? "";

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const fetchMyRequests = () => {
    setLoadingRequests(true);
    fetch("/api/scheduling/request")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        const arr: MyRequest[] = Array.isArray(data) ? data : [];
        setMyRequests(arr);

        // Pre-fill teacher from approved request (locked)
        const approved = arr.find((r) => r.status === "approved" || r.status === "confirmed");
        if (approved) {
          setTeacherId(approved.teacherId);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRequests(false));
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const toggleDay = (day: string) =>
    setPreferredDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const handleSubmit = async () => {
    if ((!teacherId.trim() && !lockedTeacherId) || !selectedCourseId) return;
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("/api/scheduling/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: (teacherLocked ? lockedTeacherId : teacherId).trim(),
          courseId: selectedCourseId,
          timezone,
          preferredDays,
          preferredTime: { start: startTime, end: endTime },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error || t("errorSubmitting"));
        return;
      }

      setSuccessMsg("Request submitted! Admin will review and confirm your schedule.");
      setPreferredDays([]);
      fetchMyRequests();
    } catch {
      setErrorMsg(t("errorSubmitting"));
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = COURSES.find((c) => c.id === selectedCourseId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      {/* ── Confirmed Classes ── */}
      {!loadingRequests && approvedRequests.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-3">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            My Confirmed Classes
          </h2>
          {approvedRequests.map((req) => (
            <div key={req.id} className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{req.courseName}</span>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-300 text-xs">Confirmed</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Teacher: <span className="font-medium text-foreground">{req.teacherName}</span>
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap mt-1">
                    {(req.preferredDays ?? []).length > 0 && (
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{req.preferredDays.join(", ")}</span>
                    )}
                    {req.preferredTime && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{req.preferredTime.start} – {req.preferredTime.end}</span>
                    )}
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{req.timezone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Pending Requests ── */}
      {!loadingRequests && pendingRequests.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }} className="space-y-2">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-amber-600" />
            Pending Admin Approval
          </h2>
          {pendingRequests.map((req) => (
            <div key={req.id} className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-foreground">{req.courseName}</p>
                  <p className="text-xs text-muted-foreground">
                    Teacher: {req.teacherName} · {(req.preferredDays ?? []).join(", ")} · {req.preferredTime?.start}–{req.preferredTime?.end}
                  </p>
                </div>
                <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs shrink-0">Awaiting Approval</Badge>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Rejected Requests ── */}
      {!loadingRequests && rejectedRequests.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }} className="space-y-2">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            Rejected Requests
          </h2>
          {rejectedRequests.map((req) => (
            <div key={req.id} className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 text-sm">
              <p className="font-medium text-foreground">{req.courseName}</p>
              <p className="text-xs text-muted-foreground">
                {(req.preferredDays ?? []).join(", ")} · {req.preferredTime?.start}–{req.preferredTime?.end} · {req.teacherName}
              </p>
              <p className="text-xs text-red-600 mt-1">Submit a new request with updated preferences below.</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Schedule Request Form (always visible) ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="rounded-xl border bg-card p-6 space-y-6">

        <div>
          <h2 className="text-base font-semibold text-foreground">
            {teacherLocked ? "Update My Schedule" : "Submit a Schedule Request"}
          </h2>
          {teacherLocked && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Your teacher is locked. You can update the timing or days of your class.
            </p>
          )}
        </div>

        {/* Course IDs info (only when teacher not yet locked) */}
        {!teacherLocked && (
          <div className="rounded-lg border bg-primary/5 border-primary/20 p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-foreground mb-1.5">Course IDs for Reference</p>
                <div className="flex flex-wrap gap-1.5">
                  {COURSES.map((c) => (
                    <span key={c.id} className="inline-flex items-center gap-1 text-xs bg-background border rounded-full px-2.5 py-0.5">
                      <span className="font-mono font-bold text-primary">{c.shortId}</span>
                      <span className="text-muted-foreground">→ {c.nameEn}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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
              <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>

        {/* Teacher + Course */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Teacher ID — locked if approved request exists */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1">
              {teacherLocked && <Lock className="w-3.5 h-3.5 text-amber-500" />}
              {t("teacherId")}
            </label>
            {teacherLocked ? (
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 px-3 py-2.5">
                <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{lockedTeacherName}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {lockedTeacherId.substring(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-1">Ask your teacher or Admin for their ID</p>
                <input
                  type="text"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  placeholder="TBA-XXXXXXXX or UUID"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </>
            )}
          </div>

          {/* Course selection */}
          <div>
            <label className="text-sm font-medium text-foreground">Select Course</label>
            <p className="text-xs text-muted-foreground mb-1">Choose the course to schedule</p>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              {COURSES.map((c) => (
                <option key={c.id} value={c.id}>{c.shortId} — {c.nameEn}</option>
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

        {/* Preferred Time */}
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
                className="rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            All times in your selected timezone: <span className="font-medium text-foreground">{timezone}</span>
          </p>
        </div>

        {/* Info banner */}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {teacherLocked
              ? "A new timing request will be sent to Admin for approval. Your current confirmed class stays active until the update is approved."
              : "Your request will be reviewed by Admin. You will be notified once your class is confirmed."}
          </p>
        </div>

        {/* Inline success / error feedback */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {successMsg}
            </motion.div>
          )}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300"
            >
              <XCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={handleSubmit}
          disabled={loading || (!teacherLocked && !teacherId.trim()) || !selectedCourseId}
          className="w-full gap-2"
        >
          <Send className="w-4 h-4" />
          {loading ? "Submitting..." : teacherLocked ? "Request Schedule Update" : "Submit Schedule Request"}
        </Button>

        {/* Request summary */}
        {selectedCourse && (preferredDays.length > 0 || startTime) && (
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Request Summary</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Course: {selectedCourse.nameEn}</Badge>
              {preferredDays.length > 0 && (
                <Badge variant="outline">Days: {preferredDays.map((d) => d.slice(0, 3)).join(", ")}</Badge>
              )}
              <Badge variant="outline">Time: {startTime} – {endTime}</Badge>
              <Badge variant="outline">TZ: {timezone}</Badge>
              {teacherLocked && <Badge variant="outline" className="text-amber-600 border-amber-300">Teacher: {lockedTeacherName} (locked)</Badge>}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
