import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { loadCities } from "@/lib/content";
import { planRoute } from "@/lib/route-cost";
import type { Locale } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

/** Lista de cidades para editar conteúdos e tarifas. */
export default async function ContentList({ params }: { params: { locale: Locale } }) {
  if (!(await isAdmin())) return <main className="app"><p style={{ paddingTop: 40 }}>Sem acesso. <Link href={`/${params.locale}/admin`}>Entrar</Link></p></main>;
  const cities = await loadCities({ includeInactive: true });
  return (
    <main className="app wide">
      <div className="stack" style={{ paddingTop: 20 }}>
        <div className="top-row"><h1>Cidades e paragens</h1><Link className="mini" href={`/${params.locale}/admin`}>← Painel</Link></div>
        <p className="hint">As alterações ficam guardadas na base de dados e aparecem logo na app. &quot;Origem&quot; = conteúdo que veio com o código.</p>
        <div className="table-wrap card"><table className="data">
          <thead><tr><th>Cidade</th><th>Paragens</th><th>Bilhete</th><th>Custo mín. do dia</th><th>Estado</th><th></th></tr></thead>
          <tbody>{cities.map((c) => {
            const p = planRoute(c, false);
            return (
              <tr key={c.id}>
                <td><b>{c.n.pt}</b> <span className="hint">({c.id})</span></td>
                <td className="num">{c.stops.length}</td>
                <td className="num">{c.single.toFixed(2)} {c.cur}</td>
                <td className="num">{p.transport.toFixed(2)} {c.cur}</td>
                <td>{c.active === false ? <span className="pill cancelled">oculta</span> : c.edited ? <span className="pill active">editada</span> : <span className="pill">origem</span>}</td>
                <td><Link className="mini" href={`/${params.locale}/admin/content/${c.id}`}>Editar</Link></td>
              </tr>
            );
          })}</tbody>
        </table></div>
        <Link className="btn ghost" href={`/${params.locale}/admin/content/new`}>+ Nova cidade</Link>
      </div>
    </main>
  );
}
