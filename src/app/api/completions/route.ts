import { NextRequest, NextResponse } from "next/server";
import {
  getCompletionRecords,
  saveCompletionRecord,
} from "@/domain/completions/repository";

export async function GET() {
  return NextResponse.json({
    records: await getCompletionRecords(),
    persisted: Boolean(process.env.DATABASE_URL),
  });
}

export async function PUT(request: NextRequest) {
  const payload = (await request.json()) as {
    matchId?: string;
    completed?: boolean;
    signature?: string;
    userScore?: string | null;
  };

  if (!payload.matchId) {
    return NextResponse.json({ error: "matchId es requerido." }, { status: 400 });
  }

  const result = await saveCompletionRecord({
    matchId: payload.matchId,
    completed: Boolean(payload.completed),
    signature: payload.signature ?? "sin-recomendacion",
    userScore: payload.userScore ?? null,
  });

  return NextResponse.json(result);
}
