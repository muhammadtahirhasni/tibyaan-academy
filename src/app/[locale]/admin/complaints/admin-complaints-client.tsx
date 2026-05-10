"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, Search, Inbox, User, MessageSquare, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  category: string;
  description: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new:       { label: "New",       color: "text-blue-700 dark:text-blue-400",   bg: "bg-blue-100 dark:bg-blue-900"   },
  in_review: { label: "In Review", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900" },
  resolved:  { label: "Resolved",  color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900" },
};

const CATEGORY_LABELS: Record<string, string> = {
  teacher:   "Teacher Issue",
  schedule:  "Schedule Issue",
  technical: "Technical Issue",
  fees:      "Fees Issue",
  other:     "Other",
};

export function AdminComplaintsClient({ complaints: initialComplaints }: { complaints: Complaint[] }) {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [searchStudent, setSearchStudent] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const filtered = useMemo(() =>
    complaints.filter((c) => {
      const ms = !searchStudent || c.studentName.toLowerCase().includes(searchStudent.toLowerCase());
      const mStatus = statusFilter === "all" || c.status === statusFilter;
      return ms && mStatus;
    }),
    [complaints, searchStudent, statusFilter]
  );

  const handleUpdate = async (id: string, status?: string) => {
    setSaving(id);
    const adminNote = noteInputs[id];
    await fetch("/api/complaints", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, adminNote }),
    });
    setComplaints((prev) => prev.map((c) =>
      c.id === id ? { ...c, ...(status ? { status } : {}), ...(adminNote !== undefined ? { adminNote } : {}) } : c
    ));
    setSaving(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          Student Complaints
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and respond to student complaints and issues
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "New",       value: complaints.filter((c) => c.status === "new").length,       color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950"    },
          { label: "In Review", value: complaints.filter((c) => c.status === "in_review").length, color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950"  },
          { label: "Resolved",  value: complaints.filter((c) => c.status === "resolved").length,  color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
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
          <input type="text" placeholder="Search by Student Name..."
            value={searchStudent} onChange={(e) => setSearchStudent(e.target.value)}
            className="w-full ps-9 pe-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="in_review">In Review</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 rounded-xl border bg-card">
            <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No complaints found.</p>
          </div>
        ) : filtered.map((c) => {
          const sc = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.new;
          const isExpanded = expandedId === c.id;
          return (
            <div key={c.id} className="rounded-xl border bg-card overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-foreground">{c.subject}</span>
                      <Badge className="text-xs bg-muted text-muted-foreground border-0">
                        {CATEGORY_LABELS[c.category] ?? c.category}
                      </Badge>
                      <Badge className={`text-xs ${sc.bg} ${sc.color} border-0`}>{sc.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <User className="w-3 h-3" />
                      <span>{c.studentName}</span>
                      <span>·</span>
                      <span>{new Date(c.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </div>
                    <p className={`text-xs text-muted-foreground ${!isExpanded ? "line-clamp-2" : ""}`}>{c.description}</p>
                  </div>
                  <button onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    className="text-xs text-primary shrink-0 hover:underline">
                    {isExpanded ? "Collapse" : "Expand"}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t pt-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-foreground">Update Status:</span>
                      {["new", "in_review", "resolved"].map((s) => (
                        <button key={s} onClick={() => handleUpdate(c.id, s)}
                          disabled={c.status === s || saving === c.id}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                            c.status === s
                              ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} border-transparent font-medium`
                              : "border-border text-muted-foreground hover:bg-muted"
                          }`}>
                          {STATUS_CONFIG[s].label}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Admin Note
                      </label>
                      <textarea
                        value={noteInputs[c.id] ?? c.adminNote ?? ""}
                        onChange={(e) => setNoteInputs((prev) => ({ ...prev, [c.id]: e.target.value }))}
                        rows={2}
                        placeholder="Internal note or response to student..."
                        className="w-full px-3 py-2 rounded-lg border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                      <Button size="sm" onClick={() => handleUpdate(c.id)} disabled={saving === c.id}
                        className="gap-1 h-8 text-xs">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {saving === c.id ? "Saving..." : "Save Note"}
                      </Button>
                    </div>

                    {c.adminNote && noteInputs[c.id] === undefined && (
                      <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 rounded-lg px-2.5 py-1.5">
                        <strong>Current note:</strong> {c.adminNote}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
