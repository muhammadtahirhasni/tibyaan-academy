"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Plus,
  MessageSquare,
  Loader2,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Sparkles,
  ChevronDown,
  Download,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  taskContext: string | null;
  messageCount: number;
  lastMessageAt: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface LessonPlan {
  title: string;
  objective: string;
  materials: string[];
  warmUp: { duration: number; activity: string };
  mainLesson: Array<{
    step: number;
    duration: number;
    activity: string;
    teacherNotes: string;
  }>;
  practice: { duration: number; activity: string };
  assessment: string;
  homework: string;
  differentiation: { advanced: string; struggling: string };
}

interface StudentAnalysis {
  overallAssessment: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{
    area: string;
    suggestion: string;
    priority: string;
  }>;
  hifzAnalysis?: {
    memorized: string;
    revisionNeeded: string;
    pace: string;
  };
  suggestedNextSteps: string[];
}

// ─── Constants ───────────────────────────────────────────────────────

const TABS = ["chat", "studentAnalysis", "lessonPlans", "quizGenerator"] as const;
type TabKey = (typeof TABS)[number];

const TAB_ICONS = {
  chat: MessageSquare,
  studentAnalysis: BarChart3,
  lessonPlans: BookOpen,
  quizGenerator: ClipboardCheck,
};

const COURSE_TYPES = [
  { value: "nazra", labelKey: "nazra" },
  { value: "hifz", labelKey: "hifz" },
  { value: "arabic", labelKey: "arabic" },
  { value: "aalim", labelKey: "aalim" },
];

const LEVELS = [
  { value: "Beginner", labelKey: "beginner" },
  { value: "Intermediate", labelKey: "intermediate" },
  { value: "Advanced", labelKey: "advanced" },
];

function generateSessionId() {
  return crypto.randomUUID();
}

// ─── Main Page Component ─────────────────────────────────────────────

