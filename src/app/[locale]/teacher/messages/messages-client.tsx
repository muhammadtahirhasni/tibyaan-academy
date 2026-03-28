"use client";

import { useState } from "react";
import {
  MessageSquare,
  Inbox,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatWindow } from "@/components/chat/chat-window";

type MatchItem = {
  id: string;
  studentName: string;
  courseName: string;
  status: string;
  createdAt: string;
};

interface MessagesClientProps {
  matches: MatchItem[];
  currentUserId: string;
  role: "teacher" | "student";
}

export function MessagesClient({
  matches: initialMatches,
  currentUserId,
  role,
}: MessagesClientProps) {
  const [matches, setMatches] = useState(initialMatches);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);
  const pendingMatches = matches.filter((m) => m.status === "requested");
  const activeMatches = matches.filter((m) =>
    ["accepted", "active"].includes(m.status)
  );

  async function handleRespond(matchId: string, action: "accept" | "reject") {
    setProcessing(matchId);
    try {
      const res = await fetch(`/api/matches/${matchId}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        const { match } = await res.json();
        setMatches((prev) =>
          prev.map((m) => (m.id === matchId ? { ...m, status: match.status } : m))
        );
      }
    } catch (err) {
      console.error("Respond failed:", err);
    } finally {
      setProcessing(null);
    }
  }

  const otherName = (m: MatchItem) =>
    role === "teacher" ? m.studentName : m.studentName;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar - Match List */}
      <div className="w-80 shrink-0 rounded-xl border bg-card flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Pending Requests (teacher only) */}
          {role === "teacher" && pendingMatches.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-medium text-muted-foreground px-2 mb-1">
                Pending Requests ({pendingMatches.length})
              </p>
              {pendingMatches.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950 mb-2"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <UserCircle className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {m.studentName}
                      </p>
                      <p className="text-xs text-muted-foreground">{m.courseName}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => handleRespond(m.id, "accept")}
                      disabled={processing === m.id}
                    >
                      {processing === m.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3 me-1" />
                      )}
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={() => handleRespond(m.id, "reject")}
                      disabled={processing === m.id}
                    >
                      <XCircle className="w-3 h-3 me-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active Conversations */}
          {activeMatches.length > 0 ? (
            <div className="p-2">
              {role === "teacher" && pendingMatches.length > 0 && (
                <p className="text-xs font-medium text-muted-foreground px-2 mb-1">
                  Conversations
                </p>
              )}
              {activeMatches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMatchId(m.id)}
                  className={`w-full text-start p-3 rounded-lg transition-colors mb-1 ${
                    selectedMatchId === m.id
                      ? "bg-emerald-50 dark:bg-emerald-950"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {otherName(m)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {m.courseName}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            pendingMatches.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Inbox className="w-10 h-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 rounded-xl border bg-card overflow-hidden">
        {selectedMatch && ["accepted", "active"].includes(selectedMatch.status) ? (
          <ChatWindow
            matchId={selectedMatch.id}
            currentUserId={currentUserId}
            otherUserName={otherName(selectedMatch)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
