"use client";

import { useState, useEffect } from "react";
import { ClipboardCheck, Inbox } from "lucide-react";

type ProgressEntry = {
  entry: {
    id: string;
    lessonCovered: string;
    rating: string;
    notes: string | null;
    entryDate: string;
  };
  teacher: { fullName: string };
};

const ratingConfig = {
  excellent: { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  good: { label: "Good", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  average: { label: "Average", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  needs_improvement: { label: "Needs Improvement", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
};

export default function StudentTrackProgressPage() {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/progress")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
          <ClipboardCheck className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Progress</h1>
          <p className="text-sm text-muted-foreground">Progress recorded by your teacher</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No progress entries yet. Your teacher will add entries after each class.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((item) => {
            const cfg = ratingConfig[item.entry.rating as keyof typeof ratingConfig] ?? ratingConfig.good;
            return (
              <div key={item.entry.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">Teacher: {item.teacher.fullName}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="font-medium text-foreground text-sm">{item.entry.lessonCovered}</p>
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
