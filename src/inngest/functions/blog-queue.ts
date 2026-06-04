import { inngest } from "@/lib/inngest";
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
    triggers: [{ cron: "0 9 * * 1" }],
  },
  async ({ step }: { step: any }) => {
    const queueCount = await step.run("check-queue", async () => {
      const result = await db
        .select({ count: count() })
        .from(blogPosts)
        .where(eq(blogPosts.isPublished, false));
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

export const blogPublisher = inngest.createFunction(
  {
    id: "blog-publisher",
    triggers: [{ cron: "0 10 */2 * *" }],
  },
  async ({ step }: { step: any }) => {
    await step.run("publish-next", async () => {
      const unpublished = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(eq(blogPosts.isPublished, false))
        .limit(1);

      if (unpublished.length > 0) {
        await db
          .update(blogPosts)
          .set({ isPublished: true, publishedAt: new Date() })
          .where(eq(blogPosts.id, unpublished[0].id));
        return { published: unpublished[0].id };
      }
      return { published: null };
    });
  }
);
