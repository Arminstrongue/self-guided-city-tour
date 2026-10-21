CREATE TABLE IF NOT EXISTS "checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"city" text NOT NULL,
	"stop" text DEFAULT '' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "checkins_uniq_idx" ON "checkins" USING btree ("email","city","stop");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "checkins_city_idx" ON "checkins" USING btree ("city","stop");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "place_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city" text NOT NULL,
	"stop" text DEFAULT '' NOT NULL,
	"author" text NOT NULL,
	"text" text NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"reports" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "place_comments_place_idx" ON "place_comments" USING btree ("city","stop","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "place_comments_author_idx" ON "place_comments" USING btree ("author");
