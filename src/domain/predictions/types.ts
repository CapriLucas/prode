import type { ConsensusOutcome, MarketScope } from "@/domain/odds/types";

export type WinnerPickKey = "home" | "draw" | "away";

export type WinnerPrediction = {
  available: true;
  recommended: ConsensusOutcome & { key: WinnerPickKey };
  alternatives: Array<ConsensusOutcome & { key: WinnerPickKey }>;
  confidence: "alta" | "baja";
  marginToSecond: number;
  scope: MarketScope;
  bookmakerCount: number;
  expectedBookmakerCount: number;
  lastUpdatedAt: string | null;
  incomplete: boolean;
  stale: boolean;
  drawApplicable: boolean;
  warnings: string[];
  explanation: string;
};

export type UnavailableWinnerPrediction = {
  available: false;
  reason: string;
  warnings: string[];
};

export type WinnerPredictionResult = WinnerPrediction | UnavailableWinnerPrediction;

export type CorrectScorePrediction = {
  available: true;
  recommended: ConsensusOutcome;
  alternatives: ConsensusOutcome[];
  confidence: "alta" | "baja";
  marginToSecond: number;
  scope: MarketScope;
  bookmakerCount: number;
  expectedBookmakerCount: number;
  lastUpdatedAt: string | null;
  incomplete: boolean;
  stale: boolean;
  warnings: string[];
  explanation: string;
};

export type UnavailableCorrectScorePrediction = {
  available: false;
  reason: string;
  warnings: string[];
};

export type CorrectScorePredictionResult =
  | CorrectScorePrediction
  | UnavailableCorrectScorePrediction;
