ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "audience" text DEFAULT 'all' NOT NULL;--> statement-breakpoint
ALTER TABLE "account_settings" ADD COLUMN IF NOT EXISTS "hidden_words" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "close_friends" ("email" text NOT NULL, "friend" text NOT NULL, "created_at" timestamp with time zone DEFAULT now() NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "close_friends_pair_idx" ON "close_friends" ("email","friend");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "close_friends_friend_idx" ON "close_friends" ("friend");