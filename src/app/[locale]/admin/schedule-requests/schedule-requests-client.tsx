"use client";

import { useState, useCallback, useEffect, startTransition } from "react";
import { Calendar, CheckCircle, XCircle, Clock, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ScheduleRequest = {
  id: string;
  status: string;
  timezone: string;
  preferredDays: string[];
  preferredTime: { start: string; end: string } | null;
  createdAt: string;
  studentName: string;
  studentId: string;
  teacherName: string;
  teacherId: string;
  courseName: string;
  courseType: string;
};

type Tab = "all" | "pending" | "approved" | "rejected";

const statusConfig: Record<string, { color: string; bg: string; label: string; icon: typeof Clock }> = {
  pending: { color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", label: "Pending Approval", icon: Clock },
  approved: { color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", label: "Approved", icon: CheckCircle },
  rejected: { color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", label: "Rejected", icon: XCircle },
};

export function ScheduleRequestsClient() {
  const [requests, setRequests] = useState<ScheduleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(() => {
    fetch("/api/admin/schedule-requests")
      .then((r) => r.json())
      .then((d) => setRequests(d.requests ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    startTransition(() => setLoading(true));
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/schedule-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = tab === "all" ? requests : requests.filter((r) => r.status === tab);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: requests.length },
    { key: "pending", label: "Pending", count: requests.filter((r) => r.status === "pending").length },
    { key: "approved", label: "Approved", count: requests.filter((r) => r.status === "approved").length },
    { key: "rejected", label: "Rejected", count: requests.filter((r) => r.status === "rejected").length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Schedule Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and approve student schedule requests
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
          <RefreshCw className={`w-4 h-4 me-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No schedule requests in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const cfg = statusConfig[req.status] ?? statusConfig.pending;
            const StatusIcon = cfg.icon;
            return (
              <div key={req.id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Student & Teacher */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">
                        {req.studentName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        (TBA-{req.studentId.substring(0, 8).toUpperCase()})
                      </span>
                      <span className="text-xs text-muted-foreground">→ Teacher:</span>
                      <span className="text-sm font-medium text-foreground">
                        {req.teacherName}
                      </span>
                    </div>

                    {/* Course */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {req.courseName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {req.timezone}
                      </span>
                    </div>

                    {/* Preferences */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {req.preferredDays.length > 0 && (
                        <span>
                          Days: {req.preferredDays.map((d) => d.slice(0, 3)).join(", ")}
                        </span>
                      )}
                      {req.preferredTime && (
                        <span>
                          Time: {req.preferredTime.start} – {req.preferredTime.end}
                        </span>
                      )}
                      <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </span>
                    {req.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={actionLoading === req.id}
                          onClick={() => handleAction(req.id, "approved")}
                        >
                          <CheckCircle className="w-3.5 h-3.5 me-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                          disabled={actionLoading === req.id}
                          onClick={() => handleAction(req.id, "rejected")}
                        >
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
