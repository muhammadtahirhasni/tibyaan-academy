"use client";

import { useState } from "react";
import {
  Video,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Inbox,
  Loader2,
  User,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoShareButtons } from "@/components/video/video-share-buttons";

type VideoItem = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  status: string;
  adminNotes: string | null;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  teacherName: string;
  teacherEmail: string;
};

type Tab = "all" | "pending" | "approved" | "rejected";

export function AdminVideosClient({ videos: initialVideos }: { videos: VideoItem[] }) {
  const [videos, setVideos] = useState(initialVideos);
  const [tab, setTab] = useState<Tab>("pending");
  const [processing, setProcessing] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState<Record<string, string>>({});
  const [playing, setPlaying] = useState<Record<string, boolean>>({});

  const filtered = tab === "all" ? videos : videos.filter((v) => v.status === tab);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: videos.filter((v) => v.status === "pending").length },
    { key: "approved", label: "Approved", count: videos.filter((v) => v.status === "approved").length },
    { key: "rejected", label: "Rejected", count: videos.filter((v) => v.status === "rejected").length },
    { key: "all", label: "All", count: videos.length },
  ];

  async function handleAction(videoId: string, action: "approve" | "reject") {
    setProcessing(videoId);
    try {
      const res = await fetch(`/api/videos/${videoId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          adminNotes: notesInput[videoId]?.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to update video");
      const { video } = await res.json();

      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? { ...v, status: video.status, isPublic: video.isPublic, adminNotes: video.adminNotes }
            : v
        )
      );
      setNotesInput((prev) => {
        const copy = { ...prev };
        delete copy[videoId];
        return copy;
      });
    } catch (err) {
      console.error("Action failed:", err);
      alert("Action failed. Please try again.");
    } finally {
      setProcessing(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Video className="w-6 h-6 text-red-600" />
          Video Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve teacher-uploaded videos
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
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
            {t.label}
            <span className="ms-2 text-xs opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Videos */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No videos in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((video) => {
            const isPlaying = playing[video.id];
            return (
              <div key={video.id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Video player */}
                  <div className="w-full lg:w-64 aspect-video bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {isPlaying && video.videoUrl ? (
                      <video
                        src={video.videoUrl}
                        className="w-full h-full object-contain bg-black"
                        controls
                        autoPlay
                        playsInline
                      />
                    ) : video.videoUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Video className="w-10 h-10 text-muted-foreground/30" />
                        <button
                          onClick={() => setPlaying((p) => ({ ...p, [video.id]: true }))}
                          className="absolute inset-0 flex items-center justify-center hover:bg-black/5 transition-colors group"
                        >
                          <div className="w-12 h-12 bg-white/90 dark:bg-black/70 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 text-emerald-600 ms-0.5" />
                          </div>
                        </button>
                      </div>
                    ) : (
                      <Video className="w-10 h-10 text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{video.title}</h3>
                        {video.description && (
                          <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {video.status === "approved" && (
                          <VideoShareButtons
                            videoId={video.id}
                            title={video.title}
                            teacherName={video.teacherName}
                          />
                        )}
                        <StatusBadge status={video.status} />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {video.teacherName}
                      </span>
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {video.viewCount}
                      </span>
                    </div>

                    {/* Admin Actions */}
                    {video.status === "pending" && (
                      <div className="mt-4 space-y-3">
                        <input
                          type="text"
                          placeholder="Admin notes (optional)..."
                          value={notesInput[video.id] ?? ""}
                          onChange={(e) =>
                            setNotesInput((prev) => ({ ...prev, [video.id]: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(video.id, "approve")}
                            disabled={processing === video.id}
                          >
                            {processing === video.id ? (
                              <Loader2 className="w-4 h-4 me-1 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 me-1" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(video.id, "reject")}
                            disabled={processing === video.id}
                          >
                            <XCircle className="w-4 h-4 me-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}

                    {video.adminNotes && video.status !== "pending" && (
                      <div className="mt-3 p-2 rounded-lg bg-muted text-xs text-muted-foreground">
                        <span className="font-medium">Admin notes:</span> {video.adminNotes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
    pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900", label: "Pending" },
    approved: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900", label: "Approved" },
    rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900", label: "Rejected" },
  };
  const cfg = config[status] ?? config.pending;
  const Icon = cfg.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}
