-- Índices para consultas frequentes que liam a tabela inteira (apagar publicação, carteira, conservação, limpeza de histórias).
CREATE INDEX IF NOT EXISTS "notifications_post_idx" ON "notifications" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "post_saves_post_idx" ON "post_saves" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "guide_bookings_email_idx" ON "guide_bookings" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_created_idx" ON "events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_expires_idx" ON "posts" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "referral_credits_hold_idx" ON "referral_credits" USING btree ("email","kind","created_at");
