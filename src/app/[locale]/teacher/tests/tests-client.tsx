"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ClipboardCheck, CheckCircle2, Clock, Bot, MessageSquare, Eye, Inbox } from "lucide-react";

interface Test {
  id: string;
  studentName: string;
  courseName: string;
  weekNumber: number;
  testDate: string | null;
  totalQuestions: number | null;
  correctAnswers: number | null;
  scorePercentage: string | null;
  teacherFeedback: string | null;
  aiFeedback: string | null;
}

const filterTabs = ["all", "pending", "graded"] as const;

export function TestsClient({ tests }: { tests: Test[] }) {
  const t = useTranslations("teacher");
  const [filter, setFilter] = useState<string>("all");

  const filtered = tests.filter((test) => {
    if (filter === "all") return true;
    if (filter === "pending") return !test.scorePercentage;
    return !!test.scorePercentage;
  });

  const pendingCount = tests.filter((t) => !t.scorePercentage).length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
          <ClipboardCheck className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("testsTitle")}</h1>
          <p className="text-sm text-muted-foreground">{pendingCount} {t("pending")}</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex gap-1">
        {filterTabs.map((tab) => (
          <button key={tab} onClick={() => setFilter(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300" : "text-muted-foreground hover:bg-muted"}`}>
            {t(tab)}
          </button>
        ))}
      </motion.div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">{t("noTestsYet")}</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="space-y-3">
          {filtered.map((test) => {
            const isGraded = !!test.scorePercentage;
            const score = test.scorePercentage ? parseFloat(test.scorePercentage) : null;
            return (
              <div key={test.id} className={`rounded-xl border p-4 ${!isGraded ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800" : "bg-card"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isGraded ? "bg-emerald-100 dark:bg-emerald-900" : "bg-amber-100 dark:bg-amber-900"}`}>
                      {isGraded ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Clock className="w-5 h-5 text-amber-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{test.studentName}</p>
                      <p className="text-xs text-muted-foreground">{test.courseName} — {t("week")} {test.weekNumber}{test.testDate ? ` — ${new Date(test.testDate).toLocaleDateString()}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {score !== null && (
                      <div className={`px-3 py-1 rounded-lg text-sm font-bold ${score >= 85 ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" : score >= 70 ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"}`}>{score}%</div>
                    )}
                    <Badge variant="outline" className={isGraded ? "border-emerald-300 text-emerald-700 dark:text-emerald-400" : "border-amber-300 text-amber-700 dark:text-amber-400"}>
                      {isGraded ? t("graded") : t("pending")}
                    </Badge>
                  </div>
                </div>
                {isGraded && test.teacherFeedback && (
                  <div className="mt-3 pt-3 border-t flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">{test.teacherFeedback}</p>
                    </div>
                    {test.aiFeedback && (
                      <div className="flex-1 flex items-start gap-2">
                        <Bot className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground">{test.aiFeedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
