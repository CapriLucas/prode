CREATE TABLE "completion_records" (
	"match_id" text PRIMARY KEY NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"signature" text NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" text PRIMARY KEY NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"phase" text NOT NULL,
	"home_team" text NOT NULL,
	"away_team" text NOT NULL,
	"venue" text NOT NULL,
	"status" text NOT NULL,
	"group_name" text,
	"placeholder" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "odds_snapshots" (
	"match_id" text PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"provider_event_id" text,
	"payload" jsonb NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_runs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sync_runs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"source" text NOT NULL,
	"status" text NOT NULL,
	"message" text,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "completion_records" ADD CONSTRAINT "completion_records_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "odds_snapshots" ADD CONSTRAINT "odds_snapshots_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;