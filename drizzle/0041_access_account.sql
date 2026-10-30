ALTER TABLE "accesses" ADD COLUMN IF NOT EXISTS "account_email" text;
--> statement-breakpoint
ALTER TABLE "accesses" ADD COLUMN IF NOT EXISTS "refunded_at" timestamp with time zone;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "accesses_account_idx" ON "accesses" ("account_email");
