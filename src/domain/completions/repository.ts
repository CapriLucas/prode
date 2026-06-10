import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { completionRecords } from "@/db/schema";

export type PersistedCompletionRecord = {
  completed: boolean;
  signature: string;
};

export async function getCompletionRecords(): Promise<
  Record<string, PersistedCompletionRecord>
> {
  if (!db) {
    return {};
  }

  const database = db;
  const rows = await tryQuery(() => database.select().from(completionRecords));

  if (!rows) {
    return {};
  }

  return Object.fromEntries(
    rows.map((row) => [
      row.matchId,
      {
        completed: row.completed,
        signature: row.signature,
      },
    ]),
  );
}

export async function saveCompletionRecord({
  matchId,
  completed,
  signature,
}: {
  matchId: string;
  completed: boolean;
  signature: string;
}) {
  if (!db) {
    return { persisted: false };
  }

  const database = db;

  if (!completed) {
    const deleted = await tryQuery(() =>
      database.delete(completionRecords).where(eq(completionRecords.matchId, matchId)),
    );
    return { persisted: Boolean(deleted) };
  }

  const saved = await tryQuery(() =>
    database
      .insert(completionRecords)
      .values({
        matchId,
        completed,
        signature,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: completionRecords.matchId,
        set: {
          completed,
          signature,
          updatedAt: new Date(),
        },
      }),
  );

  return { persisted: Boolean(saved) };
}

async function tryQuery<T>(query: () => Promise<T>) {
  try {
    return await query();
  } catch {
    return null;
  }
}
