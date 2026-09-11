import { inngest } from "@/lib/inngest";
import { SITE_URL } from "@/lib/site-config";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";

export const generateBlogArticle = inngest.createFunction(
  {
    id: "generate-blog-article",
    triggers: [{ event: "blog/generate.requested" }],
  },
  async ({ event, step }: { event: { data: { keyword: string; country: string; language: string } }; step: any }) => {
    const { keyword, country, language } = event.data;

    const article = await step.run("generate-with-claude", async () => {
      const prompt = `You are an SEO expert writing for Tibyaan Academy (${SITE_URL}),
an online Islamic education platform.

Write a complete SEO blog article with these requirements:
- Primary keyword: ${keyword}
- Target country: ${country}
- Language: ${language}
- Word count: 900-1100 words
- Include the website URL naturally in the content
- Include internal links to: /courses/nazra-quran, /courses/hifz-quran, /courses/arabic-language, /courses/aalim-course
- End with a CTA to start free trial

Return ONLY valid JSON (no markdown, no code blocks):
{
  "title": "SEO optimized title max 60 chars",
  "meta_description": "150-160 char description with primary keyword",
  "slug": "url-friendly-slug-no-spaces",
  "content": "full article content in markdown format",
  "faq": [{"question": "...", "answer": "..."}],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "category": "one of: Quran, Hifz, Arabic, Tajweed, Islamic Motivation"
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const message = await response.json();
      const text = (message.content?.[0]?.text as string) || "";
      try {
        return JSON.parse(text);
      } catch {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        throw new Error("Failed to parse Claude response as JSON");
      }
    });

    await step.run("save-to-database", async () => {
      await db.insert(blogPosts).values({
        slug: `${article.slug}-${Date.now()}`,
        titleEn: article.title,
        titleUr: article.title,
        titleAr: article.title,
        titleFr: article.title,
        titleId: article.title,
        contentEn: article.content,
        contentUr: article.content,
        contentAr: article.content,
        contentFr: article.content,
        contentId: article.content,
        metaDescriptionEn: article.meta_description,
        keywords: article.keywords,
        status: "pending_review",
        isPublished: false,
        aiGenerated: true,
      }).onConflictDoNothing();
    });

    return { success: true, slug: article.slug, title: article.title };
  }
);
