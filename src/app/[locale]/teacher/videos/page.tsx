import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTeacherVideosList } from "@/lib/db/teacher-queries";
import { VideosClient } from "./videos-client";

export default async function TeacherVideosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  let videos: Array<{
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
  }> = [];

  try {
    const raw = await getTeacherVideosList(user.id);
    videos = raw.map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      videoUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl,
      duration: v.duration,
      status: v.status,
      adminNotes: v.adminNotes,
      isPublic: v.isPublic,
      viewCount: v.viewCount,
      createdAt: v.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("Failed to load teacher videos:", err);
  }

  return <VideosClient videos={videos} />;
}
