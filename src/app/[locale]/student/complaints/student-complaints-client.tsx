"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, Send, Inbox, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Complaint {
  id: string;
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

export function StudentComplaintsClient({ complaints: initialComplaints }: { complaints: Complaint[] }) {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [tab, setTab] = useState<"submit" | "history">("submit");

  // Form state
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("teacher");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      setError("Please fill in the subject and description.");
      return;
    }
    setSaving(true); setError(""); setSubmitted(false);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, description }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to submit"); return; }
      setSubmitted(true);
      setSubject(""); setDescription(""); setCategory("teacher");
      const refreshed = await fetch("/api/complaints").then((r) => r.json());
      if (refreshed.complaints) setComplaints(refreshed.complaints);
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-amber-600" />
          Submit a Complaint
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Share any issue or concern — our admin team will review it promptly.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: "submit",  label: "Submit New" },
          { key: "history", label: `My Complaints (${complaints.length})` },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as "submit" | "history")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "submit" ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card p-6 space-y-4">

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
              <p className="text-base font-semibold text-foreground">Complaint Submitted Successfully!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Aapki complaint submit ho gayi. Admin jald review karega.
              </p>
              <Button className="mt-4" onClick={() => setSubmitted(false)}>Submit Another</Button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Subject *</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Teacher Issue, Schedule Problem, Technical Problem..."
                  className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="teacher">Teacher se related</option>
                  <option value="schedule">Schedule se related</option>
                  <option value="technical">Technical issue</option>
                  <option value="fees">Fees se related</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Description *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  rows={5} placeholder="Please describe your issue in detail..."
                  className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <Button onClick={handleSubmit} disabled={saving} className="gap-2">
                <Send className="w-4 h-4" />
                {saving ? "Submitting..." : "Submit Complaint"}
              </Button>
            </>
          )}
        </motion.div>
      ) : (
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">Complaint History</h2>
          {complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Inbox className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-sm">No complaints submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((c) => {
                const sc = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.new;
                return (
                  <div key={c.id} className="rounded-lg border bg-muted/10 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm text-foreground">{c.subject}</span>
                          <Badge className="text-xs bg-muted text-muted-foreground border-0">
                            {CATEGORY_LABELS[c.category] ?? c.category}
                          </Badge>
                          <Badge className={`text-xs ${sc.bg} ${sc.color} border-0`}>{sc.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                        {c.adminNote && (
                          <div className="mt-2 flex items-start gap-1.5 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 rounded-lg px-2.5 py-1.5">
                            <MessageSquare className="w-3 h-3 shrink-0 mt-0.5" />
                            <span><strong>Admin note:</strong> {c.adminNote}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
