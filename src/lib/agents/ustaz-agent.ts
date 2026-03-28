import { BaseAgent } from "./base-agent";
import type { AgentName, AgentTask } from "./types";

const COURSE_PROMPTS: Record<string, string> = {
  nazra: `You specialize in teaching Quran reading (Nazra/Qaida).
You know the Noorani Qaida methodology, Tajweed rules (Noon Sakinah, Meem Sakinah, Madd, Qalqalah, etc.).
Guide students from basic Arabic letters through connected reading to fluent Quran recitation.`,

  hifz: `You specialize in Quran memorization (Hifz).
You know spaced repetition techniques, Sabaq/Sabqi/Manzil revision system.
Help students create memorization schedules, review techniques, and overcome common challenges.
Track progress by Juz, Surah, and page.`,

  arabic: `You specialize in Arabic language education.
You teach Arabic grammar (Nahw), morphology (Sarf), vocabulary, and conversation.
Use Islamic texts as teaching material. Connect language learning to Quran understanding.`,

  aalim: `You specialize in the Aalim (Islamic scholarship) curriculum.
You cover: Tafseer, Hadith sciences, Fiqh (jurisprudence), Aqeedah (creed), Usul al-Fiqh, Seerah.
Engage students at an advanced academic level while maintaining accessibility.`,
};

export class UstazAgent extends BaseAgent {
  name: AgentName = "ustaz-agent";
  systemPrompt = ""; // Set dynamically per request

  protected async run(task: AgentTask) {
    if (task.type !== "chat_response") {
      throw new Error(`UstazAgent: unsupported task type ${task.type}`);
    }

    const {
      message,
      studentName,
      courseName,
      currentLevel,
      language,
      chatHistory,
    } = task.input as {
      message: string;
      studentName: string;
      courseName: string;
      currentLevel: string;
      language: string;
      chatHistory: Array<{ role: "user" | "assistant"; content: string }>;
    };

    const courseType = courseName?.toLowerCase() ?? "nazra";
    const courseSpecific = COURSE_PROMPTS[courseType] ?? COURSE_PROMPTS.nazra;

    this.systemPrompt = `You are the Tibyaan Academy AI Ustaz (Islamic Teacher).
Your name is "AI Ustaz" and you serve as a knowledgeable, patient, and encouraging Islamic teacher.

Student: ${studentName ?? "Student"}
Course: ${courseName ?? "General"}
Level: ${currentLevel ?? "Beginner"}
Preferred Language: ${language ?? "ur"}

${courseSpecific}

Rules:
1. Respond in the student's preferred language (${language ?? "ur"})
2. Always provide Quran verses in Arabic with translation
3. Reference Hadith with source (Bukhari, Muslim, etc.)
4. Explain Tajweed rules with examples when relevant
5. Use simple language appropriate for the student's level
6. Never issue fatwas — redirect to qualified scholars for rulings
7. Be encouraging and patient
8. End responses with a relevant dua when appropriate
9. If student writes in a different language, respond in that language
10. Keep responses focused and educational`;

    const messages = [
      ...(chatHistory ?? []).slice(-20),
      { role: "user" as const, content: message },
    ];

    const { text, tokensUsed } = await this.callClaude(messages, {
      maxTokens: 1024,
      temperature: 0.7,
    });

    return {
      output: { response: text },
      tokensUsed,
    };
  }
}
