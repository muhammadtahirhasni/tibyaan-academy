"use client";

import { useState } from "react";
import { Bot, Inbox, CheckCircle, XCircle, Clock, Zap } from "lucide-react";

type LogItem = {
  id: string;
  agentName: string;
  taskType: string;
  status: string;
  tokensUsed: number | null;
  durationMs: number | null;
  errorMessage: string | null;
  createdAt: string;
};

type Tab = "all" | "success" | "error";

export function AgentLogsClient({ logs }: { logs: LogItem[] }) {
  const [tab, setTab] = useState<Tab>("all");

  const filtered =
    tab === "all" ? logs : logs.filter((l) => l.status === tab);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: logs.length },
    { key: "success", label: "Success", count: logs.filter((l) => l.status === "success").length },
    { key: "error", label: "Errors", count: logs.filter((l) => l.status === "error").length },
  ];

  const totalTokens = logs.reduce((sum, l) => sum + (l.tokensUsed ?? 0), 0);
  const avgDuration =
    logs.length > 0
      ? Math.round(
          logs.reduce((sum, l) => sum + (l.durationMs ?? 0), 0) / logs.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bot className="w-6 h-6 text-red-600" />
          Agent Activity Logs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor AI agent executions and performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Runs</p>
          <p className="text-2xl font-bold text-foreground">{logs.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Success Rate</p>
          <p className="text-2xl font-bold text-emerald-600">
            {logs.length > 0
              ? Math.round(
                  (logs.filter((l) => l.status === "success").length / logs.length) * 100
                )
              : 0}
            %
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Tokens</p>
          <p className="text-2xl font-bold text-foreground">
            {totalTokens.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Avg Duration</p>
          <p className="text-2xl font-bold text-foreground">
            {avgDuration > 1000 ? `${(avgDuration / 1000).toFixed(1)}s` : `${avgDuration}ms`}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Logs */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No agent logs yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => (
            <div key={log.id} className="rounded-lg border bg-card px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  {log.status === "success" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-foreground">
                      {log.agentName}
                    </span>
                    <span className="text-xs text-muted-foreground ms-2">
                      {log.taskType}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  {log.tokensUsed && (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {log.tokensUsed.toLocaleString()}
                    </span>
                  )}
                  {log.durationMs && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.durationMs > 1000
                        ? `${(log.durationMs / 1000).toFixed(1)}s`
                        : `${log.durationMs}ms`}
                    </span>
                  )}
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
              {log.errorMessage && (
                <p className="text-xs text-red-500 mt-1 ps-7 truncate">
                  {log.errorMessage}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
