"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  CreditCard,
  Calendar,
  DollarSign,
  Users,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Receipt,
} from "lucide-react";

// Mock data — will be replaced with real API calls
const currentSubscription = {
  plan: "human_ai" as const,
  course: "Nazra Quran",
  courseType: "nazra" as const,
  amount: 15,
  interval: "month" as const,
  status: "active" as const,
  currentPeriodEnd: "2026-04-22",
  stripeSubscriptionId: "sub_mock_123",
  cancelAtPeriodEnd: false,
};

const trialInfo = {
  isTrialing: false,
  daysRemaining: 0,
};

const paymentHistory = [
  { id: "1", date: "2026-03-22", description: "Nazra Quran — Human + AI", amount: "$15.00", status: "paid" },
  { id: "2", date: "2026-02-22", description: "Nazra Quran — Human + AI", amount: "$15.00", status: "paid" },
  { id: "3", date: "2026-01-22", description: "Nazra Quran — Human + AI", amount: "$15.00", status: "paid" },
];

const familyCode = "TBY-FAM-A1B2C3";

const coursePricing = [
  { course: "Nazra Quran", type: "nazra", plan1: 15, plan2: 8 },
  { course: "Hifz Quran", type: "hifz", plan1: 20, plan2: 12 },
  { course: "Arabic Language", type: "arabic", plan1: 18, plan2: 10 },
  { course: "Aalim Course", type: "aalim", plan1: 25, plan2: 15 },
];

const statusConfig = {
  active: { color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900", label: "active" },
  trialing: { color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900", label: "trialing" },
  past_due: { color: "text-red-600", bg: "bg-red-100 dark:bg-red-900", label: "pastDue" },
  cancelled: { color: "text-muted-foreground", bg: "bg-muted", label: "cancelled" },
};

export default function PaymentsPage() {
  const t = useTranslations("payments");
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [codeCopied, setCodeCopied] = useState(false);
  const [familyInput, setFamilyInput] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(familyCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const config = statusConfig[currentSubscription.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("managePayments")}</p>
          </div>
        </div>
      </motion.div>

      {/* Trial Banner */}
      {trialInfo.isTrialing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-foreground">{t("trialActive")}</p>
              <p className="text-sm text-muted-foreground">
                {trialInfo.daysRemaining} {t("daysRemaining")}
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              {t("subscribe")}
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-xl border bg-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">{t("currentPlan")}</h3>

            {currentSubscription ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xl font-bold text-foreground">{currentSubscription.course}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {currentSubscription.plan === "human_ai" ? t("plan1Label") : t("plan2Label")}
                    </p>
                  </div>
                  <Badge variant="outline" className={`${config.color} border-current/30`}>
                    <CheckCircle2 className="w-3 h-3 me-1" />
                    {t(config.label)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{t("amount")}</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      ${currentSubscription.amount}
                      <span className="text-sm font-normal text-muted-foreground">
                        {t("perMonth")}
                      </span>
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>{t("nextBilling")}</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {currentSubscription.currentPeriodEnd}
                    </p>
                  </div>
                </div>

                {currentSubscription.cancelAtPeriodEnd && (
                  <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        {t("cancellingAt")} {currentSubscription.currentPeriodEnd}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="gap-2">
                    <ArrowUpRight className="w-4 h-4" />
                    {t("upgradePlan")}
                  </Button>
                  {currentSubscription.cancelAtPeriodEnd ? (
                    <Button variant="outline" className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                      {t("reactivate")}
                    </Button>
                  ) : (
                    <>
                      {!showCancelConfirm ? (
                        <Button
                          variant="outline"
                          className="gap-2 border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => setShowCancelConfirm(true)}
                        >
                          {t("cancelSubscription")}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground max-w-[200px]">
                            {t("cancelConfirm")}
                          </p>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setShowCancelConfirm(false)}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowCancelConfirm(false)}
                          >
                            No
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{t("noPlan")}</p>
                <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
                  {t("choosePlan")}
                </Button>
              </div>
            )}
          </motion.div>

          {/* Plan Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{t("choosePlan")}</h3>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setBillingInterval("month")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    billingInterval === "month"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  {t("monthly")}
                </button>
                <button
                  onClick={() => setBillingInterval("year")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    billingInterval === "year"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  {t("yearly")}
                  <span className="ms-1 text-emerald-600">(-17%)</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-start p-3 text-xs font-medium text-muted-foreground uppercase">Course</th>
                    <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase">{t("plan1Label")}</th>
                    <th className="text-center p-3 text-xs font-medium text-muted-foreground uppercase">{t("plan2Label")}</th>
                  </tr>
                </thead>
                <tbody>
                  {coursePricing.map((course) => {
                    const plan1Price = billingInterval === "year" ? course.plan1 * 10 : course.plan1;
                    const plan2Price = billingInterval === "year" ? course.plan2 * 10 : course.plan2;
                    const intervalLabel = billingInterval === "year" ? t("perYear") : t("perMonth");

                    return (
                      <tr key={course.type} className="border-b last:border-0">
                        <td className="p-3 text-sm font-medium text-foreground">{course.course}</td>
                        <td className="p-3 text-center">
                          <span className="text-lg font-bold text-foreground">${plan1Price}</span>
                          <span className="text-xs text-muted-foreground">{intervalLabel}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-lg font-bold text-foreground">${plan2Price}</span>
                          <span className="text-xs text-muted-foreground">{intervalLabel}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {billingInterval === "year" && (
              <div className="mt-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-3 text-center">
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                  {t("yearlyDiscount")}
                </p>
              </div>
            )}
          </motion.div>

          {/* Payment History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-xl border bg-card overflow-hidden"
          >
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-foreground">{t("paymentHistory")}</h3>
            </div>
            {paymentHistory.length > 0 ? (
              <div className="divide-y">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{payment.description}</p>
                        <p className="text-xs text-muted-foreground">{payment.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-foreground">{payment.amount}</span>
                      <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:text-emerald-400 text-xs">
                        Paid
                      </Badge>
                      <Button variant="ghost" size="sm" className="text-xs">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t("noPayments")}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Family Discount */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-xl border bg-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-foreground">{t("familyDiscount")}</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-3">{t("familyInfo")}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-muted-foreground">{t("family2nd")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-muted-foreground">{t("family3rd")}</span>
              </div>
            </div>

            {/* Your Family Code */}
            <div className="rounded-lg border p-3 bg-muted/30 mb-4">
              <p className="text-xs text-muted-foreground mb-1">{t("yourCode")}</p>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono font-bold text-foreground">{familyCode}</code>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                >
                  {codeCopied ? (
                    <>
                      <Check className="w-3 h-3" />
                      {t("copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      {t("copyCode")}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Apply Family Code */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">{t("familyCode")}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={familyInput}
                  onChange={(e) => setFamilyInput(e.target.value)}
                  placeholder={t("familyCodePlaceholder")}
                  className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {t("applyCode")}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="rounded-xl border bg-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="text-sm font-medium text-foreground">{t("plan1Label")}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Course</span>
                <span className="text-sm font-medium text-foreground">Nazra Quran</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Billing</span>
                <span className="text-sm font-medium text-foreground">{t("monthly")}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Total Paid</span>
                <span className="text-sm font-bold text-emerald-600">$45.00</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
