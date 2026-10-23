ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "address" text;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "lat" double precision;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "lng" double precision;
