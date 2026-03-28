"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Clock,
  BookOpen,
  LogIn,
  LogOut,
  Loader2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const categoryColors: Record<string, string> = {
  quran: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  hadith: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  fiqh: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  seerah: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  dua: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
};

const categoryLabels: Record<string, Record<string, string>> = {
  quran: { en: "Quran", ur: "\u0642\u0631\u0622\u0646", ar: "\u0627\u0644\u0642\u0631\u0622\u0646", fr: "Coran", id: "Al-Quran" },
  hadith: { en: "Hadith", ur: "\u062D\u062F\u06CC\u062B", ar: "\u0627\u0644\u062D\u062F\u064A\u062B", fr: "Hadith", id: "Hadits" },
  fiqh: { en: "Fiqh", ur: "\u0641\u0642\u06C1", ar: "\u0627\u0644\u0641\u0642\u0647", fr: "Fiqh", id: "Fikih" },
  seerah: { en: "Seerah", ur: "\u0633\u06CC\u0631\u062A", ar: "\u0627\u0644\u0633\u064A\u0631\u0629", fr: "Sira", id: "Sirah" },
  dua: { en: "Dua", ur: "\u062F\u0639\u0627", ar: "\u0627\u0644\u062F\u0639\u0627\u0621", fr: "Doua", id: "Doa" },
};

type CircleData = {
  circle: {
    id: string;
    titleUr: string | null;
    titleAr: string | null;
    titleEn: string | null;
    titleFr: string | null;
    titleId: string | null;
    category: string;
    scheduledAt: string;
    currentStudents: number;
    maxStudents: number;
    status: string;
    meetingLink: string | null;
  };
  teacher: {
    fullName: string;
  };
};

function getCircleTitle(circle: CircleData["circle"], locale: string): string {
  const key = `title${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof circle;
  return (circle[key] as string) || circle.titleEn || circle.titleUr || "Untitled";
}

export default function StudentDarsCirclesPage() {
  const t = useTranslations("darsCircles");
  const locale = useLocale();

  const [myCircles, setMyCircles] = useState<CircleData[]>([]);
  const [allCircles, setAllCircles] = useState<CircleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [myRes, allRes] = await Promise.all([
        fetch("/api/dars-circles?status=upcoming"),
        fetch("/api/dars-circles"),
      ]);
      const myData = await myRes.json();
      const allData = await allRes.json();

      // We need to find which circles the student has joined
      // For now, fetch all and mark joined ones from "my circles" tab
      setAllCircles(allData.circles || []);

      // Fetch student's own circles
      const studentRes = await fetch("/api/dars-circles?status=upcoming");
      const studentData = await studentRes.json();
      setMyCircles(studentData.circles || []);

      // We'll determine joined status from the my-circles list after we have it
      // Actually, let's just track join/leave locally
    } catch (err) {
      console.error("Failed to fetch circles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleJoin = async (circleId: string) => {
    setActionLoading(circleId);
    try {
      const res = await fetch(`/api/dars-circles/${circleId}/join`, {
        method: "POST",
      });
      if (res.ok) {
        setJoinedIds((prev) => new Set(prev).add(circleId));
        // Refresh data
        await fetchData();
      }
    } catch (err) {
      console.error("Failed to join:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async (circleId: string) => {
    setActionLoading(circleId);
    try {
      const res = await fetch(`/api/dars-circles/${circleId}/leave`, {
        method: "POST",
      });
      if (res.ok) {
        setJoinedIds((prev) => {
          const next = new Set(prev);
          next.delete(circleId);
          return next;
        });
        await fetchData();
      }
    } catch (err) {
      console.error("Failed to leave:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const isJoined = (circleId: string) => joinedIds.has(circleId);

  const renderCircleCard = (item: CircleData, showJoinLeave: boolean) => {
    const { circle, teacher } = item;
    const title = getCircleTitle(circle, locale);
    const scheduled = new Date(circle.scheduledAt);
    const joined = isJoined(circle.id);

    return (
      <motion.div
        key={circle.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      categoryColors[circle.category] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {categoryLabels[circle.category]?.[locale] ?? circle.category}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {circle.status}
                  </span>
                </div>
                <CardTitle className="truncate">{title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>{teacher.fullName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>{scheduled.toLocaleDateString(locale)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 shrink-0" />
                <span>
                  {scheduled.toLocaleTimeString(locale, {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 shrink-0" />
                <span>
                  {circle.currentStudents}/{circle.maxStudents} {t("students")}
                </span>
              </div>

              {showJoinLeave && (
                <div className="pt-2">
                  {joined ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={actionLoading === circle.id}
                      onClick={() => handleLeave(circle.id)}
                    >
                      {actionLoading === circle.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <LogOut className="w-4 h-4" />
                          {t("leave")}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={
                        actionLoading === circle.id ||
                        circle.currentStudents >= circle.maxStudents
                      }
                      onClick={() => handleJoin(circle.id)}
                    >
                      {actionLoading === circle.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          {circle.currentStudents >= circle.maxStudents
                            ? t("full")
                            : t("join")}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        </div>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="my">{t("myCircles")}</TabsTrigger>
          <TabsTrigger value="browse">{t("browse")}</TabsTrigger>
        </TabsList>

        <TabsContent value="my">
          {myCircles.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t("noMyCircles")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {myCircles.map((item) => renderCircleCard(item, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse">
          {allCircles.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t("noCircles")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {allCircles.map((item) => renderCircleCard(item, true))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
