import { NextRequest, NextResponse } from "next/server";
import { getPersistedMatches } from "@/domain/matches/repository";
import { getPersistedOddsSummary } from "@/domain/odds/repository";
import { predictWinnerFromMarket } from "@/domain/predictions/winner";

export async function GET(request: NextRequest) {
  const matchId = request.nextUrl.searchParams.get("matchId");

  if (!matchId) {
    return NextResponse.json(
      { error: "El parametro matchId es requerido." },
      { status: 400 },
    );
  }

  const match = (await getPersistedMatches()).find((item) => item.id === matchId);

  if (!match) {
    return NextResponse.json(
      { error: "No existe un partido para el matchId solicitado." },
      { status: 404 },
    );
  }

  const odds = await getPersistedOddsSummary(matchId);
  const market = odds?.markets.find((item) => item.key === "match_winner");

  return NextResponse.json({
    matchId,
    generatedAt: new Date().toISOString(),
    prediction: predictWinnerFromMarket(market),
  });
}
