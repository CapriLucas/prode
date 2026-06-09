import { NextResponse } from "next/server";
import { getPersistedMatches, seedMatchesIfEmpty } from "@/domain/matches/repository";
import { syncTheOddsApi } from "@/domain/odds/providers/the-odds-api";

export async function POST() {
  await seedMatchesIfEmpty();
  const matches = await getPersistedMatches();
  const result = await syncTheOddsApi(matches);

  return NextResponse.json({
    ...result,
    finishedAt: new Date().toISOString(),
  });
}
