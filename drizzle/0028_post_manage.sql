ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "hide_likes" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "comments_off" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "edited_at" timestamp with time zone;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_hides" ("email" text NOT NULL, "post_id" uuid NOT NULL, "created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "post_hides_pair_idx" ON "post_hides" ("email","post_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_mutes" ("email" text NOT NULL, "muted" text NOT NULL, "created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_mutes_pair_idx" ON "user_mutes" ("email","muted");