export default function TeacherAIAssistantPage() {
  const t = useTranslations("teacherAI");
  const [activeTab, setActiveTab] = useState<TabKey>("chat");

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-white/80 text-sm mt-0.5">{t("subtitle")}</p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-1 overflow-x-auto pb-1"
      >
        {TABS.map((tab) => {
          const Icon = TAB_ICONS[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t(`tab_${tab}`)}
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "chat" && <ChatTab />}
          {activeTab === "studentAnalysis" && <StudentAnalysisTab />}
          {activeTab === "lessonPlans" && <LessonPlanTab />}
          {activeTab === "quizGenerator" && <QuizGeneratorTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Chat Tab ────────────────────────────────────────────────────────

function ChatTab() {
  const t = useTranslations("teacherAI");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionId, setSessionId] = useState(generateSessionId);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    t("chatSuggested1"),
    t("chatSuggested2"),
    t("chatSuggested3"),
    t("chatSuggested4"),
  ];

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/teacher-ai/sessions");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions);
        }
      } catch {
        // Silent fail
      } finally {
        setLoadingSessions(false);
      }
    }
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSession = useCallback(async (sid: string) => {
    setSessionId(sid);
    setMessages([]);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/teacher-ai/sessions/${sid}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(
          data.messages.map(
            (m: { id: string; role: string; content: string; createdAt: string }) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
              timestamp: new Date(m.createdAt),
            })
          )
        );
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/teacher-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          sessionId,
          taskContext: "chat",
        }),
      });

      if (!response.ok) throw new Error("API error");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === "assistant") {
                    last.content += parsed.text;
                  }
                  return updated;
                });
              }
            } catch {
              // Skip
            }
          }
        }
      }

      // Refresh sessions list
      try {
        const sessRes = await fetch("/api/teacher-ai/sessions");
        if (sessRes.ok) {
          const data = await sessRes.json();
          setSessions(data.sessions);
        }
      } catch {
        // Silent
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "assistant" && !last.content) {
          last.content = t("errorMessage");
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const startNewChat = () => {
    setSessionId(generateSessionId());
    setMessages([]);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-18rem)] gap-4">
      {/* Chat History Sidebar */}
      <div
        className={`${
          showHistory ? "flex" : "hidden"
        } lg:flex flex-col w-64 shrink-0 rounded-xl border bg-card overflow-hidden`}
      >
        <div className="p-3 border-b">
          <Button
            onClick={startNewChat}
            className="w-full gap-2 bg-violet-600 hover:bg-violet-700"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            {t("newChat")}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase">
            {t("chatHistory")}
          </p>
          {loadingSessions ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <p className="px-2 py-4 text-xs text-muted-foreground text-center">
              {t("noHistory")}
            </p>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={`w-full text-start px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors ${
                  sessionId === session.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate text-foreground">{session.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 ps-5.5">
                  {new Date(session.lastMessageAt).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col rounded-xl border bg-card overflow-hidden min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <Bot className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t("chatTitle")}</h3>
              <p className="text-xs text-muted-foreground">{t("chatSubtitle")}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{t("chatTitle")}</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {t("chatWelcome")}
              </p>
              <div className="mt-6 w-full max-w-md">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  {t("chatSuggestedTitle")}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="px-3 py-1.5 rounded-full border text-xs text-foreground hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:border-violet-300 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-violet-600 text-white rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.content || (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {t("thinking")}
                    </span>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-violet-600/10 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-violet-600" />
                  </div>
                )}
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chatPlaceholder")}
              disabled={isLoading}
              rows={1}
              className="flex-1 resize-none rounded-xl border bg-muted/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 max-h-32"
              style={{ minHeight: "44px" }}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="h-11 w-11 shrink-0 rounded-xl bg-violet-600 hover:bg-violet-700"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Student Analysis Tab ────────────────────────────────────────────

function StudentAnalysisTab() {
  const t = useTranslations("teacherAI");
  const [studentId, setStudentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<StudentAnalysis | null>(null);
  const [studentName, setStudentName] = useState("");
  const [error, setError] = useState("");

  const analyzeStudent = async () => {
    if (!studentId.trim()) return;
    setIsLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const res = await fetch("/api/teacher-ai/analyze-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentId.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to analyze student");
      }

      const data = await res.json();
      setStudentName(data.studentName);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("analysisTitle")}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{t("analysisDescription")}</p>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder={t("studentIdPlaceholder")}
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <Button
            onClick={analyzeStudent}
            disabled={!studentId.trim() || isLoading}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {t("analyze")}
          </Button>
        </div>
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {/* Student Name Header */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                <User className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{studentName}</h3>
                <p className="text-sm text-muted-foreground">{t("analysisReport")}</p>
              </div>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {analysis.overallAssessment}
            </p>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h4 className="font-semibold text-foreground">{t("strengths")}</h4>
              </div>
              <ul className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold text-foreground">{t("weaknesses")}</h4>
              </div>
              <ul className="space-y-2">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-xl border bg-card p-6">
            <h4 className="font-semibold text-foreground mb-3">{t("recommendations")}</h4>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    rec.priority === "high"
                      ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                      : rec.priority === "medium"
                        ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                        : "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                  }`}
                >
                  <Badge
                    variant="outline"
                    className={`shrink-0 ${
                      rec.priority === "high"
                        ? "border-red-300 text-red-700 dark:text-red-400"
                        : rec.priority === "medium"
                          ? "border-amber-300 text-amber-700 dark:text-amber-400"
                          : "border-blue-300 text-blue-700 dark:text-blue-400"
                    }`}
                  >
                    {rec.priority}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm text-foreground">{rec.area}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{rec.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hifz Analysis (if available) */}
          {analysis.hifzAnalysis && (
            <div className="rounded-xl border bg-card p-6">
              <h4 className="font-semibold text-foreground mb-3">{t("hifzAnalysis")}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {t("memorized")}
                  </p>
                  <p className="text-sm text-foreground">{analysis.hifzAnalysis.memorized}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {t("revisionNeeded")}
                  </p>
                  <p className="text-sm text-foreground">
                    {analysis.hifzAnalysis.revisionNeeded}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {t("pace")}
                  </p>
                  <p className="text-sm text-foreground">{analysis.hifzAnalysis.pace}</p>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="rounded-xl border bg-card p-6">
            <h4 className="font-semibold text-foreground mb-3">{t("nextSteps")}</h4>
            <ol className="space-y-2">
              {analysis.suggestedNextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400 shrink-0">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Lesson Plan Tab ─────────────────────────────────────────────────

function LessonPlanTab() {
  const t = useTranslations("teacherAI");
  const [courseType, setCourseType] = useState("nazra");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [error, setError] = useState("");

  const generatePlan = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setError("");
    setLessonPlan(null);

    try {
      const res = await fetch("/api/teacher-ai/generate-lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseType, topic: topic.trim(), level, duration }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate lesson plan");
      }

      const data = await res.json();
      setLessonPlan(data.lessonPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("lessonPlanTitle")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("courseType")}
            </label>
            <select
              value={courseType}
              onChange={(e) => setCourseType(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              {COURSE_TYPES.map((ct) => (
                <option key={ct.value} value={ct.value}>
                  {t(ct.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("level")}
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {t(l.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("topic")}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t("topicPlaceholder")}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("duration")} ({t("minutes")})
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              {[15, 20, 30, 45, 60, 90, 120].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button
            onClick={generatePlan}
            disabled={!topic.trim() || isLoading}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {t("generatePlan")}
          </Button>
          {error && (
            <span className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </span>
          )}
        </div>
      </div>

      {/* Lesson Plan Result */}
      {lessonPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {/* Title & Objective */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{lessonPlan.title}</h3>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {duration} {t("minutes")}
              </Badge>
            </div>
            <div className="bg-violet-50 dark:bg-violet-950/20 rounded-lg p-4 border border-violet-200 dark:border-violet-800">
              <p className="text-xs font-medium text-violet-700 dark:text-violet-300 mb-1">
                {t("objective")}
              </p>
              <p className="text-sm text-foreground">{lessonPlan.objective}</p>
            </div>
          </div>

          {/* Materials */}
          {lessonPlan.materials && lessonPlan.materials.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h4 className="font-semibold text-foreground mb-3">{t("materials")}</h4>
              <div className="flex flex-wrap gap-2">
                {lessonPlan.materials.map((m, i) => (
                  <Badge key={i} variant="secondary">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Warm Up */}
          {lessonPlan.warmUp && (
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{t("warmUp")}</h4>
                  <p className="text-xs text-muted-foreground">
                    {lessonPlan.warmUp.duration} {t("minutes")}
                  </p>
                </div>
              </div>
              <p className="text-sm text-foreground">{lessonPlan.warmUp.activity}</p>
            </div>
          )}

          {/* Main Lesson Steps */}
          {lessonPlan.mainLesson && lessonPlan.mainLesson.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h4 className="font-semibold text-foreground mb-4">{t("mainLesson")}</h4>
              <div className="space-y-4">
                {lessonPlan.mainLesson.map((step) => (
                  <div
                    key={step.step}
                    className="flex gap-4 p-4 rounded-lg border bg-muted/30"
                  >
                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                        {step.step}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs gap-1">
                          <Clock className="w-3 h-3" />
                          {step.duration} {t("minutes")}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground">{step.activity}</p>
                      {step.teacherNotes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          {t("teacherNotes")}: {step.teacherNotes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practice & Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessonPlan.practice && (
              <div className="rounded-xl border bg-card p-6">
                <h4 className="font-semibold text-foreground mb-2">{t("practice")}</h4>
                <Badge variant="outline" className="text-xs gap-1 mb-3">
                  <Clock className="w-3 h-3" />
                  {lessonPlan.practice.duration} {t("minutes")}
                </Badge>
                <p className="text-sm text-foreground">{lessonPlan.practice.activity}</p>
              </div>
            )}
            {lessonPlan.assessment && (
              <div className="rounded-xl border bg-card p-6">
                <h4 className="font-semibold text-foreground mb-2">{t("assessment")}</h4>
                <p className="text-sm text-foreground">{lessonPlan.assessment}</p>
              </div>
            )}
          </div>

          {/* Homework & Differentiation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessonPlan.homework && (
              <div className="rounded-xl border bg-card p-6">
                <h4 className="font-semibold text-foreground mb-2">{t("homework")}</h4>
                <p className="text-sm text-foreground">{lessonPlan.homework}</p>
              </div>
            )}
            {lessonPlan.differentiation && (
              <div className="rounded-xl border bg-card p-6">
                <h4 className="font-semibold text-foreground mb-2">
                  {t("differentiation")}
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-emerald-600 mb-1">
                      {t("advancedStudents")}
                    </p>
                    <p className="text-sm text-foreground">
                      {lessonPlan.differentiation.advanced}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-amber-600 mb-1">
                      {t("strugglingStudents")}
                    </p>
                    <p className="text-sm text-foreground">
                      {lessonPlan.differentiation.struggling}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Quiz Generator Tab ──────────────────────────────────────────────

function QuizGeneratorTab() {
  const t = useTranslations("teacherAI");
  const [courseType, setCourseType] = useState("nazra");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [questionCount, setQuestionCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState("");
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  const generateQuiz = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setError("");
    setQuiz([]);
    setShowAnswers({});

    try {
      const res = await fetch("/api/teacher-ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseType,
          topic: topic.trim(),
          level,
          questionCount,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate quiz");
      }

      const data = await res.json();
      setQuiz(data.quiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAnswer = (index: number) => {
    setShowAnswers((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t("quizTitle")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("courseType")}
            </label>
            <select
              value={courseType}
              onChange={(e) => setCourseType(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              {COURSE_TYPES.map((ct) => (
                <option key={ct.value} value={ct.value}>
                  {t(ct.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("level")}
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {t(l.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("topic")}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t("quizTopicPlaceholder")}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("questionCount")}
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              {[3, 5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button
            onClick={generateQuiz}
            disabled={!topic.trim() || isLoading}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {t("generateQuiz")}
          </Button>
          {error && (
            <span className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </span>
          )}
        </div>
      </div>

      {/* Quiz Results */}
      {quiz.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              {t("generatedQuiz")} ({quiz.length} {t("questionsLabel")})
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                const allShown = Object.keys(showAnswers).length === quiz.length;
                if (allShown) {
                  setShowAnswers({});
                } else {
                  const all: Record<number, boolean> = {};
                  quiz.forEach((_, i) => (all[i] = true));
                  setShowAnswers(all);
                }
              }}
            >
              <ChevronDown className="w-4 h-4" />
              {Object.keys(showAnswers).length === quiz.length
                ? t("hideAllAnswers")
                : t("showAllAnswers")}
            </Button>
          </div>

          {quiz.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-xl border bg-card p-6"
            >
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-sm font-bold text-violet-600 dark:text-violet-400 shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground mb-3">{q.question}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`px-4 py-2.5 rounded-lg border text-sm ${
                          showAnswers[i] && oi === q.correctIndex
                            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200"
                            : "bg-muted/30 text-foreground"
                        }`}
                      >
                        <span className="font-medium me-2">
                          {String.fromCharCode(65 + oi)}.
                        </span>
                        {opt}
                        {showAnswers[i] && oi === q.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 inline ms-2 text-emerald-600" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => toggleAnswer(i)}
                      className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      {showAnswers[i] ? t("hideAnswer") : t("showAnswer")}
                    </button>
                  </div>

                  {showAnswers[i] && q.explanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
                    >
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                        {t("explanation")}
                      </p>
                      <p className="text-sm text-foreground">{q.explanation}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
