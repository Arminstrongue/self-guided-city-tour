CREATE TABLE IF NOT EXISTS "traveller_profiles" (
	"email" text PRIMARY KEY NOT NULL,
	"handle" text NOT NULL,
	"name" text NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"photo" text,
	"is_private" boolean DEFAULT true NOT NULL,
	"theme" text DEFAULT 'auto' NOT NULL,
	"accent" text DEFAULT 'blue' NOT NULL,
	"cities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"less_of" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_handle_idx" ON "traveller_profiles" USING btree ("handle");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "follows" (
	"follower" text NOT NULL,
	"followee" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "follows_pair_idx" ON "follows" USING btree ("follower","followee");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "follows_followee_idx" ON "follows" USING btree ("followee","status");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blocks" (
	"blocker" text NOT NULL,
	"blocked" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "blocks_pair_idx" ON "blocks" USING btree ("blocker","blocked");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter" text NOT NULL,
	"target" text NOT NULL,
	"reason" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_status_idx" ON "reports" USING btree ("status","created_at");
