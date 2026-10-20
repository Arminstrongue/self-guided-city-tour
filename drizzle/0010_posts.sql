CREATE TABLE IF NOT EXISTS "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author" text NOT NULL,
	"kind" text NOT NULL,
	"text" text DEFAULT '' NOT NULL,
	"photo" text,
	"city" text,
	"tag" text,
	"bg" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_author_idx" ON "posts" USING btree ("author","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_city_idx" ON "posts" USING btree ("city","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_kind_idx" ON "posts" USING btree ("kind","created_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_likes" (
	"post_id" uuid NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "post_likes_pair_idx" ON "post_likes" USING btree ("post_id","email");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"author" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_comments_post_idx" ON "post_comments" USING btree ("post_id","created_at");--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "post_id" uuid;
