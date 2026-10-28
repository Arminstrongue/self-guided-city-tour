-- Atualizações dos viajantes: sinais, caminhos, avisos, alertas, dicas e fotos/vídeos numa cidade, paragem ou ponto do mapa.
CREATE TABLE IF NOT EXISTS "traveller_updates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "author" text NOT NULL,
  "city" text NOT NULL,
  "stop" text,
  "kind" text NOT NULL,
  "text" text DEFAULT '' NOT NULL,
  "place" text DEFAULT '' NOT NULL,
  "lat" double precision,
  "lng" double precision,
  "photo" text,
  "post_id" uuid,
  "status" text DEFAULT 'live' NOT NULL,
  "up" integer DEFAULT 0 NOT NULL,
  "down" integer DEFAULT 0 NOT NULL,
  "reports" integer DEFAULT 0 NOT NULL,
  "expires_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "traveller_updates_city_idx" ON "traveller_updates" ("city", "status", "created_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "traveller_update_votes" (
  "update_id" uuid NOT NULL,
  "voter" text NOT NULL,
  "value" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY ("update_id", "voter")
);
