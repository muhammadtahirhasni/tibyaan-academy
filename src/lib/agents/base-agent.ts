import { getDb } from "@/lib/db";
import { agentLogs } from "@/lib/db/schema";
import type { AgentName, AgentResult, AgentTask } from "./types";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeResponse {
  content: Array<{ type: string; text: string }>;
  usage: { input_tokens: number; output_tokens: number };
}

export abstract class BaseAgent {
  abstract name: AgentName;
  abstract systemPrompt: string;

  protected model = "claude-sonnet-4-5-20250929";
  protected maxTokens = 4096;

  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    let tokensUsed = 0;

    try {
      const result = await this.run(task);
      tokensUsed = result.tokensUsed ?? 0;
      const durationMs = Date.now() - startTime;

      await this.log(task, "success", result.output, tokensUsed, durationMs);

      return {
        taskId: task.id,
        agent: this.name,
        status: "success",
        output: result.output,
        tokensUsed,
        durationMs,
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error";

      await this.log(
        task,
        "error",
        {},
        tokensUsed,
        durationMs,
        errorMessage
      );

      return {
        taskId: task.id,
        agent: this.name,
        status: "error",
        output: {},
        tokensUsed,
        durationMs,
        error: errorMessage,
      };
    }
  }

  protected abstract run(
    task: AgentTask
  ): Promise<{ output: Record<string, unknown>; tokensUsed?: number }>;

  protected async callClaude(
    messages: ClaudeMessage[],
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<{ text: string; tokensUsed: number }> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options?.maxTokens ?? this.maxTokens,
        temperature: options?.temperature ?? 0.7,
        system: this.systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Claude API error ${response.status}: ${errorBody}`);
    }

    const data = (await response.json()) as ClaudeResponse;
    const text = data.content[0]?.text ?? "";
    const tokensUsed = data.usage.input_tokens + data.usage.output_tokens;

    return { text, tokensUsed };
  }

  protected parseJSON<T>(text: string): T {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(jsonStr.trim()) as T;
  }

  private async log(
    task: AgentTask,
    status: "success" | "error",
    output: Record<string, unknown>,
    tokensUsed: number,
    durationMs: number,
    errorMessage?: string
  ) {
    try {
      const db = getDb();
      await db.insert(agentLogs).values({
        agentName: this.name,
        taskType: task.type,
        input: task.input,
        output,
        tokensUsed,
        durationMs,
        status,
        errorMessage: errorMessage ?? null,
      });
    } catch {
      console.error(`[${this.name}] Failed to log agent activity`);
    }
  }
}
