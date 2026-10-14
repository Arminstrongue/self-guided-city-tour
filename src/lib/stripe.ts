import Stripe from "stripe";
import { env } from "./env";

let client: Stripe | null = null;
export function stripe(): Stripe {
  if (!env.stripeKey) throw new Error("STRIPE_SECRET_KEY em falta");
  if (!client) client = new Stripe(env.stripeKey, { apiVersion: "2025-02-24.acacia", appInfo: { name: "Self Guided City Tour" } });
  return client;
}
