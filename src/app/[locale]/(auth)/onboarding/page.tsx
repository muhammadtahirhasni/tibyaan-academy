"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap, Languages, Sparkles, Loader2 } from "lucide-react";
import { completeOnboarding } from "./actions";

const courseOptions = [
  { value: "nazra", icon: BookOpen, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
  { value: "hifz", icon: Sparkles, color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  { value: "arabic", icon: Languages, color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { value: "aalim", icon: GraduationCap, color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
] as const;

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    age: "",
    country: "",
    course: "",
    plan: "",
    classesPerWeek: 3,
  });

  const totalSteps = 4;

  async function nextStep() {
    if (step === 3) {
      // Save to database when moving from plan selection to trial activation
      setSaving(true);
      setError("");
      try {
        const result = await completeOnboarding({
          age: parseInt(formData.age),
          country: formData.country,
          courseType: formData.course,
          planType: formData.plan as "human_ai" | "pure_ai",
          classesPerWeek: formData.classesPerWeek,
          locale,
        });
        if (result.error) {
          setError(result.error);
          setSaving(false);
          return;
        }
      } catch {
        setError("Something went wrong. Please try again.");
        setSaving(false);
        return;
      }
      setSaving(false);
    }
    if (step < totalSteps) setStep(step + 1);
  }

  function prevStep() {
    if (step > 1) setStep(step - 1);
  }

  function handleActivateTrial() {
    router.push(`/${locale}/student/dashboard`);
  }

  const stepTitles = [
    t("step1Title"),
    t("step2Title"),
    t("step3Title"),
    t("step4Title"),
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-lg border-primary/20 shadow-xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto text-3xl font-bold text-primary">
            {tc("appName")}
          </div>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{stepTitles[step - 1]}</CardDescription>

          {/* Progress Bar */}
          <div className="flex gap-2 pt-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i < step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age">{t("age")}</Label>
                <Input
                  id="age"
                  type="number"
                  min={4}
                  max={100}
                  placeholder={t("agePlaceholder")}
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">{t("country")}</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder={t("countryPlaceholder")}
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="h-12"
                />
              </div>
            </div>
          )}

          {/* Step 2: Course Select */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                {t("selectCourse")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {courseOptions.map((course) => {
                  const Icon = course.icon;
                  return (
                    <button
                      key={course.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, course: course.value })
                      }
                      className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                        formData.course === course.value
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-muted hover:border-primary/40"
                      }`}
                    >
                      <div className={`p-3 rounded-full ${course.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-semibold text-sm">
                        {t(course.value)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Plan Select */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {t("selectPlan")}
              </p>

              {/* Plan 1 */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, plan: "human_ai" })}
                className={`w-full text-start p-5 rounded-xl border-2 transition-all ${
                  formData.plan === "human_ai"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-muted hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">{t("plan1Title")}</span>
                  <Badge className="bg-accent text-white">Popular</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("plan1Desc")}
                </p>
              </button>

              {/* Plan 2 */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, plan: "pure_ai" })}
                className={`w-full text-start p-5 rounded-xl border-2 transition-all ${
                  formData.plan === "pure_ai"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-muted hover:border-primary/40"
                }`}
              >
                <span className="font-bold text-lg">{t("plan2Title")}</span>
                <p className="text-sm text-muted-foreground">
                  {t("plan2Desc")}
                </p>
              </button>

              {/* Classes per week (only for Plan 1) */}
              {formData.plan === "human_ai" && (
                <div className="space-y-2 pt-2">
                  <Label>{t("classesPerWeek")}</Label>
                  <div className="flex gap-3">
                    {[3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, classesPerWeek: num })
                        }
                        className={`flex-1 h-12 rounded-lg border-2 font-bold transition-all ${
                          formData.classesPerWeek === num
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted hover:border-primary/40"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Trial Activation */}
          {step === 4 && (
            <div className="text-center space-y-6 py-4">
              <div className="mx-auto w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-accent" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-primary">
                  {t("trialActivated")}
                </h3>
                <p className="text-muted-foreground">{t("trialMessage")}</p>
              </div>
              <Button
                onClick={handleActivateTrial}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {t("goToDashboard")}
              </Button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 text-center bg-red-50 dark:bg-red-950/30 p-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 h-12"
                  disabled={saving}
                >
                  {tc("back")}
                </Button>
              )}
              <Button
                onClick={nextStep}
                className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                disabled={
                  saving ||
                  (step === 1 && (!formData.age || !formData.country)) ||
                  (step === 2 && !formData.course) ||
                  (step === 3 && !formData.plan)
                }
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  tc("next")
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
