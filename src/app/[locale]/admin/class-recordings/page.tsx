"use client";

import { useState, useEffect, useCallback } from "react";
import { Video, Plus, Inbox, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type Student = { id: string; name: string };
type Recording = {
  recording: {
    id: string;
    title: string;
    recordingUrl: string;
    classDate: string;
    notes: string | null;
    createdAt: string;
  };
  student: { fullName: string };
};

export default function AdminClassRecordingsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: "", title: "", recordingUrl: "", classDate: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, recordingsRes] = await Promise.all([
        fetch("/api/admin/users?role=student&limit=200"),
        fetch("/api/admin/class-recordings"),
      ]);
      if (studentsRes.ok) {
        const d = await studentsRes.json();
        setStudents((d.users ?? []).map((u: { id: string; fullName: string }) => ({ id: u.id, name: u.fullName })));
      }
      if (recordingsRes.ok) {
        const d = await recordingsRes.json();
        setRecordings(d.recordings ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.studentId || !form.title || !form.recordingUrl || !form.classDate) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/class-recordings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ studentId: "", title: "", recordingUrl: "", classDate: "", notes: "" });
        await load();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Video className="w-6 h-6 text-purple-600" />
            Class Recordings (Admin Upload)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Upload class recordings for specific students</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 me-2" />
          Upload Recording
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Add Class Recording</h3>
            <button onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Student *</label>
              <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select student...</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Class Date *</label>
              <input type="date" value={form.classDate} onChange={(e) => setForm({ ...form, classDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Surah Al-Baqarah Lesson 3"
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Recording URL *</label>
              <input type="url" value={form.recordingUrl} onChange={(e) => setForm({ ...form, recordingUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2} placeholder="Additional notes..."
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={submit}
              disabled={submitting || !form.studentId || !form.title || !form.recordingUrl || !form.classDate}
              className="bg-purple-600 hover:bg-purple-700 text-white">
              {submitting ? "Saving..." : "Save Recording"}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : recordings.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No class recordings uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((item) => (
            <div key={item.recording.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{item.recording.title}</p>
                  <p className="text-xs text-muted-foreground">Student: {item.student.fullName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(item.recording.classDate).toLocaleDateString()}</p>
                  {item.recording.notes && <p className="text-xs text-muted-foreground mt-0.5">{item.recording.notes}</p>}
                </div>
                <a href={item.recording.recordingUrl} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="w-3.5 h-3.5 me-1" />
                    View
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
