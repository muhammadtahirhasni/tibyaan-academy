"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Copy, Check, Gift, Users, Calendar, Share2 } from "lucide-react";

export function ReferralCard() {
  const t = useTranslations("referral");
  const [data, setData] = useState<{
    referralCode: string;
    totalReferrals: number;
    successfulReferrals: number;
    monthsEarned: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referrals")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);

  const referralLink = data?.referralCode
    ? `https://tibyaan.com/signup?ref=${data.referralCode}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Join Tibyaan Academy with my referral code: ${data?.referralCode}\n${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="bg-card border rounded-xl p-6 space-y-5">
      <div>
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Gift className="w-5 h-5 text-green-500" />
          {t("title")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      {/* Referral Code */}
      <div className="bg-muted rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-1">{t("yourCode")}</p>
        <div className="flex items-center gap-2">
          <code className="text-lg font-bold tracking-wider">
            {data?.referralCode ?? "..."}
          </code>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={handleCopy}>
          <Copy className="w-4 h-4 me-1" />
          {copied ? t("copied") : t("copyLink")}
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={handleWhatsApp}>
          <Share2 className="w-4 h-4 me-1" />
          {t("shareWhatsApp")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-muted rounded-lg">
          <Users className="w-4 h-4 mx-auto mb-1 text-blue-500" />
          <p className="text-lg font-bold">{data?.totalReferrals ?? 0}</p>
          <p className="text-xs text-muted-foreground">{t("totalReferrals")}</p>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <Check className="w-4 h-4 mx-auto mb-1 text-green-500" />
          <p className="text-lg font-bold">{data?.successfulReferrals ?? 0}</p>
          <p className="text-xs text-muted-foreground">{t("successfulReferrals")}</p>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <Calendar className="w-4 h-4 mx-auto mb-1 text-purple-500" />
          <p className="text-lg font-bold">{data?.monthsEarned ?? 0}</p>
          <p className="text-xs text-muted-foreground">{t("monthsEarned")}</p>
        </div>
      </div>

      {/* How It Works */}
      <div>
        <h4 className="text-sm font-semibold mb-2">{t("howItWorks")}</h4>
        <ol className="space-y-1 text-sm text-muted-foreground">
          <li>1. {t("step1")}</li>
          <li>2. {t("step2")}</li>
          <li>3. {t("step3")}</li>
        </ol>
      </div>
    </div>
  );
}
