"use client";

import { ClipboardCheck, Inbox, User, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Assignment {
  id: string;
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

export function StudentAssignmentsClient({ assignments }: { assignments: Assignment[] }) {
  const pending   = assignments.filter((a) => a.status === "pending").length;
  const submitted = assignments.filter((a) => a.status === "submitted").length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-emerald-600" />
          Tests & Assignments
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tasks assigned to you by your teacher
        </p>
      </motion.div>

      {assignments.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total",     value: assignments.length, color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950"    },
            { label: "Pending",   value: pending,            color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950"  },
            { label: "Submitted", value: submitted,          color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border ${s.bg} p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">My Assignments</h2>

        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Inbox className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">No assignments yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Your teacher will assign tasks here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => {
              const sc = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.pending;
              const isOverdue = a.dueDate && a.status === "pending" && new Date(a.dueDate) < new Date();
              return (
                <div key={a.id} className={`rounded-lg border p-4 ${isOverdue ? "border-red-200 bg-red-50/30 dark:bg-red-950/10" : "bg-muted/20"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm text-foreground">{a.title}</span>
                        <Badge className="text-xs bg-primary/10 text-primary border-0 capitalize">{a.type}</Badge>
                        <Badge className={`text-xs ${sc.bg} ${sc.color} border-0`}>{sc.label}</Badge>
                        {isOverdue && <Badge className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0">Overdue</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1 flex-wrap">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {a.teacherName}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {FREQ_LABEL[a.frequency] ?? a.frequency}</span>
                        {a.dueDate && (
                          <span className={`flex items-center gap-1 ${isOverdue ? "text-red-600" : ""}`}>
                            <Calendar className="w-3 h-3" /> Due: {new Date(a.dueDate).toLocaleDateString("en-GB")}
                          </span>
                        )}
                      </div>
                      {a.description && <p className="text-xs text-muted-foreground italic ps-0 mt-1">{a.description}</p>}
                    </div>
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
