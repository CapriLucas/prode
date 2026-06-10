import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { matches as matchesTable } from "@/db/schema";
import { getMatches as getSeedMatches } from "./matches";
import type { Match } from "./types";

export async function getPersistedMatches(): Promise<Match[]> {
  if (!db) {
    return getSeedMatches();
  }

  const database = db;
  const rows = await tryQuery(() =>
    database.select().from(matchesTable).orderBy(matchesTable.startsAt),
  );

  if (!rows) {
    return getSeedMatches();
  }

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

export async function getStoredMatches(): Promise<Match[]> {
  if (!db) {
    return getSeedMatches();
  }

  const database = db;
  const rows = await tryQuery(() =>
    database.select().from(matchesTable).orderBy(matchesTable.startsAt),
  );

  if (!rows) {
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

  const database = db;
  const existing = await tryQuery(() =>
    database.select({ id: matchesTable.id }).from(matchesTable).limit(1),
  );

  if (!existing) {
    return { inserted: 0, skipped: true };
  }

  if (existing.length) {
    return { inserted: 0, skipped: true };
  }

  const seedMatches = getSeedMatches();

  const inserted = await tryQuery(() =>
    database.insert(matchesTable).values(
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
    ),
  );

  if (!inserted) {
    return { inserted: 0, skipped: true };
  }

  return { inserted: seedMatches.length, skipped: false };
}

export async function upsertMatches(matches: Match[]) {
  if (!db) {
    return { upserted: 0 };
  }

  const database = db;
  const deleted = await tryQuery(() =>
    database.delete(matchesTable).where(eq(matchesTable.placeholder, true)),
  );

  if (!deleted) {
    return { upserted: 0 };
  }

  const upserted = await tryQuery(() =>
    database
      .insert(matchesTable)
      .values(
        matches.map((match) => ({
          id: match.id,
          startsAt: new Date(match.startsAt),
          phase: match.phase,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          venue: match.venue,
          status: match.status,
          group: match.group,
          placeholder: false,
        })),
      )
      .onConflictDoUpdate({
        target: matchesTable.id,
        set: {
          startsAt: sql`excluded.starts_at`,
          phase: sql`excluded.phase`,
          homeTeam: sql`excluded.home_team`,
          awayTeam: sql`excluded.away_team`,
          venue: sql`excluded.venue`,
          status: sql`excluded.status`,
          group: sql`excluded.group_name`,
        },
      }),
  );

  if (!upserted) {
    return { upserted: 0 };
  }

  return { upserted: matches.length };
}

export async function replaceMatches(matches: Match[]) {
  if (!db) {
    return { replaced: 0 };
  }

  const database = db;
  const deleted = await tryQuery(() => database.delete(matchesTable));

  if (!deleted) {
    return { replaced: 0 };
  }

  if (!matches.length) {
    return { replaced: 0 };
  }

  const inserted = await tryQuery(() =>
    database.insert(matchesTable).values(
      matches.map((match) => ({
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
    ),
  );

  if (!inserted) {
    return { replaced: 0 };
  }

  return { replaced: matches.length };
}

async function tryQuery<T>(query: () => Promise<T>) {
  try {
    return await query();
  } catch {
    return null;
  }
}
