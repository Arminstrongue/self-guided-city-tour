CREATE TYPE "public"."agent_status" AS ENUM('pending', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'proposal', 'won', 'lost');--> statement-breakpoint
CREATE TABLE "agent_commissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"merchant_id" uuid,
	"stripe_invoice_id" text,
	"description" text,
	"amount_cents" integer NOT NULL,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"country" text,
	"code" text NOT NULL,
	"status" "agent_status" DEFAULT 'pending' NOT NULL,
	"iban" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"city" text,
	"contact" text,
	"email" text,
	"phone" text,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"notes" text,
	"merchant_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accesses" ADD COLUMN "plan" text;--> statement-breakpoint
ALTER TABLE "merchants" ADD COLUMN "agent_id" uuid;--> statement-breakpoint
ALTER TABLE "agent_commissions" ADD CONSTRAINT "agent_commissions_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_commissions" ADD CONSTRAINT "agent_commissions_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agent_comm_invoice_idx" ON "agent_commissions" USING btree ("stripe_invoice_id");--> statement-breakpoint
CREATE INDEX "agent_comm_agent_idx" ON "agent_commissions" USING btree ("agent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "agents_email_idx" ON "agents" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "agents_code_idx" ON "agents" USING btree ("code");--> statement-breakpoint
CREATE INDEX "leads_agent_idx" ON "leads" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "merchants_sub_idx" ON "merchants" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "merchants_agent_idx" ON "merchants" USING btree ("agent_id");