CREATE TYPE "public"."access_scope" AS ENUM('city', 'all');--> statement-breakpoint
CREATE TYPE "public"."merchant_plan" AS ENUM('basic', 'featured', 'partner');--> statement-breakpoint
CREATE TYPE "public"."merchant_status" AS ENUM('pending', 'active', 'past_due', 'cancelled');--> statement-breakpoint
CREATE TABLE "accesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"user_id" uuid,
	"scope" "access_scope" NOT NULL,
	"city" text,
	"flight_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'eur' NOT NULL,
	"stripe_session_id" text NOT NULL,
	"ref_merchant_id" uuid,
	"locale" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchant_id" uuid NOT NULL,
	"access_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"city" text NOT NULL,
	"stop_id" text NOT NULL,
	"offer" text NOT NULL,
	"email" text NOT NULL,
	"instagram" text,
	"tiktok" text,
	"facebook" text,
	"plan" "merchant_plan" DEFAULT 'basic' NOT NULL,
	"status" "merchant_status" DEFAULT 'pending' NOT NULL,
	"ref_code" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"provider" text,
	"locale" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accesses" ADD CONSTRAINT "accesses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accesses" ADD CONSTRAINT "accesses_ref_merchant_id_merchants_id_fk" FOREIGN KEY ("ref_merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_access_id_accesses_id_fk" FOREIGN KEY ("access_id") REFERENCES "public"."accesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accesses_session_idx" ON "accesses" USING btree ("stripe_session_id");--> statement-breakpoint
CREATE INDEX "accesses_email_idx" ON "accesses" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "commissions_access_idx" ON "commissions" USING btree ("access_id");--> statement-breakpoint
CREATE UNIQUE INDEX "merchants_ref_idx" ON "merchants" USING btree ("ref_code");--> statement-breakpoint
CREATE INDEX "merchants_city_stop_idx" ON "merchants" USING btree ("city","stop_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");