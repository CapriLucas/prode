import { NextResponse } from "next/server";
import { getPersistedMatches, seedMatchesIfEmpty } from "@/domain/matches/repository";

export async function GET() {
  const matches = await getPersistedMatches();

  return NextResponse.json({
    source: process.env.DATABASE_URL ? "postgres-or-seed" : "seed",
    updatedAt: new Date().toISOString(),
    matches,
  });
}

export async function POST() {
  const result = await seedMatchesIfEmpty();

  return NextResponse.json({
    ...result,
    updatedAt: new Date().toISOString(),
  });
}
