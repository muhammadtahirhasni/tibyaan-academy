import { BaseAgent } from "./base-agent";
import type { AgentName, AgentTask } from "./types";

export class ModerationAgent extends BaseAgent {
  name: AgentName = "moderation-agent";
  systemPrompt = `You are a content moderation assistant for Tibyaan Academy, a digital Islamic education platform.
You review submitted content (video titles, descriptions, reviews, messages) for appropriateness.

Rules:
- Flag content not related to Islamic education
- Flag inappropriate language, spam, or promotional content
- Be culturally sensitive — Islamic terms and Arabic phrases are expected and normal
- Never auto-approve or auto-reject — always provide a recommendation with confidence score
- Consider that teachers may use various languages (Urdu, Arabic, English, French, Indonesian)
- Teacher videos are expected to be Quran recitation (tilawat), lessons, or introductions`;

  protected async run(task: AgentTask) {
    switch (task.type) {
      case "moderate_video":
        return this.moderateVideo(task);
      case "moderate_content":
        return this.moderateContent(task);
      default:
        throw new Error(`ModerationAgent: unsupported task type ${task.type}`);
    }
  }

  private async moderateVideo(task: AgentTask) {
    const { title, description, teacherName } = task.input as {
      title: string;
      description: string;
      teacherName: string;
    };

    const { text, tokensUsed } = await this.callClaude(
      [
        {
          role: "user",
          content: `Review this teacher video submission for appropriateness on an Islamic education platform.

Teacher: ${teacherName}
Video Title: ${title}
Description: ${description ?? "No description provided"}

Respond in JSON:
\`\`\`json
{
  "recommendation": "approve" | "review" | "reject",
  "reasons": ["reason1", "reason2"],
  "confidence": 0.95
}
\`\`\``,
        },
      ],
      { maxTokens: 512, temperature: 0.3 }
    );

    return { output: this.parseJSON<Record<string, unknown>>(text), tokensUsed };
  }

  private async moderateContent(task: AgentTask) {
    const { content, contentType } = task.input as {
      content: string;
      contentType: string;
    };

    const { text, tokensUsed } = await this.callClaude(
      [
        {
          role: "user",
          content: `Review this ${contentType} for appropriateness on an Islamic education platform.

Content: ${content.slice(0, 2000)}

Respond in JSON:
\`\`\`json
{
  "isAppropriate": true,
  "flags": [],
  "suggestion": "Brief suggestion if any issues found"
}
\`\`\``,
        },
      ],
      { maxTokens: 512, temperature: 0.3 }
    );

    return { output: this.parseJSON<Record<string, unknown>>(text), tokensUsed };
  }
}
