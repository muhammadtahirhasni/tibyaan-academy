"use client";

import { Star, Award } from "lucide-react";
import { useTranslations } from "next-intl";

interface ReviewCardProps {
  studentName: string;
  rating: number;
  reviewText: string | null;
  courseName?: string;
  isFeatured?: boolean;
  createdAt?: string;
}

export function ReviewCard({
  studentName,
  rating,
  reviewText,
  courseName,
  isFeatured,
  createdAt,
}: ReviewCardProps) {
  const t = useTranslations("reviewsSection");

  return (
    <div className={`bg-card border rounded-xl p-5 ${isFeatured ? "ring-2 ring-purple-400" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium">{studentName}</p>
          {courseName && (
            <p className="text-xs text-muted-foreground">{courseName}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isFeatured && (
            <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
              <Award className="w-3 h-3" />
              {t("featuredReview")}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>

      {reviewText && <p className="text-sm text-muted-foreground">{reviewText}</p>}

      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-green-600 dark:text-green-400">{t("verifiedStudent")}</span>
        {createdAt && (
          <span className="text-xs text-muted-foreground">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
