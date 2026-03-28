"use client";

import { useState } from "react";
import { Disc, Inbox, Clock, User, Download, Trash2 } from "lucide-react";

type RecordingItem = {
  id: string;
  teacherName: string;
  studentName: string;
  recordingUrl: string;
  duration: number | null;
  sessionDate: string;
  expiresAt: string;
  isDeleted: boolean;
};

type Tab = "active" | "expired" | "all";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function daysRemaining(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export function AdminRecordingsClient({ recordings }: { recordings: RecordingItem[] }) {
  const [tab, setTab] = useState<Tab>("active");

  const filtered =
    tab === "all"
      ? recordings
      : tab === "active"
      ? recordings.filter((r) => !r.isDeleted)
      : recordings.filter((r) => r.isDeleted);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "active", label: "Active", count: recordings.filter((r) => !r.isDeleted).length },
    { key: "expired", label: "Deleted", count: recordings.filter((r) => r.isDeleted).length },
    { key: "all", label: "All", count: recordings.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Disc className="w-6 h-6 text-red-600" />
          All Recordings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage all class recordings across the platform
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t.label}
            <span className="ms-2 text-xs opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No recordings in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rec) => {
            const days = daysRemaining(rec.expiresAt);
            return (
              <div
                key={rec.id}
                className={`rounded-xl border bg-card p-4 ${
                  rec.isDeleted ? "opacity-60" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-1 text-sm">
                      <span className="flex items-center gap-1 text-foreground font-medium">
                        <User className="w-3.5 h-3.5" />
                        Teacher: {rec.teacherName}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <User className="w-3.5 h-3.5" />
                        Student: {rec.studentName}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {new Date(rec.sessionDate).toLocaleDateString()} at{" "}
                        {new Date(rec.sessionDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>{formatDuration(rec.duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {rec.isDeleted ? (
                      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                        <Trash2 className="w-3 h-3" />
                        Deleted
                      </span>
                    ) : (
                      <>
                        <span
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                            days <= 1
                              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              : days <= 3
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {days}d left
                        </span>
                        <a
                          href={rec.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </a>
                      </>
                    )}
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
