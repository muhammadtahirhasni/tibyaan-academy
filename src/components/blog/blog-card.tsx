import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Sparkles } from "lucide-react";

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: Date | null;
  keywords: string[] | null;
  aiGenerated: boolean;
  readMoreLabel: string;
  minuteReadLabel: string;
  aiGeneratedLabel: string;
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function BlogCard({
  slug,
  title,
  excerpt,
  publishedAt,
  keywords,
  aiGenerated,
  readMoreLabel,
  minuteReadLabel,
  aiGeneratedLabel,
}: BlogCardProps) {
  const readTime = estimateReadTime(excerpt);

  return (
    <Link href={`/blog/${slug}`} className="group block">
      <article className="h-full rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/30 group-hover:-translate-y-1">
        {/* Icon placeholder */}
        <div className="w-full h-40 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl text-primary font-arabic">
              ﷽
            </span>
          </div>
        </div>

        {/* Keywords */}
        {keywords && keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {keywords.slice(0, 3).map((kw) => (
              <Badge
                key={kw}
                variant="secondary"
                className="text-[10px] px-2 py-0.5"
              >
                {kw}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(publishedAt).toLocaleDateString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readTime} {minuteReadLabel}
            </span>
          </div>
          {aiGenerated && (
            <span className="flex items-center gap-1 text-accent">
              <Sparkles className="w-3 h-3" />
              {aiGeneratedLabel}
            </span>
          )}
        </div>

        {/* Read More */}
        <p className="mt-3 text-sm font-medium text-primary group-hover:underline">
          {readMoreLabel} →
        </p>
      </article>
    </Link>
  );
}
