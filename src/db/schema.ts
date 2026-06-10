import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const matches = pgTable("matches", {
  id: text("id").primaryKey(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  phase: text("phase").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  venue: text("venue").notNull(),
  status: text("status").notNull(),
  group: text("group_name"),
  placeholder: boolean("placeholder").notNull().default(false),
});

export const oddsSnapshots = pgTable("odds_snapshots", {
  matchId: text("match_id")
    .primaryKey()
    .references(() => matches.id, { onDelete: "cascade" }),
  source: text("source").notNull(),
  providerEventId: text("provider_event_id"),
  payload: jsonb("payload").notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
});

export const completionRecords = pgTable("completion_records", {
  matchId: text("match_id")
    .primaryKey()
    .references(() => matches.id, { onDelete: "cascade" }),
  completed: boolean("completed").notNull().default(false),
  signature: text("signature").notNull(),
  userScore: text("user_score"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const syncRuns = pgTable("sync_runs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  source: text("source").notNull(),
  status: text("status").notNull(),
  message: text("message"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});
