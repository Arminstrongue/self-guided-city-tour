CREATE TABLE IF NOT EXISTS "story_views" (
	"post_id" uuid NOT NULL,
	"viewer" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "story_views_pair_idx" ON "story_views" USING btree ("post_id","viewer");
