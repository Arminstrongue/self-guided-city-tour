ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "hours" text;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "paused" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "merchants_email_idx" ON "merchants" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_stop_idx" ON "events" ("stop","created_at");
