"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  User,
  BookOpen,
  Brain,
  Gamepad2,
  MessageSquare,
  StickyNote,
  ArrowLeft,
  Mail,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

const studentData = {
  name: "Ahmed Ali",
  email: "ahmed@example.com",
  course: "Nazra Quran",
  plan: "Human + AI",
  level: "Level 3",
  enrolledDate: "2025-09-01",
};

const tabs = ["progressTab", "hifzTab", "activitiesTab", "chatTab", "notesTab"] as const;
const tabIcons = [BookOpen, Brain, Gamepad2, MessageSquare, StickyNote];

const mockNotes = [
  { date: "2026-03-20", text: "Great progress on Tajweed rules. Needs more practice on Idgham." },
  { date: "2026-03-15", text: "Completed Level 2 assessment with 92% score. MashaAllah!" },
];

export default function StudentDetailPage() {
  const t = useTranslations("teacher");
  const [activeTab, setActiveTab] = useState<string>("progressTab");
  const [noteText, setNoteText] = useState("");

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/teacher/students">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t("allStudents")}
        </Button>
      </Link>

      {/* Student Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl border bg-card p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
            <User className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{studentData.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{studentData.email}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:text-emerald-400">
                {studentData.course}
              </Badge>
              <Badge variant="outline">{studentData.plan}</Badge>
              <Badge variant="outline">{studentData.level}</Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border bg-card p-6"
      >
        {activeTab === "progressTab" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">{t("courseCompletion")}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">Nazra Quran</span>
                  <span className="text-muted-foreground">65%</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: "65%" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">26</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("lessonsCompleted")}</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">40</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Lessons</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "hifzTab" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">{t("hifzTab")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">12</p>
                <p className="text-xs text-muted-foreground mt-1">{t("surahsMemorized")}</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">487</p>
                <p className="text-xs text-muted-foreground mt-1">{t("ayaatMemorized")}</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">88%</p>
                <p className="text-xs text-muted-foreground mt-1">{t("averageScore")}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activitiesTab" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">{t("activitiesTab")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">45</p>
                <p className="text-xs text-muted-foreground mt-1">{t("gamesPlayed")}</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-amber-500" />
                  <p className="text-2xl font-bold text-amber-600">238</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t("totalStars")}</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">92%</p>
                <p className="text-xs text-muted-foreground mt-1">{t("averageScore")}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "chatTab" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{t("chatTab")}</h3>
            <div className="rounded-lg border p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground">
                AI Chat history for this student will be displayed here. Recent conversations with the AI Ustaz can be reviewed.
              </p>
            </div>
          </div>
        )}

        {activeTab === "notesTab" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{t("notesTab")}</h3>

            {/* Add Note */}
            <div className="space-y-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={t("notePlaceholder")}
                className="w-full p-3 rounded-lg border bg-background text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setNoteText("")}
              >
                {t("saveNote")}
              </Button>
            </div>

            {/* Existing Notes */}
            <div className="space-y-3 mt-4">
              {mockNotes.map((note, i) => (
                <div key={i} className="p-4 rounded-lg border bg-muted/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">{note.date}</span>
                  </div>
                  <p className="text-sm text-foreground">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
