import { NextRequest, NextResponse } from "next/server";
import { getMatches } from "@/domain/matches/matches";
import { getOddsSummary } from "@/domain/odds/odds";
import { recommendScoreByExpectedPoints } from "@/domain/predictions/scoring";

export function GET(request: NextRequest) {
  const matchId = request.nextUrl.searchParams.get("matchId");

  if (!matchId) {
    return NextResponse.json(
      { error: "El parametro matchId es requerido." },
      { status: 400 },
    );
  }

  const match = getMatches().find((item) => item.id === matchId);

  if (!match) {
    return NextResponse.json(
      { error: "No existe un partido para el matchId solicitado." },
      { status: 404 },
    );
  }

  const odds = getOddsSummary(matchId);
  const winnerMarket = odds?.markets.find((item) => item.key === "match_winner");
  const correctScoreMarket = odds?.markets.find((item) => item.key === "correct_score");

  return NextResponse.json({
    matchId,
    generatedAt: new Date().toISOString(),
    recommendation: recommendScoreByExpectedPoints({
      winnerMarket,
      correctScoreMarket,
    }),
  });
}
