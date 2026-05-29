"use client";

import { TrendingUp, BookOpen, Star, Inbox, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ProgressEntry {
  id: string;
  teacherName: string;
  lessonCovered: string;
  rating: string;
  notes: string | null;
  sessionDate: string;
}

const RATING_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  excellent:        { label: "Excellent",         color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900" },
  good:             { label: "Good",              color: "text-blue-700 dark:text-blue-400",       bg: "bg-blue-100 dark:bg-blue-900" },
  needs_improvement:{ label: "Needs Improvement", color: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-100 dark:bg-amber-900" },
};

export function StudentProgressClient({ entries }: { entries: ProgressEntry[] }) {
  const ratingCfg = (r: string) => RATING_CONFIG[r] ?? RATING_CONFIG.good;

  const excellent = entries.filter((e) => e.rating === "excellent").length;
  const good      = entries.filter((e) => e.rating === "good").length;
  const improve   = entries.filter((e) => e.rating === "needs_improvement").length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-600" />
          My Progress
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Progress recorded by your teacher — lesson by lesson
        </p>
      </motion.div>

      {/* Summary */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Excellent", value: excellent, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
            { label: "Good", value: good, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
            { label: "Needs Work", value: improve, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border ${s.bg} p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Progress Entries */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Progress History</h2>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Inbox className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">No progress records yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Your teacher will record progress after each class.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const rc = ratingCfg(entry.rating);
              return (
                <div key={entry.id} className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{entry.teacherName}</span>
                        </div>
                        <Badge className={`text-xs ${rc.bg} ${rc.color} border-0`}>
                          <Star className="w-2.5 h-2.5 me-1" />
                          {rc.label}
                        </Badge>
                      </div>
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground">{entry.lessonCovered}</p>
                      </div>
                      {entry.notes && (
                        <p className="text-xs text-muted-foreground mt-1.5 italic ps-5">{entry.notes}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(entry.sessionDate).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
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
