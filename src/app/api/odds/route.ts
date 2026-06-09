import { NextRequest, NextResponse } from "next/server";
import { getMatches } from "@/domain/matches/matches";
import { getOddsSummary } from "@/domain/odds/odds";

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

  const summary = getOddsSummary(matchId);

  if (!summary) {
    return NextResponse.json(
      {
        matchId,
        source: "mock-provider",
        generatedAt: new Date().toISOString(),
        expectedBookmakers: [],
        markets: [],
        warnings: ["No hay probabilidades disponibles para este partido."],
      },
      { status: 200 },
    );
  }

  return NextResponse.json(summary);
}
