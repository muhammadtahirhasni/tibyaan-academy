import { inngest } from "@/lib/inngest";
import { inngestFailureHandler } from "@/lib/alerts";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

const TARGET_KEYWORDS = [
  "online Quran classes UK",
  "online Quran classes USA",
  "online Quran classes Canada",
  "online Quran classes Australia",
  "Hifz program online",
  "learn Quran online for kids",
  "Arabic language course online",
  "Aalim course online",
  "best online Islamic education",
  "Tajweed course online",
  "online Quran tutor",
  "Islamic studies online",
  "online Quran classes UAE",
  "Dars-e-Nizami online",
  "online Quran classes for adults",
];

const TARGET_COUNTRIES = ["UK", "USA", "Canada", "Australia", "UAE", "Germany", "Saudi Arabia", "Indonesia", "France"];

export const blogQueueManager = inngest.createFunction(
  {
    id: "blog-queue-manager",
    onFailure: inngestFailureHandler("blog-queue-manager"),
    triggers: [{ cron: "0 9 * * 1" }],
  },
  async ({ step }: { step: any }) => {
    const queueCount = await step.run("check-queue", async () => {
      // Only count items actually awaiting review — rejected drafts should not
      // hold the queue open and stop new generation.
      const result = await db
        .select({ count: count() })
        .from(blogPosts)
        .where(eq(blogPosts.status, "pending_review"));
      return result[0]?.count ?? 0;
    });

    if (queueCount < 3) {
      await step.run("trigger-generation", async () => {
        const keywordsToGenerate = TARGET_KEYWORDS.slice(0, 10);
        for (const keyword of keywordsToGenerate) {
          const country = TARGET_COUNTRIES[Math.floor(Math.random() * TARGET_COUNTRIES.length)];
          await inngest.send({
            name: "blog/generate.requested",
            data: { keyword, country, language: "English" },
          });
        }
      });
    }

    return { queueSize: queueCount };
  }
);

// NOTE: `blogPublisher` was removed deliberately. It ran every two days and
// flipped the oldest unpublished post to live with no human involvement. There
// is no auto-publish path any more — items sit in the review queue until a
// human approves them in /admin/content-review, however long that takes.
