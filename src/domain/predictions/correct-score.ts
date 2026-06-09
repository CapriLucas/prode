import type { ConsensusMarket, ConsensusOutcome } from "@/domain/odds/types";
import type { CorrectScorePrediction, CorrectScorePredictionResult } from "./types";

const lowConfidenceMargin = 0.04;
const visibleAlternatives = 5;

export function predictCorrectScoreFromMarket(
  market: ConsensusMarket | undefined,
): CorrectScorePredictionResult {
  if (!market) {
    return {
      available: false,
      reason: "sin resultado exacto disponible",
      warnings: ["No hay mercado de resultado exacto para este partido."],
    };
  }

  const validOutcomes = market.outcomes.filter(isValidScoreOutcome);

  if (!validOutcomes.length) {
    return {
      available: false,
      reason: "sin resultado exacto disponible",
      warnings: ["No hay marcadores exactos validos para este partido."],
    };
  }

  const sorted = [...validOutcomes].sort((a, b) => b.probability - a.probability);
  const recommended = sorted[0];
  const second = sorted[1];
  const marginToSecond = second ? recommended.probability - second.probability : 1;
  const confidence = marginToSecond <= lowConfidenceMargin ? "baja" : "alta";
  const warnings = buildWarnings(market, confidence);

  return {
    available: true,
    recommended,
    alternatives: sorted.slice(0, visibleAlternatives),
    confidence,
    marginToSecond,
    scope: market.scope,
    bookmakerCount: market.bookmakerCount,
    expectedBookmakerCount: market.expectedBookmakerCount,
    lastUpdatedAt: market.lastUpdatedAt,
    incomplete: market.incomplete,
    stale: market.stale,
    warnings,
    explanation: buildExplanation(recommended, confidence, market.scope),
  };
}

function isValidScoreOutcome(outcome: ConsensusOutcome) {
  return /^\d+-\d+$/.test(outcome.key);
}

function buildWarnings(
  market: ConsensusMarket,
  confidence: CorrectScorePrediction["confidence"],
) {
  const warnings: string[] = [];

  if (confidence === "baja") {
    warnings.push("Los marcadores principales estan muy cerca; la recomendacion tiene baja confianza.");
  }

  if (market.scope === "90_minutes") {
    warnings.push("El mercado de resultado exacto aplica a 90 minutos y puede no coincidir con el prode.");
  }

  if (market.incomplete) {
    warnings.push("El consenso usa solo las casas con resultado exacto disponible.");
  }

  if (market.stale) {
    warnings.push("Algunas cuotas de resultado exacto estan desactualizadas.");
  }

  warnings.push("No se consideran goles de tanda de penales.");

  return warnings;
}

function buildExplanation(
  recommended: ConsensusOutcome,
  confidence: CorrectScorePrediction["confidence"],
  scope: CorrectScorePrediction["scope"],
) {
  const scopeText =
    scope === "includes_extra_time" ? "incluyendo prorroga" : "solo para 90 minutos";
  const confidenceText =
    confidence === "alta"
      ? "con una diferencia razonable frente al resto de marcadores"
      : "aunque otros marcadores tienen probabilidades cercanas";

  return `${recommended.label} es el resultado exacto con mayor probabilidad consenso ${scopeText}, ${confidenceText}.`;
}
