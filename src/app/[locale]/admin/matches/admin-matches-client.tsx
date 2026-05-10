"use client";

import { useState } from "react";
import { Users, Inbox, ArrowRight, Calendar, Clock, BookOpen, Link2, CheckCircle, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type MatchItem = {
  id: string;
  studentName: string;
  teacherName: string;
  courseName: string;
  status: string;
  days: string;
  time: string;
  timezone: string;
  createdAt: string;
  classCount: number;
  zoomLink: string | null;
  matchId: string | null;
};

type Tab = "all" | "approved" | "rejected" | "pending";

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  approved:  { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900", label: "Active" },
  confirmed: { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900", label: "Confirmed" },
  pending:   { color: "text-amber-700 dark:text-amber-400",   bg: "bg-amber-100 dark:bg-amber-900",   label: "Pending" },
  suggested: { color: "text-blue-700 dark:text-blue-400",     bg: "bg-blue-100 dark:bg-blue-900",     label: "Suggested" },
  rejected:  { color: "text-red-700 dark:text-red-400",       bg: "bg-red-100 dark:bg-red-900",       label: "Rejected" },
};

function ZoomLinkEditor({ matchId, initialLink }: { matchId: string; initialLink: string | null }) {
  const [editing, setEditing] = useState(false);
  const [link, setLink] = useState(initialLink ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/matches/zoom", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, zoomLink: link }),
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="mt-2">
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://zoom.us/j/..."
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button size="sm" onClick={save} disabled={saving} className="h-7 text-xs px-3">
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-7 text-xs px-2">
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline truncate max-w-[200px]">
              <Link2 className="w-3 h-3 shrink-0" />
              Zoom Link Set
            </a>
          ) : (
            <span className="text-xs text-muted-foreground italic">No Zoom link</span>
          )}
          {saved && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
          <button onClick={() => setEditing(true)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <Pencil className="w-3 h-3" />
            {link ? "Edit" : "Set Zoom Link"}
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminMatchesClient({ matches }: { matches: MatchItem[] }) {
  const [tab, setTab] = useState<Tab>("all");

  const isActive = (s: string) => s === "approved" || s === "confirmed";
  const isPending = (s: string) => s === "pending" || s === "suggested";

  const filtered =
    tab === "all"      ? matches :
    tab === "approved" ? matches.filter((m) => isActive(m.status)) :
    tab === "rejected" ? matches.filter((m) => m.status === "rejected") :
                         matches.filter((m) => isPending(m.status));

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all",      label: "All",     count: matches.length },
    { key: "approved", label: "Active",  count: matches.filter((m) => isActive(m.status)).length },
    { key: "pending",  label: "Pending", count: matches.filter((m) => isPending(m.status)).length },
    { key: "rejected", label: "Rejected",count: matches.filter((m) => m.status === "rejected").length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-red-600" />
          Student-Teacher Matches & Zoom Links
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage active matches and set Zoom links for each Teacher–Student pair
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Requests",    value: matches.length,                                          color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950" },
          { label: "Active Matches",    value: matches.filter((m) => isActive(m.status)).length,         color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: "Pending",           value: matches.filter((m) => isPending(m.status)).length,        color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950" },
          { label: "With Zoom Link",    value: matches.filter((m) => m.zoomLink).length,                 color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.bg} p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
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
            const cfg = statusConfig[match.status] ?? statusConfig.pending;
            return (
              <div key={match.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-foreground">{match.studentName}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-semibold text-foreground">{match.teacherName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{match.courseName}</span>
                    </div>
                    {match.days && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {match.days}
                        </span>
                        {match.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {match.time} ({match.timezone})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Zoom Link Editor — only for active matches */}
                    {isActive(match.status) && match.matchId && (
                      <ZoomLinkEditor matchId={match.matchId} initialLink={match.zoomLink} />
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge className={`${cfg.bg} ${cfg.color} border-0`}>
                      {cfg.label}
                    </Badge>
                    {match.classCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {match.classCount} class{match.classCount !== 1 ? "es" : ""} scheduled
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(match.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
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
