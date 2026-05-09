"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Inbox, Clock, Search as SearchIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Complaint = {
  complaint: {
    id: string;
    subject: string;
    category: string;
    description: string;
    status: string;
    adminNotes: string | null;
    resolvedAt: string | null;
    createdAt: string;
  };
  student: { fullName: string };
};

const statusConfig = {
  new: { label: "New", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", icon: Clock },
  in_review: { label: "In Review", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", icon: SearchIcon },
  resolved: { label: "Resolved", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: CheckCircle2 },
};

function ComplaintCard({ item, onUpdate }: { item: Complaint; onUpdate: () => void }) {
  const [editNotes, setEditNotes] = useState(item.complaint.adminNotes ?? "");
  const [updating, setUpdating] = useState(false);
  const cfg = statusConfig[item.complaint.status as keyof typeof statusConfig] ?? statusConfig.new;
  const StatusIcon = cfg.icon;

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      await fetch(`/api/admin/complaints/${item.complaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: editNotes }),
      });
      onUpdate();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground capitalize">{item.complaint.category}</span>
            <span className="font-semibold text-foreground text-sm">{item.complaint.subject}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">Student: {item.student.fullName}</p>
          <p className="text-sm text-muted-foreground">{item.complaint.description}</p>
          <p className="text-xs text-muted-foreground mt-1">{new Date(item.complaint.createdAt).toLocaleDateString()}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </span>
      </div>

      {/* Admin Notes */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Admin Notes / Response</label>
        <textarea
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
          rows={2}
          placeholder="Add notes or response for the student..."
          className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Actions */}
      {item.complaint.status !== "resolved" && (
        <div className="flex gap-2 flex-wrap">
          {item.complaint.status === "new" && (
            <Button size="sm" variant="outline" onClick={() => updateStatus("in_review")} disabled={updating} className="text-amber-600 border-amber-200">
              Mark In Review
            </Button>
          )}
          <Button size="sm" onClick={() => updateStatus("resolved")} disabled={updating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <CheckCircle2 className="w-3.5 h-3.5 me-1" />
            Mark Resolved
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "new" | "in_review" | "resolved">("all");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/complaints")
      .then((r) => r.json())
      .then((d) => setComplaints(d.complaints ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? complaints : complaints.filter((c) => c.complaint.status === filter);

  const counts = {
    all: complaints.length,
    new: complaints.filter((c) => c.complaint.status === "new").length,
    in_review: complaints.filter((c) => c.complaint.status === "in_review").length,
    resolved: complaints.filter((c) => c.complaint.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-600" />
          Student Complaints
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Review and resolve student complaints</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all", "new", "in_review", "resolved"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {f === "all" ? "All" : f === "new" ? "New" : f === "in_review" ? "In Review" : "Resolved"} ({counts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No complaints in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <ComplaintCard key={item.complaint.id} item={item} onUpdate={load} />
          ))}
        </div>
      )}
    </div>
  );
}
