"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Plus,
  MessageSquare,
  Loader2,
  Globe,
} from "lucide-react";
import { DAILY_MESSAGE_LIMIT } from "@/lib/claude/ustaz";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  courseContext: string | null;
  messageCount: number;
  lastMessageAt: string;
}

const languages = [
  { code: "ur", label: "اردو" },
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "id", label: "Bahasa" },
];

function generateSessionId() {
  return crypto.randomUUID();
}

export default function AIUstazPage() {
  const t = useTranslations("aiUstaz");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatLang, setChatLang] = useState("en");
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionId, setSessionId] = useState(generateSessionId);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestedQuestions = [
    t("suggested1"),
    t("suggested2"),
    t("suggested3"),
    t("suggested4"),
    t("suggested5"),
  ];

  // Load chat sessions on mount
  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/ai-ustaz/sessions");
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
      const res = await fetch(`/api/ai-ustaz/sessions/${sid}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(
          data.messages.map((m: { id: string; role: string; content: string; createdAt: string }) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: new Date(m.createdAt),
          }))
        );
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || messagesUsed >= DAILY_MESSAGE_LIMIT)
      return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setMessagesUsed((prev) => prev + 1);

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/ai-ustaz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          sessionId,
          studentName: "Student",
          courseName: "Nazra Quran",
          courseType: "nazra",
          currentLevel: "Level 3",
          preferredLanguage:
            languages.find((l) => l.code === chatLang)?.label || "English",
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

      // Refresh sessions list after sending
      try {
        const sessRes = await fetch("/api/ai-ustaz/sessions");
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
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Chat History Sidebar */}
      <div
        className={`${
          showHistory ? "flex" : "hidden"
        } lg:flex flex-col w-64 shrink-0 rounded-xl border bg-card overflow-hidden`}
      >
        <div className="p-3 border-b">
          <Button
            onClick={startNewChat}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
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
                  <span className="truncate text-foreground">
                    {session.title}
                  </span>
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
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t("title")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {DAILY_MESSAGE_LIMIT - messagesUsed} {t("dailyLimit")}
            </Badge>
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={chatLang}
                onChange={(e) => setChatLang(e.target.value)}
                className="text-xs bg-transparent border-none outline-none text-foreground cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {t("title")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {t("welcomeMessage")}
              </p>

              <div className="mt-6 w-full max-w-md">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  {t("suggestedTitle")}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="px-3 py-1.5 rounded-full border text-xs text-foreground hover:bg-primary/5 hover:border-primary/30 transition-colors"
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
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-accent" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
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
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Daily Limit Warning */}
        {messagesUsed >= DAILY_MESSAGE_LIMIT && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
              {t("limitReached")}
            </p>
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("placeholder")}
              disabled={isLoading || messagesUsed >= DAILY_MESSAGE_LIMIT}
              rows={1}
              className="flex-1 resize-none rounded-xl border bg-muted/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 max-h-32"
              style={{ minHeight: "44px" }}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading || messagesUsed >= DAILY_MESSAGE_LIMIT}
              className="h-11 w-11 shrink-0 rounded-xl bg-accent hover:bg-accent/90"
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
