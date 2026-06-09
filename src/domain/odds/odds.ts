import { expectedBookmakers, oddsByMatchId } from "@/data/seeds/odds";
import type {
  BookmakerOdds,
  ConsensusMarket,
  ConsensusOutcome,
  MarketKey,
  MatchOddsSummary,
} from "./types";

const staleAfterHours = 24;

export function getOddsSummary(matchId: string): MatchOddsSummary | null {
  const bookmakers = oddsByMatchId[matchId];

  if (!bookmakers?.length) {
    return null;
  }

  return getOddsSummaryFromBookmakers({
    matchId,
    source: "mock-provider",
    expectedBookmakers,
    bookmakers,
  });
}

export function getOddsSummaryFromBookmakers({
  matchId,
  source,
  expectedBookmakers: expected,
  bookmakers,
}: {
  matchId: string;
  source: MatchOddsSummary["source"];
  expectedBookmakers: string[];
  bookmakers: BookmakerOdds[];
}): MatchOddsSummary {
  const markets = [
    buildConsensusMarket(bookmakers, "match_winner", expected),
    buildConsensusMarket(bookmakers, "correct_score", expected),
  ].filter((market): market is ConsensusMarket => Boolean(market));

  const warnings = buildWarnings(markets);

  return {
    matchId,
    source,
    generatedAt: new Date().toISOString(),
    expectedBookmakers: expected,
    markets,
    warnings,
  };
}

export function impliedProbability(odds: number): number {
  if (odds <= 1) {
    return 0;
  }

  return 1 / odds;
}

function buildConsensusMarket(
  bookmakers: BookmakerOdds[],
  marketKey: MarketKey,
  expected: string[],
): ConsensusMarket | null {
  const entries = bookmakers
    .map((bookmaker) => ({
      bookmaker,
      market: bookmaker.markets.find((market) => market.key === marketKey),
    }))
    .filter((entry) => entry.market);

  if (!entries.length) {
    return null;
  }

  const outcomeMap = new Map<
    string,
    { label: string; probabilities: number[]; odds: number[]; bookmakers: Set<string> }
  >();

  for (const { bookmaker, market } of entries) {
    for (const outcome of market?.outcomes ?? []) {
      if (outcome.includesPenaltyShootout) {
        continue;
      }

      const current = outcomeMap.get(outcome.key) ?? {
        label: outcome.label,
        probabilities: [],
        odds: [],
        bookmakers: new Set<string>(),
      };

      current.probabilities.push(impliedProbability(outcome.odds));
      current.odds.push(outcome.odds);
      current.bookmakers.add(bookmaker.bookmaker);
      outcomeMap.set(outcome.key, current);
    }
  }

  const outcomes = normalizeOutcomes(
    Array.from(outcomeMap.entries()).map(([key, value]) => ({
      key,
      label: value.label,
      probability: average(value.probabilities),
      bookmakerCount: value.bookmakers.size,
      averageOdds: average(value.odds),
    })),
  );

  const lastUpdatedAt = latestDate(entries.map((entry) => entry.bookmaker.updatedAt));
  const missingBookmakers = expected.filter(
    (bookmaker) => !entries.some((entry) => entry.bookmaker.bookmaker === bookmaker),
  );

  return {
    key: marketKey,
    scope: mostCommon(entries.map((entry) => entry.market?.scope ?? "90_minutes")),
    outcomes,
    bookmakerCount: entries.length,
    expectedBookmakerCount: expected.length,
    lastUpdatedAt,
    incomplete: entries.length < expectedBookmakers.length,
    stale: entries.some((entry) => isStale(entry.bookmaker.updatedAt)),
    missingBookmakers,
  };
}

function normalizeOutcomes(outcomes: ConsensusOutcome[]): ConsensusOutcome[] {
  const total = outcomes.reduce((sum, outcome) => sum + outcome.probability, 0);

  if (total === 0) {
    return outcomes;
  }

  return outcomes
    .map((outcome) => ({
      ...outcome,
      probability: outcome.probability / total,
    }))
    .sort((a, b) => b.probability - a.probability);
}

function average(values: number[]): number {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function latestDate(values: string[]): string | null {
  if (!values.length) {
    return null;
  }

  return new Date(Math.max(...values.map((value) => new Date(value).getTime()))).toISOString();
}

function isStale(value: string): boolean {
  const ageMs = Date.now() - new Date(value).getTime();
  return ageMs > staleAfterHours * 60 * 60 * 1000;
}

function mostCommon<T extends string>(values: T[]): T {
  const counts = new Map<T, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function buildWarnings(markets: ConsensusMarket[]): string[] {
  const warnings = new Set<string>();

  for (const market of markets) {
    if (market.incomplete) {
      warnings.add("Hay casas sin datos para algun mercado; el consenso usa las disponibles.");
    }

    if (market.stale) {
      warnings.add("Algunas cuotas estan desactualizadas y pueden no reflejar el mercado actual.");
    }

    if (market.scope === "90_minutes") {
      warnings.add("Algun mercado aplica a 90 minutos y puede no coincidir con la regla del prode.");
    }
  }

  warnings.add("Las probabilidades excluyen tanda de penales y no son recomendacion de apuesta.");

  return Array.from(warnings);
}
