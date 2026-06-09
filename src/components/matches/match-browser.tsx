"use client";

import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  filterMatches,
  formatDateLabel,
  formatMatchDate,
} from "@/domain/matches/matches";
import type { Match, MatchPhase } from "@/domain/matches/types";

type MatchBrowserProps = {
  matches: Match[];
  phases: Array<MatchPhase | "Todas">;
};

export function MatchBrowser({
  matches: initialMatches,
  phases,
}: MatchBrowserProps) {
  const [matches, setMatches] = useState(initialMatches);
  const [phase, setPhase] = useState<MatchPhase | "Todas">("Todas");
  const [date, setDate] = useState("");
  const [team, setTeam] = useState("");
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id ?? "");
  const [sourceError, setSourceError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    () => filterMatches(matches, { phase, date, team }),
    [date, matches, phase, team],
  );

  const selectedMatch =
    matches.find((match) => match.id === selectedMatchId) ?? filteredMatches[0] ?? null;

  const statusCounts = useMemo(
    () => ({
      total: matches.length,
      upcoming: matches.filter((match) => match.status === "proximo").length,
      placeholders: matches.filter((match) => match.placeholder).length,
    }),
    [matches],
  );

  function clearFilters() {
    setPhase("Todas");
    setDate("");
    setTeam("");
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
          <Metric label="Proximos" value={statusCounts.upcoming} />
          <Metric label="Por definir" value={statusCounts.placeholders} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium">
              <Filter size={16} aria-hidden="true" />
              Filtros
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.3fr_auto]">
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
                {filteredMatches.map((match) => (
                  <button
                    className={`grid w-full gap-3 px-4 py-4 text-left hover:bg-slate-50 md:grid-cols-[minmax(0,1fr)_auto] ${
                      selectedMatch?.id === match.id ? "bg-emerald-50/70" : "bg-white"
                    }`}
                    key={match.id}
                    onClick={() => setSelectedMatchId(match.id)}
                    type="button"
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
                      </div>
                      <div className="text-lg font-semibold">
                        {match.homeTeam} vs {match.awayTeam}
                      </div>
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
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                      Seleccionar
                      <ChevronRight size={16} aria-hidden="true" />
                    </div>
                  </button>
                ))}
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
                La seleccion queda lista para consultar probabilidades y recomendaciones en
                las siguientes historias.
              </div>
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-lg border border-[var(--line)] bg-white px-3 py-2">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-xs text-[var(--muted)]">{label}</div>
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
