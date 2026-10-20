"use client";
/** "O que viver": momentos curados, mapa de diversão (OpenStreetMap), eventos e diário, ordenados pelos interesses do viajante. */
import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LMap, LayerGroup } from "leaflet";
import { fmt, INTL_LOCALE, type Dict, type Locale } from "@/i18n/dictionaries";
import { CAT_HOBBIES, CAT_ICON, HOBBIES, HOBBY_ICON, distM, rankCats, type Hobby, type Place, type PlaceCat } from "@/lib/explore";
import { EVENT_HOBBY, type CityEvent } from "@/lib/events";
import { WHEN_ICON, type When } from "@/data/moments";
import { saveMemory } from "@/lib/diary";

export type CustomView = { icon: string; title: string; text: string; community: boolean };
export type MomentView = { id: string; icon: string; when: When; h: Hobby[]; lat: number; lng: number; title: string; text: string };
type Pos = { lat: number; lng: number };
const TILES = process.env.NEXT_PUBLIC_MAP_TILES || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const KEY = "sgct:hobbies";

function loadHobbies(): Hobby[] { try { const v = JSON.parse(localStorage.getItem(KEY) ?? "[]"); return Array.isArray(v) ? v.filter((h) => (HOBBIES as readonly string[]).includes(h)) : []; } catch { return []; } }
const score = (h: Hobby[], mine: Hobby[]) => h.filter((x) => mine.includes(x)).length;
/** Popularidade (Google): um lugar 4,7 com milhares de avaliações "aproxima-se" até 3 km. */
const pop = (p: Place) => (p.rating ? Math.max(0, p.rating - 4) * 4000 * Math.min(1, (p.reviews ?? 0) / 800) : 0);
const tiktok = (q: string) => `https://www.tiktok.com/search?q=${encodeURIComponent(q)}`;
const walkLink = (to: Pos) => `https://www.google.com/maps/dir/?api=1&destination=${to.lat},${to.lng}&travelmode=walking`;
const goLink = (to: Pos) => `https://www.google.com/maps/dir/?api=1&destination=${to.lat},${to.lng}&travelmode=transit`;

/** Hora atual na cidade → que momentos são "agora". */
function nowWhen(tz?: string): When[] {
  try {
    const p = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "numeric", hourCycle: "h23", weekday: "short" }).formatToParts(new Date());
    const h = Number(p.find((x) => x.type === "hour")?.value), wd = p.find((x) => x.type === "weekday")?.value ?? "";
    const out: When[] = [];
    if (h >= 6 && h < 12) out.push("morning");
    if (h >= 17 && h < 21) out.push("sunset");
    if (h >= 20 || h < 3) out.push("night");
    if (wd === "Sat" || wd === "Sun") out.push("weekend");
    return out;
  } catch { return []; }
}

async function shrink(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
    const k = Math.min(1, 1080 / Math.max(img.width, img.height));
    const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.8);
  } finally { URL.revokeObjectURL(url); }
}

