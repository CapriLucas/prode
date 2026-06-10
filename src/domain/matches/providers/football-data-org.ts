import type { Match, MatchPhase, MatchStatus } from "@/domain/matches/types";
import { upsertMatches } from "@/domain/matches/repository";

type FdoTeam = {
  id: number | null;
  name: string | null;
  shortName?: string | null;
};

type FdoMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  homeTeam: FdoTeam;
  awayTeam: FdoTeam;
  venue?: string | null;
};

type FdoMatchesResponse = {
  matches: FdoMatch[];
};

const STAGE_MAP: Record<string, MatchPhase> = {
  GROUP_STAGE: "Fase de grupos",
  ROUND_OF_32: "Dieciseisavos",
  ROUND_OF_16: "Octavos",
  QUARTER_FINALS: "Cuartos",
  SEMI_FINALS: "Semifinal",
  THIRD_PLACE: "Tercer puesto",
  FINAL: "Final",
};

function mapStage(stage: string): MatchPhase {
  return STAGE_MAP[stage] ?? "Fase de grupos";
}

function mapStatus(status: string): MatchStatus {
  if (status === "FINISHED") return "finalizado";
  if (status === "IN_PLAY" || status === "PAUSED" || status === "LIVE") return "en curso";
  return "proximo";
}

function mapGroup(group: string | null): string | undefined {
  if (!group) return undefined;
  return group.replace("GROUP_", "Grupo ");
}

export async function syncFootballDataOrg() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    return {
      synced: 0,
      skipped: true,
      message: "FOOTBALL_DATA_API_KEY no configurada.",
    };
  }

  const competitionCode = process.env.FOOTBALL_DATA_COMPETITION ?? "WC";
  const url = `https://api.football-data.org/v4/competitions/${competitionCode}/matches`;

  const response = await fetch(url, {
    headers: { "X-Auth-Token": apiKey },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`football-data.org error ${response.status}: ${body}`);
  }

  const data = (await response.json()) as FdoMatchesResponse;

  const matches: Match[] = data.matches.map((m) => ({
    id: `fdo-${m.id}`,
    startsAt: m.utcDate,
    phase: mapStage(m.stage),
    group: mapGroup(m.group),
    homeTeam: m.homeTeam.name ?? m.homeTeam.shortName ?? "Por definir",
    awayTeam: m.awayTeam.name ?? m.awayTeam.shortName ?? "Por definir",
    venue: m.venue ?? "Por definir",
    status: mapStatus(m.status),
    placeholder: false,
  }));

  const { upserted } = await upsertMatches(matches);

  return {
    synced: upserted,
    skipped: false,
    message: `Sincronizados ${upserted} partidos desde football-data.org.`,
  };
}
