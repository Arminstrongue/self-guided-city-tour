CREATE TABLE IF NOT EXISTS "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"local_at" text NOT NULL,
	"tz" text DEFAULT 'UTC' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"place" text DEFAULT '' NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"ref" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"photo" text DEFAULT '' NOT NULL,
	"paid" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reservations_email_idx" ON "reservations" USING btree ("email","starts_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stop_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city" text NOT NULL,
	"stop" text NOT NULL,
	"kind" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"reporter" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stop_reports_place_idx" ON "stop_reports" USING btree ("city","stop","status");
