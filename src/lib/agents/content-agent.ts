import { getDb } from "@/lib/db";
import { dailyDars, blogPosts } from "@/lib/db/schema";
import { BaseAgent } from "./base-agent";
import type { AgentName, AgentTask } from "./types";

const DARS_CATEGORIES = ["quran", "hadith", "fiqh", "seerah", "dua"] as const;

interface DarsContent {
  slug: string;
  titleEn: string;
  contentEn: string;
  sourceReference: string;
}

interface TranslatedDars {
  title: string;
  content: string;
}

interface BlogContent {
  slug: string;
  title: string;
  content: string;
  metaDescription: string;
  keywords: string[];
}

export class ContentAgent extends BaseAgent {
  name: AgentName = "content-agent";
  systemPrompt = `You are an Islamic education content specialist for Tibyaan Academy, a digital madrasah.
You create authentic, well-referenced Islamic educational content.

Rules:
- All Quran verses must include Arabic text and Surah:Ayah reference
- All Hadith must include source book (Bukhari, Muslim, etc.) and narrator
- Content must follow Sunni mainstream scholarly consensus
- Language must be simple, educational, and accessible
- Each piece must be original and unique
- Always provide source references`;

  protected async run(task: AgentTask) {
    switch (task.type) {
      case "generate_daily_dars":
        return this.generateDailyDars(task);
      case "generate_blog":
        return this.generateBlog(task);
      case "translate_content":
        return this.translateContent(task);
      default:
        throw new Error(`ContentAgent: unsupported task type ${task.type}`);
    }
  }

  private async generateDailyDars(task: AgentTask) {
    const category =
      (task.input.category as string) ??
      DARS_CATEGORIES[Math.floor(Math.random() * DARS_CATEGORIES.length)];

    const categoryPrompts: Record<string, string> = {
      quran: "Generate a short Quran Tafseer post. Pick a meaningful verse, provide Arabic text, translation, and brief tafseer (explanation). Include Surah name and verse number.",
      hadith: "Generate a Hadith of the Day post. Pick an authentic hadith, provide Arabic text, translation, narrator chain, and brief explanation of its lesson. Include source book.",
      fiqh: "Generate a short Fiqh Q&A. Pick a common daily practice question and answer it with scholarly evidence. Keep it practical.",
      seerah: "Generate a short Seerah episode. Pick an incident from Prophet Muhammad (PBUH) life with a lesson. Include historical context.",
      dua: "Generate a Daily Dua post. Pick a Sunnah dua, provide Arabic text, transliteration, translation, and when to recite it. Include source.",
    };

    const { text: englishJson, tokensUsed: genTokens } = await this.callClaude(
      [
        {
          role: "user",
          content: `${categoryPrompts[category]}

Respond in JSON format:
\`\`\`json
{
  "slug": "kebab-case-unique-slug-with-date",
  "titleEn": "Title in English",
  "contentEn": "Full content in Markdown format",
  "sourceReference": "Source reference (e.g., Sahih Bukhari #123)"
}
\`\`\``,
        },
      ],
      { maxTokens: 2048 }
    );

    const parsed = this.parseJSON<DarsContent>(englishJson);
    const today = new Date().toISOString().split("T")[0];
    const slug = `${today}-${parsed.slug}`;

    const translations: Record<string, TranslatedDars> = {};
    let totalTokens = genTokens;

    for (const lang of ["ur", "ar", "fr", "id"] as const) {
      const { text, tokensUsed } = await this.callClaude(
        [
          {
            role: "user",
            content: `Translate this Islamic educational content to ${lang === "ur" ? "Urdu" : lang === "ar" ? "Arabic" : lang === "fr" ? "French" : "Indonesian"}.
Keep Quran/Hadith Arabic text as-is. Only translate explanatory text.

Title: ${parsed.titleEn}
Content: ${parsed.contentEn}

Respond in JSON:
\`\`\`json
{ "title": "Translated title", "content": "Translated content in Markdown" }
\`\`\``,
          },
        ],
        { maxTokens: 2048 }
      );
      translations[lang] = this.parseJSON<TranslatedDars>(text);
      totalTokens += tokensUsed;
    }

    const db = getDb();
    await db.insert(dailyDars).values({
      slug,
      titleEn: parsed.titleEn,
      titleUr: translations.ur.title,
      titleAr: translations.ar.title,
      titleFr: translations.fr.title,
      titleId: translations.id.title,
      contentEn: parsed.contentEn,
      contentUr: translations.ur.content,
      contentAr: translations.ar.content,
      contentFr: translations.fr.content,
      contentId: translations.id.content,
      category: category as typeof DARS_CATEGORIES[number],
      sourceReference: parsed.sourceReference,
      generatedBy: this.name,
      isPublished: true,
      publishedAt: new Date(),
    });

    return {
      output: { slug, category, titleEn: parsed.titleEn },
      tokensUsed: totalTokens,
    };
  }

