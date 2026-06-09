import type { ConsensusMarket, ConsensusOutcome, MarketScope } from "@/domain/odds/types";
import type {
  ScoreRecommendation,
  ScoreRecommendationCandidate,
  ScoreRecommendationResult,
  WinnerPickKey,
} from "./types";

const pointsForSign = 3;
const pointsForExactScoreTotal = 6;
const visibleCandidates = 5;

export function recommendScoreByExpectedPoints({
  winnerMarket,
  correctScoreMarket,
}: {
  winnerMarket: ConsensusMarket | undefined;
  correctScoreMarket: ConsensusMarket | undefined;
}): ScoreRecommendationResult {
  if (!correctScoreMarket) {
    return {
      available: false,
      reason: "sin recomendación disponible",
      warnings: ["No hay mercado de resultado exacto para recomendar un marcador final."],
    };
  }

  const exactScores = correctScoreMarket.outcomes.filter(isValidScoreOutcome);

  if (!exactScores.length) {
    return {
      available: false,
      reason: "sin recomendación disponible",
      warnings: ["No hay marcadores exactos validos para calcular puntaje esperado."],
    };
  }

  const mostLikelyExactScore = exactScores[0];
  const winnerProbabilities = winnerMarket ? getWinnerProbabilities(winnerMarket) : null;

  if (!winnerMarket || !winnerProbabilities) {
    return buildFallbackRecommendation({
      correctScoreMarket,
      exactScores,
      mostLikelyExactScore,
      warning: "Faltan probabilidades de ganador/empate; se usa el resultado exacto mas probable.",
    });
  }

  const candidates = exactScores
    .map((outcome) => buildCandidate(outcome, winnerProbabilities))
    .filter((candidate): candidate is ScoreRecommendationCandidate => Boolean(candidate))
    .sort((a, b) => b.expectedPoints - a.expectedPoints);

  if (!candidates.length) {
    return buildFallbackRecommendation({
      correctScoreMarket,
      exactScores,
      mostLikelyExactScore,
      warning: "No se pudieron cruzar marcadores con probabilidades de signo; se usa el resultado exacto mas probable.",
    });
  }

  const recommended = candidates[0];
  const warnings = buildWarnings(winnerMarket, correctScoreMarket);

  return {
    available: true,
    recommended,
    candidates: candidates.slice(0, visibleCandidates),
    mostLikelyExactScore,
    differsFromMostLikelyExact: recommended.score !== mostLikelyExactScore.key,
    usedFallback: false,
    scope: resolveScope(winnerMarket.scope, correctScoreMarket.scope),
    warnings,
    explanation: buildExplanation(recommended, mostLikelyExactScore, false),
  };
}

function buildCandidate(
  outcome: ConsensusOutcome,
  winnerProbabilities: Map<WinnerPickKey, ConsensusOutcome>,
): ScoreRecommendationCandidate | null {
  const sign = getSignFromScore(outcome.key);
  const signOutcome = winnerProbabilities.get(sign);

  if (!signOutcome) {
    return null;
  }

  return {
    score: outcome.key,
    sign,
    signLabel: signOutcome.label,
    exactProbability: outcome.probability,
    signProbability: signOutcome.probability,
    expectedPoints: calculateExpectedPoints({
      exactProbability: outcome.probability,
      signProbability: signOutcome.probability,
    }),
  };
}

export function calculateExpectedPoints({
  exactProbability,
  signProbability,
}: {
  exactProbability: number;
  signProbability: number;
}) {
  const signOnlyProbability = Math.max(signProbability - exactProbability, 0);
  return exactProbability * pointsForExactScoreTotal + signOnlyProbability * pointsForSign;
}

