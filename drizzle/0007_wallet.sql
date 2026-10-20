CREATE TABLE IF NOT EXISTS "traveller_memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"city" text NOT NULL,
	"city_name" text NOT NULL,
	"title" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"photo" text,
	"lat" text,
	"lng" text,
	"taken_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "memories_email_idx" ON "traveller_memories" USING btree ("email","taken_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "traveller_prefs" (
	"email" text PRIMARY KEY NOT NULL,
	"hobbies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"saved" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
