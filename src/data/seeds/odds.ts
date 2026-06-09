import type { BookmakerOdds } from "@/domain/odds/types";

const updatedRecently = "2026-06-09T20:40:00Z";
const updatedOld = "2026-06-08T15:00:00Z";

export const expectedBookmakers = ["Bet365", "Betfair", "DraftKings", "FanDuel"];

export const oddsByMatchId: Record<string, BookmakerOdds[]> = {
  "wc2026-001": [
    bookmaker("Bet365", updatedRecently, [
      ["match_winner", "includes_extra_time", winner(1.42, 4.1, 7.8)],
      ["correct_score", "includes_extra_time", scores([
        ["1-0", 5.8],
        ["2-0", 6.4],
        ["2-1", 8.2],
        ["1-1", 9.0],
        ["0-0", 12.5],
      ])],
    ]),
    bookmaker("Betfair", updatedRecently, [
      ["match_winner", "includes_extra_time", winner(1.46, 4.0, 7.2)],
      ["correct_score", "includes_extra_time", scores([
        ["1-0", 5.6],
        ["2-0", 6.6],
        ["2-1", 8.5],
        ["1-1", 8.8],
        ["0-0", 13.0],
      ])],
    ]),
    bookmaker("DraftKings", updatedRecently, [
      ["match_winner", "90_minutes", winner(1.52, 3.8, 6.9)],
      ["correct_score", "90_minutes", scores([
        ["1-0", 6.0],
        ["2-0", 6.9],
        ["2-1", 8.0],
        ["1-1", 8.4],
      ])],
    ]),
  ],
  "wc2026-004": [
    bookmaker("Bet365", updatedRecently, [
      ["match_winner", "includes_extra_time", winner(1.34, 4.9, 9.5)],
      ["correct_score", "includes_extra_time", scores([
        ["2-0", 5.4],
        ["1-0", 5.7],
        ["2-1", 7.6],
        ["3-0", 8.4],
        ["1-1", 10.5],
      ])],
    ]),
    bookmaker("Betfair", updatedRecently, [
      ["match_winner", "includes_extra_time", winner(1.36, 4.8, 9.0)],
      ["correct_score", "includes_extra_time", scores([
        ["2-0", 5.2],
        ["1-0", 5.9],
        ["2-1", 7.8],
        ["3-0", 8.1],
        ["1-1", 10.8],
      ])],
    ]),
    bookmaker("FanDuel", updatedOld, [
      ["match_winner", "includes_extra_time", winner(1.38, 4.6, 8.8)],
      ["correct_score", "includes_extra_time", scores([
        ["2-0", 5.5],
        ["1-0", 6.0],
        ["2-1", 7.9],
        ["3-0", 8.0],
      ])],
    ]),
  ],
  "wc2026-005": [
    bookmaker("Bet365", updatedRecently, [
      ["match_winner", "includes_extra_time", winner(1.5, 4.0, 6.6)],
      ["correct_score", "includes_extra_time", scores([
        ["1-0", 6.1],
        ["2-0", 7.0],
        ["2-1", 7.4],
        ["1-1", 8.2],
      ])],
    ]),
    bookmaker("DraftKings", updatedRecently, [
      ["match_winner", "90_minutes", winner(1.55, 3.9, 6.2)],
    ]),
  ],
  "wc2026-072": [
    bookmaker("Bet365", updatedRecently, [
      ["match_winner", "includes_extra_time", winner(2.05, 3.25, 3.6)],
      ["correct_score", "includes_extra_time", scores([
        ["1-1", 5.9],
        ["1-0", 7.1],
        ["0-1", 7.4],
        ["2-1", 9.3],
        ["1-2", 9.8],
      ])],
    ]),
    bookmaker("Betfair", updatedRecently, [
      ["match_winner", "includes_extra_time", winner(2.0, 3.3, 3.7)],
      ["correct_score", "includes_extra_time", scores([
        ["1-1", 6.0],
        ["1-0", 7.0],
        ["0-1", 7.2],
        ["2-1", 9.5],
        ["1-2", 9.6],
      ])],
    ]),
    bookmaker("DraftKings", updatedRecently, [
      ["match_winner", "includes_extra_time", winner(2.1, 3.15, 3.55)],
    ]),
  ],
};

function bookmaker(
  bookmakerName: string,
  updatedAt: string,
  markets: Array<[BookmakerOdds["markets"][number]["key"], BookmakerOdds["markets"][number]["scope"], BookmakerOdds["markets"][number]["outcomes"]]>,
): BookmakerOdds {
  return {
    bookmaker: bookmakerName,
    updatedAt,
    markets: markets.map(([key, scope, outcomes]) => ({ key, scope, outcomes })),
  };
}

function winner(home: number, draw: number, away: number) {
  return [
    { key: "home", label: "Local", odds: home },
    { key: "draw", label: "Empate", odds: draw },
    { key: "away", label: "Visitante", odds: away },
  ];
}

function scores(values: Array<[string, number]>) {
  return values.map(([score, odds]) => ({
    key: score,
    label: score,
    odds,
  }));
}
