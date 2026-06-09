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

export type ScoreRecommendationCandidate = {
  score: string;
  sign: WinnerPickKey;
  signLabel: string;
  exactProbability: number;
  signProbability: number;
  expectedPoints: number;
};

export type ScoreRecommendation = {
  available: true;
  recommended: ScoreRecommendationCandidate;
  candidates: ScoreRecommendationCandidate[];
  mostLikelyExactScore: ConsensusOutcome;
  differsFromMostLikelyExact: boolean;
  usedFallback: boolean;
  scope: MarketScope;
  warnings: string[];
  explanation: string;
};

export type UnavailableScoreRecommendation = {
  available: false;
  reason: string;
  warnings: string[];
};

export type ScoreRecommendationResult =
  | ScoreRecommendation
  | UnavailableScoreRecommendation;
