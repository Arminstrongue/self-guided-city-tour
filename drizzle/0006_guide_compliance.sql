ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "activity_reg_no" text;--> statement-breakpoint
ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "insurer" text;--> statement-breakpoint
ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "policy_no" text;--> statement-breakpoint
ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "tax_id" text;--> statement-breakpoint
ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "tax_country" text;--> statement-breakpoint
ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "address" text;--> statement-breakpoint
ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "birth_date" text;--> statement-breakpoint
ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "independent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "guides" ADD COLUMN IF NOT EXISTS "terms_version" text;
