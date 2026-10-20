ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "video" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "video_status" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "duration" integer;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_video_idx" ON "posts" USING btree ("video_status","created_at");
