import { getPersistedOddsSummary } from "@/domain/odds/repository";
import { recommendScoreByExpectedPoints } from "@/domain/predictions/scoring";
import type { ScoreRecommendationResult } from "@/domain/predictions/types";
import type { Match } from "@/domain/matches/types";

export type MatchReviewItem = {
  matchId: string;
  recommendation: ScoreRecommendationResult;
  signature: string;
  hasWarning: boolean;
};

export async function buildMatchReviewItems(matches: Match[]): Promise<MatchReviewItem[]> {
  return Promise.all(
    matches.map(async (match) => {
      const odds = await getPersistedOddsSummary(match.id);
    const winnerMarket = odds?.markets.find((market) => market.key === "match_winner");
    const correctScoreMarket = odds?.markets.find((market) => market.key === "correct_score");
    const recommendation = recommendScoreByExpectedPoints({
      winnerMarket,
      correctScoreMarket,
    });

      return {
        matchId: match.id,
        recommendation,
        signature: buildRecommendationSignature(recommendation),
        hasWarning:
          !recommendation.available ||
          recommendation.warnings.length > 0 ||
          (recommendation.available && recommendation.usedFallback),
      };
    }),
  );
}

function buildRecommendationSignature(recommendation: ScoreRecommendationResult): string {
  if (!recommendation.available) {
    return `unavailable:${recommendation.reason}`;
  }

  return [
    recommendation.recommended.score,
    recommendation.recommended.expectedPoints.toFixed(4),
    recommendation.recommended.sign,
    recommendation.scope,
    recommendation.usedFallback ? "fallback" : "optimized",
  ].join(":");
}
