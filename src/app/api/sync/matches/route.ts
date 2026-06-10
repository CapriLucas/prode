import { NextResponse } from "next/server";
import { syncFootballDataOrg } from "@/domain/matches/providers/football-data-org";

export async function POST() {
  const result = await syncFootballDataOrg();

  return NextResponse.json({
    ...result,
    finishedAt: new Date().toISOString(),
  });
}
