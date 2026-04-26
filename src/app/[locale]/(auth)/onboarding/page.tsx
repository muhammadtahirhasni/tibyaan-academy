"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  GraduationCap,
  Languages,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { completeOnboarding, completeTeacherOnboarding } from "./actions";
import { createClient } from "@/lib/supabase/client";

const courseOptions = [
  {
    value: "nazra",
    icon: BookOpen,
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  },
  {
    value: "hifz",
    icon: Sparkles,
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
  {
    value: "arabic",
    icon: Languages,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    value: "aalim",
    icon: GraduationCap,
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  },
] as const;

const specializationOptions = [
  { value: "nazra", icon: BookOpen },
  { value: "hifz", icon: Sparkles },
  { value: "arabic", icon: Languages },
  { value: "aalim", icon: GraduationCap },
] as const;

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const tc = useTranslations("common");
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const [role, setRole] = useState<"student" | "teacher" | null>(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Student form data
  const [studentData, setStudentData] = useState({
    age: "",
    country: "",
    course: "",
    plan: "",
    classesPerWeek: 3,
  });

  // Teacher form data
  const [teacherData, setTeacherData] = useState({
    bio: "",
    specializations: [] as string[],
    yearsExperience: "",
  });

  // Detect role from Supabase user_metadata on mount
  useEffect(() => {
    async function detectRole() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userRole = user?.user_metadata?.role;
      if (userRole === "teacher") {
        setRole("teacher");
      } else {
        setRole("student");
      }
    }
    detectRole();
  }, []);

  const isTeacher = role === "teacher";
  const totalSteps = isTeacher ? 3 : 4;

  function toggleSpecialization(value: string) {
    setTeacherData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(value)
        ? prev.specializations.filter((s) => s !== value)
        : [...prev.specializations, value],
    }));
  }

  async function nextStep() {
    if (isTeacher && step === 2) {
      // Save teacher data on step 2 (last input step)
      setSaving(true);
      setError("");
      try {
        const result = await completeTeacherOnboarding({
          bio: teacherData.bio,
          specializations: teacherData.specializations,
          yearsExperience: parseInt(teacherData.yearsExperience),
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

    if (!isTeacher && step === 3) {
      // Save student data when moving from plan selection to trial activation
      setSaving(true);
      setError("");
      try {
        const result = await completeOnboarding({
          age: parseInt(studentData.age),
          country: studentData.country,
          courseType: studentData.course,
          planType: studentData.plan as "human_ai" | "pure_ai",
          classesPerWeek: studentData.classesPerWeek,
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

  function handleGoToDashboard() {
    if (isTeacher) {
      router.push(`/${locale}/teacher/dashboard`);
    } else {
      router.push(`/${locale}/student/dashboard`);
    }
  }

  // Don't render until role is detected
  if (role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const studentStepTitles = [
    t("step1Title"),
    t("step2Title"),
    t("step3Title"),
    t("step4Title"),
  ];

  const teacherStepTitles = [
    t("teacherStep1Title"),
    t("teacherStep2Title"),
    t("teacherStep3Title"),
  ];

  const stepTitles = isTeacher ? teacherStepTitles : studentStepTitles;
  const pageTitle = isTeacher ? t("teacherTitle") : t("title");

  // Disable next button logic
  const isNextDisabled = (() => {
    if (saving) return true;
    if (isTeacher) {
      if (step === 1) return !teacherData.bio.trim();
      if (step === 2)
        return (
          teacherData.specializations.length === 0 ||
          !teacherData.yearsExperience
        );
    } else {
      if (step === 1) return !studentData.age || !studentData.country;
      if (step === 2) return !studentData.course;
      if (step === 3) return !studentData.plan;
    }
    return false;
  })();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-lg border-primary/20 shadow-xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto text-3xl font-bold text-primary">
            {tc("appName")}
          </div>
          <CardTitle className="text-2xl">{pageTitle}</CardTitle>
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
          {/* ===================== STUDENT FLOW ===================== */}
          {!isTeacher && (
            <>
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
                      value={studentData.age}
                      onChange={(e) =>
                        setStudentData({
                          ...studentData,
                          age: e.target.value,
                        })
                      }
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">{t("country")}</Label>
                    <select
                      id="country"
                      value={studentData.country}
                      onChange={(e) =>
                        setStudentData({
                          ...studentData,
                          country: e.target.value,
                        })
                      }
                      className="w-full h-12 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">{t("countryPlaceholder")}</option>
                      <option value="Pakistan">🇵🇰 Pakistan</option>
                      <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                      <option value="UAE">🇦🇪 UAE</option>
                      <option value="USA">🇺🇸 USA</option>
                      <option value="UK">🇬🇧 UK</option>
                      <option value="India">🇮🇳 India</option>
                      <option value="Bangladesh">🇧🇩 Bangladesh</option>
                      <option value="Indonesia">🇮🇩 Indonesia</option>
                      <option value="Malaysia">🇲🇾 Malaysia</option>
                      <option value="Egypt">🇪🇬 Egypt</option>
                      <option value="Morocco">🇲🇦 Morocco</option>
                      <option value="Algeria">🇩🇿 Algeria</option>
                      <option value="Tunisia">🇹🇳 Tunisia</option>
                      <option value="Turkey">🇹🇷 Turkey</option>
                      <option value="Iran">🇮🇷 Iran</option>
                      <option value="Iraq">🇮🇶 Iraq</option>
                      <option value="Jordan">🇯🇴 Jordan</option>
                      <option value="Lebanon">🇱🇧 Lebanon</option>
                      <option value="Kuwait">🇰🇼 Kuwait</option>
                      <option value="Qatar">🇶🇦 Qatar</option>
                      <option value="Bahrain">🇧🇭 Bahrain</option>
                      <option value="Oman">🇴🇲 Oman</option>
                      <option value="Sudan">🇸🇩 Sudan</option>
                      <option value="Nigeria">🇳🇬 Nigeria</option>
                      <option value="Kenya">🇰🇪 Kenya</option>
                      <option value="South Africa">🇿🇦 South Africa</option>
                      <option value="France">🇫🇷 France</option>
                      <option value="Germany">🇩🇪 Germany</option>
                      <option value="Canada">🇨🇦 Canada</option>
                      <option value="Australia">🇦🇺 Australia</option>
                      <option value="New Zealand">🇳🇿 New Zealand</option>
                      <option value="Japan">🇯🇵 Japan</option>
                      <option value="China">🇨🇳 China</option>
                      <option value="Afghanistan">🇦🇫 Afghanistan</option>
                      <option value="Other">🌍 Other</option>
                    </select>
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
                            setStudentData({
                              ...studentData,
                              course: course.value,
                            })
                          }
                          className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                            studentData.course === course.value
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
                    onClick={() =>
                      setStudentData({ ...studentData, plan: "human_ai" })
                    }
                    className={`w-full text-start p-5 rounded-xl border-2 transition-all ${
                      studentData.plan === "human_ai"
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-muted hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">
                        {t("plan1Title")}
                      </span>
                      <Badge className="bg-accent text-white">Popular</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("plan1Desc")}
                    </p>
                  </button>

                  {/* Plan 2 */}
                  <button
                    type="button"
                    onClick={() =>
                      setStudentData({ ...studentData, plan: "pure_ai" })
                    }
                    className={`w-full text-start p-5 rounded-xl border-2 transition-all ${
                      studentData.plan === "pure_ai"
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-muted hover:border-primary/40"
                    }`}
                  >
                    <span className="font-bold text-lg">
                      {t("plan2Title")}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {t("plan2Desc")}
                    </p>
                  </button>

                  {/* Classes per week (only for Plan 1) */}
                  {studentData.plan === "human_ai" && (
                    <div className="space-y-2 pt-2">
                      <Label>{t("classesPerWeek")}</Label>
                      <div className="flex gap-3">
                        {[3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() =>
                              setStudentData({
                                ...studentData,
                                classesPerWeek: num,
                              })
                            }
                            className={`flex-1 h-12 rounded-lg border-2 font-bold transition-all ${
                              studentData.classesPerWeek === num
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
                    <p className="text-muted-foreground">
                      {t("trialMessage")}
                    </p>
                  </div>
                  <Button
                    onClick={handleGoToDashboard}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    {t("goToDashboard")}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* ===================== TEACHER FLOW ===================== */}
          {isTeacher && (
            <>
              {/* Step 1: Bio */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">{t("bio")}</Label>
                    <Textarea
                      id="bio"
                      placeholder={t("bioPlaceholder")}
                      value={teacherData.bio}
                      onChange={(e) =>
                        setTeacherData({
                          ...teacherData,
                          bio: e.target.value,
                        })
                      }
                      className="min-h-[120px] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Specializations + Experience */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <Label>{t("specializations")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("selectSpecializations")}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {specializationOptions.map((spec) => {
                        const Icon = spec.icon;
                        const selected =
                          teacherData.specializations.includes(spec.value);
                        return (
                          <button
                            key={spec.value}
                            type="button"
                            onClick={() => toggleSpecialization(spec.value)}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                              selected
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-muted hover:border-primary/40"
                            }`}
                          >
                            <Icon className="w-5 h-5 shrink-0" />
                            <span className="font-semibold text-sm">
                              {t(spec.value)}
                            </span>
                            {selected && (
                              <CheckCircle2 className="w-4 h-4 text-primary ms-auto" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience">
                      {t("yearsExperience")}
                    </Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      min={0}
                      max={50}
                      placeholder={t("yearsExperiencePlaceholder")}
                      value={teacherData.yearsExperience}
                      onChange={(e) =>
                        setTeacherData({
                          ...teacherData,
                          yearsExperience: e.target.value,
                        })
                      }
                      className="h-12"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <div className="text-center space-y-6 py-4">
                  <div className="mx-auto w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-primary">
                      {t("trialActivated")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("teacherTrialMessage")}
                    </p>
                  </div>
                  <Button
                    onClick={handleGoToDashboard}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    {t("goToTeacherDashboard")}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 text-center bg-red-50 dark:bg-red-950/30 p-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Navigation Buttons */}
          {step < totalSteps && (
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
                disabled={isNextDisabled}
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
