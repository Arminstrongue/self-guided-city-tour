CREATE TYPE "public"."booking_status" AS ENUM('pending', 'requested', 'confirmed', 'declined', 'cancelled', 'expired', 'completed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."guide_status" AS ENUM('pending', 'active', 'suspended', 'rejected');--> statement-breakpoint
CREATE TABLE "guide_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guide_id" uuid NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"city" text NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"hours" integer NOT NULL,
	"people" integer NOT NULL,
	"amount_cents" integer NOT NULL,
	"fee_cents" integer NOT NULL,
	"note" text,
	"locale" text,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"stripe_session_id" text,
	"payment_intent_id" text,
	"respond_by" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guide_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"guide_id" uuid NOT NULL,
	"stars" integer NOT NULL,
	"comment" text,
	"author" text,
	"locale" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"city" text NOT NULL,
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"photo" text,
	"hourly_cents" integer NOT NULL,
	"max_people" integer DEFAULT 6 NOT NULL,
	"meeting_point" text,
	"license_no" text,
	"status" "guide_status" DEFAULT 'pending' NOT NULL,
	"stripe_account_id" text,
	"payouts_ready" boolean DEFAULT false NOT NULL,
	"rating_sum" integer DEFAULT 0 NOT NULL,
	"rating_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guide_bookings" ADD CONSTRAINT "guide_bookings_guide_id_guides_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."guides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_reviews" ADD CONSTRAINT "guide_reviews_booking_id_guide_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."guide_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_reviews" ADD CONSTRAINT "guide_reviews_guide_id_guides_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."guides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_guide_idx" ON "guide_bookings" USING btree ("guide_id","start_at");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_session_idx" ON "guide_bookings" USING btree ("stripe_session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "guide_reviews_booking_idx" ON "guide_reviews" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "guide_reviews_guide_idx" ON "guide_reviews" USING btree ("guide_id");--> statement-breakpoint
CREATE UNIQUE INDEX "guides_email_idx" ON "guides" USING btree ("email");--> statement-breakpoint
CREATE INDEX "guides_city_status_idx" ON "guides" USING btree ("city","status");