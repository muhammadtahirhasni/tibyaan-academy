import { BaseAgent } from "./base-agent";
import type { AgentName, AgentTask } from "./types";

export class SeoAgent extends BaseAgent {
  name: AgentName = "seo-agent";
  systemPrompt = `You are an SEO specialist for Tibyaan Academy, a digital Islamic education platform.
You optimize content for search engines while maintaining Islamic educational quality.

Rules:
- Meta descriptions: 150-160 characters
- Titles: under 60 characters
- Use keywords relevant to Islamic education, Quran learning, online madrasah
- Support multilingual SEO (Urdu, Arabic, English, French, Indonesian)
- Focus on long-tail keywords for Islamic education niche`;

  protected async run(task: AgentTask) {
    switch (task.type) {
      case "optimize_seo":
        return this.optimizeSeo(task);
      case "generate_meta":
        return this.generateMeta(task);
      default:
        throw new Error(`SeoAgent: unsupported task type ${task.type}`);
    }
  }

  private async optimizeSeo(task: AgentTask) {
    const { content, locale, pageType } = task.input as {
      content: string;
      locale: string;
      pageType: string;
    };

    const { text, tokensUsed } = await this.callClaude(
      [
        {
          role: "user",
          content: `Optimize this ${pageType} page content for SEO. Locale: ${locale}

Content: ${content.slice(0, 2000)}

Respond in JSON:
\`\`\`json
{
  "optimizedTitle": "SEO title under 60 chars",
  "metaDescription": "Meta description 150-160 chars",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "ogTitle": "Open Graph title",
  "ogDescription": "Open Graph description"
}
\`\`\``,
        },
      ],
      { maxTokens: 1024 }
    );

    return { output: this.parseJSON<Record<string, unknown>>(text), tokensUsed };
  }

  private async generateMeta(task: AgentTask) {
    const { title, content, locale } = task.input as {
      title: string;
      content: string;
      locale: string;
    };

    const { text, tokensUsed } = await this.callClaude(
      [
        {
          role: "user",
          content: `Generate SEO meta tags for this page. Locale: ${locale}

Title: ${title}
Content preview: ${content.slice(0, 1000)}

Respond in JSON:
\`\`\`json
{
  "metaTitle": "Page title for SEO",
  "metaDescription": "Description 150-160 chars",
  "keywords": ["keyword1", "keyword2"],
  "ogTitle": "OG title",
  "ogDescription": "OG description"
}
\`\`\``,
        },
      ],
      { maxTokens: 512 }
    );

    return { output: this.parseJSON<Record<string, unknown>>(text), tokensUsed };
  }
}
