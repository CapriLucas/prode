import { NextResponse } from "next/server";
import { getPersistedMatches, seedMatchesIfEmpty } from "@/domain/matches/repository";
import { syncOddsApiIo } from "@/domain/odds/providers/odds-api-io";

export async function POST() {
  await seedMatchesIfEmpty();
  const matches = await getPersistedMatches();
  const result = await syncOddsApiIo(matches);

  return NextResponse.json({
    ...result,
    finishedAt: new Date().toISOString(),
  });
}
