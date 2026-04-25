"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  Languages,
  GraduationCap,
  ChevronRight,
  Clock,
  Plus,
} from "lucide-react";

const courseIcons: Record<string, typeof BookOpen> = {
  nazra: BookOpen,
  hifz: Sparkles,
  arabic: Languages,
  aalim: GraduationCap,
};

interface Course {
  id: string;
  name: string;
  courseType: string;
  status: string;
  planType: string;
  trialEndDate: string | null;
  createdAt: string;
  color: string;
  bgColor: string;
  iconColor: string;
}

export function CoursesClient({
  courses,
  locale,
}: {
  courses: Course[];
  locale: string;
}) {
  const t = useTranslations("dashboard");
  const [now] = useState(() => Date.now());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("myCourses")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("enrolledCourses")}: {courses.length}
          </p>
        </div>
        <Link href="/courses">
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            {t("exploreCourses")}
          </Button>
        </Link>
      </div>

      {/* No courses */}
      {courses.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-12 text-center">
          <BookOpen className="w-12 h-12 text-primary mx-auto" />
          <h3 className="mt-4 text-lg font-bold text-foreground">
            {t("noCourses") ?? "No courses enrolled yet"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            {t("noCoursesDesc") ?? "Explore our courses and start your free 5-day trial today!"}
          </p>
          <Link href="/courses">
            <Button className="mt-4 bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" />
              {t("exploreCourses") ?? "Explore Courses"}
            </Button>
          </Link>
        </div>
      )}

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course, i) => {
          const Icon = courseIcons[course.courseType] || BookOpen;
          const trialDaysLeft = course.trialEndDate
            ? Math.max(0, Math.ceil((new Date(course.trialEndDate).getTime() - now) / (1000 * 60 * 60 * 24)))
            : null;

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Top Bar */}
              <div className={`h-1.5 ${course.color}`} />

              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${course.bgColor} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${course.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground">
                      {course.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {course.planType === "human_ai" ? "Human + AI" : "Pure AI"}
                      </Badge>
                      <Badge
                        variant={course.status === "trial" ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {course.status === "trial" ? "Free Trial" : course.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Trial Info */}
                {course.status === "trial" && trialDaysLeft !== null && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-700 dark:text-amber-400 font-medium">
                        {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} remaining in free trial
                      </span>
                    </div>
                  </div>
                )}

                {/* Enrolled Date */}
                <p className="mt-4 text-xs text-muted-foreground">
                  {t("enrolledOn") ?? "Enrolled"}: {new Date(course.createdAt).toLocaleDateString(locale, {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </p>

                {/* Actions */}
                <div className="mt-4 flex gap-3">
                  <Link href={`/student/courses/${course.id}`} className="flex-1">
                    <Button className="w-full bg-primary hover:bg-primary/90 gap-2">
                      {t("continueLesson")}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
