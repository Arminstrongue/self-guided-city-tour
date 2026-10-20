CREATE TABLE IF NOT EXISTS "account_settings" (
	"email" text PRIMARY KEY NOT NULL,
	"dm_policy" text DEFAULT 'circle' NOT NULL,
	"notif" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"lang" text DEFAULT 'en' NOT NULL,
	"sessions_after" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"actor" text NOT NULL,
	"type" text NOT NULL,
	"post_id" uuid,
	"text" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_email_idx" ON "notifications" USING btree ("email","created_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_subs" (
	"endpoint" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "push_subs_email_idx" ON "push_subs" USING btree ("email");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "live_presence" (
	"email" text PRIMARY KEY NOT NULL,
	"at" timestamp with time zone NOT NULL
);
