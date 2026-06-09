export type MarketKey = "match_winner" | "correct_score";

export type MarketScope = "90_minutes" | "includes_extra_time";

export type BookmakerOdds = {
  bookmaker: string;
  updatedAt: string;
  markets: OddsMarket[];
};

export type OddsMarket = {
  key: MarketKey;
  scope: MarketScope;
  outcomes: OddsOutcome[];
};

export type OddsOutcome = {
  key: string;
  label: string;
  odds: number;
  includesPenaltyShootout?: boolean;
};

export type ConsensusOutcome = {
  key: string;
  label: string;
  probability: number;
  bookmakerCount: number;
  averageOdds: number;
};

export type ConsensusMarket = {
  key: MarketKey;
  scope: MarketScope;
  outcomes: ConsensusOutcome[];
  bookmakerCount: number;
  expectedBookmakerCount: number;
  lastUpdatedAt: string | null;
  incomplete: boolean;
  stale: boolean;
  missingBookmakers: string[];
};

export type MatchOddsSummary = {
  matchId: string;
  source: "mock-provider" | "the-odds-api";
  generatedAt: string;
  expectedBookmakers: string[];
  markets: ConsensusMarket[];
  warnings: string[];
};
