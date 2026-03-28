"use client";

import { useState } from "react";
import { Bell, Inbox, User, Circle } from "lucide-react";

type NotifItem = {
  id: string;
  userId: string;
  userName: string;
  type: string;
  title: string;
  message: string | null;
  isRead: boolean;
  createdAt: string;
};

const typeColors: Record<string, string> = {
  match_request: "text-amber-600",
  match_accepted: "text-emerald-600",
  match_rejected: "text-red-600",
  video_approved: "text-emerald-600",
  video_rejected: "text-red-600",
  new_message: "text-blue-600",
  new_recording: "text-purple-600",
  enrollment: "text-blue-600",
  review: "text-amber-600",
  system: "text-muted-foreground",
};

export function AdminNotificationsClient({
  notifications,
}: {
  notifications: NotifItem[];
}) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const filtered =
    filter === "all" ? notifications : notifications.filter((n) => !n.isRead);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bell className="w-6 h-6 text-red-600" />
          All Notifications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform-wide notification activity
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "unread"
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground"
          }`}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No notifications.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-lg border bg-card px-4 py-3 ${
                !notif.isRead ? "border-s-2 border-s-emerald-500" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!notif.isRead && (
                      <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 shrink-0" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {notif.title}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        typeColors[notif.type] ?? "text-muted-foreground"
                      }`}
                    >
                      {notif.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  {notif.message && (
                    <p className="text-xs text-muted-foreground truncate">
                      {notif.message}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{notif.userName}</span>
                    <span>{new Date(notif.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
