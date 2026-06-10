import type { Match } from "@/domain/matches/types";
import type { BookmakerOdds, OddsMarket } from "../types";
import { saveOddsSummary } from "../repository";
import { getOddsSummaryFromBookmakers } from "../odds";
import {
  fetchOddsApiIoEvents,
  type OddsApiIoEvent,
} from "@/domain/matches/providers/odds-api-io";

type ApiMarket = {
  name: string;
  updatedAt: string;
  odds: Record<string, string | number>[];
};

type ApiEvent = OddsApiIoEvent & {
  bookmakers: Record<string, ApiMarket[]>;
};

const BASE_URL =
  process.env.ODDS_API_IO_BASE_URL ?? "https://api.odds-api.io/v3";
const BOOKMAKERS = ["Bet365"];
const BATCH_SIZE = 10;
const LOG_PREFIX = "[odds-sync]";

export async function syncOddsApiIo(matches: Match[]) {
  const apiKey = process.env.ODDS_API_KEY_IO;
  logInfo("inicio", {
    matches: matches.length,
    bookmakers: BOOKMAKERS.join(","),
    batchSize: BATCH_SIZE,
  });

  if (!apiKey) {
    logWarn("omitido: ODDS_API_KEY_IO no configurada");
    return {
      synced: 0,
      skipped: true,
      message: "ODDS_API_KEY_IO no configurada.",
    };
  }

  const eventsResult = await fetchOddsApiIoEvents();

  if (eventsResult.skipped) {
    logWarn("omitido: no se pudieron obtener eventos", {
      message: eventsResult.message,
    });
    return { synced: 0, skipped: true, message: eventsResult.message };
  }

  const upcomingEvents = eventsResult.events.filter(
    (event) => event.status === "pending" || event.status === "live",
  );
  logInfo("eventos obtenidos", {
    total: eventsResult.events.length,
    upcoming: upcomingEvents.length,
  });

  const oddsMap = new Map<number, ApiEvent>();
  const ids = getEventIdsForMatches(matches, upcomingEvents);
  const totalBatches = Math.ceil(ids.length / BATCH_SIZE);
  logInfo("event ids detectados para odds", {
    ids: ids.length,
    batches: totalBatches,
  });

  if (!ids.length) {
    logWarn("sin event ids para consultar odds");
    return {
      synced: 0,
      fetched: 0,
      skipped: false,
      message: "No se encontraron eventos de odds-api.io para los partidos persistidos.",
    };
  }

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    logInfo(`consultando batch ${batchNumber}/${totalBatches}`, {
      eventIds: batch.join(","),
    });

    const oddsUrl = new URL(`${BASE_URL}/odds/multi`);
    oddsUrl.searchParams.set("apiKey", apiKey);
    oddsUrl.searchParams.set("eventIds", batch.join(","));
    oddsUrl.searchParams.set("bookmakers", BOOKMAKERS.join(","));

    const oddsRes = await fetch(oddsUrl, { cache: "no-store" });
    if (!oddsRes.ok) {
      const body = await oddsRes.text();
      logError(`fallo batch ${batchNumber}/${totalBatches}`, {
        status: oddsRes.status,
        body,
      });
      throw new Error(`odds-api.io /odds/multi error ${oddsRes.status}: ${body}`);
    }

    const batchData = (await oddsRes.json()) as ApiEvent[];
    logInfo(`batch ${batchNumber}/${totalBatches} recibido`, {
      eventsWithOdds: batchData.length,
    });

    for (const ev of batchData) {
      oddsMap.set(ev.id, ev);
    }
  }

  let synced = 0;
  let built = 0;
  let skippedNoEvent = 0;
  let skippedNoOdds = 0;
  let skippedNoBookmakers = 0;
  let skippedPersistence = 0;

  logInfo("procesando partidos", {
    matches: matches.length,
    eventsWithOdds: oddsMap.size,
  });

  for (const [index, match] of matches.entries()) {
    const progress = `${index + 1}/${matches.length}`;
    const event = findEventForMatch(upcomingEvents, match);
    if (!event) {
      skippedNoEvent++;
      logWarn(`skip ${progress}: sin evento asociado`, describeMatch(match));
      continue;
    }

    const eventWithOdds = oddsMap.get(event.id);
    if (!eventWithOdds?.bookmakers) {
      skippedNoOdds++;
      logWarn(`skip ${progress}: sin odds en respuesta`, {
        ...describeMatch(match),
        eventId: event.id,
      });
      continue;
    }

    const bookmakers = mapBookmakers(eventWithOdds);
    if (!bookmakers.length) {
      skippedNoBookmakers++;
      logWarn(`skip ${progress}: sin bookmakers/markets compatibles`, {
        ...describeMatch(match),
        eventId: event.id,
        bookmakers: Object.keys(eventWithOdds.bookmakers).join(","),
      });
      continue;
    }

    const summary = getOddsSummaryFromBookmakers({
      matchId: match.id,
      source: "odds-api-io",
      expectedBookmakers: BOOKMAKERS,
      bookmakers,
    });
    built++;

    const persistence = await saveOddsSummary(summary, String(event.id));
    if (!persistence.persisted) {
      skippedPersistence++;
      logWarn(`summary no persistido ${progress}`, {
        ...describeMatch(match),
        eventId: event.id,
        error: persistence.error,
      });
      continue;
    }

    synced++;
    logInfo(`guardado ${progress}`, {
      ...describeMatch(match),
      eventId: event.id,
      bookmakers: bookmakers.length,
      markets: summary.markets.length,
    });
  }

  logInfo("fin", {
    synced,
    built,
    skippedNoEvent,
    skippedNoOdds,
    skippedNoBookmakers,
    skippedPersistence,
  });

  return {
    synced,
    built,
    fetched: oddsMap.size,
    skippedNoEvent,
    skippedNoOdds,
    skippedNoBookmakers,
    skippedPersistence,
    skipped: false,
    message: `Sincronizados ${synced} partidos desde odds-api.io.`,
  };
}

