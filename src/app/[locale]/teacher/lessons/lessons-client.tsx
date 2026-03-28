"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Clock, StickyNote, Inbox } from "lucide-react";

interface Lesson {
  id: string;
  studentName: string;
  courseName: string;
  courseType: string;
  lessonNumber: number;
  lessonType: string;
  isCompleted: boolean;
  completedAt: string | null;
  teacherNotes: string | null;
}

const courseTabs = ["all", "nazra", "hifz", "arabic", "aalim"] as const;

export function LessonsClient({ lessons }: { lessons: Lesson[] }) {
  const t = useTranslations("teacher");
  const [activeTab, setActiveTab] = useState<string>("all");

  const filtered = activeTab === "all" ? lessons : lessons.filter((l) => l.courseType === activeTab);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("lessonManagement")}</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} lessons</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex gap-1 overflow-x-auto pb-1">
        {courseTabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" : "text-muted-foreground hover:bg-muted"}`}>
            {tab === "all" ? t("all") : t(tab)}
          </button>
        ))}
      </motion.div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">{t("noLessonsYet")}</p>
        </div>
      ) : (
        <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-3">
          {filtered.map((lesson) => {
            const completed = lesson.isCompleted;
            return (
              <div key={lesson.id} className={`rounded-xl border p-4 ${completed ? "bg-emerald-50/50 dark:bg-emerald-950/20" : "bg-blue-50/50 dark:bg-blue-950/20"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-card border flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-foreground">#{lesson.lessonNumber}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{lesson.courseName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{lesson.studentName}</p>
                      {lesson.teacherNotes && (
                        <div className="flex items-center gap-1 mt-1">
                          <StickyNote className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{lesson.teacherNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={completed ? "text-emerald-600" : "text-blue-600"}>
                      {completed ? <CheckCircle2 className="w-3 h-3 me-1" /> : <Clock className="w-3 h-3 me-1" />}
                      {completed ? t("completed") : t("inProgress")}
                    </Badge>
                    {!completed && (
                      <Button size="sm" variant="outline" className="text-xs h-7 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                        {t("markLessonComplete")}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
