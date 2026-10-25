import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { AgentPortal } from "@/components/AgentPortal";
import { requestCurrency } from "@/lib/fx";
import { agentSummary, currentAgent } from "@/lib/agents";
import { loadCities } from "@/lib/content";
import { cityName } from "@/data/cities";
import { env } from "@/lib/env";
import type { Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function Portal(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params;
  const agent = await currentAgent();
  if (!agent) redirect(`/${params.locale}/agents`);
  const s = await agentSummary(agent.id);
  const cities = (await loadCities()).map((c) => ({ id: c.id, name: cityName(c, params.locale) }));
  return (
    <main className="app">
      <Header locale={params.locale} currency={(await requestCurrency())} />
      <AgentPortal locale={params.locale} cities={cities}
        agent={{ name: agent.name, code: agent.code, status: agent.status }}
        link={`${env.appUrl}/${params.locale}/merchants?agent=${agent.code}`}
        leads={s.leads.map((l) => ({ id: l.id, name: l.name, kind: l.kind, city: l.city, contact: l.contact, email: l.email, phone: l.phone, status: l.status, notes: l.notes }))}
        clients={s.clients.map((c) => ({ id: c.id, name: c.name, plan: c.plan, status: c.status, city: c.city }))}
        comm={s.comm.map((c) => ({ id: c.id, description: c.description, amountCents: c.amountCents, paidAt: c.paidAt?.toISOString() ?? null, createdAt: c.createdAt.toISOString() }))}
        due={s.due} paid={s.paid} />
    </main>
  );
}
