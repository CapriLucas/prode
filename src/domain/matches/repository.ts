import { db } from "@/db/client";
import { matches as matchesTable } from "@/db/schema";
import { getMatches as getSeedMatches } from "./matches";
import type { Match } from "./types";

export async function getPersistedMatches(): Promise<Match[]> {
  if (!db) {
    return getSeedMatches();
  }

  const rows = await db.select().from(matchesTable).orderBy(matchesTable.startsAt);

  if (!rows.length) {
    return getSeedMatches();
  }

  return rows.map((row) => ({
    id: row.id,
    startsAt: row.startsAt.toISOString(),
    phase: row.phase as Match["phase"],
    homeTeam: row.homeTeam,
    awayTeam: row.awayTeam,
    venue: row.venue,
    status: row.status as Match["status"],
    group: row.group ?? undefined,
    placeholder: row.placeholder,
  }));
}

export async function seedMatchesIfEmpty() {
  if (!db) {
    return { inserted: 0, skipped: true };
  }

  const existing = await db.select({ id: matchesTable.id }).from(matchesTable).limit(1);

  if (existing.length) {
    return { inserted: 0, skipped: true };
  }

  const seedMatches = getSeedMatches();

  await db.insert(matchesTable).values(
    seedMatches.map((match) => ({
      id: match.id,
      startsAt: new Date(match.startsAt),
      phase: match.phase,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      venue: match.venue,
      status: match.status,
      group: match.group,
      placeholder: match.placeholder ?? false,
    })),
  );

  return { inserted: seedMatches.length, skipped: false };
}
