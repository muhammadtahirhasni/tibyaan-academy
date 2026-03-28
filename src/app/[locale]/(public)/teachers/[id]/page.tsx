import { getDb } from "@/lib/db";
import { users, teacherProfiles, teacherVideos } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Star, BookOpen, Calendar, Play, Eye } from "lucide-react";

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const db = getDb();

  // Get teacher info + profile
  const teacherRows = await db
    .select({
      user: users,
      profile: teacherProfiles,
    })
    .from(users)
    .innerJoin(teacherProfiles, eq(users.id, teacherProfiles.userId))
    .where(and(eq(users.id, id), eq(users.role, "teacher")))
    .limit(1);

  const teacher = teacherRows[0];
  if (!teacher) notFound();

  // Get approved public videos
  const videos = await db
    .select()
    .from(teacherVideos)
    .where(
      and(
        eq(teacherVideos.teacherId, id),
        eq(teacherVideos.status, "approved"),
        eq(teacherVideos.isPublic, true)
      )
    )
    .orderBy(desc(teacherVideos.createdAt));

  const backLabel: Record<string, string> = {
    en: "All Teachers",
    ur: "تمام اساتذہ",
    ar: "جميع المعلمين",
    fr: "Tous les enseignants",
    id: "Semua Guru",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/teachers"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{backLabel[locale] ?? backLabel.en}</span>
      </Link>

      {/* Profile Header */}
      <div className="rounded-xl border bg-card p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
            {teacher.user.avatarUrl ? (
              <img
                src={teacher.user.avatarUrl}
                alt={teacher.user.fullName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                {teacher.user.fullName.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{teacher.user.fullName}</h1>

            {teacher.profile.bio && (
              <p className="text-muted-foreground mt-2">{teacher.profile.bio}</p>
            )}

            {teacher.profile.specializations && teacher.profile.specializations.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {teacher.profile.specializations.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
              {teacher.profile.averageRating && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {parseFloat(teacher.profile.averageRating).toFixed(1)} rating
                </span>
              )}
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {teacher.profile.totalStudents} students
              </span>
              {teacher.profile.yearsExperience && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {teacher.profile.yearsExperience} years experience
                </span>
              )}
            </div>

            {teacher.profile.certifications && teacher.profile.certifications.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {teacher.profile.certifications.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Videos */}
      {videos.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-emerald-600" />
            {locale === "ur" ? "ویڈیوز" : locale === "ar" ? "مقاطع الفيديو" : "Videos"}
            <span className="text-sm font-normal text-muted-foreground">({videos.length})</span>
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {videos.map((video) => (
              <div key={video.id} className="rounded-xl border bg-card overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <video
                    src={video.videoUrl}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                    poster={video.thumbnailUrl ?? undefined}
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-foreground text-sm">{video.title}</h3>
                  {video.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {video.viewCount}
                    </span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <p>No videos available yet.</p>
        </div>
      )}
    </div>
  );
}