export function Explore({ cityId, cityName, locale, t, moments, agenda, center, tz, gmapsKey, customs = [], bare = false }: {
  cityId: string; cityName: string; locale: Locale; t: Dict; moments: MomentView[]; agenda?: string; center: Pos; tz?: string; gmapsKey?: string; customs?: CustomView[]; bare?: boolean;
}) {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [picking, setPicking] = useState(false);
  const [tab, setTab] = useState<"moments" | "places" | "events" | "customs">("moments");
  const [data, setData] = useState<{ places: Place[] | null; events: CityEvent[] | null; eventsEnabled: boolean; source?: "google" | "osm" } | null>(null);
  const [sv, setSv] = useState<Place | null>(null);
  const [failed, setFailed] = useState(false);
  const [cat, setCat] = useState<PlaceCat | "all">("all");
  const [pos, setPos] = useState<Pos | null>(null);
  const [save, setSave] = useState<{ title: string; lat: number; lng: number } | null>(null);
  const [toast, setToast] = useState("");
  const now = useMemo(() => nowWhen(tz), [tz]);

  useEffect(() => { const h = loadHobbies(); setHobbies(h); if (!h.length) setPicking(true); }, []);
  // Carrega lugares e eventos só quando o viajante abre esses separadores.
  useEffect(() => {
    if (tab === "moments" || data || failed) return;
    fetch(`/api/explore?city=${cityId}&locale=${locale}`).then((r) => (r.ok ? r.json() : Promise.reject())).then(setData).catch(() => setFailed(true));
  }, [tab, data, failed, cityId, locale]);
  useEffect(() => {
    if (tab !== "places" || pos || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }), () => {}, { maximumAge: 300_000, timeout: 8000 });
  }, [tab, pos]);

  function toggle(h: Hobby) {
    const next = hobbies.includes(h) ? hobbies.filter((x) => x !== h) : [...hobbies, h];
    setHobbies(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignorar */ }
  }

  const ms = useMemo(() => [...moments].sort((a, b) => (score(b.h, hobbies) + (now.includes(b.when) ? 2 : 0)) - (score(a.h, hobbies) + (now.includes(a.when) ? 2 : 0))), [moments, hobbies, now]);
  const cats = useMemo(() => rankCats(hobbies).filter((c) => data?.places?.some((p) => p.cat === c)), [hobbies, data]);
  const from = pos && distM(pos, center) < 40000 ? pos : center;
  const places = useMemo(() => (data?.places ?? []).filter((p) => cat === "all" || p.cat === cat)
    .map((p) => ({ ...p, d: distM(from, p) }))
    .sort((a, b) => (cat === "all" ? (score(CAT_HOBBIES[b.cat], hobbies) - score(CAT_HOBBIES[a.cat], hobbies)) * 3000 : 0) + (a.d - pop(a)) - (b.d - pop(b)))
    .slice(0, 60), [data, cat, from, hobbies]);
  const events = useMemo(() => (data?.events ?? []).slice().sort((a, b) => a.start.localeCompare(b.start)), [data]);
  const dayFmt = useMemo(() => new Intl.DateTimeFormat(INTL_LOCALE[locale], { weekday: "long", day: "numeric", month: "long" }), [locale]);
  const money = (n: number, c: string) => { try { return new Intl.NumberFormat(INTL_LOCALE[locale], { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n); } catch { return `${n} ${c}`; } };
  const dist = (m: number) => (m < 1800 ? fmt(t.exWalk, { m: Math.max(1, Math.round(m / 80)) }) : fmt(t.exKm, { km: (m / 1000).toFixed(m < 10000 ? 1 : 0) }));

  return (
    <section className="sec ex" id="explore">
      {!bare && <div className="sec-h reveal"><div><h2>{fmt(t.exTitle, { city: cityName })}</h2><p>{t.exSub}</p></div></div>}

      <div className={`card ex-hob ${picking ? "open" : ""}`}>
        <div className="row-between">
          <b>{hobbies.length && !picking ? `${t.exForYou}: ${hobbies.map((h) => HOBBY_ICON[h]).join(" ")}` : t.exHobbies}</b>
          <button className="link-btn" onClick={() => setPicking(!picking)}>{picking ? t.exDone : t.exEdit}</button>
        </div>
        {picking && <>
          <p className="hint" style={{ margin: 0 }}>{t.exHobbiesHint}</p>
          <div className="ex-chips">{HOBBIES.map((h) => (
            <button key={h} className={hobbies.includes(h) ? "on" : ""} aria-pressed={hobbies.includes(h)} onClick={() => toggle(h)}>{HOBBY_ICON[h]} {t.hob[h]}</button>
          ))}</div>
        </>}
      </div>

      <div className="ex-tabs" role="tablist">
        {(["moments", "places", "events", ...(customs.length ? ["customs" as const] : [])] as const).map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
            {k === "moments" ? `✨ ${t.exTabMoments}` : k === "places" ? `🎡 ${t.exTabPlaces}` : k === "events" ? `🎟 ${t.exTabEvents}` : `🤝 ${t.exTabCustoms}`}
          </button>
        ))}
      </div>

      {tab === "moments" && (
        <div className="ex-moments">
          {ms.map((m) => (
            <article key={m.id} className="card ex-m">
              <div className="ex-m-top"><span className="ex-ic" aria-hidden="true">{m.icon}</span>
                <span className="ex-when">{WHEN_ICON[m.when]} {t.when[m.when]}{now.includes(m.when) && <b className="ex-now">● {t.exNow}</b>}</span></div>
              <b className="ex-m-t">{m.title}</b>
              <p className="hint" style={{ margin: 0 }}>{m.text}</p>
              <div className="ex-tags">{m.h.map((h) => <span key={h} className={hobbies.includes(h) ? "on" : ""}>{HOBBY_ICON[h]} {t.hob[h]}</span>)}</div>
              <div className="ex-acts">
                <a href={goLink(m)} target="_blank" rel="noreferrer">🧭 {t.exGo}</a>
                <a href={tiktok(`${m.title} ${cityName}`)} target="_blank" rel="noreferrer">♪ {t.exTiktok}</a>
                <button onClick={() => setSave({ title: m.title, lat: m.lat, lng: m.lng })}>💾 {t.exSave}</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === "places" && (
        <div className="stack" style={{ gap: 12 }}>
          {!data && !failed && <p className="hint">{t.exLoading}</p>}
          {(failed || (data && !data.places)) && <p className="hint">{t.exNoPlaces}</p>}
          {data?.places && <>
            <div className="ex-chips scroll">
              <button className={cat === "all" ? "on" : ""} onClick={() => setCat("all")}>{t.exAll}</button>
              {cats.map((c) => <button key={c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{CAT_ICON[c]} {t.cat[c]}</button>)}
            </div>
            {gmapsKey && data.source === "google" ? <GoogleMap apiKey={gmapsKey} places={places} pos={pos} center={center} /> : <ExploreMap places={places} pos={pos} center={center} />}
            <div className="ex-list">
              {places.map((p) => (
                <div key={p.id} className="ex-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.photo ? <img className="ex-ph" src={`/api/explore/photo?n=${encodeURIComponent(p.photo)}`} alt="" loading="lazy" /> : <span className="ex-ic sm" aria-hidden="true">{CAT_ICON[p.cat]}</span>}
                  <div className="stack" style={{ gap: 2, minWidth: 0, flex: 1 }}>
                    <b className="ad-ellip">{p.name}</b>
                    <span className="hint">
                      {p.rating ? <b className="ex-star">★ {p.rating.toFixed(1)}</b> : null}{p.rating ? ` (${(p.reviews ?? 0).toLocaleString(INTL_LOCALE[locale])}) · ` : ""}
                      {CAT_ICON[p.cat]} {t.cat[p.cat]} · {dist(p.d)}{p.fee === false ? ` · ${t.exFreeEntry}` : ""}
                      {p.openNow === true && <b className="ex-open"> · {t.exOpen}</b>}{p.openNow === false && <span> · {t.exClosed}</span>}
                    </span>
                    <span className="ex-acts sm">
                      <a href={p.gmaps ?? (p.d < 1800 ? walkLink(p) : goLink(p))} target="_blank" rel="noreferrer">🧭 {t.exGo}</a>
                      {gmapsKey && data.source === "google" && <button onClick={() => setSv(p)}>👁 Street View</button>}
                      {p.web && <a href={p.web} target="_blank" rel="noreferrer">{t.exWeb}</a>}
                      <a href={tiktok(`${p.name} ${cityName}`)} target="_blank" rel="noreferrer">♪ TikTok</a>
                      <button onClick={() => setSave({ title: p.name, lat: p.lat, lng: p.lng })}>💾</button>
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="hint" style={{ fontSize: 12 }}>{data.source === "google" ? "Google Maps" : "© OpenStreetMap"}</p>
          </>}
        </div>
      )}

      {tab === "events" && (
        <div className="stack" style={{ gap: 10 }}>
          {!data && !failed && <p className="hint">{t.exLoading}</p>}
          {data?.eventsEnabled && events.length === 0 && <p className="hint">{t.exEventsNone}</p>}
          {events.length > 0 && groupByDay(events).map(([day, list]) => (
            <div key={day} className="stack" style={{ gap: 8 }}>
              <b className="ex-day">{dayFmt.format(new Date(`${day}T12:00:00`))}</b>
              {list.map((e) => (
                <a key={e.id} href={e.url} target="_blank" rel="noreferrer" className={`card ex-ev ${score(EVENT_HOBBY[e.kind], hobbies) ? "fit" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {e.image ? <img src={e.image} alt="" loading="lazy" /> : <span className="ex-ev-ph" aria-hidden="true">🎟</span>}
                  <span className="stack" style={{ gap: 2, minWidth: 0 }}>
                    <span className="label" style={{ color: "var(--cobalt)" }}>{t.evKind[e.kind]}{e.localTime ? ` · ${e.localTime}` : ""}</span>
                    <b className="ex-ev-t">{e.name}</b>
                    <span className="hint ad-ellip">{e.venue ?? ""}{e.priceMin && e.currency ? ` · ${fmt(t.exFrom, { p: money(e.priceMin, e.currency) })}` : ""}</span>
                  </span>
                </a>
              ))}
            </div>
          ))}
          {agenda && <div className="card ex-agenda"><span className="hint">{data?.eventsEnabled ? "" : t.exEventsSoon}</span><a className="btn ghost press" href={agenda} target="_blank" rel="noreferrer">📅 {t.exAgenda}</a></div>}
          <p className="hint" style={{ fontSize: 12 }}>{data?.eventsEnabled ? "Ticketmaster" : ""}</p>
        </div>
      )}

      {sv && gmapsKey && <StreetView apiKey={gmapsKey} place={sv} t={t} onClose={() => setSv(null)} />}
      {tab === "customs" && (
        <div className="stack" style={{ gap: 14 }}>
          {[true, false].map((comm) => customs.some((x) => x.community === comm) && (
            <div key={String(comm)} className="stack" style={{ gap: 8 }}>
              <b className="ex-day">{comm ? fmt(t.exCommunities, { city: cityName }) : t.exCustoms}</b>
              <div className="ex-moments">{customs.filter((x) => x.community === comm).map((x) => (
                <article key={x.title} className="card ex-m"><div className="ex-m-top"><span className="ex-ic" aria-hidden="true">{x.icon}</span></div><b className="ex-m-t">{x.title}</b><p className="hint" style={{ margin: 0 }}>{x.text}</p></article>
              ))}</div>
            </div>
          ))}
        </div>
      )}

      {save && <SaveMemory t={t} cityId={cityId} cityName={cityName} item={save} onClose={(ok) => { setSave(null); if (ok) { setToast(t.exSaved); setTimeout(() => setToast(""), 2500); } }} />}
      {toast && <div className="ex-toast" role="status">{toast} <a href={`/${locale}/diary`}>{t.diary} →</a></div>}
    </section>
  );
}

function groupByDay(list: CityEvent[]): [string, CityEvent[]][] {
  const m = new Map<string, CityEvent[]>();
  for (const e of list) m.set(e.localDate, [...(m.get(e.localDate) ?? []), e]);
  return [...m.entries()].slice(0, 10);
}

function SaveMemory({ t, cityId, cityName, item, onClose }: { t: Dict; cityId: string; cityName: string; item: { title: string; lat: number; lng: number }; onClose: (ok: boolean) => void }) {
  const [note, setNote] = useState(""); const [photo, setPhoto] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  return (
    <div className="ex-modal" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(false); }}>
      <div className="card stack ex-sheet">
        <b style={{ fontSize: 18 }}>💾 {item.title}</b>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {photo && <img src={photo} alt="" style={{ width: "100%", borderRadius: 14, maxHeight: 260, objectFit: "cover" }} />}
        <label className="btn ghost press" style={{ cursor: "pointer" }}>📷 {t.exPhoto}
          <input type="file" accept="image/*" capture="environment" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPhoto(await shrink(f)); }} />
        </label>
        <div className="field"><textarea rows={3} maxLength={500} placeholder={t.exNote} value={note} onChange={(e) => setNote(e.target.value)} /></div>
        <div className="grid2">
          <button className="btn ghost press" onClick={() => onClose(false)}>{t.exCancel}</button>
          <button className="btn press" disabled={busy} onClick={async () => {
            setBusy(true);
            try { await saveMemory({ city: cityId, cityName, title: item.title, note: note.trim(), photo, lat: item.lat, lng: item.lng }); onClose(true); } catch { setBusy(false); }
          }}>{t.exSaveBtn}</button>
        </div>
      </div>
    </div>
  );
}

function ExploreMap({ places, pos, center }: { places: (Place & { d: number })[]; pos: Pos | null; center: Pos }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  useEffect(() => {
    let off = false;
    void import("leaflet").then((L) => {
      if (off || !el.current || map.current) return;
      const m = L.map(el.current, { zoomControl: true }).setView([center.lat, center.lng], 13);
      L.tileLayer(TILES, { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(m);
      layer.current = L.layerGroup().addTo(m); map.current = m; draw(L);
    });
    return () => { off = true; map.current?.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { void import("leaflet").then((L) => draw(L)); });
  function draw(L: typeof import("leaflet")) {
    const m = map.current, g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    const icon = (html: string) => L.divIcon({ html, className: "mk ex-mk", iconSize: [30, 30], iconAnchor: [15, 15] });
    places.forEach((p) => L.marker([p.lat, p.lng], { icon: icon(CAT_ICON[p.cat]) }).bindPopup(`<b>${p.name.replace(/[<>&]/g, "")}</b>`).addTo(g));
    if (pos) L.circleMarker([pos.lat, pos.lng], { radius: 8, color: "#fff", weight: 3, fillColor: "#2b7cff", fillOpacity: 1 }).addTo(g);
    const pts = places.slice(0, 25).map((p) => [p.lat, p.lng] as [number, number]);
    if (pts.length) m.fitBounds(L.latLngBounds(pts).pad(0.1), { maxZoom: 15 });
  }
  return <div ref={el} className="leaflet-box ex-map" role="region" aria-label="Map" />;
}


/* ---------- Google Maps (mapa e Street View) ---------- */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type G = any;
let gLoad: Promise<G> | null = null;
function loadGoogle(key: string): Promise<G> {
  const w = window as unknown as { google?: G; __sgctG?: () => void };
  if (w.google?.maps?.Map) return Promise.resolve(w.google);
  if (!gLoad) gLoad = new Promise((ok, bad) => {
    w.__sgctG = () => ok(w.google);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=__sgctG`;
    s.async = true; s.onerror = () => { gLoad = null; bad(new Error("maps")); };
    document.head.appendChild(s);
  });
  return gLoad;
}

function GoogleMap({ apiKey, places, pos, center }: { apiKey: string; places: (Place & { d: number })[]; pos: Pos | null; center: Pos }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<G>(null);
  const marks = useRef<G[]>([]);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let off = false;
    loadGoogle(apiKey).then((g) => {
      if (off || !el.current) return;
      map.current = new g.maps.Map(el.current, { center: { lat: center.lat, lng: center.lng }, zoom: 13, mapTypeControl: false, streetViewControl: true, fullscreenControl: true, clickableIcons: true, gestureHandling: "cooperative" });
      draw(g);
    }).catch(() => setErr(true));
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { const g = (window as unknown as { google?: G }).google; if (g?.maps && map.current) draw(g); });
  function draw(g: G) {
    marks.current.forEach((m) => m.setMap(null)); marks.current = [];
    const info = new g.maps.InfoWindow();
    const b = new g.maps.LatLngBounds();
    places.forEach((p, i) => {
      const m = new g.maps.Marker({ map: map.current, position: { lat: p.lat, lng: p.lng }, title: p.name, label: { text: CAT_ICON[p.cat], fontSize: "16px" },
        icon: { path: g.maps.SymbolPath.CIRCLE, scale: 15, fillColor: "#ffffff", fillOpacity: 1, strokeColor: "#0071e3", strokeWeight: 2 } });
      m.addListener("click", () => { info.setContent(`<b>${p.name.replace(/[<>&]/g, "")}</b>${p.rating ? `<br>★ ${p.rating.toFixed(1)}` : ""}`); info.open({ map: map.current, anchor: m }); });
      marks.current.push(m);
      if (i < 25) b.extend({ lat: p.lat, lng: p.lng });
    });
    if (pos) marks.current.push(new g.maps.Marker({ map: map.current, position: pos, icon: { path: g.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#2b7cff", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3 } }));
    if (places.length) { map.current.fitBounds(b, 40); if (places.length === 1) map.current.setZoom(16); }
  }
  if (err) return <ExploreMap places={places} pos={pos} center={center} />;
  return <div ref={el} className="ex-map" role="region" aria-label="Google Maps" />;
}

function StreetView({ apiKey, place, t, onClose }: { apiKey: string; place: Place; t: Dict; onClose: () => void }) {
  const el = useRef<HTMLDivElement>(null);
  const [none, setNone] = useState(false);
  useEffect(() => {
    loadGoogle(apiKey).then((g) => {
      new g.maps.StreetViewService().getPanorama({ location: { lat: place.lat, lng: place.lng }, radius: 150, source: g.maps.StreetViewSource.OUTDOOR }, (data: G, status: string) => {
        if (status !== "OK" || !el.current) { setNone(true); return; }
        new g.maps.StreetViewPanorama(el.current, { pano: data.location.pano, pov: { heading: 0, pitch: 0 }, zoom: 0, addressControl: false, fullscreenControl: true, motionTracking: true });
      });
    }).catch(() => setNone(true));
  }, [apiKey, place]);
  return (
    <div className="ex-modal sv" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card ex-sv">
        <div className="row-between" style={{ padding: "12px 14px" }}><b className="ad-ellip">👁 {place.name}</b><button className="link-btn" onClick={onClose}>✕</button></div>
        {none ? <p className="hint" style={{ padding: 16 }}>{t.exNoSv}</p> : <div ref={el} className="ex-sv-pano" />}
      </div>
    </div>
  );
}
