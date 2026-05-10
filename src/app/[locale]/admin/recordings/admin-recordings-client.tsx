"use client";

import { useState, useEffect } from "react";
import { Disc, Inbox, Clock, User, Download, Plus, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type RecordingItem = {
  id: string;
  teacherName: string;
  studentName: string;
  recordingUrl: string;
  duration: number | null;
  sessionDate: string;
  expiresAt: string;
  isDeleted: boolean;
};

type Tab = "upload" | "active" | "all";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function daysRemaining(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

interface UserOption { id: string; fullName: string; }

function UploadForm({ onSuccess }: { onSuccess: () => void }) {
  const [students, setStudents] = useState<UserOption[]>([]);
  const [teachers, setTeachers] = useState<UserOption[]>([]);
  const [studentId, setStudentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [durationMinutes, setDurationMinutes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/recordings")
      .then((r) => r.json())
      .then((d) => {
        setStudents(d.students ?? []);
        setTeachers(d.teachers ?? []);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!studentId || !teacherId || !recordingUrl.trim() || !sessionDate) {
      setError("Please fill all required fields.");
      return;
    }
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/admin/recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId, teacherId,
          recordingUrl: recordingUrl.trim(),
          sessionDate: new Date(sessionDate).toISOString(),
          durationMinutes: durationMinutes ? parseInt(durationMinutes) : null,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to save"); return; }
      setSaved(true);
      setRecordingUrl(""); setDurationMinutes(""); setStudentId(""); setTeacherId("");
      onSuccess();
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
        <Plus className="w-4 h-4" /> Upload Class Recording
      </h2>
      <p className="text-sm text-muted-foreground">
        Add a recording link (YouTube, Google Drive, mp4 URL) for a student's class.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Student *</label>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">— Select Student —</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Teacher *</label>
          <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">— Select Teacher —</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground block mb-1">Recording URL * (YouTube / Google Drive / MP4 link)</label>
        <input type="url" value={recordingUrl} onChange={(e) => setRecordingUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=... or https://drive.google.com/..."
          className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Class Date *</label>
          <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Duration (minutes)</label>
          <input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)}
            placeholder="45"
            className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 rounded-lg px-3 py-2">
          <CheckCircle className="w-4 h-4 shrink-0" /> Recording added successfully!
        </div>
      )}

      <Button onClick={handleSubmit} disabled={saving} className="gap-2">
        <Plus className="w-4 h-4" />
        {saving ? "Saving..." : "Add Recording"}
      </Button>
    </div>
  );
}

export function AdminRecordingsClient({ recordings: initialRecordings }: { recordings: RecordingItem[] }) {
  const [recordings, setRecordings] = useState(initialRecordings);
  const [tab, setTab] = useState<Tab>("upload");

  const filtered =
    tab === "upload" ? [] :
    tab === "active" ? recordings.filter((r) => !r.isDeleted) :
    recordings;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "upload", label: "Upload New" },
    { key: "active", label: "Active", count: recordings.filter((r) => !r.isDeleted).length },
    { key: "all", label: "All", count: recordings.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Disc className="w-6 h-6 text-red-600" />
          Class Recordings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload and manage class recordings for students
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>
            {t.label}{t.count !== undefined ? ` (${t.count})` : ""}
          </button>
        ))}
      </div>

      {tab === "upload" ? (
        <UploadForm onSuccess={() => window.location.reload()} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No recordings in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rec) => {
            const days = daysRemaining(rec.expiresAt);
            return (
              <div key={rec.id} className={`rounded-xl border bg-card p-4 ${rec.isDeleted ? "opacity-60" : ""}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-1 text-sm">
                      <span className="flex items-center gap-1 text-foreground font-medium">
                        <User className="w-3.5 h-3.5" /> Teacher: {rec.teacherName}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <User className="w-3.5 h-3.5" /> Student: {rec.studentName}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {new Date(rec.sessionDate).toLocaleDateString()} at{" "}
                        {new Date(rec.sessionDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span>{formatDuration(rec.duration)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!rec.isDeleted && (
                      <>
                        <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          days <= 1 ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                          days <= 3 ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          <Clock className="w-3 h-3" /> {days}d left
                        </span>
                        <a href={rec.recordingUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors">
                          <Download className="w-3 h-3" /> Open
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
