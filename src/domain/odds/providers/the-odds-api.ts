import type { Match } from "@/domain/matches/types";
import type { BookmakerOdds, OddsMarket } from "../types";
import { expectedBookmakers } from "@/data/seeds/odds";
import { saveOddsSummary } from "../repository";
import { getOddsSummaryFromBookmakers } from "../odds";

type TheOddsApiEvent = {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers?: Array<{
    key: string;
    title: string;
    last_update: string;
    markets: Array<{
      key: string;
      last_update: string;
      outcomes: Array<{
        name: string;
        price: number;
        point?: number;
      }>;
    }>;
  }>;
};

const defaultSportKey = "soccer_fifa_world_cup";
const defaultRegions = "us,uk,eu";
const defaultMarkets = "h2h,totals";

export async function syncTheOddsApi(matches: Match[]) {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return {
      synced: 0,
      skipped: true,
      message: "ODDS_API_KEY no configurada.",
    };
  }

  const baseUrl = process.env.ODDS_API_BASE_URL ?? "https://api.the-odds-api.com";
  const sportKey = process.env.ODDS_API_SPORT_KEY ?? defaultSportKey;
  const regions = process.env.ODDS_API_REGIONS ?? defaultRegions;
  const markets = process.env.ODDS_API_MARKETS ?? defaultMarkets;
  const url = new URL(`/v4/sports/${sportKey}/odds`, baseUrl);

  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("regions", regions);
  url.searchParams.set("markets", markets);
  url.searchParams.set("oddsFormat", "decimal");
  url.searchParams.set("dateFormat", "iso");

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`The Odds API error ${response.status}: ${message}`);
  }

  const events = (await response.json()) as TheOddsApiEvent[];
  let synced = 0;

  for (const match of matches) {
    const event = findMatchingEvent(events, match);

    if (!event) {
      continue;
    }

    const bookmakers = mapBookmakers(event);
    const summary = getOddsSummaryFromBookmakers({
      matchId: match.id,
      source: "the-odds-api",
      expectedBookmakers,
      bookmakers,
    });

    await saveOddsSummary(summary, event.id);
    synced += 1;
  }

  return {
    synced,
    skipped: false,
    message: `Sincronizados ${synced} partidos desde The Odds API.`,
  };
}

function findMatchingEvent(events: TheOddsApiEvent[], match: Match) {
  const home = normalize(match.homeTeam);
  const away = normalize(match.awayTeam);

  return events.find((event) => {
    const eventHome = normalize(event.home_team);
    const eventAway = normalize(event.away_team);

    return (
      (eventHome.includes(home) || home.includes(eventHome)) &&
      (eventAway.includes(away) || away.includes(eventAway))
    );
  });
}

function mapBookmakers(event: TheOddsApiEvent): BookmakerOdds[] {
  return (event.bookmakers ?? []).map((bookmaker) => ({
    bookmaker: bookmaker.title,
    updatedAt: bookmaker.last_update,
    markets: bookmaker.markets
      .map((market) => mapMarket(event, market.key, market.outcomes))
      .filter((market): market is OddsMarket => Boolean(market)),
  }));
}

function mapMarket(
  event: TheOddsApiEvent,
  key: string,
  outcomes: Array<{ name: string; price: number; point?: number }>,
): OddsMarket | null {
  if (key === "h2h") {
    return {
      key: "match_winner",
      scope: "90_minutes",
      outcomes: outcomes.map((outcome) => ({
        key: mapWinnerOutcomeKey(event, outcome.name),
        label: mapWinnerOutcomeLabel(event, outcome.name),
        odds: outcome.price,
      })),
    };
  }

  if (key === "correct_score") {
    return {
      key: "correct_score",
      scope: "90_minutes",
      outcomes: outcomes.map((outcome) => ({
        key: outcome.name,
        label: outcome.name,
        odds: outcome.price,
      })),
    };
  }

  if (key === "totals") {
    return {
      key: "totals",
      scope: "90_minutes",
      outcomes: outcomes.map((outcome) => ({
        key: `${outcome.name.toLowerCase()}_${outcome.point ?? ""}`,
        label: outcome.name === "Over"
          ? `Más de ${outcome.point} goles`
          : `Menos de ${outcome.point} goles`,
        odds: outcome.price,
        point: outcome.point,
      })),
    };
  }

  return null;
}

function mapWinnerOutcomeKey(event: TheOddsApiEvent, name: string) {
  const normalized = normalize(name);

  if (normalized === "draw" || normalized === "empate") {
    return "draw";
  }

  if (normalized === normalize(event.home_team)) {
    return "home";
  }

  if (normalized === normalize(event.away_team)) {
    return "away";
  }

  return normalized;
}

function mapWinnerOutcomeLabel(event: TheOddsApiEvent, name: string) {
  const key = mapWinnerOutcomeKey(event, name);

  if (key === "draw") {
    return "Empate";
  }

  if (key === "home") {
    return "Local";
  }

  if (key === "away") {
    return "Visitante";
  }

  return name;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
