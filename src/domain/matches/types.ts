export type MatchPhase =
  | "Fase de grupos"
  | "Dieciseisavos"
  | "Octavos"
  | "Cuartos"
  | "Semifinal"
  | "Tercer puesto"
  | "Final";

export type MatchStatus = "proximo" | "en curso" | "finalizado";

export type Match = {
  id: string;
  startsAt: string;
  phase: MatchPhase;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  status: MatchStatus;
  group?: string;
  placeholder?: boolean;
};

export type MatchFilters = {
  phase?: MatchPhase | "Todas";
  date?: string;
  team?: string;
};
