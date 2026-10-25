/**
 * Detalhes do roteiro (como a página de uma experiência): destaques, inclui / não inclui, o que levar e ponto de partida.
 * Componente de servidor: só texto e ligações, nada de JavaScript no navegador.
 */
import { Check, Clock, Footprints, Headphones, MapPin, CloudOff, CreditCard, Gift, X } from "lucide-react";
import type { Dict } from "@/i18n/dictionaries";
import { fmt } from "@/i18n/core";

export function RouteDetails({ t, meta, accessN, free, start }: { t: Dict; meta: string; accessN: number; free: boolean; start: { name: string; lat: number; lng: number } | null }) {
  const rows: { icon: typeof Clock; text: string }[] = [
    { icon: Clock, text: meta },
    { icon: Headphones, text: t.rd.audio },
    { icon: CloudOff, text: t.rd.offline },
    { icon: Footprints, text: accessN ? fmt(t.rd.access, { n: accessN }) : t.rd.accessOk },
    ...(free ? [] : [{ icon: CreditCard, text: t.rd.once }, { icon: Gift, text: t.rd.try }])
  ];
  return (
    <section className="sec rd" id="details">
      <div className="sec-h"><div><h2>{t.rd.title}</h2></div></div>
      <ul className="rd-hl card">
        {rows.map(({ icon: I, text }) => <li key={text}><span className="rd-ic"><I size={20} aria-hidden="true" /></span><span>{text}</span></li>)}
      </ul>
      <div className="rd-grid">
        <div className="card rd-box">
          <h3>{t.rd.incT}</h3>
          <ul>{t.rd.inc.map((x) => <li key={x}><Check size={18} className="rd-yes" aria-hidden="true" />{x}</li>)}</ul>
          <h3>{t.rd.excT}</h3>
          <ul>{t.rd.exc.map((x) => <li key={x}><X size={18} className="rd-no" aria-hidden="true" />{x}</li>)}</ul>
        </div>
        <div className="card rd-box">
          <h3>{t.rd.bringT}</h3>
          <ul className="rd-dots">{t.rd.bring.map((x) => <li key={x}>{x}</li>)}</ul>
          {start && <>
            <h3>{t.rd.start}</h3>
            <p className="rd-start"><MapPin size={18} aria-hidden="true" /><span><b>{start.name}</b><br /><a href={`https://www.google.com/maps/search/?api=1&query=${start.lat},${start.lng}`} target="_blank" rel="noopener noreferrer">{t.rd.map} ↗</a></span></p>
          </>}
        </div>
      </div>
    </section>
  );
}
