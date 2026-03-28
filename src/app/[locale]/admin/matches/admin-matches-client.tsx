"use client";

import { useState } from "react";
import { Users, Inbox, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";

type MatchItem = {
  id: string;
  studentName: string;
  teacherName: string;
  courseName: string;
  status: string;
  createdAt: string;
  respondedAt: string | null;
};

type Tab = "all" | "requested" | "accepted" | "active" | "rejected" | "completed";

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  requested: { color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900", label: "Pending" },
  accepted: { color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900", label: "Accepted" },
  active: { color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900", label: "Active" },
  rejected: { color: "text-red-600", bg: "bg-red-100 dark:bg-red-900", label: "Rejected" },
  completed: { color: "text-muted-foreground", bg: "bg-muted", label: "Completed" },
};

export function AdminMatchesClient({ matches }: { matches: MatchItem[] }) {
  const [tab, setTab] = useState<Tab>("all");

  const filtered = tab === "all" ? matches : matches.filter((m) => m.status === tab);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: matches.length },
    { key: "requested", label: "Pending", count: matches.filter((m) => m.status === "requested").length },
    { key: "active", label: "Active", count: matches.filter((m) => m.status === "active").length },
    { key: "accepted", label: "Accepted", count: matches.filter((m) => m.status === "accepted").length },
    { key: "rejected", label: "Rejected", count: matches.filter((m) => m.status === "rejected").length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-red-600" />
          Student-Teacher Matches
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Oversee all student-teacher matching activity
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
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No matches in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((match) => {
            const cfg = statusConfig[match.status] ?? statusConfig.requested;
            return (
              <div key={match.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-foreground">
                        {match.studentName}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {match.teacherName}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {match.courseName}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      <div>{new Date(match.createdAt).toLocaleDateString()}</div>
                      {match.respondedAt && (
                        <div className="text-[10px]">
                          Responded: {new Date(match.respondedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
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
