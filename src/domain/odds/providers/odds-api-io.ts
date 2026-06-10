import type { Match } from "@/domain/matches/types";
import type { BookmakerOdds, OddsMarket } from "../types";
import { saveOddsSummary } from "../repository";
import { getOddsSummaryFromBookmakers } from "../odds";

type ApiMarket = {
  name: string;
  updatedAt: string;
  odds: Record<string, string | number>[];
};

type ApiEvent = {
  id: number;
  home: string;
  away: string;
  date: string;
  status: string;
  bookmakers: Record<string, ApiMarket[]>;
};

const BASE_URL = "https://api.odds-api.io/v3";
const LEAGUE = "international-fifa-world-cup";
const BOOKMAKERS = ["Bet365"];
const BATCH_SIZE = 10;

export async function syncOddsApiIo(matches: Match[]) {
  const apiKey = process.env.ODDS_API_KEY_IO;

  if (!apiKey) {
    return { synced: 0, skipped: true, message: "ODDS_API_KEY_IO no configurada." };
  }

  const eventsUrl = new URL(`${BASE_URL}/events`);
  eventsUrl.searchParams.set("apiKey", apiKey);
  eventsUrl.searchParams.set("sport", "football");
  eventsUrl.searchParams.set("league", LEAGUE);

  const eventsRes = await fetch(eventsUrl, { cache: "no-store" });
  if (!eventsRes.ok) {
    throw new Error(`odds-api.io /events error ${eventsRes.status}: ${await eventsRes.text()}`);
  }

  const allEvents = (await eventsRes.json()) as ApiEvent[];
  const upcomingEvents = allEvents.filter((e) => e.status === "pending" || e.status === "live");

  const oddsMap = new Map<number, ApiEvent>();
  const ids = upcomingEvents.map((e) => e.id);

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const oddsUrl = new URL(`${BASE_URL}/odds/multi`);
    oddsUrl.searchParams.set("apiKey", apiKey);
    oddsUrl.searchParams.set("eventIds", batch.join(","));
    oddsUrl.searchParams.set("bookmakers", BOOKMAKERS.join(","));

    const oddsRes = await fetch(oddsUrl, { cache: "no-store" });
    if (!oddsRes.ok) {
      throw new Error(`odds-api.io /odds/multi error ${oddsRes.status}: ${await oddsRes.text()}`);
    }

    const batchData = (await oddsRes.json()) as ApiEvent[];
    for (const ev of batchData) {
      oddsMap.set(ev.id, ev);
    }
  }

  let synced = 0;

  for (const match of matches) {
    const event = findMatchingEvent(upcomingEvents, match);
    if (!event) continue;

    const eventWithOdds = oddsMap.get(event.id);
    if (!eventWithOdds?.bookmakers) continue;

    const bookmakers = mapBookmakers(eventWithOdds);
    if (!bookmakers.length) continue;

    const summary = getOddsSummaryFromBookmakers({
      matchId: match.id,
      source: "odds-api-io",
      expectedBookmakers: BOOKMAKERS,
      bookmakers,
    });

    await saveOddsSummary(summary, String(event.id));
    synced++;
  }

  return {
    synced,
    skipped: false,
    message: `Sincronizados ${synced} partidos desde odds-api.io.`,
  };
}

function findMatchingEvent(events: ApiEvent[], match: Match): ApiEvent | undefined {
  const home = normalize(match.homeTeam);
  const away = normalize(match.awayTeam);

  return events.find((event) => {
    const eventHome = normalize(event.home);
    const eventAway = normalize(event.away);

    return (
      (eventHome.includes(home) || home.includes(eventHome)) &&
      (eventAway.includes(away) || away.includes(eventAway))
    );
  });
}

function mapBookmakers(event: ApiEvent): BookmakerOdds[] {
  return Object.entries(event.bookmakers)
    .filter(([name]) => !name.includes("("))
    .map(([name, markets]) => ({
      bookmaker: name,
      updatedAt: latestUpdatedAt(markets),
      markets: markets
        .map(mapMarket)
        .filter((m): m is OddsMarket => m !== null),
    }))
    .filter((bk) => bk.markets.length > 0);
}

function mapMarket(market: ApiMarket): OddsMarket | null {
  if (market.name === "ML") {
    const entry = market.odds[0];
    if (!entry) return null;

    const outcomes = [
      entry.home ? { key: "home", label: "Local", odds: parseFloat(String(entry.home)) } : null,
      entry.draw ? { key: "draw", label: "Empate", odds: parseFloat(String(entry.draw)) } : null,
      entry.away ? { key: "away", label: "Visitante", odds: parseFloat(String(entry.away)) } : null,
    ].filter((o): o is NonNullable<typeof o> => o !== null && !isNaN(o.odds));

    if (!outcomes.length) return null;

    return { key: "match_winner", scope: "90_minutes", outcomes };
  }

  if (market.name === "Goals Over/Under") {
    const entry = market.odds.find((o) => Number(o.hdp) === 2.5) ?? market.odds[0];
    if (!entry) return null;

    const hdp = Number(entry.hdp);
    const outcomes = [
      { key: `over_${hdp}`, label: `Más de ${hdp} goles`, odds: parseFloat(String(entry.over)), point: hdp },
      { key: `under_${hdp}`, label: `Menos de ${hdp} goles`, odds: parseFloat(String(entry.under)), point: hdp },
    ].filter((o) => !isNaN(o.odds));

    if (!outcomes.length) return null;

    return { key: "totals", scope: "90_minutes", outcomes };
  }

  if (market.name === "Correct Score") {
    const outcomes = market.odds
      .filter((o) => /^\d+-\d+$/.test(String(o.label)))
      .map((o) => ({
        key: String(o.label),
        label: String(o.label),
        odds: parseFloat(String(o.odds)),
      }))
      .filter((o) => !isNaN(o.odds));

    if (!outcomes.length) return null;

    return { key: "correct_score", scope: "90_minutes", outcomes };
  }

  return null;
}

function latestUpdatedAt(markets: ApiMarket[]): string {
  const dates = markets.map((m) => m.updatedAt).filter(Boolean);
  if (!dates.length) return new Date().toISOString();
  return new Date(Math.max(...dates.map((d) => new Date(d).getTime()))).toISOString();
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
