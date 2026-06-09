import { worldCupMatches } from "@/data/seeds/matches";
import type { Match, MatchFilters, MatchPhase } from "./types";

export const matchPhases: Array<MatchPhase | "Todas"> = [
  "Todas",
  "Fase de grupos",
  "Dieciseisavos",
  "Octavos",
  "Cuartos",
  "Semifinal",
  "Tercer puesto",
  "Final",
];

export function getMatches(): Match[] {
  return [...worldCupMatches].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}

export function getTeams(matches: Match[] = getMatches()): string[] {
  const teams = new Set<string>();

  for (const match of matches) {
    teams.add(match.homeTeam);
    teams.add(match.awayTeam);
  }

  return [...teams].sort((a, b) => a.localeCompare(b));
}

export function getMatchDates(matches: Match[] = getMatches()): string[] {
  const dates = new Set(matches.map((match) => match.startsAt.slice(0, 10)));
  return [...dates].sort();
}

export function filterMatches(matches: Match[], filters: MatchFilters): Match[] {
  return matches.filter((match) => {
    const matchesPhase =
      !filters.phase || filters.phase === "Todas" || match.phase === filters.phase;
    const matchesDate = !filters.date || match.startsAt.startsWith(filters.date);
    const normalizedTeam = filters.team?.trim().toLowerCase();
    const matchesTeam =
      !normalizedTeam ||
      match.homeTeam.toLowerCase().includes(normalizedTeam) ||
      match.awayTeam.toLowerCase().includes(normalizedTeam);

    return matchesPhase && matchesDate && matchesTeam;
  });
}

export function formatMatchDate(value: string, locale = "es-AR"): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDateLabel(value: string, locale = "es-AR"): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T12:00:00Z`));
}
