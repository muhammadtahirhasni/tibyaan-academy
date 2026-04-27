import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { teacherVideos, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { Link } from "@/i18n/navigation";
import { VideoShareButtons } from "@/components/video/video-share-buttons";
import { ArrowLeft, User, Eye, Calendar } from "lucide-react";

const BASE_URL =
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || "https://tibyaan-academy.vercel.app";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

async function getVideo(videoId: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: teacherVideos.id,
      title: teacherVideos.title,
      description: teacherVideos.description,
      videoUrl: teacherVideos.videoUrl,
      thumbnailUrl: teacherVideos.thumbnailUrl,
      viewCount: teacherVideos.viewCount,
      createdAt: teacherVideos.createdAt,
      status: teacherVideos.status,
      teacherId: teacherVideos.teacherId,
      teacherName: users.fullName,
    })
    .from(teacherVideos)
    .innerJoin(users, eq(teacherVideos.teacherId, users.id))
    .where(and(eq(teacherVideos.id, videoId), eq(teacherVideos.status, "approved")))
    .limit(1);

  return rows[0] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const video = await getVideo(id);

  if (!video) {
    return { title: "Video Not Found — Tibyaan Academy" };
  }

  const pageUrl = `${BASE_URL}/${locale}/videos/${id}`;
  const teacherName = video.teacherName || "Teacher";
  const description = `Tilawat by ${teacherName} on Tibyaan Academy${video.description ? ` — ${video.description}` : ""}`;

  return {
    title: `${video.title} — Tibyaan Academy`,
    description,
    openGraph: {
      title: video.title,
      description,
      url: pageUrl,
      siteName: "Tibyaan Academy",
      type: "video.other",
      ...(video.thumbnailUrl
        ? { images: [{ url: video.thumbnailUrl, width: 1280, height: 720, alt: video.title }] }
        : {}),
      videos: video.videoUrl
        ? [{ url: video.videoUrl, secureUrl: video.videoUrl, type: "video/mp4", width: 1280, height: 720 }]
        : undefined,
    },
    twitter: {
      card: video.thumbnailUrl ? "summary_large_image" : "summary",
      title: video.title,
      description,
      ...(video.thumbnailUrl ? { images: [video.thumbnailUrl] } : {}),
    },
    alternates: { canonical: pageUrl },
  };
}

export default async function VideoPage({ params }: Props) {
  const { locale, id } = await params;
  const video = await getVideo(id);

  if (!video) notFound();

  const teacherName = video.teacherName || "Teacher";

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tibyaan Academy
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Video player */}
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
          <video
            src={video.videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full"
            preload="auto"
          />
        </div>

        {/* Info + share */}
        <div className="mt-6 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
              {video.title}
            </h1>
            {video.description && (
              <p className="mt-2 text-muted-foreground text-sm">{video.description}</p>
            )}
          </div>

          {/* Share button */}
          <VideoShareButtons
            videoId={id}
            title={video.title}
            teacherName={teacherName}
            className="shrink-0 mt-1"
          />
        </div>

        {/* Teacher + meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            {teacherName}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            {video.viewCount} views
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(video.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* CTA */}
        <div className="mt-10 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-center">
          <p className="text-base font-semibold text-foreground">
            Learn Quran online with qualified teachers
          </p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Join Tibyaan Academy — 7-day free trial, no credit card required
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
