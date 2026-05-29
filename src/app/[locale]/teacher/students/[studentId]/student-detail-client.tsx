"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  User, BookOpen, Brain, Gamepad2, MessageSquare,
  StickyNote, ArrowLeft, Mail, CheckCircle2, Star, Save,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

interface StudentDetailClientProps {
  student: {
    id: string;
    name: string;
    email: string;
    enrolledDate: string;
    course: string;
    plan: string;
    enrollmentStatus: string;
  };
  progress: { completedLessons: number; totalLessons: number; progressPct: number };
  hifz: {
    uniqueSurahs: number;
    totalAyaatMemorized: number;
    avgScore: number;
    recentRecords: Array<{
      surahNumber: number;
      ayahFrom: number;
      ayahTo: number;
      score: number | null;
      type: string;
      date: string;
    }>;
  };
  activities: { gamesPlayed: number };
  notes: Array<{ date: string; title: string; notes: string }>;
}

const tabs = ["progressTab", "hifzTab", "activitiesTab", "chatTab", "notesTab"] as const;
const tabIcons = [BookOpen, Brain, Gamepad2, MessageSquare, StickyNote];

export function StudentDetailClient({
  student, progress, hifz, activities, notes,
}: StudentDetailClientProps) {
  const t = useTranslations("teacher");
  const [activeTab, setActiveTab] = useState<string>("progressTab");
  const [noteText, setNoteText] = useState("");

  return (
    <div className="space-y-6">
      <Link href="/teacher/students">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t("allStudents")}
        </Button>
      </Link>

      {/* Student Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl border bg-card p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
            <User className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{student.email}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:text-emerald-400">
                {student.course}
              </Badge>
              {student.plan && student.plan !== "—" && (
                <Badge variant="outline">{student.plan}</Badge>
              )}
              <Badge variant="outline" className={student.enrollmentStatus === "active" ? "border-blue-300 text-blue-700" : ""}>
                {student.enrollmentStatus}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Since {new Date(student.enrolledDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-1 overflow-x-auto pb-1"
      >
        {tabs.map((tab, i) => {
          const Icon = tabIcons[i];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t(tab)}
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border bg-card p-6"
      >
        {activeTab === "progressTab" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">{t("courseCompletion")}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">{student.course}</span>
                  <span className="text-muted-foreground">{progress.progressPct}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${progress.progressPct}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{progress.completedLessons}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("lessonsCompleted")}</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{progress.totalLessons || "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Lessons</p>
                </div>
              </div>
              {progress.totalLessons === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No lessons recorded yet for this student.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "hifzTab" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">{t("hifzTab")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{hifz.uniqueSurahs}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("surahsMemorized")}</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{hifz.totalAyaatMemorized}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("ayaatMemorized")}</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {hifz.avgScore > 0 ? `${hifz.avgScore}%` : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t("averageScore")}</p>
              </div>
            </div>
            {hifz.recentRecords.length > 0 && (
              <div className="space-y-2 mt-2">
                <p className="text-sm font-medium text-foreground">Recent Hifz Entries</p>
                {hifz.recentRecords.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs">
                    <span>Surah {r.surahNumber} · Ayah {r.ayahFrom}–{r.ayahTo}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{r.type}</Badge>
                      {r.score != null && <span className="text-emerald-600 font-medium">{r.score}%</span>}
                      <span className="text-muted-foreground">{r.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {hifz.recentRecords.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No hifz records yet.</p>
            )}
          </div>
        )}

        {activeTab === "activitiesTab" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">{t("activitiesTab")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{activities.gamesPlayed}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("gamesPlayed")}</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-amber-500" />
                  <p className="text-2xl font-bold text-amber-600">—</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t("totalStars")}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "chatTab" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{t("chatTab")}</h3>
            <div className="rounded-lg border p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground">
                AI Chat history for {student.name} will appear here. Recent conversations with AI Ustaz can be reviewed.
              </p>
            </div>
          </div>
        )}

        {activeTab === "notesTab" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{t("notesTab")}</h3>
            <div className="space-y-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={t("notePlaceholder")}
                className="w-full p-3 rounded-lg border bg-background text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                onClick={() => setNoteText("")}
              >
                <Save className="w-4 h-4" />
                {t("saveNote")}
              </Button>
            </div>
            <div className="space-y-3 mt-4">
              {notes.length > 0 ? notes.map((note, i) => (
                <div key={i} className="p-4 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-medium text-foreground">{note.title}</span>
                    <span className="text-xs text-muted-foreground">{note.date}</span>
                  </div>
                  <p className="text-sm text-foreground">{note.notes}</p>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No lesson notes recorded yet. Add notes on completed lessons.
                </p>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
