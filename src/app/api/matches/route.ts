import { NextResponse } from "next/server";
import { getMatches } from "@/domain/matches/matches";

export function GET() {
  return NextResponse.json({
    source: "seed",
    updatedAt: new Date().toISOString(),
    matches: getMatches(),
  });
}
