"use client";

import { useState, useEffect } from "react";
import { CalendarClock, Inbox, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChangeRequest = {
  request: {
    id: string;
    newSchedule: { days: string[]; time: string; timezone: string };
    reason: string | null;
    status: string;
    adminNotes: string | null;
    createdAt: string;
  };
  studentName: string;
  teacherName: string;
};

const statusConfig = {
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", icon: Clock },
  approved: { label: "Approved", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", icon: XCircle },
};

export default function AdminScheduleChangeRequestsPage() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/schedule-change-requests")
      .then((r) => r.json())
      .then((d) => setRequests(d.requests ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handle = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/schedule-change-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      load();
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === "all" ? requests : requests.filter((r) => r.request.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CalendarClock className="w-6 h-6 text-blue-600" />
          Schedule Change Requests
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Review student schedule change requests</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {f} ({requests.filter((r) => f === "all" || r.request.status === f).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No requests in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const cfg = statusConfig[item.request.status as keyof typeof statusConfig] ?? statusConfig.pending;
            const StatusIcon = cfg.icon;
            const sched = item.request.newSchedule;
            return (
              <div key={item.request.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">{item.studentName}</span>
                      <span className="text-xs text-muted-foreground">→ Teacher: {item.teacherName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      New Schedule: {sched.days.join(", ")} at {sched.time} ({sched.timezone})
                    </p>
                    {item.request.reason && <p className="text-sm text-muted-foreground">Reason: {item.request.reason}</p>}
                    <p className="text-xs text-muted-foreground">{new Date(item.request.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    {item.request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={actionLoading === item.request.id}
                          onClick={() => handle(item.request.id, "approved")}>
                          <CheckCircle2 className="w-3.5 h-3.5 me-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200"
                          disabled={actionLoading === item.request.id}
                          onClick={() => handle(item.request.id, "rejected")}>
                          <XCircle className="w-3.5 h-3.5 me-1" />
                          Reject
                        </Button>
                      </div>
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
