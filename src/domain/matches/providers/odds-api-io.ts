import type { Match, MatchPhase, MatchStatus } from "@/domain/matches/types";
import { replaceMatches } from "@/domain/matches/repository";

export type OddsApiIoEvent = {
  id: number;
  home: string;
  away: string;
  homeId?: number;
  awayId?: number;
  date: string;
  status: string;
  league?: {
    name: string;
    slug: string;
  };
  sport?: {
    name: string;
    slug: string;
  };
};

const BASE_URL =
  process.env.ODDS_API_IO_BASE_URL ?? "https://api.odds-api.io/v3";
const SPORT = process.env.ODDS_API_IO_SPORT ?? "football";
const LEAGUE = process.env.ODDS_API_IO_LEAGUE ?? "international-fifa-world-cup";

export async function fetchOddsApiIoEvents() {
  const apiKey = process.env.ODDS_API_KEY_IO;

  if (!apiKey) {
    return {
      events: [] as OddsApiIoEvent[],
      skipped: true,
      message: "ODDS_API_KEY_IO no configurada.",
    };
  }

  const eventsUrl = new URL(`${BASE_URL}/events`);
  eventsUrl.searchParams.set("apiKey", apiKey);
  eventsUrl.searchParams.set("sport", SPORT);
  eventsUrl.searchParams.set("league", LEAGUE);

  const response = await fetch(eventsUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(
      `odds-api.io /events error ${response.status}: ${await response.text()}`,
    );
  }

  return {
    events: (await response.json()) as OddsApiIoEvent[],
    skipped: false,
    message: "Eventos obtenidos desde odds-api.io.",
  };
}

export async function syncOddsApiIoMatches() {
  const result = await fetchOddsApiIoEvents();

  if (result.skipped) {
    return {
      synced: 0,
      skipped: true,
      message: result.message,
    };
  }

  const matches = result.events.map(mapEventToMatch);
  const persistence = await replaceMatches(matches);

  if (!persistence.persisted) {
    return {
      synced: 0,
      fetched: matches.length,
      skipped: false,
      persisted: false,
      error: persistence.error,
      message: `Se obtuvieron ${matches.length} partidos desde odds-api.io, pero no se pudieron persistir: ${persistence.error}`,
    };
  }

  return {
    synced: persistence.replaced,
    fetched: matches.length,
    skipped: false,
    persisted: true,
    message: `Sincronizados ${persistence.replaced} partidos desde odds-api.io.`,
  };
}

function mapEventToMatch(event: OddsApiIoEvent): Match {
  return {
    id: String(event.id),
    startsAt: event.date,
    phase: inferPhase(event.date),
    homeTeam: event.home,
    awayTeam: event.away,
    venue: "Por definir",
    status: mapStatus(event.status),
    placeholder: false,
  };
}

function mapStatus(status: string): MatchStatus {
  if (status === "finished" || status === "ended" || status === "complete") {
    return "finalizado";
  }

  if (status === "live" || status === "inprogress" || status === "in_play") {
    return "en curso";
  }

  return "proximo";
}

function inferPhase(dateValue: string): MatchPhase {
  const date = new Date(dateValue);
  const time = date.getTime();

  if (time >= Date.UTC(2026, 6, 19)) return "Final";
  if (time >= Date.UTC(2026, 6, 18)) return "Tercer puesto";
  if (time >= Date.UTC(2026, 6, 14)) return "Semifinal";
  if (time >= Date.UTC(2026, 6, 9)) return "Cuartos";
  if (time >= Date.UTC(2026, 6, 4)) return "Octavos";
  if (time >= Date.UTC(2026, 5, 28)) return "Dieciseisavos";

  return "Fase de grupos";
}
