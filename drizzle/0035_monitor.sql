CREATE TABLE IF NOT EXISTS "monitor_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"ok" boolean NOT NULL,
	"ms" integer DEFAULT 0 NOT NULL,
	"status" integer DEFAULT 0 NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "monitor_state" (
	"name" text PRIMARY KEY NOT NULL,
	"ok" boolean DEFAULT true NOT NULL,
	"fails" integer DEFAULT 0 NOT NULL,
	"alerted" boolean DEFAULT false NOT NULL,
	"since" timestamp with time zone DEFAULT now() NOT NULL,
	"last_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_ms" integer DEFAULT 0 NOT NULL,
	"last_status" integer DEFAULT 0 NOT NULL,
	"last_error" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "social_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"network" text NOT NULL,
	"account" text DEFAULT '' NOT NULL,
	"followers" integer DEFAULT 0 NOT NULL,
	"posts" integer DEFAULT 0 NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "monitor_log_name_at_idx" ON "monitor_log" USING btree ("name","at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "social_snapshots_net_at_idx" ON "social_snapshots" USING btree ("network","at");