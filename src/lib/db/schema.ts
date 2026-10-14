import { pgTable, uuid, text, integer, timestamp, pgEnum, index, uniqueIndex } from "drizzle-orm/pg-core";

export const accessScope = pgEnum("access_scope", ["city", "all"]);
export const merchantPlan = pgEnum("merchant_plan", ["basic", "featured", "partner"]);
export const merchantStatus = pgEnum("merchant_status", ["pending", "active", "past_due", "cancelled"]);

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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, (t) => [
  uniqueIndex("merchants_ref_idx").on(t.refCode),
  index("merchants_city_stop_idx").on(t.city, t.stopId)
]);

export const accesses = pgTable("accesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  userId: uuid("user_id").references(() => users.id),
  scope: accessScope("scope").notNull(),
  city: text("city"),
  flightAt: timestamp("flight_at", { withTimezone: true }),
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
