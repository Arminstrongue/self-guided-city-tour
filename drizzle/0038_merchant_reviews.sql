CREATE TABLE IF NOT EXISTS "merchant_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"merchant_id" uuid NOT NULL,
	"stars" integer NOT NULL,
	"comment" text,
	"author" text,
	"locale" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_requests" ADD COLUMN IF NOT EXISTS "review_mailed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "rating_sum" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "rating_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "merchant_reviews" ADD CONSTRAINT "merchant_reviews_booking_id_booking_requests_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking_requests"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "merchant_reviews" ADD CONSTRAINT "merchant_reviews_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "merchant_reviews_booking_idx" ON "merchant_reviews" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "merchant_reviews_merchant_idx" ON "merchant_reviews" USING btree ("merchant_id","created_at");