ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "book_mode" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "book_options" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "booking_url" text;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "phone" text;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "photo_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "locale" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "merchant_photos" (
	"merchant_id" uuid NOT NULL REFERENCES "merchants"("id") ON DELETE cascade,
	"idx" integer NOT NULL,
	"data" text NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "merchant_photos_idx" ON "merchant_photos" USING btree ("merchant_id","idx");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "booking_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_id" uuid NOT NULL REFERENCES "merchants"("id") ON DELETE cascade,
	"kind" text NOT NULL,
	"option" text DEFAULT '' NOT NULL,
	"date_from" text NOT NULL,
	"date_to" text DEFAULT '' NOT NULL,
	"time" text DEFAULT '' NOT NULL,
	"people" integer DEFAULT 1 NOT NULL,
	"units" integer DEFAULT 1 NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_requests_merchant_idx" ON "booking_requests" USING btree ("merchant_id","created_at");
