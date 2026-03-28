import { BaseAgent } from "./base-agent";
import type { AgentName, AgentTask } from "./types";

interface TajweedError {
  type: string;
  word: string;
  expected: string;
  description: string;
}

interface TajweedAnalysis {
  score: number;
  errors: TajweedError[];
  strengths: string[];
  suggestions: string[];
}

export class TajweedAgent extends BaseAgent {
  name: AgentName = "tajweed-agent";
  systemPrompt = `You are an expert in Quran tajweed (rules of Quranic recitation) for Tibyaan Academy, a digital madrasah.
You analyze Arabic transcription text for tajweed correctness and provide detailed feedback.

Your expertise covers all major tajweed rules including:
- Nun Sakinah and Tanween rules (Idghaam, Ikhfaa, Iqlaab, Izhar)
- Meem Sakinah rules (Idghaam Shafawi, Ikhfaa Shafawi, Izhar Shafawi)
- Qalqalah (echoing/bouncing sound on specific letters: ق ط ب ج د)
- Madd rules (natural Madd, connected/separated Madd, necessary Madd, etc.)
- Laam rules (Tafkheem and Tarqeeq of Laam in Allah's name)
- Raa rules (Tafkheem and Tarqeeq)
- Noon and Meem Mushaddad (Ghunnah)
- Stopping rules (Waqf) and starting rules (Ibtidaa)
- Heavy and light letter pronunciation (Tafkheem/Tarqeeq)

Rules:
- Evaluate the transcription against the correct Quran text for the given surah/ayah range
- Identify specific tajweed mistakes with the exact word and rule violated
- Be precise: reference the exact tajweed rule name in Arabic transliteration
- Provide constructive, educational feedback suitable for students
- Score must reflect overall accuracy (0 = completely incorrect, 100 = perfect recitation)
- Always respond in structured JSON format`;

  protected async run(task: AgentTask) {
    switch (task.type) {
      case "analyze_tajweed":
        return this.analyzeTajweed(task);
      default:
        throw new Error(`TajweedAgent: unsupported task type ${task.type}`);
    }
  }

  private async analyzeTajweed(task: AgentTask) {
    const { transcription, surahNumber, ayahFrom, ayahTo } = task.input as {
      transcription: string;
      surahNumber: number;
      ayahFrom: number;
      ayahTo: number;
    };

    const { text, tokensUsed } = await this.callClaude(
      [
        {
          role: "user",
          content: `Analyze the following Arabic transcription for tajweed correctness.

Surah: ${surahNumber}, Ayah range: ${ayahFrom}-${ayahTo}

Transcription:
${transcription}

Compare the transcription against the correct Quran text for the specified ayah range.
Identify all tajweed rule violations, noting the specific word, the rule that should apply,
and what the correct pronunciation should be.

Also list the tajweed rules that were applied correctly as strengths,
and provide suggestions for improvement.

Respond in JSON format:
\`\`\`json
{
  "score": 85,
  "errors": [
    {
      "type": "Ikhfaa",
      "word": "the Arabic word with the error",
      "expected": "what the correct application should be",
      "description": "Explanation of the tajweed rule violation"
    }
  ],
  "strengths": [
    "Correct application of Madd Tabee'i throughout",
    "Proper Ghunnah on Noon Mushaddad"
  ],
  "suggestions": [
    "Practice Ikhfaa rules with a teacher",
    "Review Qalqalah letters and their application"
  ]
}
\`\`\``,
        },
      ],
      { maxTokens: 2048, temperature: 0.3 }
    );

    const analysis = this.parseJSON<TajweedAnalysis>(text);

    return {
      output: {
        score: analysis.score,
        errors: analysis.errors,
        strengths: analysis.strengths,
        suggestions: analysis.suggestions,
        surahNumber,
        ayahRange: `${ayahFrom}-${ayahTo}`,
      } as Record<string, unknown>,
      tokensUsed,
    };
  }
}
