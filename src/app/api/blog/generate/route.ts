import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import {
  BLOG_TOPICS,
  getBlogGenerationPrompt,
  getBlogTranslationPrompt,
} from "@/lib/claude/blog";
import { withCron } from "@/lib/cron-auth";

async function callClaude(
  apiKey: string,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error: ${response.status} — ${errorText}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find(
    (b: { type: string }) => b.type === "text"
  );
  return textBlock?.text || "";
}

function parseJsonResponse(text: string): Record<string, unknown> {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Extract JSON from markdown code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1].trim());
    }
    // Try finding JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not parse JSON from response");
  }
}

async function generateBlog() {

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service not configured" },
      { status: 500 }
    );
  }

  const db = getDb();

  // Get existing slugs to find unwritten topics
  const existingPosts = await db
    .select({ slug: blogPosts.slug })
    .from(blogPosts);
  const existingSlugs = new Set(existingPosts.map((p) => p.slug));

  // Find topics not yet written
  const availableTopics = BLOG_TOPICS.filter((topic) => {
    const slug = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return !existingSlugs.has(slug);
  });

  if (availableTopics.length === 0) {
    return NextResponse.json(
      { message: "All topics have been written" },
      { status: 200 }
    );
  }

  // Pick a random topic
  const topic =
    availableTopics[Math.floor(Math.random() * availableTopics.length)];

  // Generate English article
  const englishPrompt = getBlogGenerationPrompt(topic);
  const englishRaw = await callClaude(
    apiKey,
    "You are a blog content generator. Return only valid JSON.",
    englishPrompt
  );
  const englishArticle = parseJsonResponse(englishRaw) as {
    title: string;
    content: string;
    metaDescription: string;
    keywords: string[];
    slug: string;
  };

  // Translate to other languages
  const translations: Record<
    string,
    { title: string; content: string; metaDescription: string }
  > = {};

  for (const lang of ["ur", "ar", "fr", "id"]) {
    const translationPrompt = getBlogTranslationPrompt(
      {
        title: englishArticle.title,
        content: englishArticle.content,
        metaDescription: englishArticle.metaDescription,
      },
      lang
    );

    const translatedRaw = await callClaude(
      apiKey,
      "You are a professional translator. Return only valid JSON.",
      translationPrompt
    );
    translations[lang] = parseJsonResponse(translatedRaw) as {
      title: string;
      content: string;
      metaDescription: string;
    };
  }

  // Save to database
  const slug = englishArticle.slug || topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  await db.insert(blogPosts).values({
    slug,
    titleEn: englishArticle.title,
    titleUr: translations.ur.title,
    titleAr: translations.ar.title,
    titleFr: translations.fr.title,
    titleId: translations.id.title,
    contentEn: englishArticle.content,
    contentUr: translations.ur.content,
    contentAr: translations.ar.content,
    contentFr: translations.fr.content,
    contentId: translations.id.content,
    metaDescriptionEn: englishArticle.metaDescription,
    metaDescriptionUr: translations.ur.metaDescription,
    keywords: englishArticle.keywords,
    // Generated content enters the review queue. Only a human approval in the
    // admin review page moves it to 'published'.
    status: "pending_review",
    isPublished: false,
    aiGenerated: true,
  });

  return NextResponse.json({
    success: true,
    slug,
    title: englishArticle.title,
    status: "pending_review",
    languages: ["en", "ur", "ar", "fr", "id"],
  });
}

// withCron adds auth + failure alerting to both entry points.
export const GET = withCron("/api/blog/generate", generateBlog, {
  allowAdminSecret: true,
});
export const POST = withCron("/api/blog/generate", generateBlog, {
  allowAdminSecret: true,
});
