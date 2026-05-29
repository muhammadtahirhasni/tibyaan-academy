"use client";

import { useState, useMemo } from "react";
import { TrendingUp, Search, Star, FileText, MessageCircle, Inbox, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ProgressEntry {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  lessonCovered: string;
  rating: string;
  notes: string | null;
  sessionDate: string;
}

const RATING_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  excellent:        { label: "Excellent",         color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900" },
  good:             { label: "Good",              color: "text-blue-700 dark:text-blue-400",       bg: "bg-blue-100 dark:bg-blue-900" },
  needs_improvement:{ label: "Needs Improvement", color: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-100 dark:bg-amber-900" },
};

function generateWhatsAppText(entries: ProgressEntry[], studentName: string): string {
  const lines = [
    `📊 *Progress Report — ${studentName}*`,
    `Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`,
    `Total Sessions: ${entries.length}`,
    "",
    ...entries.slice(0, 10).map((e) => {
      const rc = RATING_CONFIG[e.rating];
      return `📅 ${new Date(e.sessionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} — ${e.lessonCovered} — *${rc?.label ?? e.rating}*${e.notes ? `\n💬 ${e.notes}` : ""}`;
    }),
    "",
    "— Tibyaan Academy",
  ];
  return lines.join("\n");
}

function generatePDFContent(entries: ProgressEntry[], studentName: string, teacherName: string): void {
  const ratingRow = (r: string) => RATING_CONFIG[r]?.label ?? r;
  const rows = entries.map((e) =>
    `<tr>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;">${new Date(e.sessionDate).toLocaleDateString("en-GB")}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;">${e.lessonCovered}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;">${ratingRow(e.rating)}</td>
      <td style="padding:6px 8px;border:1px solid #e5e7eb;">${e.notes ?? "—"}</td>
    </tr>`
  ).join("");

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Progress Report — ${studentName}</title>
<style>body{font-family:Arial,sans-serif;padding:20px;color:#111;}h1{color:#059669;}table{width:100%;border-collapse:collapse;margin-top:16px;}th{background:#f3f4f6;padding:8px;border:1px solid #d1d5db;text-align:left;font-size:13px;}td{font-size:12px;}p{margin:4px 0;}</style>
</head>
<body>
<h1>📊 Progress Report</h1>
<p><strong>Student:</strong> ${studentName}</p>
<p><strong>Teacher:</strong> ${teacherName}</p>
<p><strong>Total Sessions:</strong> ${entries.length}</p>
<p><strong>Generated:</strong> ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
<table><thead><tr><th>Date</th><th>Lesson Covered</th><th>Rating</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<p style="margin-top:20px;color:#6b7280;font-size:11px;">— Tibyaan Academy</p>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `progress-${studentName.replace(/\s+/g, "-").toLowerCase()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminProgressClient({ entries }: { entries: ProgressEntry[] }) {
  const [searchStudent, setSearchStudent] = useState("");
  const [searchTeacher, setSearchTeacher] = useState("");

  const filtered = useMemo(() =>
    entries.filter((e) => {
      const matchStudent = !searchStudent || e.studentName.toLowerCase().includes(searchStudent.toLowerCase());
      const matchTeacher = !searchTeacher || e.teacherName.toLowerCase().includes(searchTeacher.toLowerCase());
      return matchStudent && matchTeacher;
    }),
    [entries, searchStudent, searchTeacher]
  );

  // Get unique students for PDF/WA share
  const uniqueStudents = useMemo(() => {
    const map = new Map<string, { name: string; teacherName: string }>();
    entries.forEach((e) => {
      if (!map.has(e.studentId)) map.set(e.studentId, { name: e.studentName, teacherName: e.teacherName });
    });
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }));
  }, [entries]);

  const handleWhatsApp = (studentId: string, studentName: string) => {
    const studentEntries = entries.filter((e) => e.studentId === studentId);
    const text = generateWhatsAppText(studentEntries, studentName);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handlePDF = (studentId: string, studentName: string, teacherName: string) => {
    const studentEntries = entries.filter((e) => e.studentId === studentId);
    generatePDFContent(studentEntries, studentName, teacherName);
  };

  const ratingCfg = (r: string) => RATING_CONFIG[r] ?? RATING_CONFIG.good;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-red-600" />
          Track Progress — All Students
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View progress records for all students, generate PDF, and share via WhatsApp
        </p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Sessions", value: entries.length, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
          { label: "Students Tracked", value: uniqueStudents.length, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: "Excellent Ratings", value: entries.filter((e) => e.rating === "excellent").length, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: "Needs Improvement", value: entries.filter((e) => e.rating === "needs_improvement").length, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.bg} p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Per-student PDF/WhatsApp share */}
      {uniqueStudents.length > 0 && (
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h2 className="text-base font-semibold text-foreground">Report Actions per Student</h2>
          <div className="space-y-2">
            {uniqueStudents.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/20 border">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Teacher: {s.teacherName} · {entries.filter((e) => e.studentId === s.id).length} sessions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => handlePDF(s.id, s.name, s.teacherName)}
                    className="gap-1 text-xs h-8">
                    <FileText className="w-3.5 h-3.5" /> PDF
                  </Button>
                  <Button size="sm" onClick={() => handleWhatsApp(s.id, s.name)}
                    className="gap-1 text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Filter by Student Name..."
            value={searchStudent} onChange={(e) => setSearchStudent(e.target.value)}
            className="w-full ps-9 pe-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Filter by Teacher Name..."
            value={searchTeacher} onChange={(e) => setSearchTeacher(e.target.value)}
            className="w-full ps-9 pe-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      {/* Entries list */}
      <div className="rounded-xl border bg-card p-6 space-y-3">
        <h2 className="text-base font-semibold text-foreground">All Progress Entries ({filtered.length})</h2>
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No progress records found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => {
              const rc = ratingCfg(entry.rating);
              return (
                <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/10">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{entry.studentName}</span>
                      <span className="text-xs text-muted-foreground">→ {entry.teacherName}</span>
                      <Badge className={`text-xs ${rc.bg} ${rc.color} border-0`}>
                        <Star className="w-2.5 h-2.5 me-1" />{rc.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{entry.lessonCovered}</p>
                    {entry.notes && <p className="text-xs text-muted-foreground italic mt-0.5">{entry.notes}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(entry.sessionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
