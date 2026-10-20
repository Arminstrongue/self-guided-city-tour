CREATE TABLE IF NOT EXISTS "invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inviter" text NOT NULL,
	"channel" text NOT NULL,
	"target_hash" text,
	"joined_email" text,
	"joined_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invites_inviter_idx" ON "invites" USING btree ("inviter","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invites_target_idx" ON "invites" USING btree ("target_hash");
