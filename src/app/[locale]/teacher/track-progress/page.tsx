"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Plus, Inbox, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Student = { id: string; name: string };
type ProgressEntry = {
  entry: {
    id: string;
    lessonCovered: string;
    rating: string;
    notes: string | null;
    entryDate: string;
  };
  student: { fullName: string };
};

const ratingConfig = {
  excellent: { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  good: { label: "Good", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  average: { label: "Average", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  needs_improvement: { label: "Needs Improvement", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
};

export default function TeacherTrackProgressPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: "", lessonCovered: "", rating: "good", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, entriesRes] = await Promise.all([
        fetch("/api/teacher/students"),
        fetch("/api/teacher/progress"),
      ]);
      if (studentsRes.ok) {
        const d = await studentsRes.json();
        setStudents(d.students ?? []);
      }
      if (entriesRes.ok) {
        const d = await entriesRes.json();
        setEntries(d.entries ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.studentId || !form.lessonCovered) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/teacher/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ studentId: "", lessonCovered: "", rating: "good", notes: "" });
        await load();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = selectedStudent === "all"
    ? entries
    : entries.filter((e) => {
        const s = students.find((st) => st.name === e.student.fullName);
        return s?.id === selectedStudent;
      });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Track Progress</h1>
            <p className="text-sm text-muted-foreground">Record daily progress for your students</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 me-2" />
          Add Entry
        </Button>
      </div>

      {/* Add Progress Form */}
      {showForm && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">New Progress Entry</h3>
            <button onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Student *</label>
              <select
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Rating *</label>
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {Object.entries(ratingConfig).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Lesson Covered *</label>
              <input
                type="text"
                value={form.lessonCovered}
                onChange={(e) => setForm({ ...form, lessonCovered: e.target.value })}
                placeholder="e.g. Surah Al-Fatiha, Verses 1-7"
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional observations..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button
              onClick={submit}
              disabled={submitting || !form.studentId || !form.lessonCovered}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </div>
      )}

      {/* Filter */}
      {students.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedStudent("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedStudent === "all" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}
          >
            All Students
          </button>
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStudent(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedStudent === s.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Entries List */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No progress entries yet. Add your first entry above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const cfg = ratingConfig[item.entry.rating as keyof typeof ratingConfig] ?? ratingConfig.good;
            return (
              <div key={item.entry.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground text-sm">{item.student.fullName}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{item.entry.lessonCovered}</p>
                    {item.entry.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{item.entry.notes}</p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {new Date(item.entry.entryDate).toLocaleDateString()}
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