function findMatchingEvent(events: OddsApiIoEvent[], match: Match): OddsApiIoEvent | undefined {
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

function getEventIdsForMatches(matches: Match[], events: OddsApiIoEvent[]) {
  const ids = new Set<number>();

  for (const match of matches) {
    const directId = getDirectEventId(match.id);

    if (directId) {
      ids.add(directId);
      continue;
    }

    const event = findEventForMatch(events, match);

    if (event) {
      ids.add(event.id);
    }
  }

  return [...ids];
}

function findEventForMatch(events: OddsApiIoEvent[], match: Match): OddsApiIoEvent | undefined {
  const directId = getDirectEventId(match.id);

  if (directId) {
    return events.find((event) => event.id === directId);
  }

  return findMatchingEvent(events, match);
}

function getDirectEventId(matchId: string) {
  if (!/^\d+$/.test(matchId)) {
    return null;
  }

  return Number(matchId);
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

function describeMatch(match: Match) {
  return {
    matchId: match.id,
    teams: `${match.homeTeam} vs ${match.awayTeam}`,
    startsAt: match.startsAt,
  };
}

function logInfo(message: string, details?: Record<string, unknown>) {
  if (details) {
    console.info(`${LOG_PREFIX} ${message}`, details);
    return;
  }

  console.info(`${LOG_PREFIX} ${message}`);
}

function logWarn(message: string, details?: Record<string, unknown>) {
  if (details) {
    console.warn(`${LOG_PREFIX} ${message}`, details);
    return;
  }

  console.warn(`${LOG_PREFIX} ${message}`);
}

function logError(message: string, details?: Record<string, unknown>) {
  if (details) {
    console.error(`${LOG_PREFIX} ${message}`, details);
    return;
  }

  console.error(`${LOG_PREFIX} ${message}`);
}
