"use client";

import { useState } from "react";
import {
  MessageSquare,
  Inbox,
  Clock,
  UserCircle,
} from "lucide-react";
import { ChatWindow } from "@/components/chat/chat-window";

type MatchItem = {
  id: string;
  teacherName: string;
  courseName: string;
  status: string;
  createdAt: string;
};

interface StudentMessagesClientProps {
  matches: MatchItem[];
  currentUserId: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  requested: { label: "Pending", color: "text-amber-500" },
  accepted: { label: "Active", color: "text-emerald-500" },
  active: { label: "Active", color: "text-emerald-500" },
  rejected: { label: "Declined", color: "text-red-500" },
  completed: { label: "Completed", color: "text-muted-foreground" },
};

export function StudentMessagesClient({ matches, currentUserId }: StudentMessagesClientProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const selectedMatch = matches.find((m) => m.id === selectedMatchId);
  const chatEnabled = selectedMatch && ["accepted", "active"].includes(selectedMatch.status);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar */}
      <div className="w-80 shrink-0 rounded-xl border bg-card flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            My Teachers
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Inbox className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                No teacher connections yet. Browse teachers to get started!
              </p>
            </div>
          ) : (
            matches.map((m) => {
              const st = statusLabels[m.status] ?? statusLabels.requested;
              return (
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
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {m.teacherName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {m.courseName}
                      </p>
                    </div>
                    <span className={`text-xs ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 rounded-xl border bg-card overflow-hidden">
        {chatEnabled ? (
          <ChatWindow
            matchId={selectedMatch.id}
            currentUserId={currentUserId}
            otherUserName={selectedMatch.teacherName}
          />
        ) : selectedMatch ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Clock className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">
              {selectedMatch.status === "requested"
                ? "Waiting for teacher to accept your request..."
                : selectedMatch.status === "rejected"
                ? "This request was declined."
                : "This conversation has ended."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
