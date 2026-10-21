CREATE TABLE IF NOT EXISTS "referral_credits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"kind" text NOT NULL,
	"access_id" uuid NOT NULL,
	"friend" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "referral_credits_access_kind_idx" ON "referral_credits" USING btree ("access_id","kind");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "referral_credits_email_idx" ON "referral_credits" USING btree ("email");
