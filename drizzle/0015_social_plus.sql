ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "extra" jsonb;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "photo" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "audio" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "reply_to" uuid;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_saves" (
	"post_id" uuid NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "post_saves_pair_idx" ON "post_saves" USING btree ("email","post_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message_reactions" (
	"message_id" uuid NOT NULL,
	"email" text NOT NULL,
	"emoji" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "message_reactions_pair_idx" ON "message_reactions" USING btree ("message_id","email");
