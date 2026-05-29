"use client";

import { useState, useMemo } from "react";
import { ClipboardList, Search, Inbox, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Assignment {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
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
  once: "One-time", daily: "Daily", weekly: "Weekly",
};

export function AdminAssignmentsClient({ assignments }: { assignments: Assignment[] }) {
  const [searchStudent, setSearchStudent] = useState("");
  const [searchTeacher, setSearchTeacher] = useState("");

  const filtered = useMemo(() =>
    assignments.filter((a) => {
      const ms = !searchStudent || a.studentName.toLowerCase().includes(searchStudent.toLowerCase());
      const mt = !searchTeacher || a.teacherName.toLowerCase().includes(searchTeacher.toLowerCase());
      return ms && mt;
    }),
    [assignments, searchStudent, searchTeacher]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-red-600" />
          All Tests & Assignments
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all assignments across every student and teacher
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",     value: assignments.length,                                         color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950"    },
          { label: "Pending",   value: assignments.filter((a) => a.status === "pending").length,   color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950"  },
          { label: "Submitted", value: assignments.filter((a) => a.status === "submitted").length, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: "Reviewed",  value: assignments.filter((a) => a.status === "reviewed").length,  color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950"    },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.bg} p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Filter by Student Name..."
            value={searchStudent} onChange={(e) => setSearchStudent(e.target.value)}
            className="w-full ps-9 pe-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Filter by Teacher Name..."
            value={searchTeacher} onChange={(e) => setSearchTeacher(e.target.value)}
            className="w-full ps-9 pe-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border bg-card p-6 space-y-3">
        <h2 className="text-base font-semibold text-foreground">Assignments ({filtered.length})</h2>
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No assignments found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((a) => {
              const sc = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.pending;
              return (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/10">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{a.title}</span>
                      <Badge className="text-xs bg-primary/10 text-primary border-0 capitalize">{a.type}</Badge>
                      <Badge className={`text-xs ${sc.bg} ${sc.color} border-0`}>{sc.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> Student: <strong>{a.studentName}</strong></span>
                      <span>Teacher: {a.teacherName}</span>
                      <span>{FREQ_LABEL[a.frequency] ?? a.frequency}</span>
                      {a.dueDate && <span>Due: {new Date(a.dueDate).toLocaleDateString("en-GB")}</span>}
                    </div>
                    {a.description && <p className="text-xs text-muted-foreground italic mt-0.5">{a.description}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
