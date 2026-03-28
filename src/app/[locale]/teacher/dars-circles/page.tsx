"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Clock,
  Plus,
  BookOpen,
  Loader2,
  CheckCircle,
  Link as LinkIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const CATEGORIES = ["quran", "hadith", "fiqh", "seerah", "dua"] as const;
const LOCALES = [
  { code: "ur", label: "Urdu" },
  { code: "ar", label: "Arabic" },
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "id", label: "Indonesian" },
] as const;

type TeacherCircle = {
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
  enrollmentCount: number;
};

function getCircleTitle(circle: TeacherCircle["circle"], locale: string): string {
  const key = `title${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof circle;
  return (circle[key] as string) || circle.titleEn || circle.titleUr || "Untitled";
}

export default function TeacherDarsCirclesPage() {
  const t = useTranslations("darsCircles");
  const locale = useLocale();

  const [circles, setCircles] = useState<TeacherCircle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [titles, setTitles] = useState<Record<string, string>>({
    ur: "",
    ar: "",
    en: "",
    fr: "",
    id: "",
  });
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("quran");
  const [meetingLink, setMeetingLink] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [maxStudents, setMaxStudents] = useState("30");

  const fetchCircles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dars-circles");
      const data = await res.json();
      // The API returns circles with teacher info; for teacher view we map differently
      setCircles(
        (data.circles || []).map((item: { circle: TeacherCircle["circle"]; teacher: unknown }) => ({
          circle: item.circle,
          enrollmentCount: item.circle.currentStudents,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch circles:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCircles();
  }, [fetchCircles]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate || !scheduledTime) return;

    setCreating(true);
    setSuccess(false);

    try {
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      const res = await fetch("/api/dars-circles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleUr: titles.ur || null,
          titleAr: titles.ar || null,
          titleEn: titles.en || null,
          titleFr: titles.fr || null,
          titleId: titles.id || null,
          descriptionEn: description || null,
          category,
          meetingLink: meetingLink || null,
          scheduledAt,
          maxStudents: parseInt(maxStudents) || 30,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTitles({ ur: "", ar: "", en: "", fr: "", id: "" });
        setDescription("");
        setCategory("quran");
        setMeetingLink("");
        setScheduledDate("");
        setScheduledTime("");
        setMaxStudents("30");
        await fetchCircles();
        setTimeout(() => {
          setSuccess(false);
          setShowForm(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to create circle:", err);
    } finally {
      setCreating(false);
    }
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("teacherTitle")}
            </h1>
          </div>
          <p className="text-muted-foreground">{t("teacherSubtitle")}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          {t("createCircle")}
        </Button>
      </div>

      {/* Create Circle Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("createCircle")}</CardTitle>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="flex items-center gap-2 text-emerald-600 py-4">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{t("circleCreated")}</span>
                </div>
              ) : (
                <form onSubmit={handleCreate} className="space-y-6">
                  {/* Multilingual titles */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">
                      {t("circleTitles")}
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {LOCALES.map((l) => (
                        <div key={l.code}>
                          <Label htmlFor={`title-${l.code}`} className="text-xs text-muted-foreground mb-1">
                            {l.label}
                          </Label>
                          <Input
                            id={`title-${l.code}`}
                            value={titles[l.code]}
                            onChange={(e) =>
                              setTitles((prev) => ({
                                ...prev,
                                [l.code]: e.target.value,
                              }))
                            }
                            placeholder={`${t("titlePlaceholder")} (${l.label})`}
                            dir={l.code === "ur" || l.code === "ar" ? "rtl" : "ltr"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">{t("description")}</Label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                      placeholder={t("descriptionPlaceholder")}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <Label htmlFor="category">{t("category")}</Label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1 w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {categoryLabels[cat]?.[locale] ?? cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Meeting Link */}
                  <div>
                    <Label htmlFor="meetingLink">{t("meetingLink")}</Label>
                    <Input
                      id="meetingLink"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                    />
                  </div>

                  {/* Date/Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduledDate">{t("scheduledDate")}</Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduledTime">{t("scheduledTime")}</Label>
                      <Input
                        id="scheduledTime"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Max Students */}
                  <div>
                    <Label htmlFor="maxStudents">{t("maxStudents")}</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      min="1"
                      max="500"
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(e.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={creating}>
                    {creating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {t("createCircle")}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Circle List */}
      {circles.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t("noTeacherCircles")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {circles.map(({ circle, enrollmentCount }) => {
            const title = getCircleTitle(circle, locale);
            const scheduled = new Date(circle.scheduledAt);

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
                          {enrollmentCount}/{circle.maxStudents} {t("students")}
                        </span>
                      </div>
                      {circle.meetingLink && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <LinkIcon className="w-4 h-4 shrink-0" />
                          <a
                            href={circle.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:underline truncate"
                          >
                            {t("meetingLink")}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
