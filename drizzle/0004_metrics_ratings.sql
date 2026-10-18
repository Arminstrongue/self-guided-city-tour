CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"city" text,
	"stop" text,
	"locale" text,
	"ref" text,
	"platform" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"access_id" uuid NOT NULL,
	"city" text NOT NULL,
	"stars" integer NOT NULL,
	"nps" integer,
	"comment" text,
	"locale" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_access_id_accesses_id_fk" FOREIGN KEY ("access_id") REFERENCES "public"."accesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_name_created_idx" ON "events" USING btree ("name","created_at");--> statement-breakpoint
CREATE INDEX "events_city_idx" ON "events" USING btree ("city");--> statement-breakpoint
CREATE UNIQUE INDEX "ratings_access_city_idx" ON "ratings" USING btree ("access_id","city");--> statement-breakpoint
CREATE INDEX "ratings_created_idx" ON "ratings" USING btree ("created_at");