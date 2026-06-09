import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { oddsSnapshots } from "@/db/schema";
import { getOddsSummary } from "./odds";
import type { MatchOddsSummary } from "./types";

export async function getPersistedOddsSummary(matchId: string): Promise<MatchOddsSummary | null> {
  if (!db) {
    return getOddsSummary(matchId);
  }

  const rows = await db
    .select()
    .from(oddsSnapshots)
    .where(eq(oddsSnapshots.matchId, matchId))
    .limit(1);

  if (!rows.length) {
    return getOddsSummary(matchId);
  }

  return rows[0].payload as MatchOddsSummary;
}

export async function saveOddsSummary(summary: MatchOddsSummary, providerEventId?: string) {
  if (!db) {
    return { persisted: false };
  }

  await db
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

  return { persisted: true };
}
