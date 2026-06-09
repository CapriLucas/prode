import type { ConsensusMarket, ConsensusOutcome } from "@/domain/odds/types";
import type {
  WinnerPickKey,
  WinnerPrediction,
  WinnerPredictionResult,
} from "./types";

const lowConfidenceMargin = 0.08;

export function predictWinnerFromMarket(
  market: ConsensusMarket | undefined,
): WinnerPredictionResult {
  if (!market) {
    return {
      available: false,
      reason: "sin recomendación disponible",
      warnings: ["No hay mercado de ganador/empate/ganador para este partido."],
    };
  }

  const validOutcomes = market.outcomes.filter(isWinnerOutcome);

  if (!validOutcomes.length) {
    return {
      available: false,
      reason: "sin recomendación disponible",
      warnings: ["No hay probabilidades validas para local, empate o visitante."],
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
    alternatives: sorted,
    confidence,
    marginToSecond,
    scope: market.scope,
    bookmakerCount: market.bookmakerCount,
    expectedBookmakerCount: market.expectedBookmakerCount,
    lastUpdatedAt: market.lastUpdatedAt,
    incomplete: market.incomplete,
    stale: market.stale,
    drawApplicable: validOutcomes.some((outcome) => outcome.key === "draw"),
    warnings,
    explanation: buildExplanation(recommended, confidence, market.scope),
  };
}

function isWinnerOutcome(
  outcome: ConsensusOutcome,
): outcome is ConsensusOutcome & { key: WinnerPickKey } {
  return outcome.key === "home" || outcome.key === "draw" || outcome.key === "away";
}

function buildWarnings(market: ConsensusMarket, confidence: WinnerPrediction["confidence"]) {
  const warnings: string[] = [];

  if (confidence === "baja") {
    warnings.push("Las probabilidades estan muy cerca; la recomendacion tiene baja confianza.");
  }

  if (market.scope === "90_minutes") {
    warnings.push("El mercado disponible aplica a 90 minutos y puede no coincidir con el prode.");
  }

  if (market.incomplete) {
    warnings.push("El consenso usa solo las casas con datos disponibles.");
  }

  if (market.stale) {
    warnings.push("Algunas cuotas estan desactualizadas.");
  }

  return warnings;
}

function buildExplanation(
  recommended: ConsensusOutcome & { key: WinnerPickKey },
  confidence: WinnerPrediction["confidence"],
  scope: WinnerPrediction["scope"],
) {
  const scopeText =
    scope === "includes_extra_time" ? "incluyendo prorroga" : "solo para 90 minutos";
  const confidenceText =
    confidence === "alta"
      ? "con una diferencia clara frente a las alternativas"
      : "aunque la diferencia contra otra opcion es chica";

  return `${recommended.label} es la opcion con mayor probabilidad consenso ${scopeText}, ${confidenceText}.`;
}
