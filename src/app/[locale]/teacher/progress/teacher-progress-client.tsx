"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Plus, CheckCircle, AlertCircle, Star, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Student { id: string; name: string; }

interface ProgressEntry {
  id: string;
  student_name: string;
  lesson_covered: string;
  rating: string;
  notes: string | null;
  session_date: string;
}

const RATINGS = [
  { value: "excellent", label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900" },
  { value: "good", label: "Good", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900" },
  { value: "needs_improvement", label: "Needs Improvement", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900" },
];

export function TeacherProgressClient({ students }: { students: Student[] }) {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [lessonCovered, setLessonCovered] = useState("");
  const [rating, setRating] = useState("good");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(() => {
    setLoading(true);
    fetch("/api/progress")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleSave = async () => {
    if (!selectedStudent || !lessonCovered.trim()) {
      setError("Please select a student and enter the lesson covered.");
      return;
    }
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudent, lessonCovered: lessonCovered.trim(), rating, notes: notes.trim() || null }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to save"); return; }
      setSaved(true);
      setLessonCovered("");
      setNotes("");
      fetchEntries();
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  const ratingCfg = (r: string) => RATINGS.find((x) => x.value === r) ?? RATINGS[1];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-600" />
          Track Progress
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Record daily lesson progress for each student</p>
      </motion.div>

      {/* Entry Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">New Progress Entry</h2>

        {/* Student */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Select Student *</label>
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No students assigned yet. Ask Admin to approve a schedule request.</p>
          ) : (
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">— Select Student —</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Lesson Covered */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Lesson Covered *</label>
          <input type="text" value={lessonCovered} onChange={(e) => setLessonCovered(e.target.value)}
            placeholder="e.g., Surah Al-Baqarah Ayah 1-10, Tajweed rule: Ikhfa..."
            className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        {/* Rating */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Performance Rating *</label>
          <div className="flex gap-2 flex-wrap">
            {RATINGS.map((r) => (
              <button key={r.value} onClick={() => setRating(r.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  rating === r.value
                    ? `${r.bg} ${r.color} border-current`
                    : "bg-background hover:bg-muted border-border"
                }`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Teacher Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Any observations, tips, or feedback for the student..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
            <CheckCircle className="w-4 h-4 shrink-0" /> Progress saved successfully!
          </div>
        )}

        <Button onClick={handleSave} disabled={saving || students.length === 0} className="gap-2">
          <Plus className="w-4 h-4" />
          {saving ? "Saving..." : "Save Progress Entry"}
        </Button>
      </motion.div>

      {/* History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Recent Progress Entries</h2>
          <Button variant="ghost" size="sm" onClick={fetchEntries} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 italic">No progress entries yet. Start recording!</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const rc = ratingCfg(entry.rating);
              return (
                <div key={entry.id} className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{entry.student_name}</span>
                        <Badge className={`text-xs ${rc.bg} ${rc.color} border-0`}>
                          <Star className="w-2.5 h-2.5 me-1" />
                          {rc.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mt-1">{entry.lesson_covered}</p>
                      {entry.notes && <p className="text-xs text-muted-foreground mt-1 italic">{entry.notes}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(entry.session_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
