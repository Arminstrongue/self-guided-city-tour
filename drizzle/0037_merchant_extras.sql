ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "promo" jsonb;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "languages" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN IF NOT EXISTS "payments" jsonb DEFAULT '[]'::jsonb NOT NULL;