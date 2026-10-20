CREATE TABLE IF NOT EXISTS "split_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"currency" text NOT NULL,
	"owner" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "split_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"email" text,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "split_members_group_idx" ON "split_members" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "split_members_email_idx" ON "split_members" USING btree ("email");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "split_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"amount" integer NOT NULL,
	"orig_amount" integer NOT NULL,
	"orig_currency" text NOT NULL,
	"payer" uuid NOT NULL,
	"shares" jsonb NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "split_items_group_idx" ON "split_items" USING btree ("group_id","created_at");
