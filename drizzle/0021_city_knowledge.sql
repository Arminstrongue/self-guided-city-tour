CREATE TABLE IF NOT EXISTS "city_knowledge" (
	"city" text NOT NULL,
	"lang" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"text" text NOT NULL,
	"url" text NOT NULL,
	"src_lang" text NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "city_knowledge_key_idx" ON "city_knowledge" USING btree ("city","lang","kind");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "city_pulse" (
	"city" text NOT NULL,
	"day" text NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "city_pulse_key_idx" ON "city_pulse" USING btree ("city","day");
