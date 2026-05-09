"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Plus, Inbox, X, Clock, CheckCircle2, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Complaint = {
  id: string;
  subject: string;
  category: string;
  description: string;
  status: string;
  adminNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
};

const categories = ["teacher", "schedule", "technical", "fees", "other"] as const;

const statusConfig = {
  new: { label: "New", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", icon: Clock },
  in_review: { label: "In Review", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", icon: SearchIcon },
  resolved: { label: "Resolved", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: CheckCircle2 },
};

export default function StudentComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "other", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/student/complaints")
      .then((r) => r.json())
      .then((d) => setComplaints(d.complaints ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.subject || !form.description) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setShowForm(false);
        setForm({ subject: "", category: "other", description: "" });
        setTimeout(() => setSuccess(false), 4000);
        load();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Complaints</h1>
            <p className="text-sm text-muted-foreground">Submit and track your complaints</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 me-2" />
          New Complaint
        </Button>
      </div>

      {success && (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 text-sm text-emerald-700 dark:text-emerald-400">
          Your complaint has been submitted successfully. We will review it shortly.
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Submit a Complaint</h3>
            <button onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject *</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief subject of your complaint"
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500 capitalize"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Please describe your complaint in detail..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button
              onClick={submit}
              disabled={submitting || !form.subject || !form.description}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? "Submitting..." : "Submit Complaint"}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No complaints submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((item) => {
            const cfg = statusConfig[item.status as keyof typeof statusConfig] ?? statusConfig.new;
            const StatusIcon = cfg.icon;
            return (
              <div key={item.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground capitalize">{item.category}</span>
                      <h3 className="font-semibold text-foreground text-sm">{item.subject}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    {item.adminNotes && (
                      <div className="mt-2 rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">
                        <span className="font-medium">Admin response: </span>{item.adminNotes}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Submitted: {new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
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
