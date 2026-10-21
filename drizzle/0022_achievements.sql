CREATE TABLE IF NOT EXISTS "achievements" (
	"email" text NOT NULL,
	"key" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "achievements_key_idx" ON "achievements" USING btree ("email","key");
--> statement-breakpoint
INSERT INTO "achievements" ("email", "key")
SELECT DISTINCT e, 'legacy' FROM (
	SELECT "email" AS e FROM "accesses"
	UNION SELECT "email" FROM "traveller_profiles"
	UNION SELECT "email" FROM "checkins"
	UNION SELECT "email" FROM "traveller_memories"
) x ON CONFLICT DO NOTHING;
