"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardCheck, Plus, Inbox, X, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Student = { id: string; name: string };
type Assignment = {
  assignment: {
    id: string;
    type: string;
    title: string;
    description: string | null;
    frequency: string;
    dueDate: string | null;
    status: string;
    teacherGrade: string | null;
    teacherFeedback: string | null;
    createdAt: string;
  };
  student: { fullName: string };
};

const statusConfig = {
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  submitted: { label: "Submitted", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  graded: { label: "Graded", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
};

const typeConfig = {
  test: { label: "Test", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
  assignment: { label: "Assignment", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
};

export default function TeacherTestsAssignmentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    type: "assignment",
    title: "",
    description: "",
    frequency: "once",
    dueDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [filterStudent, setFilterStudent] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, assignmentsRes] = await Promise.all([
        fetch("/api/teacher/students"),
        fetch("/api/teacher/assignments"),
      ]);
      if (studentsRes.ok) {
        const d = await studentsRes.json();
        setStudents(d.students ?? []);
      }
      if (assignmentsRes.ok) {
        const d = await assignmentsRes.json();
        setAssignments(d.assignments ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.studentId || !form.title) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dueDate: form.dueDate || undefined,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ studentId: "", type: "assignment", title: "", description: "", frequency: "once", dueDate: "" });
        await load();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filterStudent === "all"
    ? assignments
    : assignments.filter((a) => {
        const s = students.find((st) => st.name === a.student.fullName);
        return s?.id === filterStudent;
      });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tests &amp; Assignments</h1>
            <p className="text-sm text-muted-foreground">Assign tests and work to your students</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="w-4 h-4 me-2" />
          Assign
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">New Assignment</h3>
            <button onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Student *</label>
              <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">Select student...</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="assignment">Assignment</option>
                <option value="test">Test</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Memorise Surah Al-Ikhlas"
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2} placeholder="Additional instructions..."
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Frequency</label>
              <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="once">One Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={submit} disabled={submitting || !form.studentId || !form.title}
              className="bg-amber-600 hover:bg-amber-700 text-white">
              {submitting ? "Saving..." : "Assign"}
            </Button>
          </div>
        </div>
      )}

      {/* Filter */}
      {students.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setFilterStudent("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStudent === "all" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
            All Students
          </button>
          {students.map((s) => (
            <button key={s.id} onClick={() => setFilterStudent(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStudent === s.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
              {s.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No assignments yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const status = statusConfig[item.assignment.status as keyof typeof statusConfig] ?? statusConfig.pending;
            const type = typeConfig[item.assignment.type as keyof typeof typeConfig] ?? typeConfig.assignment;
            return (
              <div key={item.assignment.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${type.bg} ${type.color}`}>{type.label}</span>
                      <span className="font-semibold text-foreground text-sm">{item.assignment.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Student: {item.student.fullName}</p>
                    {item.assignment.description && <p className="text-sm text-muted-foreground">{item.assignment.description}</p>}
                    {item.assignment.dueDate && <p className="text-xs text-muted-foreground">Due: {new Date(item.assignment.dueDate).toLocaleDateString()}</p>}
                    {item.assignment.teacherGrade && <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Grade: {item.assignment.teacherGrade}</p>}
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
