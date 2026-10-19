import { and, gte, inArray, lt } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const csv = (v: unknown) => { const s = v === null || v === undefined ? "" : String(v); return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const eur = (c: number) => (c / 100).toFixed(2);

/**
 * Relatório anual DAC7 (CSV) por guia: identificação, n.º de atividades e contraprestação por trimestre.
 * Contraprestação = valor pago ao guia, já sem a comissão; a comissão aparece em coluna própria.
 * Nos serviços pessoais não há limiar de isenção: entram todos os guias com reservas pagas.
 * O IBAN não é guardado aqui: tire-o da conta Express de cada guia na Stripe.
 */
export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("forbidden", { status: 403 });
  const y = Number(new URL(req.url).searchParams.get("year")) || new Date().getUTCFullYear();
  const from = new Date(Date.UTC(y, 0, 1)), to = new Date(Date.UTC(y + 1, 0, 1));
  const d = await db();
  const bookings = await d.select().from(schema.guideBookings)
    .where(and(inArray(schema.guideBookings.status, ["confirmed", "completed"]), gte(schema.guideBookings.startAt, from), lt(schema.guideBookings.startAt, to)));
  const ids = [...new Set(bookings.map((b) => b.guideId))];
  const guides = ids.length ? await d.select().from(schema.guides).where(inArray(schema.guides.id, ids)) : [];

  const head = ["guide_id", "nome", "email", "data_nascimento", "nif", "pais_fiscal", "morada", "registo_atividade", "stripe_conta",
    ...[1, 2, 3, 4].flatMap((q) => [`T${q}_atividades`, `T${q}_contraprestacao_eur`, `T${q}_comissao_eur`]), "total_atividades", "total_contraprestacao_eur", "total_comissao_eur", "dados_completos"];
  const rows = guides.map((g) => {
    const mine = bookings.filter((b) => b.guideId === g.id);
    const q = [0, 1, 2, 3].map((i) => mine.filter((b) => Math.floor(b.startAt.getUTCMonth() / 3) === i));
    const sum = (xs: typeof mine, f: (b: (typeof mine)[number]) => number) => xs.reduce((a, b) => a + f(b), 0);
    const complete = Boolean(g.taxId && g.taxCountry && g.address && g.birthDate);
    return [g.id, g.name, g.email, g.birthDate, g.taxId, g.taxCountry, g.address, g.activityRegNo, g.stripeAccountId,
      ...q.flatMap((xs) => [xs.length, eur(sum(xs, (b) => b.amountCents - b.feeCents)), eur(sum(xs, (b) => b.feeCents))]),
      mine.length, eur(sum(mine, (b) => b.amountCents - b.feeCents)), eur(sum(mine, (b) => b.feeCents)), complete ? "sim" : "NAO"];
  });
  const body = "﻿" + [head, ...rows].map((r) => r.map(csv).join(";")).join("\n") + "\n";
  return new Response(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="dac7-guias-${y}.csv"`, "Cache-Control": "no-store" } });
}
