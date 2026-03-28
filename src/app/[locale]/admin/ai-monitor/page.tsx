"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, DollarSign, AlertTriangle, FileText } from "lucide-react";

interface AIStats {
  totalTokens: number;
  totalCostCents: number;
  flaggedCount: number;
  flaggedConversations: {
    id: string;
    studentName: string;
    sessionId: string;
    flagReason: string;
    tokensUsed: number;
    createdAt: string;
  }[];
}

export default function AdminAIMonitorPage() {
  const t = useTranslations("admin");
  const [data, setData] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/ai-monitor")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/admin/ai-monitor/settings")
      .then((res) => res.json())
      .then((d) => setSystemPrompt(d.systemPrompt ?? ""))
      .catch(() => {});
  }, []);

  const handleSavePrompt = async () => {
    setPromptLoading(true);
    setSaved(false);
    await fetch("/api/admin/ai-monitor/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt }),
    });
    setPromptLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const stats = [
    { label: t("totalTokens"), value: data?.totalTokens?.toLocaleString() ?? "0", icon: Bot, color: "bg-blue-500" },
    { label: t("totalCost"), value: `$${((data?.totalCostCents ?? 0) / 100).toFixed(2)}`, icon: DollarSign, color: "bg-green-500" },
    { label: t("flaggedConversations"), value: data?.flaggedCount ?? 0, icon: AlertTriangle, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t("sidebarAIMonitor")}</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card border rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{loading ? "..." : stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flagged Conversations */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="font-semibold mb-4">{t("flaggedConversations")}</h3>
        <div className="space-y-3">
          {(data?.flaggedConversations ?? []).map((conv) => (
            <div key={conv.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{conv.studentName}</p>
                  <p className="text-xs text-muted-foreground">Session: {conv.sessionId.slice(0, 8)}...</p>
                </div>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full dark:bg-red-900/30 dark:text-red-400">
                  {conv.tokensUsed.toLocaleString()} tokens
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{conv.flagReason}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(conv.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {!data?.flaggedConversations?.length && !loading && (
            <p className="text-sm text-muted-foreground text-center py-4">{t("noResults")}</p>
          )}
        </div>
      </div>

      {/* System Prompt Editor */}
      <div className="bg-card border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5" />
          <h3 className="font-semibold">{t("systemPrompt")}</h3>
        </div>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={10}
          className="w-full border rounded-lg px-4 py-3 bg-background text-sm font-mono resize-y"
          placeholder="Enter the AI Ustaz system prompt..."
        />
        <div className="flex items-center gap-3 mt-3">
          <Button size="sm" onClick={handleSavePrompt} disabled={promptLoading}>
            {promptLoading ? "Saving..." : t("savePrompt")}
          </Button>
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </div>
    </div>
  );
}
