import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { loadCities } from "@/lib/content";
import { CityEditor } from "@/components/CityEditor";
import type { City } from "@/data/cities";
import type { Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

const BLANK: City = {
  id: "", n: { pt: "", en: "", es: "", fr: "", de: "" }, cur: "EUR", single: 2, card: 0, cardName: "", alt: null,
  air: { m: "metro", min: 30, line: "", r: 1 }, ret: { core: { m: "metro", min: 30, line: "", r: 1 }, extra: { m: "metro", min: 40, line: "", r: 1 } },
  stops: []
};

export default async function EditCity({ params }: { params: { locale: Locale; city: string } }) {
  if (!(await isAdmin())) return <main className="app"><p style={{ paddingTop: 40 }}>Sem acesso. <Link href={`/${params.locale}/admin`}>Entrar</Link></p></main>;
  const cities = await loadCities({ includeInactive: true });
  const isNew = params.city === "new";
  const found = cities.find((c) => c.id === params.city);
  if (!isNew && !found) notFound();
  const { edited, active, ...city } = found ?? { ...BLANK, edited: false, active: true };
  return (
    <main className="app wide">
      <div className="stack" style={{ paddingTop: 20 }}>
        <div className="top-row"><h1>{isNew ? "Nova cidade" : `Editar ${city.n.pt}`}</h1><Link className="mini" href={`/${params.locale}/admin/content`}>← Cidades</Link></div>
        <CityEditor initial={city} isNew={isNew} edited={Boolean(edited)} active={active !== false} locale={params.locale} />
      </div>
    </main>
  );
}
