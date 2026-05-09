"use client";

import { useState, useEffect } from "react";
import { FileText, Inbox, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  teacher: { fullName: string };
};

const statusConfig = {
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", icon: Clock },
  submitted: { label: "Submitted", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", icon: CheckCircle2 },
  graded: { label: "Graded", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: CheckCircle2 },
};

const typeConfig = {
  test: { label: "Test", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
  assignment: { label: "Assignment", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
};

export default function StudentTestsAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "test" | "assignment">("all");

  useEffect(() => {
    fetch("/api/student/assignments")
      .then((r) => r.json())
      .then((d) => setAssignments(d.assignments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? assignments : assignments.filter((a) => a.assignment.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
          <FileText className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tests &amp; Assignments</h1>
          <p className="text-sm text-muted-foreground">Assigned by your teacher</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "test", "assignment"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === f ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
            }`}
          >
            {f === "all" ? "All" : f === "test" ? "Tests" : "Assignments"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No tests or assignments yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const status = statusConfig[item.assignment.status as keyof typeof statusConfig] ?? statusConfig.pending;
            const type = typeConfig[item.assignment.type as keyof typeof typeConfig] ?? typeConfig.assignment;
            const StatusIcon = status.icon;
            const isOverdue = item.assignment.dueDate && item.assignment.status === "pending"
              && new Date(item.assignment.dueDate) < new Date();
            return (
              <div key={item.assignment.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${type.bg} ${type.color}`}>
                        {type.label}
                      </span>
                      <h3 className="font-semibold text-foreground text-sm">{item.assignment.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">Teacher: {item.teacher.fullName}</p>
                    {item.assignment.description && (
                      <p className="text-sm text-muted-foreground">{item.assignment.description}</p>
                    )}
                    {item.assignment.dueDate && (
                      <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}>
                        {isOverdue && <AlertTriangle className="w-3 h-3" />}
                        <span>Due: {new Date(item.assignment.dueDate).toLocaleDateString()}</span>
                        {isOverdue && <span className="font-medium">— Overdue</span>}
                      </div>
                    )}
                    {item.assignment.teacherGrade && (
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Grade: {item.assignment.teacherGrade}</p>
                    )}
                    {item.assignment.teacherFeedback && (
                      <p className="text-xs text-muted-foreground italic">Feedback: {item.assignment.teacherFeedback}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
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
