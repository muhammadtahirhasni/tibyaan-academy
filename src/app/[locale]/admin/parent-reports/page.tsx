"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Send,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  User,
  Phone,
} from "lucide-react";

interface ReportEntry {
  id: string;
  studentId: string;
  studentName: string;
  parentWhatsapp: string;
  status: "pending" | "sent" | "failed";
  sentAt: string | null;
  createdAt: string;
}

export default function ParentReportsPage() {
  const t = useTranslations("parentReports");
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [studentIdInput, setStudentIdInput] = useState("");
  const [bulkSending, setBulkSending] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookedUpStudent, setLookedUpStudent] = useState<{
    id: string;
    name: string;
    email: string;
    parentWhatsapp: string | null;
    studentCode: string;
  } | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/parent-reports/history");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleLookup = async () => {
    if (!studentIdInput.trim()) return;
    setLookupLoading(true);
    setLookedUpStudent(null);
    setLookupError(null);
    try {
      const res = await fetch(`/api/parent-reports/lookup?studentId=${encodeURIComponent(studentIdInput.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setLookedUpStudent(data.student);
      } else {
        const err = await res.json();
        setLookupError(err.error || "Student not found");
      }
    } catch {
      setLookupError("Lookup failed");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSendSingle = async (studentId?: string) => {
    const targetId = studentId || lookedUpStudent?.id || studentIdInput.trim();
    if (!targetId) return;
    setSendingId(targetId);
    try {
      const res = await fetch("/api/parent-reports/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: targetId }),
      });
      if (res.ok) {
        setStudentIdInput("");
        setLookedUpStudent(null);
        fetchReports();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to send");
      }
    } catch {
      alert("Failed to send report");
    } finally {
      setSendingId(null);
    }
  };

  const handleBulkSend = async () => {
    setBulkSending(true);
    try {
      const res = await fetch("/api/parent-reports/weekly");
      if (res.ok) {
        const data = await res.json();
        alert(
          `${t("bulkResult")}: ${data.sent} ${t("sent")}, ${data.failed} ${t("failed")}`
        );
        fetchReports();
      }
    } catch {
      alert("Bulk send failed");
    } finally {
      setBulkSending(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === "sent")
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === "failed")
      return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  const statusColor = (status: string) => {
    if (status === "sent") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50";
    if (status === "failed") return "bg-red-100 text-red-700 dark:bg-red-950/50";
    return "bg-amber-100 text-amber-700 dark:bg-amber-950/50";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border bg-card p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("sendReport")}
        </h3>

        {/* Student Lookup */}
        <div className="space-y-3 mb-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={studentIdInput}
                onChange={(e) => {
                  setStudentIdInput(e.target.value);
                  setLookedUpStudent(null);
                  setLookupError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                placeholder={t("studentIdPlaceholder")}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleLookup}
              disabled={lookupLoading || !studentIdInput.trim()}
              className="gap-2"
            >
              <Search className="w-4 h-4" />
              {lookupLoading ? "Searching..." : "Lookup"}
            </Button>
          </div>

          {lookupError && (
            <p className="text-sm text-red-500">{lookupError}</p>
          )}

          {lookedUpStudent && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{lookedUpStudent.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{lookedUpStudent.studentCode}</p>
                </div>
              </div>
              {lookedUpStudent.parentWhatsapp ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{lookedUpStudent.parentWhatsapp}</span>
                </div>
              ) : (
                <p className="text-xs text-amber-600">No parent WhatsApp on file</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSendSingle(lookedUpStudent.id)}
                  disabled={!!sendingId || !lookedUpStudent.parentWhatsapp}
                  className="gap-2"
                >
                  <Send className="w-3 h-3" />
                  {sendingId === lookedUpStudent.id ? t("sending") : "Send This Week's Report"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Bulk send */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
          <div>
            <p className="text-sm font-medium text-foreground">
              {t("bulkSendTitle")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("bulkSendDesc")}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleBulkSend}
            disabled={bulkSending}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            {bulkSending ? t("sending") : t("sendAll")}
          </Button>
        </div>
      </motion.div>

      {/* Report History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border bg-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {t("history")}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchReports}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {t("loading")}
          </p>
        ) : reports.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {t("noReports")}
          </p>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {statusIcon(report.status)}
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {report.studentName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {report.parentWhatsapp}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusColor(report.status)}>
                    {t(report.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
