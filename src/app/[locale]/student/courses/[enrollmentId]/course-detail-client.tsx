"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  BookOpen,
  Check,
  Play,
  ChevronLeft,
  Sparkles,
  Languages,
  GraduationCap,
  Bot,
  ChevronDown,
} from "lucide-react";
import { getSyllabus } from "@/lib/data/course-syllabus";

const courseIcons: Record<string, typeof BookOpen> = {
  nazra: BookOpen,
  hifz: Sparkles,
  arabic: Languages,
  aalim: GraduationCap,
};

const courseColors: Record<string, { bg: string; icon: string; bar: string }> = {
  nazra: { bg: "bg-emerald-50 dark:bg-emerald-950", icon: "text-emerald-600", bar: "bg-emerald-500" },
  hifz: { bg: "bg-amber-50 dark:bg-amber-950", icon: "text-amber-600", bar: "bg-amber-500" },
  arabic: { bg: "bg-blue-50 dark:bg-blue-950", icon: "text-blue-600", bar: "bg-blue-500" },
  aalim: { bg: "bg-purple-50 dark:bg-purple-950", icon: "text-purple-600", bar: "bg-purple-500" },
};

interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  isCompleted: boolean;
  completedAt: string | null;
  lessonType: string;
}

interface CourseDetailProps {
  courseName: string;
  courseDescription: string;
  courseType: string;
  status: string;
  planType: string;
  lessons: Lesson[];
  progress: number;
  completedCount: number;
  totalCount: number;
}

export function CourseDetailClient({
  courseName,
  courseDescription,
  courseType,
  status,
  planType,
  lessons,
  progress,
  completedCount,
  totalCount,
}: CourseDetailProps) {
  const t = useTranslations("dashboard");
  const ts = useTranslations("courseDetail");
  const Icon = courseIcons[courseType] || BookOpen;
  const colors = courseColors[courseType] || courseColors.nazra;
  const syllabus = getSyllabus(courseType);
  const isHifz = courseType === "hifz";
  const [showAllSyllabus, setShowAllSyllabus] = useState(false);
  const visibleSyllabus = isHifz && !showAllSyllabus ? syllabus.slice(0, 5) : syllabus;

  // Determine current lesson (first incomplete)
  const currentLessonIndex = lessons.findIndex((l) => !l.isCompleted);

  return (
    <div className="space-y-6">
      {/* Back Button + Header */}
      <div>
        <Link
          href="/student/courses"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("myCourses")}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center`}>
                <Icon className={`w-7 h-7 ${colors.icon}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{courseName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {planType === "human_ai" ? "Human + AI" : "Pure AI"}
                  </Badge>
                  <Badge variant={status === "trial" ? "secondary" : "default"} className="text-xs">
                    {status === "trial" ? "Free Trial" : status}
                  </Badge>
                </div>
              </div>
            </div>
            <Link href="/student/ai-ustaz">
              <Button variant="outline" size="sm" className="gap-2">
                <Bot className="w-4 h-4" />
                {t("askAI")}
              </Button>
            </Link>
          </div>

          {courseDescription && (
            <p className="mt-4 text-sm text-muted-foreground">{courseDescription}</p>
          )}

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">{t("courseProgress")}</span>
              <span className="font-bold text-foreground">{progress}%</span>
            </div>
            <div className="h-3 rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${colors.bar} transition-all duration-700`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {completedCount}/{totalCount} {t("completedLessons")}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Course Syllabus */}
      {syllabus.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t("syllabusOverview")}
          </h3>
          <div className="space-y-3">
            {visibleSyllabus.map((section) => (
              <div
                key={section.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{section.id}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {ts(section.titleKey)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ts(section.descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {isHifz && (
            <button
              onClick={() => setShowAllSyllabus(!showAllSyllabus)}
              className="flex items-center gap-2 mx-auto mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {showAllSyllabus ? t("showLess") : t("showAllParas")}
              <ChevronDown className={`w-4 h-4 transition-transform ${showAllSyllabus ? "rotate-180" : ""}`} />
            </button>
          )}
        </motion.div>
      )}

      {/* Lessons List */}
      {lessons.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t("lessonsList")}
          </h3>
          <div className="space-y-1">
            {lessons.map((lesson, i) => {
              const isCurrent = i === currentLessonIndex;
              const isLocked = !lesson.isCompleted && i > currentLessonIndex && currentLessonIndex !== -1;

              return (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                    isCurrent
                      ? "bg-primary/5 border border-primary/20"
                      : lesson.isCompleted
                        ? "text-muted-foreground"
                        : isLocked
                          ? "opacity-50"
                          : ""
                  }`}
                >
                  {lesson.isCompleted ? (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : isCurrent ? (
                    <Play className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-muted-foreground/30 shrink-0" />
                  )}
                  <span className={`flex-1 ${isCurrent ? "font-medium text-foreground" : ""}`}>
                    {lesson.lessonNumber}. {lesson.title}
                  </span>
                  {isCurrent && (
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      {t("lessonCurrent") ?? "Current"}
                    </Badge>
                  )}
                  {lesson.isCompleted && lesson.completedAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(lesson.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl border bg-card p-8 text-center"
        >
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="mt-3 text-lg font-semibold text-foreground">
            Lessons coming soon
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your teacher will add lessons to this course. In the meantime, you can use AI Ustaz to start learning!
          </p>
          <Link href="/student/ai-ustaz">
            <Button className="mt-4 gap-2">
              <Bot className="w-4 h-4" />
              {t("askAI")}
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
