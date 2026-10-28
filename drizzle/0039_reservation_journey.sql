-- Viagens de comboio/autocarro com mudanças (troços: de, para, partida, chegada, operador, plataforma).
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "journey" jsonb;
