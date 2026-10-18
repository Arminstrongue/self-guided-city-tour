import { pgTable, uuid, text, integer, timestamp, pgEnum, index, uniqueIndex, jsonb, boolean } from "drizzle-orm/pg-core";

export const accessScope = pgEnum("access_scope", ["city", "all"]);
export const merchantPlan = pgEnum("merchant_plan", ["basic", "featured", "partner"]);
export const merchantStatus = pgEnum("merchant_status", ["pending", "active", "past_due", "cancelled"]);
export const agentStatus = pgEnum("agent_status", ["pending", "active", "suspended"]);
export const leadStatus = pgEnum("lead_status", ["new", "contacted", "proposal", "won", "lost"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  name: text("name"),
  provider: text("provider"),
  locale: text("locale"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("users_email_idx").on(t.email)]);

export const merchants = pgTable("merchants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  city: text("city").notNull(),
  stopId: text("stop_id").notNull(),
  offer: text("offer").notNull(),
  email: text("email").notNull(),
  instagram: text("instagram"),
  tiktok: text("tiktok"),
  facebook: text("facebook"),
  plan: merchantPlan("plan").notNull().default("basic"),
  status: merchantStatus("status").notNull().default("pending"),
  refCode: text("ref_code").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  agentId: uuid("agent_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [
  uniqueIndex("merchants_ref_idx").on(t.refCode),
  index("merchants_sub_idx").on(t.stripeSubscriptionId),
  index("merchants_agent_idx").on(t.agentId),
  index("merchants_city_stop_idx").on(t.city, t.stopId)
]);

export const accesses = pgTable("accesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  userId: uuid("user_id").references(() => users.id),
  scope: accessScope("scope").notNull(),
  city: text("city"),
  flightAt: timestamp("flight_at", { withTimezone: true }),
  flightNo: text("flight_no"),
  plan: text("plan"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("eur"),
  stripeSessionId: text("stripe_session_id").notNull(),
  refMerchantId: uuid("ref_merchant_id").references(() => merchants.id),
  locale: text("locale"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [
  uniqueIndex("accesses_session_idx").on(t.stripeSessionId),
  index("accesses_email_idx").on(t.email)
]);

export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id").notNull().references(() => merchants.id),
  accessId: uuid("access_id").notNull().references(() => accesses.id),
  amountCents: integer("amount_cents").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("commissions_access_idx").on(t.accessId)]);

export type Merchant = typeof merchants.$inferSelect;
export type Access = typeof accesses.$inferSelect;

/** Conteúdo editável no painel: substitui (ou acrescenta) cidades de src/data/cities.ts. */
export const cityContent = pgTable("city_content", {
  id: text("id").primaryKey(),
  data: jsonb("data").notNull(),
  active: boolean("active").notNull().default(true),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

/** Comerciais independentes: angariam comerciantes, restaurantes, pousadas, hotéis e empresas. */
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  country: text("country"),
  code: text("code").notNull(),
  status: agentStatus("status").notNull().default("pending"),
  iban: text("iban"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("agents_email_idx").on(t.email), uniqueIndex("agents_code_idx").on(t.code)]);

/** Carteira de negócios de cada comercial. */
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => agents.id),
  name: text("name").notNull(),
  kind: text("kind").notNull(),          // shop, food, cafe, guesthouse, hotel, company, other
  city: text("city"),
  contact: text("contact"),
  email: text("email"),
  phone: text("phone"),
  status: leadStatus("status").notNull().default("new"),
  notes: text("notes"),
  merchantId: uuid("merchant_id").references(() => merchants.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("leads_agent_idx").on(t.agentId)]);

/** Comissões dos comerciais: uma por fatura de assinatura paga (primeiros 12 meses). */
export const agentCommissions = pgTable("agent_commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => agents.id),
  merchantId: uuid("merchant_id").references(() => merchants.id),
  stripeInvoiceId: text("stripe_invoice_id"),
  description: text("description"),
  amountCents: integer("amount_cents").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("agent_comm_invoice_idx").on(t.stripeInvoiceId), index("agent_comm_agent_idx").on(t.agentId)]);

export type Agent = typeof agents.$inferSelect;
export type Lead = typeof leads.$inferSelect;

/** Métricas anónimas (sem cookies nem dados pessoais): só o nome do evento, cidade e contexto. */
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  city: text("city"),
  stop: text("stop"),
  locale: text("locale"),
  ref: text("ref"),
  platform: text("platform"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [index("events_name_created_idx").on(t.name, t.createdAt), index("events_city_idx").on(t.city)]);

/** Avaliação no fim do roteiro: estrelas, NPS (0–10) e comentário. Uma por compra. */
export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  accessId: uuid("access_id").notNull().references(() => accesses.id),
  city: text("city").notNull(),
  stars: integer("stars").notNull(),
  nps: integer("nps"),
  comment: text("comment"),
  locale: text("locale"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [uniqueIndex("ratings_access_city_idx").on(t.accessId, t.city), index("ratings_created_idx").on(t.createdAt)]);
export type Rating = typeof ratings.$inferSelect;
