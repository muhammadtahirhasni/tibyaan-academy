import { and, eq } from "drizzle-orm";
import { blogPosts, dailyDars } from "@/lib/db/schema";

export type ContentStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "needs_revision";

/**
 * The single definition of "live". Public pages, the sitemap and the RSS feed
 * must all go through these — nothing is live unless a human set status to
 * 'published'. `isPublished` is kept in step for older queries, but `status` is
 * the authority.
 */
export const publishedDars = () =>
  and(eq(dailyDars.status, "published"), eq(dailyDars.isPublished, true));

export const publishedBlogPosts = () =>
  and(eq(blogPosts.status, "published"), eq(blogPosts.isPublished, true));

export const REVIEW_QUEUE_STATUSES: ContentStatus[] = [
  "pending_review",
  "needs_revision",
];

export const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  published: "Published",
  rejected: "Rejected",
  needs_revision: "Revision requested",
};
