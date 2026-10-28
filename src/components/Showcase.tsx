"use client";
import { useDict } from "@/i18n/client-dict";
/** Peças visuais da página inicial e da página da cidade. */
import { useEffect, useMemo, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { Credit, Img, Lightbox, PhotoGrid, Slides, useCityMedia, useNear, type Photo } from "./Media";

// Capas das cidades: os pedidos feitos no mesmo instante juntam-se num só (?covers=a,b,c) em vez de um por cidade.
const memo = new Map<string, Promise<Photo[]>>();
let queue: { id: string; ok: (p: Photo[]) => void }[] = [];
function flush() {
  const batch = queue; queue = [];
  for (let i = 0; i < batch.length; i += 24) {
    const part = batch.slice(i, i + 24);
    void fetch(`/api/media?covers=${part.map((x) => x.id).join(",")}`).then((r) => (r.ok ? r.json() : null)).catch(() => null)
      .then((j: { covers?: Record<string, Photo[]> } | null) => { for (const x of part) x.ok(j?.covers?.[x.id] ?? []); });
  }
}
function covers(id: string): Promise<Photo[]> {
  if (!memo.has(id)) memo.set(id, new Promise<Photo[]>((ok) => { if (!queue.length) setTimeout(flush, 30); queue.push({ id, ok }); }));
  return memo.get(id)!;
}

/** Herói da página inicial: uma fotografia de cada cidade em destaque, em fundido lento. */
export function HomeHero({ cities, children }: { cities: string[]; children: React.ReactNode }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  useEffect(() => {
    let live = true;
    void Promise.all(cities.map((c) => covers(c))).then((all) => { if (live) setPhotos(all.map((l) => l[0]).filter(Boolean)); });
    return () => { live = false; };
  }, [cities]);
  return <section className="hero-x"><Slides photos={photos} />{children}</section>;
}

export type DestCity = { id: string; name: string; country: string; stops: number; free?: string; region?: "europe" | "americas" | "africa" | "asia"; keys?: string };
type DestLabels = { stops: string; search: string; all: string; none: string; showAll: string; regions: Record<"europe" | "americas" | "africa" | "asia", string> };

function DestCard({ c, href, from, labels, i }: { c: DestCity; href: string; from: string; labels: { stops: string }; i: number }) {
  const [ref, near] = useNear<HTMLAnchorElement>("400px");
  const [p, setP] = useState<Photo | null>(null);
  useEffect(() => { if (near) void covers(c.id).then((l) => setP(l[0] ?? null)); }, [near, c.id]);
  return (
    <a ref={ref} href={href} className="dcard reveal" style={{ animationDelay: `${(i % 4) * 60}ms` }}
      onClick={() => { try { localStorage.setItem("sgct:city", c.id); } catch { /* ignorar */ } }}>
      {p ? <Img src={p.thumb.replace("/500px-", "/960px-")} alt="" /> : <span className="skel" style={{ position: "absolute", inset: 0, opacity: .25 }} />}
      <span className="tagc">{c.country}</span>
      <span className="txt"><b>{c.name}</b><small className="num">{c.stops} {labels.stops}</small><span className={`from num${c.free ? "" : " web-only"}`}>{c.free ? `🎁 ${c.free}` : from}</span></span>
    </a>
  );
}

/** Sem acentos e em minúsculas, para "sao paulo" encontrar "São Paulo" e "zurich" encontrar "Zürich". */
const fold = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const REGIONS = ["europe", "americas", "africa", "asia"] as const;
const FIRST = 8;

/** Destinos: pesquisa por nome (em qualquer idioma) ou país, filtro por região e só 8 cartões até pedir "ver todas". */
export function DestGrid({ locale, cities, from, labels }: { locale: string; cities: DestCity[]; from: string; labels: DestLabels }) {
  const [q, setQ] = useState("");
  const [reg, setReg] = useState<(typeof REGIONS)[number] | "">("");
  const [more, setMore] = useState(false);
  const shown = useMemo(() => {
    const words = fold(q.trim()).split(/\s+/).filter(Boolean);
    return cities.filter((c) => (!reg || c.region === reg) && words.every((w) => fold(`${c.name} ${c.country} ${c.keys ?? ""}`).includes(w)));
  }, [cities, q, reg]);
  const filtering = Boolean(q.trim() || reg);
  const list = filtering || more ? shown : shown.slice(0, FIRST);
  const count = (r: string) => cities.filter((c) => c.region === r).length;
  return (
    <>
      <div className="dest-tools">
        <label className="dest-search">
          <span aria-hidden="true">⌕</span>
          <input type="search" inputMode="search" enterKeyHint="search" placeholder={labels.search} aria-label={labels.search} value={q} onChange={(e) => setQ(e.target.value)} />
          {q && <button type="button" aria-label="×" onClick={() => setQ("")}>×</button>}
        </label>
        <div className="dest-chips" role="radiogroup">
          <button type="button" role="radio" aria-checked={!reg} className={`press ${!reg ? "on" : ""}`} onClick={() => setReg("")}>{labels.all} <small>{cities.length}</small></button>
          {REGIONS.filter((r) => count(r)).map((r) => (
            <button key={r} type="button" role="radio" aria-checked={reg === r} className={`press ${reg === r ? "on" : ""}`} onClick={() => setReg(reg === r ? "" : r)}>{labels.regions[r]} <small>{count(r)}</small></button>
          ))}
        </div>
      </div>
      {list.length ? <div className="dest">{list.map((c, i) => <DestCard key={c.id} c={c} i={i} href={`/${locale}/c/${c.id}`} from={from} labels={labels} />)}</div>
        : <p className="hint" style={{ textAlign: "center", padding: "24px 0" }}>{labels.none}</p>}
      {!filtering && !more && shown.length > FIRST && (
        <button type="button" className="btn ghost press dest-more" onClick={() => setMore(true)}>{labels.showAll.replace("{n}", String(cities.length))}</button>
      )}
    </>
  );
}

/* ---------- Página da cidade ---------- */

export type ShowStop = { id: string; name: string; area: string; minutes: number; top: boolean; optional?: boolean };

/** Herói da cidade com as fotografias das paragens mais famosas. */
export function CityHero({ cityId, children }: { cityId: string; children: React.ReactNode }) {
  const m = useCityMedia(cityId);
  return <section className="hero-x city-hero"><Slides photos={m?.cover ?? []} />{children}</section>;
}

/** Galeria (grelha + todas as fotos) e carrossel de destaques com a fotografia de cada paragem. */
export function CityGallery({ cityId, cityName, stops, sub, t: tProp, locale }: { cityId: string; cityName: string; stops: ShowStop[]; sub?: string; t?: Dict; locale: Locale }) {
  const t = useDict(tProp);
  const m = useCityMedia(cityId);
  const [open, setOpen] = useState<{ title: string; photos: Photo[] } | null>(null);
  const all = useMemo(() => stops.map((s) => m?.stops[s.id]).filter((p): p is Photo => Boolean(p)), [m, stops]);
  async function openStop(s: ShowStop) {
    const r = await fetch(`/api/media?city=${cityId}&stop=${s.id}&locale=${locale}`).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    const photos: Photo[] = r?.photos?.length ? r.photos : m?.stops[s.id] ? [m.stops[s.id]!] : [];
    if (photos.length) setOpen({ title: s.name, photos });
  }
  return (
    <>
      <section className="sec reveal">
        <div className="sec-h"><div><h2>{t.highlights}</h2>{sub && <p>{sub}</p>}</div></div>
        <div className="rail">
          {stops.map((s) => (
            <button key={s.id} className="scard press" onClick={() => void openStop(s)}>
              <span className="ph">{m ? <><Img src={m.stops[s.id]?.thumb} alt="" /><Credit p={m.stops[s.id]} /></> : <span className="skel" style={{ position: "absolute", inset: 0 }} />}
                {s.top && !s.optional && <span className="cnt" style={{ left: 10, right: "auto", background: "linear-gradient(135deg,#ffb340,#ff7a1a)", color: "#1a0d00" }}>Top</span>}
                {s.optional && <span className="cnt" style={{ left: 10, right: "auto" }}>+ {t.tpOptional}</span>}</span>
              <span className="tx"><b>{s.name}</b>{s.minutes > 0 && <small className="num">{s.area} · {s.minutes} min</small>}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="sec reveal">
        <div className="sec-h"><h2>{t.photos}</h2>{all.length > 0 && <button onClick={() => setOpen({ title: cityName, photos: all })}><span className="num">{all.length}</span> {t.photos.toLowerCase()} ›</button>}</div>
        <PhotoGrid title={cityName} photos={all} t={t} />
        <p className="hint">{t.photoSrc}</p>
      </section>
      {open && <Lightbox title={open.title} photos={open.photos} onClose={() => setOpen(null)} t={t} />}
    </>
  );
}

/** Barra fixa em baixo com o preço, que aparece depois do herói e leva ao formulário. */
export function StickyBook({ label, price, cta }: { label: string; price: string; cta: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const f = () => {
      const book = document.getElementById("book");
      const r = book?.getBoundingClientRect();
      setOn(window.scrollY > window.innerHeight * 0.6 && !(r && r.top < window.innerHeight * 0.8 && r.bottom > 0));
    };
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <div className={`sticky-cta${on ? " on" : ""}`} aria-hidden={!on}>
      <div><small>{label}</small><b className="num">{price}</b></div>
      <a className="btn tram press" href="#book" tabIndex={on ? 0 : -1}>{cta}</a>
    </div>
  );
}
