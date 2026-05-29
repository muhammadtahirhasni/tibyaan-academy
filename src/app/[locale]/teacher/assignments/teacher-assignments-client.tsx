"use client";

import { useState } from "react";
import { ClipboardCheck, Plus, Inbox, CheckCircle, AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StudentOption { id: string; fullName: string; }

interface Assignment {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  title: string;
  description: string | null;
  frequency: string;
  dueDate: string | null;
  status: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "text-amber-700 dark:text-amber-400",   bg: "bg-amber-100 dark:bg-amber-900"   },
  submitted: { label: "Submitted", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900" },
  reviewed:  { label: "Reviewed",  color: "text-blue-700 dark:text-blue-400",     bg: "bg-blue-100 dark:bg-blue-900"     },
};

const FREQ_LABEL: Record<string, string> = {
  once: "Once", daily: "Daily", weekly: "Weekly",
};

export function TeacherAssignmentsClient({
  students,
  assignments: initialAssignments,
}: {
  students: StudentOption[];
  assignments: Assignment[];
}) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [tab, setTab] = useState<"assign" | "list">("assign");

  // Form state
  const [studentId, setStudentId] = useState("");
  const [type, setType] = useState<"test" | "assignment">("assignment");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"once" | "daily" | "weekly">("once");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!studentId || !title.trim()) {
      setError("Please select a student and enter a title.");
      return;
    }
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, type, title, description, frequency, dueDate: dueDate || null }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to save"); return; }
      setSaved(true);
      setTitle(""); setDescription(""); setStudentId(""); setDueDate("");
      const refreshed = await fetch("/api/assignments").then((r) => r.json());
      if (refreshed.assignments) setAssignments(refreshed.assignments);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch("/api/assignments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setAssignments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-red-600" />
          Tests & Assignments
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Assign tests and homework to your students
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "assign", label: "Assign New" },
          { key: "list",   label: `All Assignments (${assignments.length})` },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as "assign" | "list")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "assign" ? (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Assignment
          </h2>

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
              <label className="text-sm font-medium text-foreground block mb-1">Type *</label>
              <select value={type} onChange={(e) => setType(e.target.value as "test" | "assignment")}
                className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="assignment">Assignment</option>
                <option value="test">Test</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Title / Topic *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Surah Al-Baqarah revision, Tajweed test..."
              className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Description / Instructions</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} placeholder="Detailed instructions or questions..."
              className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Frequency *</label>
              <select value={frequency} onChange={(e) => setFrequency(e.target.value as "once" | "daily" | "weekly")}
                className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
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
              <CheckCircle className="w-4 h-4 shrink-0" /> Assignment assigned successfully!
            </div>
          )}

          <Button onClick={handleSubmit} disabled={saving} className="gap-2">
            <Plus className="w-4 h-4" />
            {saving ? "Saving..." : "Assign"}
          </Button>
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No assignments yet. Assign one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const sc = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.pending;
            return (
              <div key={a.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-foreground">{a.title}</span>
                      <Badge className="text-xs bg-primary/10 text-primary border-0 capitalize">{a.type}</Badge>
                      <Badge className={`text-xs ${sc.bg} ${sc.color} border-0`}>{sc.label}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <User className="w-3 h-3" /> {a.studentName}
                      <span className="ms-2">· {FREQ_LABEL[a.frequency] ?? a.frequency}</span>
                      {a.dueDate && <span className="ms-2">· Due: {new Date(a.dueDate).toLocaleDateString("en-GB")}</span>}
                    </div>
                    {a.description && <p className="text-xs text-muted-foreground italic">{a.description}</p>}
                  </div>
                  <div className="shrink-0">
                    <select value={a.status} onChange={(e) => handleStatusChange(a.id, e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                      <option value="pending">Pending</option>
                      <option value="submitted">Submitted</option>
                      <option value="reviewed">Reviewed</option>
                    </select>
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
