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

  const rows = await db.select().from(completionRecords);

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

  if (!completed) {
    await db.delete(completionRecords).where(eq(completionRecords.matchId, matchId));
    return { persisted: true };
  }

  await db
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
    });

  return { persisted: true };
}
