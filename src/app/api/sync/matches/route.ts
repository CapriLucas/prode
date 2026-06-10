import { NextResponse } from "next/server";
import { syncOddsApiIoMatches } from "@/domain/matches/providers/odds-api-io";

export async function POST() {
  const result = await syncOddsApiIoMatches();

  return NextResponse.json({
    ...result,
    finishedAt: new Date().toISOString(),
  });
}