  private async generateBlog(task: AgentTask) {
    const topic = task.input.topic as string;

    const { text: englishJson, tokensUsed: genTokens } = await this.callClaude(
      [
        {
          role: "user",
          content: `Write a comprehensive SEO-optimized blog article about: "${topic}"
Target audience: Muslim parents and students interested in Islamic education online.

Respond in JSON:
\`\`\`json
{
  "slug": "kebab-case-slug",
  "title": "Article Title",
  "content": "Full article in Markdown (1000-1500 words)",
  "metaDescription": "150-160 char SEO description",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
\`\`\``,
        },
      ],
      { maxTokens: 4096 }
    );

    const parsed = this.parseJSON<BlogContent>(englishJson);
    const translations: Record<string, { title: string; content: string }> = {};
    let totalTokens = genTokens;

    for (const lang of ["ur", "ar", "fr", "id"] as const) {
      const langName =
        lang === "ur" ? "Urdu" : lang === "ar" ? "Arabic" : lang === "fr" ? "French" : "Indonesian";
      const { text, tokensUsed } = await this.callClaude(
        [
          {
            role: "user",
            content: `Translate this article to ${langName}. Keep proper nouns and Islamic terms.

Title: ${parsed.title}
Content: ${parsed.content}

Respond in JSON:
\`\`\`json
{ "title": "Translated title", "content": "Translated content" }
\`\`\``,
          },
        ],
        { maxTokens: 4096 }
      );
      translations[lang] = this.parseJSON<{ title: string; content: string }>(text);
      totalTokens += tokensUsed;
    }

    const db = getDb();
    await db.insert(blogPosts).values({
      slug: parsed.slug,
      titleEn: parsed.title,
      titleUr: translations.ur.title,
      titleAr: translations.ar.title,
      titleFr: translations.fr.title,
      titleId: translations.id.title,
      contentEn: parsed.content,
      contentUr: translations.ur.content,
      contentAr: translations.ar.content,
      contentFr: translations.fr.content,
      contentId: translations.id.content,
      metaDescriptionEn: parsed.metaDescription,
      keywords: parsed.keywords,
      isPublished: true,
      publishedAt: new Date(),
      aiGenerated: true,
    });

    return {
      output: { slug: parsed.slug, titleEn: parsed.title },
      tokensUsed: totalTokens,
    };
  }

  private async translateContent(task: AgentTask) {
    const { content, targetLanguage } = task.input as {
      content: string;
      targetLanguage: string;
    };
    const langName =
      targetLanguage === "ur"
        ? "Urdu"
        : targetLanguage === "ar"
          ? "Arabic"
          : targetLanguage === "fr"
            ? "French"
            : targetLanguage === "id"
              ? "Indonesian"
              : "English";

    const { text, tokensUsed } = await this.callClaude(
      [
        {
          role: "user",
          content: `Translate the following Islamic educational content to ${langName}. Keep Arabic Quran/Hadith text as-is.\n\n${content}`,
        },
      ],
      { maxTokens: 4096 }
    );

    return {
      output: { translatedContent: text },
      tokensUsed,
    };
  }
}
