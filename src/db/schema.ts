import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

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
