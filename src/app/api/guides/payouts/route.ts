import { NextResponse } from "next/server";
import { currentGuide, payoutsDashboard, payoutsLink } from "@/lib/guides";
import { isLocale } from "@/i18n/core";

export const runtime = "nodejs";

/** Abre o registo Stripe do guia (identidade + IBAN) ou o painel de pagamentos se já estiver pronto. */
export async function POST(req: Request) {
  const g = await currentGuide();
  if (!g) return NextResponse.json({ error: "auth" }, { status: 401 });
  const l = new URL(req.url).searchParams.get("locale") ?? "pt";
  try {
    const url = g.payoutsReady ? (await payoutsDashboard(g)) ?? (await payoutsLink(g, isLocale(l) ? l : "pt")) : await payoutsLink(g, isLocale(l) ? l : "pt");
    return NextResponse.json({ url });
  } catch (e) {
    console.error("payouts", e);
    return NextResponse.json({ error: "stripe" }, { status: 502 });
  }
}
