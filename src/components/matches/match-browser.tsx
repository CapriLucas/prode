"use client";

import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronRight,
  Clipboard,
  ClipboardCheck,
  Clock3,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  filterMatches,
  formatDateLabel,
  formatMatchDate,
} from "@/domain/matches/matches";
import type { Match, MatchPhase } from "@/domain/matches/types";
import type { ConsensusMarket, MatchOddsSummary } from "@/domain/odds/types";
import type {
  CorrectScorePredictionResult,
  ScoreRecommendationResult,
  WinnerPredictionResult,
} from "@/domain/predictions/types";
import type { MatchReviewItem } from "@/domain/review/review";

type MatchBrowserProps = {
  initialCompletionRecords: Record<string, CompletionRecord>;
  matches: Match[];
  phases: Array<MatchPhase | "Todas">;
  reviewItems: MatchReviewItem[];
};

type ReviewStatusFilter = "todos" | "pendiente" | "completado" | "sin-recomendacion" | "advertencia";
type ReviewSort = "fecha" | "fase" | "confianza";
type CompletionRecord = {
  completed: boolean;
  signature: string;
};

export function MatchBrowser({
  initialCompletionRecords,
  matches: initialMatches,
  phases,
  reviewItems,
}: MatchBrowserProps) {
  const [matches, setMatches] = useState(initialMatches);
  const [phase, setPhase] = useState<MatchPhase | "Todas">("Todas");
  const [date, setDate] = useState("");
  const [team, setTeam] = useState("");
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id ?? "");
  const [sourceError, setSourceError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [odds, setOdds] = useState<MatchOddsSummary | null>(null);
  const [oddsError, setOddsError] = useState("");
  const [isLoadingOdds, setIsLoadingOdds] = useState(false);
  const [oddsRefreshKey, setOddsRefreshKey] = useState(0);
  const [winnerPrediction, setWinnerPrediction] = useState<WinnerPredictionResult | null>(null);
  const [winnerError, setWinnerError] = useState("");
  const [correctScorePrediction, setCorrectScorePrediction] =
    useState<CorrectScorePredictionResult | null>(null);
  const [correctScoreError, setCorrectScoreError] = useState("");
  const [finalRecommendation, setFinalRecommendation] =
    useState<ScoreRecommendationResult | null>(null);
  const [finalRecommendationError, setFinalRecommendationError] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>("todos");
  const [sortBy, setSortBy] = useState<ReviewSort>("fecha");
  const [completionRecords, setCompletionRecords] = useState<Record<string, CompletionRecord>>(
    () => ({ ...initialCompletionRecords, ...readCompletionRecords() }),
  );
  const [copiedMatchId, setCopiedMatchId] = useState("");

  const reviewByMatchId = useMemo(
    () => new Map(reviewItems.map((item) => [item.matchId, item])),
    [reviewItems],
  );

  const dates = useMemo(
    () => Array.from(new Set(matches.map((match) => match.startsAt.slice(0, 10)))).sort(),
    [matches],
  );

  const teams = useMemo(() => {
    const values = new Set<string>();

    for (const match of matches) {
      values.add(match.homeTeam);
      values.add(match.awayTeam);
    }

    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [matches]);

  const filteredMatches = useMemo(
    () => {
      const baseMatches = filterMatches(matches, { phase, date, team }).filter((match) => {
        const review = reviewByMatchId.get(match.id);
        const completion = completionRecords[match.id];
        const isCompleted = Boolean(completion?.completed);
        const hasRecommendation = Boolean(review?.recommendation.available);
        const hasWarning = Boolean(review?.hasWarning);

        if (statusFilter === "completado") {
          return isCompleted;
        }

        if (statusFilter === "pendiente") {
          return !isCompleted;
        }

        if (statusFilter === "sin-recomendacion") {
          return !hasRecommendation;
        }

        if (statusFilter === "advertencia") {
          return hasWarning;
        }

        return true;
      });

      return sortMatches(baseMatches, sortBy, reviewByMatchId);
    },
    [completionRecords, date, matches, phase, reviewByMatchId, sortBy, statusFilter, team],
  );

  const selectedMatch =
    matches.find((match) => match.id === selectedMatchId) ?? filteredMatches[0] ?? null;

  useEffect(() => {
    if (!selectedMatch?.id) {
      return;
    }

    let cancelled = false;

    async function loadOdds(matchId: string) {
      setIsLoadingOdds(true);
      setOddsError("");
      setWinnerError("");
      setCorrectScoreError("");
      setFinalRecommendationError("");

      try {
        const [oddsResponse, winnerResponse, correctScoreResponse, finalResponse] =
          await Promise.all([
            fetch(`/api/odds?matchId=${matchId}`),
            fetch(`/api/predictions/winner?matchId=${matchId}`),
            fetch(`/api/predictions/correct-score?matchId=${matchId}`),
            fetch(`/api/predictions/final-score?matchId=${matchId}`),
          ]);

        if (!oddsResponse.ok) {
          throw new Error("No se pudieron cargar las probabilidades");
        }

        if (!winnerResponse.ok) {
          throw new Error("No se pudo cargar la recomendacion");
        }

        if (!correctScoreResponse.ok) {
          throw new Error("No se pudo cargar el resultado exacto");
        }

        if (!finalResponse.ok) {
          throw new Error("No se pudo cargar la recomendacion final");
        }

        const oddsPayload = (await oddsResponse.json()) as MatchOddsSummary;
        const winnerPayload = (await winnerResponse.json()) as {
          prediction: WinnerPredictionResult;
        };
        const correctScorePayload = (await correctScoreResponse.json()) as {
          prediction: CorrectScorePredictionResult;
        };
        const finalPayload = (await finalResponse.json()) as {
          recommendation: ScoreRecommendationResult;
        };

        if (!cancelled) {
          setOdds(oddsPayload);
          setWinnerPrediction(winnerPayload.prediction);
          setCorrectScorePrediction(correctScorePayload.prediction);
          setFinalRecommendation(finalPayload.recommendation);
        }
      } catch {
        if (!cancelled) {
          setOdds(null);
          setWinnerPrediction(null);
          setCorrectScorePrediction(null);
          setFinalRecommendation(null);
          setOddsError("No se pudieron cargar las probabilidades.");
          setWinnerError("No se pudo cargar la recomendacion de ganador/empate.");
          setCorrectScoreError("No se pudo cargar la recomendacion de resultado exacto.");
          setFinalRecommendationError("No se pudo cargar la recomendacion final.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOdds(false);
        }
      }
    }

    loadOdds(selectedMatch.id);

    return () => {
      cancelled = true;
    };
  }, [oddsRefreshKey, selectedMatch?.id]);

  const statusCounts = useMemo(
    () => {
      const completed = matches.filter((match) => completionRecords[match.id]?.completed).length;
      const withRecommendation = matches.filter(
        (match) => reviewByMatchId.get(match.id)?.recommendation.available,
      ).length;

      return {
        total: matches.length,
        completed,
        pending: matches.length - completed,
        withRecommendation,
      };
    },
    [completionRecords, matches, reviewByMatchId],
  );

  useEffect(() => {
    window.localStorage.setItem("prode:completed-matches", JSON.stringify(completionRecords));
  }, [completionRecords]);

  function clearFilters() {
    setPhase("Todas");
    setDate("");
    setTeam("");
    setStatusFilter("todos");
  }

  function toggleCompleted(matchId: string) {
    const review = reviewByMatchId.get(matchId);
    const isCurrentlyCompleted = Boolean(completionRecords[matchId]?.completed);
    const nextRecord = {
      completed: !isCurrentlyCompleted,
      signature: review?.signature ?? "sin-recomendacion",
    };

    setCompletionRecords((current) => {
      const next = { ...current };

      if (isCurrentlyCompleted) {
        delete next[matchId];
      } else {
        next[matchId] = nextRecord;
      }

      return next;
    });

    persistCompletion(matchId, nextRecord);
  }

  async function copyRecommendedScore(matchId: string) {
    const review = reviewByMatchId.get(matchId);

    if (!review?.recommendation.available) {
      return;
    }

    await navigator.clipboard.writeText(review.recommendation.recommended.score);
    setCopiedMatchId(matchId);
    window.setTimeout(() => setCopiedMatchId(""), 1600);
  }

  async function refreshMatches() {
    setIsRefreshing(true);

    try {
      const response = await fetch("/api/matches");

      if (!response.ok) {
        throw new Error("No se pudieron cargar los partidos");
      }

      const payload = (await response.json()) as { matches: Match[] };
      setMatches(payload.matches);
      setSourceError(false);
    } catch {
      setSourceError(true);
    } finally {
      setIsRefreshing(false);
    }
  }

  if (sourceError) {
    return (
      <section className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-5 py-10">
        <div className="w-full rounded-lg border border-[var(--line)] bg-[var(--panel)] p-8 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700">
            <AlertCircle size={24} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold">No se pudieron cargar los partidos</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            La fuente de partidos no esta disponible en este momento. Podes reintentar
            para volver a consultar el calendario del Mundial 2026.
          </p>
          <button
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-strong)]"
            onClick={refreshMatches}
            type="button"
          >
            <RefreshCw
              className={isRefreshing ? "animate-spin" : ""}
              size={16}
              aria-hidden="true"
            />
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8">
      <header className="flex flex-col gap-5 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 py-1 text-sm text-[var(--muted)]">
            <Trophy size={16} aria-hidden="true" />
            Mundial 2026
          </div>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-normal text-[var(--foreground)]">
            Partidos para completar el prode
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Consulta el calendario, filtra por fase, fecha o seleccion, y elegi el
            partido que despues vas a analizar con probabilidades y recomendaciones.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <Metric label="Partidos" value={statusCounts.total} />
          <Metric label="Completados" value={statusCounts.completed} />
          <Metric label="Con recomend." value={statusCounts.withRecommendation} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium">
              <Filter size={16} aria-hidden="true" />
              Filtros
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.3fr_1fr_1fr_auto]">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-[var(--muted)]">Fase</span>
                <select
                  className="h-10 rounded-md border border-[var(--line)] bg-white px-3 outline-none focus:border-[var(--accent)]"
                  onChange={(event) => setPhase(event.target.value as MatchPhase | "Todas")}
                  value={phase}
                >
                  {phases.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-[var(--muted)]">Fecha</span>
                <select
                  className="h-10 rounded-md border border-[var(--line)] bg-white px-3 outline-none focus:border-[var(--accent)]"
                  onChange={(event) => setDate(event.target.value)}
                  value={date}
                >
                  <option value="">Todas</option>
                  {dates.map((item) => (
                    <option key={item} value={item}>
                      {formatDateLabel(item)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-[var(--muted)]">Seleccion o placeholder</span>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                    size={16}
                    aria-hidden="true"
                  />
                  <input
                    className="h-10 w-full rounded-md border border-[var(--line)] bg-white pl-9 pr-3 outline-none focus:border-[var(--accent)]"
                    list="teams"
                    onChange={(event) => setTeam(event.target.value)}
                    placeholder="Argentina, Ganador Grupo A..."
                    value={team}
                  />
                  <datalist id="teams">
                    {teams.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-[var(--muted)]">Estado prode</span>
                <select
                  className="h-10 rounded-md border border-[var(--line)] bg-white px-3 outline-none focus:border-[var(--accent)]"
                  onChange={(event) =>
                    setStatusFilter(event.target.value as ReviewStatusFilter)
                  }
                  value={statusFilter}
                >
                  <option value="todos">Todos</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="completado">Completados</option>
                  <option value="sin-recomendacion">Sin recomendación</option>
                  <option value="advertencia">Con advertencia</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-[var(--muted)]">Orden</span>
                <select
                  className="h-10 rounded-md border border-[var(--line)] bg-white px-3 outline-none focus:border-[var(--accent)]"
                  onChange={(event) => setSortBy(event.target.value as ReviewSort)}
                  value={sortBy}
                >
                  <option value="fecha">Fecha</option>
                  <option value="fase">Fase</option>
                  <option value="confianza">Confianza</option>
                </select>
              </label>

              <div className="flex items-end gap-2">
                <button
                  className="h-10 rounded-md border border-[var(--line)] px-3 text-sm font-medium hover:bg-slate-50"
                  onClick={clearFilters}
                  type="button"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel)] shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <h2 className="text-sm font-semibold">
                {filteredMatches.length} partidos encontrados
              </h2>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-sm font-medium hover:bg-slate-50"
                disabled={isRefreshing}
                onClick={refreshMatches}
                type="button"
              >
                <RefreshCw
                  className={isRefreshing ? "animate-spin" : ""}
                  size={15}
                  aria-hidden="true"
                />
                {isRefreshing ? "Actualizando" : "Actualizar"}
              </button>
            </div>

            {filteredMatches.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <CalendarDays
                  className="mx-auto mb-3 text-[var(--muted)]"
                  size={32}
                  aria-hidden="true"
                />
                <h3 className="text-base font-semibold">No hay partidos para esos filtros</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                  Proba cambiar la fase, la fecha o la seleccion para volver a ver partidos.
                </p>
                <button
                  className="mt-4 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-strong)]"
                  onClick={clearFilters}
                  type="button"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--line)]">
                {filteredMatches.map((match) => {
                  const review = reviewByMatchId.get(match.id);
                  const completion = completionRecords[match.id];
                  const isCompleted = Boolean(completion?.completed);
                  const recommendationUpdated =
                    isCompleted && completion?.signature !== review?.signature;

                  return (
                    <article
                      className={`grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_260px] ${
                        selectedMatch?.id === match.id ? "bg-emerald-50/70" : "bg-white"
                      }`}
                      key={match.id}
                    >
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <StatusBadge status={match.status} />
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            {match.phase}
                          </span>
                          {match.group ? (
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                              {match.group}
                            </span>
                          ) : null}
                          {match.placeholder ? (
                            <span className="rounded-md bg-[var(--warning-bg)] px-2 py-1 text-xs font-medium text-[var(--warning)]">
                              Equipos por definir
                            </span>
                          ) : null}
                          {isCompleted ? (
                            <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                              Completado
                            </span>
                          ) : null}
                          {recommendationUpdated ? (
                            <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                              Recomendación actualizada
                            </span>
                          ) : null}
                        </div>
                        <button
                          className="text-left text-lg font-semibold hover:text-[var(--accent)]"
                          onClick={() => setSelectedMatchId(match.id)}
                          type="button"
                        >
                          {match.homeTeam} vs {match.awayTeam}
                        </button>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--muted)]">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={15} aria-hidden="true" />
                            {formatMatchDate(match.startsAt)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={15} aria-hidden="true" />
                            {match.venue}
                          </span>
                        </div>
                        <MatchReviewSummary review={review} />
                      </div>

                      <div className="flex flex-col justify-between gap-3">
                        <div className="flex justify-end">
                          <button
                            className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-sm font-medium hover:bg-slate-50"
                            onClick={() => setSelectedMatchId(match.id)}
                            type="button"
                          >
                            Detalle
                            <ChevronRight size={16} aria-hidden="true" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!review?.recommendation.available}
                            onClick={() => copyRecommendedScore(match.id)}
                            type="button"
                          >
                            {copiedMatchId === match.id ? (
                              <ClipboardCheck size={15} aria-hidden="true" />
                            ) : (
                              <Clipboard size={15} aria-hidden="true" />
                            )}
                            {copiedMatchId === match.id ? "Copiado" : "Copiar"}
                          </button>
                          <button
                            className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                              isCompleted
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]"
                            }`}
                            onClick={() => toggleCompleted(match.id)}
                            type="button"
                          >
                            <Check size={15} aria-hidden="true" />
                            {isCompleted ? "Hecho" : "Completar"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5 shadow-sm lg:sticky lg:top-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
            <Check size={16} aria-hidden="true" />
            Partido seleccionado
          </div>

          {selectedMatch ? (
            <div>
              <h2 className="text-2xl font-semibold">
                {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
              </h2>
              <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                <DetailRow label="Fecha" value={formatMatchDate(selectedMatch.startsAt)} />
                <DetailRow label="Fase" value={selectedMatch.phase} />
                <DetailRow label="Estado" value={selectedMatch.status} />
                <DetailRow label="Sede" value={selectedMatch.venue} />
              </div>

              {selectedMatch.placeholder ? (
                <div className="mt-5 rounded-md border border-amber-200 bg-[var(--warning-bg)] p-3 text-sm leading-6 text-[var(--warning)]">
                  Este partido tiene participantes pendientes. Cuando se definan los cruces,
                  el dataset podra actualizarse sin cambiar el flujo.
                </div>
              ) : null}

              <div className="mt-5 rounded-md border border-[var(--line)] bg-slate-50 p-3 text-sm leading-6 text-[var(--muted)]">
                Las probabilidades se obtienen desde un proveedor mock con formato de API.
                Cuando exista una API key, esta misma vista puede conectarse al proveedor real.
              </div>

              <OddsPanel
                isLoading={isLoadingOdds}
                odds={odds}
                oddsError={oddsError}
                onRetry={() => setOddsRefreshKey((value) => value + 1)}
                winnerError={winnerError}
                winnerPrediction={winnerPrediction}
                correctScoreError={correctScoreError}
                correctScorePrediction={correctScorePrediction}
                finalRecommendation={finalRecommendation}
                finalRecommendationError={finalRecommendationError}
              />
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Selecciona un partido de la lista para continuar.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}

function OddsPanel({
  isLoading,
  odds,
  oddsError,
  onRetry,
  winnerError,
  winnerPrediction,
  correctScoreError,
  correctScorePrediction,
  finalRecommendation,
  finalRecommendationError,
}: {
  isLoading: boolean;
  odds: MatchOddsSummary | null;
  oddsError: string;
  onRetry: () => void;
  winnerError: string;
  winnerPrediction: WinnerPredictionResult | null;
  correctScoreError: string;
  correctScorePrediction: CorrectScorePredictionResult | null;
  finalRecommendation: ScoreRecommendationResult | null;
  finalRecommendationError: string;
}) {
  const matchWinner = odds?.markets.find((market) => market.key === "match_winner");
  const correctScore = odds?.markets.find((market) => market.key === "correct_score");

  return (
    <section className="mt-5 border-t border-[var(--line)] pt-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Probabilidades consenso</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Cuotas convertidas a probabilidad implicita y normalizadas.
          </p>
        </div>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--line)] px-3 text-sm font-medium hover:bg-slate-50"
          disabled={isLoading}
          onClick={onRetry}
          type="button"
        >
          <RefreshCw className={isLoading ? "animate-spin" : ""} size={15} aria-hidden="true" />
          {isLoading ? "Cargando" : "Reintentar"}
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-md border border-[var(--line)] bg-slate-50 p-4 text-sm text-[var(--muted)]">
          Cargando probabilidades...
        </div>
      ) : null}

      {!isLoading && oddsError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {oddsError}
        </div>
      ) : null}

      {!isLoading && !oddsError && odds ? (
        <div className="space-y-4">
          <FinalRecommendationCard
            error={finalRecommendationError}
            recommendation={finalRecommendation}
          />
          <WinnerPredictionCard error={winnerError} prediction={winnerPrediction} />
          <CorrectScorePredictionCard
            error={correctScoreError}
            prediction={correctScorePrediction}
          />

          <div className="rounded-md border border-[var(--line)] p-3 text-xs leading-5 text-[var(--muted)]">
            Fuente: {odds.source}. Generado: {formatMatchDate(odds.generatedAt)}.
          </div>

          {odds.warnings.length ? (
            <div className="space-y-2">
              {odds.warnings.map((warning) => (
                <div
                  className="rounded-md border border-amber-200 bg-[var(--warning-bg)] p-3 text-xs leading-5 text-[var(--warning)]"
                  key={warning}
                >
                  {warning}
                </div>
              ))}
            </div>
          ) : null}

          {matchWinner ? (
            <MarketCard market={matchWinner} title="Ganador / empate / ganador" />
          ) : (
            <MissingMarket label="ganador / empate / ganador" />
          )}

          {correctScore ? (
            <MarketCard limit={5} market={correctScore} title="Resultado exacto" />
          ) : (
            <MissingMarket label="resultado exacto" />
          )}
        </div>
      ) : null}
    </section>
  );
}

function FinalRecommendationCard({
  error,
  recommendation,
}: {
  error: string;
  recommendation: ScoreRecommendationResult | null;
}) {
  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!recommendation) {
    return null;
  }

  if (!recommendation.available) {
    return (
      <div className="rounded-lg border border-[var(--line)] bg-slate-50 p-4">
        <h4 className="text-sm font-semibold">Recomendación final</h4>
        <p className="mt-2 text-sm text-[var(--muted)]">{recommendation.reason}</p>
        {recommendation.warnings.map((warning) => (
          <p className="mt-2 text-xs text-[var(--warning)]" key={warning}>
            {warning}
          </p>
        ))}
      </div>
    );
  }

  const scopeLabel =
    recommendation.scope === "includes_extra_time" ? "Incluye prorroga" : "Solo 90 minutos";

  return (
    <div className="rounded-lg border border-zinc-300 bg-zinc-950 p-4 text-white">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold">Recomendación final para el prode</h4>
          <p className="mt-1 text-xs text-zinc-300">{scopeLabel}</p>
        </div>
        {recommendation.usedFallback ? (
          <span className="rounded-md bg-amber-200 px-2 py-1 text-xs font-semibold text-amber-950">
            Simple
          </span>
        ) : (
          <span className="rounded-md bg-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-950">
            Optimizada
          </span>
        )}
      </div>

      <div className="rounded-md bg-white p-3 text-zinc-950">
        <div className="text-xs font-medium text-zinc-500">Marcador recomendado</div>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div className="text-4xl font-semibold">{recommendation.recommended.score}</div>
          <div className="text-right">
            <div className="text-xs text-zinc-500">Puntos esperados</div>
            <div className="text-xl font-semibold">
              {recommendation.recommended.expectedPoints.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-100">{recommendation.explanation}</p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md bg-white/10 p-2">
          <div className="text-zinc-300">Signo</div>
          <div className="mt-1 font-semibold">{recommendation.recommended.signLabel}</div>
        </div>
        <div className="rounded-md bg-white/10 p-2">
          <div className="text-zinc-300">Prob. exacta</div>
          <div className="mt-1 font-semibold">
            {formatProbability(recommendation.recommended.exactProbability)}
          </div>
        </div>
        <div className="rounded-md bg-white/10 p-2">
          <div className="text-zinc-300">Prob. signo</div>
          <div className="mt-1 font-semibold">
            {formatProbability(recommendation.recommended.signProbability)}
          </div>
        </div>
        <div className="rounded-md bg-white/10 p-2">
          <div className="text-zinc-300">Exacto más probable</div>
          <div className="mt-1 font-semibold">{recommendation.mostLikelyExactScore.label}</div>
        </div>
      </div>

      {recommendation.differsFromMostLikelyExact ? (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-100 p-2 text-xs leading-5 text-amber-950">
          La recomendación final difiere del marcador exacto más probable individualmente
          porque prioriza el puntaje esperado total.
        </div>
      ) : null}

      <div className="mt-3 space-y-2">
        {recommendation.candidates.map((candidate) => (
          <div key={candidate.score}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs text-zinc-200">
              <span>
                {candidate.score} · {candidate.signLabel}
              </span>
              <span>{candidate.expectedPoints.toFixed(2)} pts esp.</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className={`h-full rounded-full ${
                  candidate.score === recommendation.recommended.score
                    ? "bg-emerald-300"
                    : "bg-white/50"
                }`}
                style={{ width: `${Math.max((candidate.expectedPoints / 6) * 100, 3)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {recommendation.warnings.length ? (
        <div className="mt-3 space-y-2">
          {recommendation.warnings.map((warning) => (
            <div
              className="rounded-md border border-amber-300 bg-amber-100 p-2 text-xs leading-5 text-amber-950"
              key={warning}
            >
              {warning}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CorrectScorePredictionCard({
  error,
  prediction,
}: {
  error: string;
  prediction: CorrectScorePredictionResult | null;
}) {
  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  if (!prediction.available) {
    return (
      <div className="rounded-lg border border-[var(--line)] bg-slate-50 p-4">
        <h4 className="text-sm font-semibold">Predicción resultado exacto</h4>
        <p className="mt-2 text-sm text-[var(--muted)]">{prediction.reason}</p>
        {prediction.warnings.map((warning) => (
          <p className="mt-2 text-xs text-[var(--warning)]" key={warning}>
            {warning}
          </p>
        ))}
      </div>
    );
  }

  const scopeLabel =
    prediction.scope === "includes_extra_time" ? "Incluye prorroga" : "Solo 90 minutos";

  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-sky-950">
            Predicción resultado exacto
          </h4>
          <p className="mt-1 text-xs text-sky-800">{scopeLabel}</p>
        </div>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-sky-800">
          Confianza {prediction.confidence}
        </span>
      </div>

      <div className="rounded-md bg-white p-3">
        <div className="text-xs font-medium text-[var(--muted)]">Marcador recomendado</div>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div className="text-3xl font-semibold">{prediction.recommended.label}</div>
          <div className="text-lg font-semibold">
            {formatProbability(prediction.recommended.probability)}
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-sky-950">{prediction.explanation}</p>

      <div className="mt-3 space-y-2">
        {prediction.alternatives.map((outcome) => (
          <div key={outcome.key}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs text-sky-950">
              <span>{outcome.label}</span>
              <span>{formatProbability(outcome.probability)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white">
              <div
                className={`h-full rounded-full ${
                  outcome.key === prediction.recommended.key ? "bg-sky-700" : "bg-sky-200"
                }`}
                style={{ width: `${Math.max(outcome.probability * 100, 3)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {prediction.warnings.length ? (
        <div className="mt-3 space-y-2">
          {prediction.warnings.map((warning) => (
            <div
              className="rounded-md border border-amber-200 bg-[var(--warning-bg)] p-2 text-xs leading-5 text-[var(--warning)]"
              key={warning}
            >
              {warning}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3 text-xs leading-5 text-sky-900">
        Consenso usado: {prediction.bookmakerCount}/{prediction.expectedBookmakerCount} casas.
        Ultima actualización:{" "}
        {prediction.lastUpdatedAt ? formatMatchDate(prediction.lastUpdatedAt) : "sin dato"}.
      </div>
    </div>
  );
}

function WinnerPredictionCard({
  error,
  prediction,
}: {
  error: string;
  prediction: WinnerPredictionResult | null;
}) {
  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  if (!prediction.available) {
    return (
      <div className="rounded-lg border border-[var(--line)] bg-slate-50 p-4">
        <h4 className="text-sm font-semibold">Predicción ganador/empate</h4>
        <p className="mt-2 text-sm text-[var(--muted)]">{prediction.reason}</p>
        {prediction.warnings.map((warning) => (
          <p className="mt-2 text-xs text-[var(--warning)]" key={warning}>
            {warning}
          </p>
        ))}
      </div>
    );
  }

  const scopeLabel =
    prediction.scope === "includes_extra_time" ? "Incluye prorroga" : "Solo 90 minutos";

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-emerald-950">
            Predicción ganador/empate
          </h4>
          <p className="mt-1 text-xs text-emerald-800">{scopeLabel}</p>
        </div>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-emerald-800">
          Confianza {prediction.confidence}
        </span>
      </div>

      <div className="rounded-md bg-white p-3">
        <div className="text-xs font-medium text-[var(--muted)]">Recomendación</div>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div className="text-2xl font-semibold">{prediction.recommended.label}</div>
          <div className="text-lg font-semibold">
            {formatProbability(prediction.recommended.probability)}
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-emerald-950">{prediction.explanation}</p>

      <div className="mt-3 space-y-2">
        {prediction.alternatives.map((outcome) => (
          <div key={outcome.key}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs text-emerald-950">
              <span>{outcome.label}</span>
              <span>{formatProbability(outcome.probability)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white">
              <div
                className={`h-full rounded-full ${
                  outcome.key === prediction.recommended.key
                    ? "bg-[var(--accent)]"
                    : "bg-emerald-200"
                }`}
                style={{ width: `${Math.max(outcome.probability * 100, 3)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {prediction.warnings.length ? (
        <div className="mt-3 space-y-2">
          {prediction.warnings.map((warning) => (
            <div
              className="rounded-md border border-amber-200 bg-[var(--warning-bg)] p-2 text-xs leading-5 text-[var(--warning)]"
              key={warning}
            >
              {warning}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3 text-xs leading-5 text-emerald-900">
        Consenso usado: {prediction.bookmakerCount}/{prediction.expectedBookmakerCount} casas.
        Ultima actualización:{" "}
        {prediction.lastUpdatedAt ? formatMatchDate(prediction.lastUpdatedAt) : "sin dato"}.
      </div>
    </div>
  );
}

function MarketCard({
  market,
  title,
  limit,
}: {
  market: ConsensusMarket;
  title: string;
  limit?: number;
}) {
  const visibleOutcomes = limit ? market.outcomes.slice(0, limit) : market.outcomes;
  const scopeLabel =
    market.scope === "includes_extra_time" ? "Incluye prorroga" : "Solo 90 minutos";

  return (
    <div className="rounded-lg border border-[var(--line)] bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="mt-1 text-xs text-[var(--muted)]">{scopeLabel}</p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
          {market.bookmakerCount}/{market.expectedBookmakerCount} casas
        </span>
      </div>

      <div className="space-y-2">
        {visibleOutcomes.map((outcome) => (
          <div key={outcome.key}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs">
              <span className="font-medium">{outcome.label}</span>
              <span className="text-[var(--muted)]">
                {formatProbability(outcome.probability)} · cuota prom.{" "}
                {outcome.averageOdds.toFixed(2)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${Math.max(outcome.probability * 100, 3)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {market.incomplete || market.stale || market.scope === "90_minutes" ? (
        <div className="mt-3 text-xs leading-5 text-[var(--muted)]">
          {market.incomplete ? `Faltan: ${market.missingBookmakers.join(", ")}. ` : ""}
          {market.stale ? "Hay datos antiguos. " : ""}
          {market.scope === "90_minutes" ? "No equivale necesariamente al reglamento con prorroga." : ""}
        </div>
      ) : null}
    </div>
  );
}

function MissingMarket({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-slate-50 p-4 text-sm text-[var(--muted)]">
      No hay probabilidades disponibles para {label}.
    </div>
  );
}

function formatProbability(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-lg border border-[var(--line)] bg-white px-3 py-2">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-[var(--muted)]">{label}</div>
    </div>
  );
}

function MatchReviewSummary({ review }: { review: MatchReviewItem | undefined }) {
  if (!review || !review.recommendation.available) {
    return (
      <div className="mt-3 rounded-md border border-[var(--line)] bg-slate-50 p-3 text-sm text-[var(--muted)]">
        Sin recomendación final disponible.
      </div>
    );
  }

  return (
    <div className="mt-3 grid gap-2 rounded-md border border-[var(--line)] bg-slate-50 p-3 text-sm md:grid-cols-[1fr_auto]">
      <div>
        <div className="text-xs text-[var(--muted)]">Recomendación final</div>
        <div className="mt-1 font-semibold">
          {review.recommendation.recommended.score} ·{" "}
          {review.recommendation.recommended.signLabel}
        </div>
      </div>
      <div className="md:text-right">
        <div className="text-xs text-[var(--muted)]">Puntos esperados</div>
        <div className="mt-1 font-semibold">
          {review.recommendation.recommended.expectedPoints.toFixed(2)}
        </div>
      </div>
      {review.hasWarning ? (
        <div className="rounded-md bg-[var(--warning-bg)] px-2 py-1 text-xs text-[var(--warning)] md:col-span-2">
          Tiene advertencias para revisar en detalle.
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: Match["status"] }) {
  const styles = {
    proximo: "bg-blue-50 text-blue-700",
    "en curso": "bg-amber-50 text-amber-700",
    finalizado: "bg-slate-100 text-slate-700",
  };

  return (
    <span className={`rounded-md px-2 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[90px_1fr] gap-3">
      <span>{label}</span>
      <span className="font-medium text-[var(--foreground)]">{value}</span>
    </div>
  );
}

function sortMatches(
  matches: Match[],
  sortBy: ReviewSort,
  reviewByMatchId: Map<string, MatchReviewItem>,
) {
  return [...matches].sort((a, b) => {
    if (sortBy === "fase") {
      return a.phase.localeCompare(b.phase) || a.startsAt.localeCompare(b.startsAt);
    }

    if (sortBy === "confianza") {
      const aPoints = getExpectedPoints(reviewByMatchId.get(a.id));
      const bPoints = getExpectedPoints(reviewByMatchId.get(b.id));
      return bPoints - aPoints || a.startsAt.localeCompare(b.startsAt);
    }

    return a.startsAt.localeCompare(b.startsAt);
  });
}

function getExpectedPoints(review: MatchReviewItem | undefined) {
  if (!review?.recommendation.available) {
    return -1;
  }

  return review.recommendation.recommended.expectedPoints;
}

function readCompletionRecords(): Record<string, CompletionRecord> {
  if (typeof window === "undefined") {
    return {};
  }

  const stored = window.localStorage.getItem("prode:completed-matches");

  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored) as Record<string, CompletionRecord>;
  } catch {
    return {};
  }
}

function persistCompletion(matchId: string, record: CompletionRecord) {
  fetch("/api/completions", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      matchId,
      completed: record.completed,
      signature: record.signature,
    }),
  }).catch(() => {
    // The local optimistic state remains available through localStorage fallback.
  });
}
