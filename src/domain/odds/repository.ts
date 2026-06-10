import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { oddsSnapshots } from "@/db/schema";
import { getOddsSummary } from "./odds";
import type { MatchOddsSummary } from "./types";

export async function getPersistedOddsSummary(matchId: string): Promise<MatchOddsSummary | null> {
  if (!db) {
    return getOddsSummary(matchId);
  }

  const database = db;
  const rows = await tryQuery(() =>
    database
      .select()
      .from(oddsSnapshots)
      .where(eq(oddsSnapshots.matchId, matchId))
      .limit(1),
  );

  if (!rows) {
    return getOddsSummary(matchId);
  }

  if (!rows.length) {
    return getOddsSummary(matchId);
  }

  return rows[0].payload as MatchOddsSummary;
}

export async function saveOddsSummary(summary: MatchOddsSummary, providerEventId?: string) {
  if (!db) {
    return { persisted: false, error: "DATABASE_URL no configurada." };
  }

  const database = db;
  try {
    await database
      .insert(oddsSnapshots)
      .values({
        matchId: summary.matchId,
        source: summary.source,
        providerEventId,
        payload: summary,
        fetchedAt: new Date(summary.generatedAt),
      })
      .onConflictDoUpdate({
        target: oddsSnapshots.matchId,
        set: {
          source: summary.source,
          providerEventId,
          payload: summary,
          fetchedAt: new Date(summary.generatedAt),
        },
      });
  } catch (error) {
    return { persisted: false, error: getErrorMessage(error) };
  }

  return { persisted: true };
}

async function tryQuery<T>(query: () => Promise<T>) {
  try {
    return await query();
  } catch {
    return null;
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
