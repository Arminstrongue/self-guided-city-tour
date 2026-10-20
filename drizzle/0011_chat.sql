CREATE TABLE IF NOT EXISTS "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pair" text NOT NULL,
	"sender" text NOT NULL,
	"recipient" text NOT NULL,
	"text" text NOT NULL,
	"ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_pair_idx" ON "messages" USING btree ("pair","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_unread_idx" ON "messages" USING btree ("recipient","read_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chat_cleared" (
	"email" text NOT NULL,
	"peer" text NOT NULL,
	"before" timestamp with time zone NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "chat_cleared_pair_idx" ON "chat_cleared" USING btree ("email","peer");
