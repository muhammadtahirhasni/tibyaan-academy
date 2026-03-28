import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { users, agentLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AgentLogsClient } from "./agent-logs-client";

export default async function AdminAgentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/login`);

  const db = getDb();
  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!dbUser[0] || dbUser[0].role !== "admin") redirect(`/${locale}`);

  let logs: Array<{
    id: string;
    agentName: string;
    taskType: string;
    status: string;
    tokensUsed: number | null;
    durationMs: number | null;
    errorMessage: string | null;
    createdAt: string;
  }> = [];

  try {
    const raw = await db
      .select()
      .from(agentLogs)
      .orderBy(desc(agentLogs.createdAt))
      .limit(100);

    logs = raw.map((l) => ({
      id: l.id,
      agentName: l.agentName,
      taskType: l.taskType,
      status: l.status,
      tokensUsed: l.tokensUsed,
      durationMs: l.durationMs,
      errorMessage: l.errorMessage,
      createdAt: l.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("Failed to load agent logs:", err);
  }

  return <AgentLogsClient logs={logs} />;
}
