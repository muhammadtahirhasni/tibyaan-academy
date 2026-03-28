import { BaseAgent } from "./base-agent";
import type { AgentName, AgentTask } from "./types";

interface TimeSlot {
  day: string;
  time: string;
}

interface ScheduleInput {
  studentTimezone: string;
  preferredDays: string[];
  preferredTime: { start: string; end: string };
  teacherSchedule: TimeSlot[];
  existingClasses: TimeSlot[];
}

interface SuggestedSlot {
  day: string;
  time: string;
  score: number;
  reason: string;
}

export class SchedulingAgent extends BaseAgent {
  name: AgentName = "scheduling-agent";
  systemPrompt = `You are an intelligent scheduling assistant for Tibyaan Academy, an Islamic online academy.
You analyze student timezone, teacher availability, existing class conflicts, and preferred days/times to suggest optimal class slots.

Rules:
- Consider prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) and avoid scheduling during them
- Account for cultural preferences (e.g., Friday Jumu'ah time, weekend patterns in Muslim-majority regions)
- Prioritize slots that align with both student and teacher availability
- Avoid back-to-back classes — leave at least 15 minutes buffer
- Score each suggestion from 0.0 to 1.0 based on overall suitability
- Always provide clear reasoning for each suggested slot
- Return exactly 3 suggestions sorted by score (highest first)`;

  protected async run(task: AgentTask) {
    switch (task.type) {
      case "suggest_schedule":
        return this.suggestSchedule(task);
      default:
        throw new Error(`SchedulingAgent: unsupported task type ${task.type}`);
    }
  }

  private async suggestSchedule(task: AgentTask) {
    const input = task.input as unknown as ScheduleInput;

    const { text, tokensUsed } = await this.callClaude(
      [
        {
          role: "user",
          content: `Analyze the following scheduling constraints and suggest 3 optimal class time slots.

Student Timezone: ${input.studentTimezone}
Preferred Days: ${input.preferredDays.join(", ")}
Preferred Time Window: ${input.preferredTime.start} - ${input.preferredTime.end}

Teacher Available Slots:
${input.teacherSchedule.map((s) => `- ${s.day} at ${s.time}`).join("\n")}

Existing Classes (conflicts to avoid):
${input.existingClasses.length > 0 ? input.existingClasses.map((c) => `- ${c.day} at ${c.time}`).join("\n") : "- None"}

Respond in JSON format:
\`\`\`json
[
  { "day": "Monday", "time": "10:00 AM", "score": 0.95, "reason": "Explanation" },
  { "day": "Wednesday", "time": "11:00 AM", "score": 0.85, "reason": "Explanation" },
  { "day": "Friday", "time": "09:00 AM", "score": 0.75, "reason": "Explanation" }
]
\`\`\``,
        },
      ],
      { maxTokens: 1024 }
    );

    const suggestions = this.parseJSON<SuggestedSlot[]>(text);

    return {
      output: { suggestions },
      tokensUsed,
    };
  }
}
