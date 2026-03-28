import { BaseAgent } from "./base-agent";
import type { AgentName, AgentTask } from "./types";

interface LessonPlan {
  title: string;
  courseType: string;
  topic: string;
  level: string;
  duration: string;
  objectives: string[];
  activities: Array<{
    name: string;
    description: string;
    durationMinutes: number;
    type: "lecture" | "discussion" | "activity" | "recitation" | "assessment";
  }>;
  materials: string[];
  assessment: {
    method: string;
    criteria: string[];
  };
  islamicReferences: string[];
}

interface QuizQuestion {
  questionNumber: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  reference?: string;
}

interface StudentProgressAnalysis {
  studentName: string;
  overallGrade: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  hifzProgress: {
    currentJuz: number;
    completionPercentage: number;
    tajweedLevel: string;
    observations: string[];
  };
  academicProgress: {
    averageScore: number;
    trend: "improving" | "stable" | "declining";
    subjectBreakdown: Array<{
      subject: string;
      score: number;
      notes: string;
    }>;
  };
  actionPlan: Array<{
    area: string;
    action: string;
    timeline: string;
  }>;
}

export class TeacherAssistantAgent extends BaseAgent {
  name: AgentName = "teacher-assistant-agent";
  systemPrompt = `You are an Islamic education specialist assistant for Tibyaan Academy, a digital madrasah platform.
You help teachers with lesson planning, quiz generation, and student progress analysis.

Expertise areas:
- Quran: Hifz (memorization), Tilawah (recitation), Tafseer (interpretation), Tajweed rules
- Hadith: Study of prophetic traditions, authentication, and explanation
- Arabic: Classical Arabic grammar (Nahw), morphology (Sarf), and conversational Arabic
- Aalim course: Comprehensive Islamic scholarship covering Aqeedah, Fiqh, Usool, Seerah, and Islamic history

Rules:
- All lesson plans must be pedagogically sound and age/level-appropriate
- Quizzes must have clear, unambiguous questions with verified correct answers
- Student analysis must be constructive, balanced, and actionable
- All Islamic content must follow Sunni mainstream scholarly consensus
- Include authentic Quran/Hadith references where applicable
- Content must be culturally sensitive and respectful`;

  protected async run(task: AgentTask) {
    switch (task.type) {
      case "generate_lesson_plan":
        return this.generateLessonPlan(task);
      case "generate_quiz":
        return this.generateQuiz(task);
      case "analyze_student_progress":
        return this.analyzeStudentProgress(task);
      default:
        throw new Error(
          `TeacherAssistantAgent: unsupported task type ${task.type}`
        );
    }
  }

  private async generateLessonPlan(task: AgentTask) {
    const { courseType, topic, level, duration } = task.input as {
      courseType: string;
      topic: string;
      level: string;
      duration: string;
    };

    const { text, tokensUsed } = await this.callClaude(
      [
        {
          role: "user",
          content: `Create a detailed lesson plan for the following:

Course Type: ${courseType}
Topic: ${topic}
Level: ${level}
Duration: ${duration}

The lesson plan should be structured for an Islamic education setting at Tibyaan Academy.
Include practical activities suitable for online/hybrid learning.

Respond in JSON format:
\`\`\`json
{
  "title": "Lesson title",
  "courseType": "${courseType}",
  "topic": "${topic}",
  "level": "${level}",
  "duration": "${duration}",
  "objectives": ["Learning objective 1", "Learning objective 2"],
  "activities": [
    {
      "name": "Activity name",
      "description": "What students do",
      "durationMinutes": 15,
      "type": "lecture|discussion|activity|recitation|assessment"
    }
  ],
  "materials": ["Material 1", "Material 2"],
  "assessment": {
    "method": "How to assess learning",
    "criteria": ["Criterion 1", "Criterion 2"]
  },
  "islamicReferences": ["Quran/Hadith references used in lesson"]
}
\`\`\``,
        },
      ],
      { maxTokens: 3072 }
    );

    const parsed = this.parseJSON<LessonPlan>(text);

    return {
      output: parsed as unknown as Record<string, unknown>,
      tokensUsed,
    };
  }

  private async generateQuiz(task: AgentTask) {
    const { courseType, topic, level, questionCount } = task.input as {
      courseType: string;
      topic: string;
      level: string;
      questionCount: number;
    };

    const count = questionCount ?? 10;

    const { text, tokensUsed } = await this.callClaude(
      [
        {
          role: "user",
          content: `Generate a quiz for the following:

Course Type: ${courseType}
Topic: ${topic}
Level: ${level}
Number of Questions: ${count}

Create a mix of difficulty levels (easy, medium, hard).
Each question must have 4 options with exactly one correct answer.
For Quran/Hadith questions, include the source reference.

Respond in JSON format:
\`\`\`json
{
  "questions": [
    {
      "questionNumber": 1,
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct with reference",
      "difficulty": "easy|medium|hard",
      "reference": "Optional Quran/Hadith reference"
    }
  ]
}
\`\`\``,
        },
      ],
      { maxTokens: 4096 }
    );

    const parsed = this.parseJSON<{ questions: QuizQuestion[] }>(text);

    return {
      output: {
        courseType,
        topic,
        level,
        questionCount: parsed.questions.length,
        questions: parsed.questions,
      } as unknown as Record<string, unknown>,
      tokensUsed,
    };
  }

  private async analyzeStudentProgress(task: AgentTask) {
    const { studentName, hifzData, lessonData, testData } = task.input as {
      studentName: string;
      hifzData: Record<string, unknown>;
      lessonData: Record<string, unknown>;
      testData: Record<string, unknown>;
    };

    const { text, tokensUsed } = await this.callClaude(
      [
        {
          role: "user",
          content: `Analyze the following student's progress and provide a comprehensive report:

Student Name: ${studentName}

Hifz (Quran Memorization) Data:
${JSON.stringify(hifzData, null, 2)}

Lesson Attendance & Participation Data:
${JSON.stringify(lessonData, null, 2)}

Test & Assessment Data:
${JSON.stringify(testData, null, 2)}

Provide a thorough, constructive analysis focusing on actionable recommendations.
Be encouraging while honestly identifying areas for improvement.

Respond in JSON format:
\`\`\`json
{
  "studentName": "${studentName}",
  "overallGrade": "A/B/C/D/F or descriptive grade",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Area for improvement 1", "Area for improvement 2"],
  "recommendations": ["Specific recommendation 1", "Specific recommendation 2"],
  "hifzProgress": {
    "currentJuz": 5,
    "completionPercentage": 16.7,
    "tajweedLevel": "Beginner/Intermediate/Advanced",
    "observations": ["Observation 1"]
  },
  "academicProgress": {
    "averageScore": 78,
    "trend": "improving|stable|declining",
    "subjectBreakdown": [
      { "subject": "Subject name", "score": 85, "notes": "Performance notes" }
    ]
  },
  "actionPlan": [
    { "area": "Focus area", "action": "What to do", "timeline": "When" }
  ]
}
\`\`\``,
        },
      ],
      { maxTokens: 4096 }
    );

    const parsed = this.parseJSON<StudentProgressAnalysis>(text);

    return {
      output: parsed as unknown as Record<string, unknown>,
      tokensUsed,
    };
  }
}