function buildFallbackRecommendation({
  correctScoreMarket,
  exactScores,
  mostLikelyExactScore,
  warning,
}: {
  correctScoreMarket: ConsensusMarket;
  exactScores: ConsensusOutcome[];
  mostLikelyExactScore: ConsensusOutcome;
  warning: string;
}): ScoreRecommendation {
  const fallback = {
    score: mostLikelyExactScore.key,
    sign: getSignFromScore(mostLikelyExactScore.key),
    signLabel: getSignLabel(getSignFromScore(mostLikelyExactScore.key)),
    exactProbability: mostLikelyExactScore.probability,
    signProbability: mostLikelyExactScore.probability,
    expectedPoints: mostLikelyExactScore.probability * pointsForExactScoreTotal,
  };

  return {
    available: true,
    recommended: fallback,
    candidates: exactScores.slice(0, visibleCandidates).map((outcome) => ({
      score: outcome.key,
      sign: getSignFromScore(outcome.key),
      signLabel: getSignLabel(getSignFromScore(outcome.key)),
      exactProbability: outcome.probability,
      signProbability: outcome.probability,
      expectedPoints: outcome.probability * pointsForExactScoreTotal,
    })),
    mostLikelyExactScore,
    differsFromMostLikelyExact: false,
    usedFallback: true,
    scope: correctScoreMarket.scope,
    warnings: [warning, ...buildWarnings(undefined, correctScoreMarket)],
    explanation: buildExplanation(fallback, mostLikelyExactScore, true),
  };
}

function getWinnerProbabilities(market: ConsensusMarket) {
  const probabilities = new Map<WinnerPickKey, ConsensusOutcome>();

  for (const outcome of market.outcomes) {
    if (outcome.key === "home" || outcome.key === "draw" || outcome.key === "away") {
      probabilities.set(outcome.key, outcome);
    }
  }

  return probabilities.size ? probabilities : null;
}

function getSignFromScore(score: string): WinnerPickKey {
  const [home, away] = score.split("-").map(Number);

  if (home > away) {
    return "home";
  }

  if (away > home) {
    return "away";
  }

  return "draw";
}

function getSignLabel(sign: WinnerPickKey) {
  const labels = {
    home: "Local",
    draw: "Empate",
    away: "Visitante",
  };

  return labels[sign];
}

function isValidScoreOutcome(outcome: ConsensusOutcome) {
  return /^\d+-\d+$/.test(outcome.key);
}

function resolveScope(winnerScope: MarketScope, scoreScope: MarketScope): MarketScope {
  if (winnerScope === "90_minutes" || scoreScope === "90_minutes") {
    return "90_minutes";
  }

  return "includes_extra_time";
}

function buildWarnings(
  winnerMarket: ConsensusMarket | undefined,
  correctScoreMarket: ConsensusMarket,
) {
  const warnings = new Set<string>();

  if (winnerMarket?.scope === "90_minutes" || correctScoreMarket.scope === "90_minutes") {
    warnings.add("Algún mercado aplica a 90 minutos y puede no coincidir con el prode.");
  }

  if (winnerMarket?.incomplete || correctScoreMarket.incomplete) {
    warnings.add("El calculo usa solo casas y mercados con datos disponibles.");
  }

  if (winnerMarket?.stale || correctScoreMarket.stale) {
    warnings.add("Algunas cuotas estan desactualizadas.");
  }

  warnings.add("El resultado exacto vale 6 puntos totales, no 9.");
  warnings.add("No se consideran goles de tanda de penales.");

  return Array.from(warnings);
}

function buildExplanation(
  recommended: ScoreRecommendationCandidate,
  mostLikelyExactScore: ConsensusOutcome,
  usedFallback: boolean,
) {
  if (usedFallback) {
    return `${recommended.score} se recomienda como marcador simple porque faltan datos para optimizar el puntaje esperado completo.`;
  }

  if (recommended.score !== mostLikelyExactScore.key) {
    return `${recommended.score} maximiza el puntaje esperado al combinar probabilidad del signo ${recommended.signLabel} y probabilidad exacta, aunque ${mostLikelyExactScore.key} sea el marcador exacto mas probable individualmente.`;
  }

  return `${recommended.score} maximiza el puntaje esperado y tambien es el marcador exacto mas probable individualmente.`;
}
