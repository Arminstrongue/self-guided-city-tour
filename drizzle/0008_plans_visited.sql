ALTER TABLE "traveller_prefs" ADD COLUMN IF NOT EXISTS "visited" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "traveller_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"title" text NOT NULL,
	"city" text,
	"city_name" text NOT NULL,
	"start_date" text,
	"days" integer DEFAULT 1 NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "plans_email_idx" ON "traveller_plans" USING btree ("email","updated_at");
