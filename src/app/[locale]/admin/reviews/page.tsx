"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback, startTransition } from "react";
import { Button } from "@/components/ui/button";
import { Star, Check, X, Award, AlertTriangle } from "lucide-react";

interface Review {
  id: string;
  studentName: string;
  courseName: string;
  rating: number;
  reviewText: string;
  isApproved: boolean;
  isFeatured: boolean;
  aiSpamScore: string | null;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const t = useTranslations("admin");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const fetchReviews = useCallback(() => {
    fetch(`/api/admin/reviews?filter=${filter}`)
      .then((res) => res.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    startTransition(() => setLoading(true));
    fetchReviews();
  }, [filter, fetchReviews]);

  const handleAction = async (id: string, action: string) => {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(true);
    fetchReviews();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t("reviewQueue")}</h2>
        <div className="flex gap-1">
          {["pending", "approved", "rejected", "featured"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {t(f)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{t("noResults")}</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-card border rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium">{review.studentName}</p>
                  <p className="text-sm text-muted-foreground">{review.courseName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {review.aiSpamScore && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      Number(review.aiSpamScore) > 0.7
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : Number(review.aiSpamScore) > 0.3
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}>
                      <AlertTriangle className="w-3 h-3 inline me-1" />
                      {t("spamScore")}: {Number(review.aiSpamScore).toFixed(2)}
                    </span>
                  )}
                  {review.isFeatured && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full dark:bg-purple-900/30 dark:text-purple-400">
                      {t("featured")}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <p className="text-sm mb-3">{review.reviewText}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  {!review.isApproved && (
                    <Button size="sm" variant="outline" onClick={() => handleAction(review.id, "approve")}>
                      <Check className="w-4 h-4 me-1" /> {t("approve")}
                    </Button>
                  )}
                  {review.isApproved && !review.isFeatured && (
                    <Button size="sm" variant="outline" onClick={() => handleAction(review.id, "feature")}>
                      <Award className="w-4 h-4 me-1" /> {t("feature")}
                    </Button>
                  )}
                  {review.isFeatured && (
                    <Button size="sm" variant="outline" onClick={() => handleAction(review.id, "unfeature")}>
                      {t("unfeature")}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleAction(review.id, "reject")}>
                    <X className="w-4 h-4 me-1" /> {t("reject")}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
