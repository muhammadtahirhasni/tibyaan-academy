"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Video,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Inbox,
  Loader2,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoShareButtons } from "@/components/video/video-share-buttons";

type VideoItem = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  status: string;
  adminNotes: string | null;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
};

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-500", label: "Pending Review" },
  approved: { icon: CheckCircle, color: "text-emerald-500", label: "Approved" },
  rejected: { icon: XCircle, color: "text-red-500", label: "Rejected" },
};

export function VideosClient({
  videos: initialVideos,
  teacherName,
}: {
  videos: VideoItem[];
  teacherName: string;
}) {
  const t = useTranslations("teacher");
  const [videos, setVideos] = useState(initialVideos);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [playing, setPlaying] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file || !title.trim()) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      setUploadProgress(5);
      const res = await fetch("/api/videos/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          contentType: file.type || "video/mp4",
          fileName: file.name,
        }),
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Daily limit reached. You can upload 1 video per day.");
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }

      const { signedUrl, videoId } = await res.json();
      setUploadProgress(15);

      // Supabase Storage signed URL upload — FormData with empty-string key matches SDK
      const formData = new FormData();
      formData.append("cacheControl", "3600");
      formData.append("", file);

      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text().catch(() => "");
        throw new Error(`Storage upload failed (${uploadRes.status}): ${errText}`);
      }
      setUploadProgress(100);

      setVideos((prev) => [
        {
          id: videoId,
          title: title.trim(),
          description: description.trim() || null,
          videoUrl: "",
          thumbnailUrl: null,
          duration: null,
          status: "pending",
          adminNotes: null,
          isPublic: false,
          viewCount: 0,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setTitle("");
      setDescription("");
      setShowForm(false);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Video className="w-6 h-6 text-emerald-600" />
            {t("sidebarVideos")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload tilawat and intro videos for your profile
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Upload className="w-4 h-4 me-2" />
          Upload Video
        </Button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Surah Al-Baqarah Tilawat"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={2}
              placeholder="Optional description..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Video File *</label>
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="w-full text-sm text-muted-foreground file:me-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900 dark:file:text-emerald-300"
            />
          </div>

          {uploading && uploadProgress > 0 && (
            <div className="space-y-1">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">{uploadProgress}%</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={uploading || !title.trim()}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={uploading}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Videos List */}
      {videos.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No videos yet. Upload your first video!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const cfg = statusConfig[video.status] ?? statusConfig.pending;
            const StatusIcon = cfg.icon;
            const isPlaying = playing[video.id];

            return (
              <div key={video.id} className="rounded-xl border bg-card overflow-hidden">
                {/* Video area */}
                <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden">
                  {isPlaying && video.videoUrl ? (
                    <video
                      src={video.videoUrl}
                      className="w-full h-full object-contain bg-black"
                      controls
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <>
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Video className="w-10 h-10 text-muted-foreground/30" />
                      )}
                      {/* Play button overlay — only for approved videos with a URL */}
                      {video.status === "approved" && video.videoUrl && (
                        <button
                          onClick={() => setPlaying((p) => ({ ...p, [video.id]: true }))}
                          className="absolute inset-0 flex items-center justify-center hover:bg-black/10 transition-colors group"
                        >
                          <div className="w-12 h-12 bg-white/90 dark:bg-black/70 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 text-emerald-600 ms-0.5" />
                          </div>
                        </button>
                      )}
                    </>
                  )}

                  {/* Status badge */}
                  <div className="absolute top-2 end-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-background/90 backdrop-blur-sm ${cfg.color}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-1">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {video.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      {video.status === "approved" && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {video.viewCount}
                        </span>
                      )}
                      {/* Share button — only for approved videos */}
                      {video.status === "approved" && (
                        <VideoShareButtons
                          videoId={video.id}
                          title={video.title}
                          teacherName={teacherName}
                        />
                      )}
                    </div>
                  </div>

                  {video.status === "rejected" && video.adminNotes && (
                    <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-950 text-xs text-red-600 dark:text-red-400">
                      {video.adminNotes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
