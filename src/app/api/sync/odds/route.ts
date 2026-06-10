import { NextResponse } from "next/server";
import { getStoredMatches } from "@/domain/matches/repository";
import { syncOddsApiIo } from "@/domain/odds/providers/odds-api-io";

export async function POST() {
  const matches = await getStoredMatches();

  if (!matches.length) {
    return NextResponse.json({
      synced: 0,
      skipped: true,
      message: "No hay partidos persistidos. Ejecutar primero POST /api/sync/matches.",
      finishedAt: new Date().toISOString(),
    });
  }

  const result = await syncOddsApiIo(matches);

  return NextResponse.json({
    ...result,
    finishedAt: new Date().toISOString(),
  });
}
