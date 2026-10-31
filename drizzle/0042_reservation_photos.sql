ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "photos" jsonb DEFAULT '[]'::jsonb NOT NULL;
