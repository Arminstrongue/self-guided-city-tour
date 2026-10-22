ALTER TABLE "accesses" ADD COLUMN IF NOT EXISTS "activated_at" timestamp with time zone;--> statement-breakpoint
UPDATE "accesses" SET "activated_at" = "created_at" WHERE "activated_at" IS NULL;
