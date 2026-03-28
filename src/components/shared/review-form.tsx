"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface ReviewFormProps {
  courseId: string;
  onSubmitted?: () => void;
}

export function ReviewForm({ courseId, onSubmitted }: ReviewFormProps) {
  const t = useTranslations("reviewsSection");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setSubmitting(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, rating, reviewText }),
      });
      setSubmitted(true);
      onSubmitted?.();
    } catch {
      // Error handling
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
        <p className="text-green-700 dark:text-green-400 font-medium">
          {t("reviewSubmitted")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-6 space-y-4">
      <h3 className="font-semibold">{t("writeReview")}</h3>

      <div>
        <p className="text-sm text-muted-foreground mb-2">{t("yourRating")}</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder={t("reviewPlaceholder")}
        rows={4}
        className="w-full border rounded-lg px-4 py-3 bg-background text-sm resize-y"
      />

      <Button type="submit" disabled={rating === 0 || submitting}>
        {submitting ? "..." : t("submitReview")}
      </Button>
    </form>
  );
}
