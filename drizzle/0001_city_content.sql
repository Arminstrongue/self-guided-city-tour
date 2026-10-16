CREATE TABLE "city_content" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
