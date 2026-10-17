"use client";
/** Peças visuais da página inicial e da página da cidade. */
import { useEffect, useMemo, useState } from "react";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { Img, Lightbox, PhotoGrid, Slides, useCityMedia, useNear, type Photo } from "./Media";

const memo = new Map<string, Promise<Photo[]>>();
function covers(id: string): Promise<Photo[]> {
  if (!memo.has(id)) memo.set(id, fetch(`/api/media?city=${id}&cover=1`).then((r) => (r.ok ? r.json() : null)).then((j) => (j?.cover ?? []) as Photo[]).catch(() => []));
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

export type DestCity = { id: string; name: string; country: string; stops: number };

function DestCard({ c, href, from, labels, i }: { c: DestCity; href: string; from: string; labels: { stops: string }; i: number }) {
  const [ref, near] = useNear<HTMLAnchorElement>("400px");
  const [p, setP] = useState<Photo | null>(null);
  useEffect(() => { if (near) void covers(c.id).then((l) => setP(l[0] ?? null)); }, [near, c.id]);
  return (
    <a ref={ref} href={href} className="dcard reveal" style={{ animationDelay: `${(i % 4) * 60}ms` }}
      onClick={() => { try { localStorage.setItem("sgct:city", c.id); } catch { /* ignorar */ } }}>
      {p ? <Img src={p.thumb.replace("/500px-", "/960px-")} alt="" /> : <span className="skel" style={{ position: "absolute", inset: 0, opacity: .25 }} />}
      <span className="tagc">{c.country}</span>
      <span className="txt"><b>{c.name}</b><small className="num">{c.stops} {labels.stops}</small><span className="from num">{from}</span></span>
    </a>
  );
}

export function DestGrid({ locale, cities, from, labels }: { locale: string; cities: DestCity[]; from: string; labels: { stops: string } }) {
  return <div className="dest">{cities.map((c, i) => <DestCard key={c.id} c={c} i={i} href={`/${locale}/c/${c.id}`} from={from} labels={labels} />)}</div>;
}

/* ---------- Página da cidade ---------- */

export type ShowStop = { id: string; name: string; area: string; minutes: number; top: boolean };

/** Herói da cidade com as fotografias das paragens mais famosas. */
export function CityHero({ cityId, children }: { cityId: string; children: React.ReactNode }) {
  const m = useCityMedia(cityId);
  return <section className="hero-x city-hero"><Slides photos={m?.cover ?? []} />{children}</section>;
}

/** Galeria (grelha + todas as fotos) e carrossel de destaques com a fotografia de cada paragem. */
export function CityGallery({ cityId, cityName, stops, sub, t, locale }: { cityId: string; cityName: string; stops: ShowStop[]; sub: string; t: Dict; locale: Locale }) {
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
        <div className="sec-h"><div><h2>{t.highlights}</h2><p>{sub}</p></div></div>
        <div className="rail">
          {stops.map((s) => (
            <button key={s.id} className="scard press" onClick={() => void openStop(s)}>
              <span className="ph">{m ? <Img src={m.stops[s.id]?.thumb} alt="" /> : <span className="skel" style={{ position: "absolute", inset: 0 }} />}
                {s.top && <span className="cnt" style={{ left: 10, right: "auto", background: "linear-gradient(135deg,#ffb340,#ff7a1a)", color: "#1a0d00" }}>Top</span>}</span>
              <span className="tx"><b>{s.name}</b><small className="num">{s.area} · {s.minutes} min</small></span>
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
