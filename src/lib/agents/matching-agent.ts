import { BaseAgent } from "./base-agent";
import type { AgentName, AgentTask } from "./types";

export class MatchingAgent extends BaseAgent {
  name: AgentName = "matching-agent";
  systemPrompt = `You are a student-teacher matching specialist for Tibyaan Academy.
You analyze compatibility between students and teachers based on multiple factors.

Factors to consider (in order of importance):
1. Language compatibility — student and teacher must share a common language
2. Course specialization — teacher must be qualified for the requested course
3. Schedule compatibility — overlapping available times considering timezones
4. Experience level — match teacher experience with student needs
5. Teacher availability — teachers with fewer students get slight preference
6. Teaching style — beginner-friendly for new students, advanced for experienced`;

  protected async run(task: AgentTask) {
    switch (task.type) {
      case "score_match":
        return this.scoreMatch(task);
      case "suggest_teachers":
        return this.suggestTeachers(task);
      default:
        throw new Error(`MatchingAgent: unsupported task type ${task.type}`);
    }
  }

  private async scoreMatch(task: AgentTask) {
    const { studentProfile, teacherProfile, courseType } = task.input as {
      studentProfile: Record<string, unknown>;
      teacherProfile: Record<string, unknown>;
      courseType: string;
    };

    const { text, tokensUsed } = await this.callClaude(
      [
        {
          role: "user",
          content: `Score the compatibility between this student and teacher for a ${courseType} course.

Student Profile: ${JSON.stringify(studentProfile)}
Teacher Profile: ${JSON.stringify(teacherProfile)}

Respond in JSON:
\`\`\`json
{
  "score": 85,
  "reasons": ["Strong language match", "Teacher specializes in this course"]
}
\`\`\``,
        },
      ],
      { maxTokens: 512, temperature: 0.3 }
    );

    return { output: this.parseJSON<Record<string, unknown>>(text), tokensUsed };
  }

  private async suggestTeachers(task: AgentTask) {
    const { studentProfile, courseType, availableTeachers } = task.input as {
      studentProfile: Record<string, unknown>;
      courseType: string;
      availableTeachers: Array<Record<string, unknown>>;
    };

    const { text, tokensUsed } = await this.callClaude(
      [
        {
          role: "user",
          content: `Suggest the top 3 most compatible teachers for this student.

Student Profile: ${JSON.stringify(studentProfile)}
Course Type: ${courseType}
Available Teachers: ${JSON.stringify(availableTeachers.slice(0, 20))}

Respond in JSON:
\`\`\`json
{
  "suggestions": [
    { "teacherId": "id1", "score": 92, "reasons": ["reason1", "reason2"] },
    { "teacherId": "id2", "score": 85, "reasons": ["reason1"] },
    { "teacherId": "id3", "score": 78, "reasons": ["reason1"] }
  ]
}
\`\`\``,
        },
      ],
      { maxTokens: 1024, temperature: 0.3 }
    );

    return { output: this.parseJSON<Record<string, unknown>>(text), tokensUsed };
  }
}
