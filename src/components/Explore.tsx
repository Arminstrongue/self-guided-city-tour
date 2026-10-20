"use client";
import { loadWish, saveWish, toggleWish, wishKey, type Wish } from "@/lib/wishlist";
/** "O que viver": momentos curados, mapa de diversão (OpenStreetMap), eventos e diário, ordenados pelos interesses do viajante. */
import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LMap, LayerGroup } from "leaflet";
import { fmt, INTL_LOCALE, type Dict, type Locale } from "@/i18n/dictionaries";
import { CAT_HOBBIES, CAT_ICON, HOBBIES, HOBBY_ICON, distM, rankCats, type Hobby, type Place, type PlaceCat } from "@/lib/explore";
import { EVENT_HOBBY, type CityEvent } from "@/lib/events";
import { WHEN_ICON, type When } from "@/data/moments";
import { saveMemoryAnywhere } from "@/lib/diary";
import { loadGoogle, type G } from "@/lib/gmaps-client";
import { MapView, type Focus } from "./MapView";
import type { Airport, Stop } from "@/data/cities";
import type { Museum } from "@/data/museums";

export type CustomView = { icon: string; title: string; text: string; community: boolean };
export type MomentView = { id: string; icon: string; when: When; h: Hobby[]; lat: number; lng: number; title: string; text: string };
type Pos = { lat: number; lng: number };
const TILES = process.env.NEXT_PUBLIC_MAP_TILES || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const KEY = "sgct:hobbies";

function loadHobbies(): Hobby[] { try { const v = JSON.parse(localStorage.getItem(KEY) ?? "[]"); return Array.isArray(v) ? v.filter((h) => (HOBBIES as readonly string[]).includes(h)) : []; } catch { return []; } }
/** "Ver menos" escolhido em "O seu algoritmo" (carteira): baixa a posição desses interesses. */
let LESS: Hobby[] = [];
try { if (typeof window !== "undefined") LESS = JSON.parse(localStorage.getItem("sgct:less") ?? "[]"); } catch { /* ignorar */ }
const score = (h: Hobby[], mine: Hobby[]) => h.filter((x) => mine.includes(x)).length - h.filter((x) => LESS.includes(x)).length * 1.5;
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

export type RouteForMap = { stops: Stop[]; done: Record<string, boolean>; museums: Museum[]; airport?: Airport; pos: Pos | null };
export function Explore({ cityId, cityName, locale, t, moments, agenda, center, tz, gmapsKey, customs = [], bare = false, route, focusIn }: {
  cityId: string; cityName: string; locale: Locale; t: Dict; moments: MomentView[]; agenda?: string; center: Pos; tz?: string; gmapsKey?: string; customs?: CustomView[]; bare?: boolean;
  route?: RouteForMap; focusIn?: Focus | null;
}) {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [picking, setPicking] = useState(false);
  const [tab, setTab] = useState<"moments" | "places" | "events" | "customs">("moments");
  const [data, setData] = useState<{ places: Place[] | null; events: CityEvent[] | null; eventsEnabled: boolean; source?: "google" | "osm" } | null>(null);
  const [sv, setSv] = useState<Place | null>(null);
  const [focus, setFocus] = useState<Focus | null>(focusIn ?? null);
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (focusIn) { setFocus(focusIn); setTab("moments"); setTimeout(() => mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 60); } }, [focusIn]);
  /** Mostra um lugar no mapa do separador atual (como em Diversão e lugares). */
  const show = (f: { lat: number; lng: number; name: string }) => { setFocus({ ...f, walk: true }); setTimeout(() => mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 30); };
  const [failed, setFailed] = useState(false);
  const [cat, setCat] = useState<PlaceCat | "all">("all");
  const [pos, setPos] = useState<Pos | null>(null);
  const [save, setSave] = useState<{ title: string; lat: number; lng: number } | null>(null);
  const [toPlan, setToPlan] = useState<{ title: string; lat: number; lng: number; icon: string; kind: "moment" | "place" } | null>(null);
  const [toast, setToast] = useState("");
  const [wish, setWish] = useState<Wish[]>([]);
  useEffect(() => { void loadWish().then((r) => setWish(r.list)); }, []);
  const wished = (title: string) => wish.some((x) => wishKey(x) === wishKey({ city: cityId, title }));
  function heart(it: { title: string; lat: number; lng: number; icon: string }) {
    const was = wished(it.title);
    const next = toggleWish(wish, { city: cityId, cityName, ...it });
    setWish(next); void saveWish(next);
    if (!was) { setToast(`❤️ ${t.wlWishAdded}`); setTimeout(() => setToast(""), 2500); }
  }
  const now = useMemo(() => nowWhen(tz), [tz]);

  useEffect(() => {
    const h = loadHobbies(); setHobbies(h);
    if (h.length) return;
    // Sem interesses neste dispositivo: tenta os da conta; se não houver, pede para escolher.
    fetch("/api/me/prefs").then((r) => (r.ok ? r.json() : null)).then((p) => {
      const fromAccount = (p?.hobbies ?? []).filter((x: string) => (HOBBIES as readonly string[]).includes(x)) as Hobby[];
      if (fromAccount.length) { setHobbies(fromAccount); try { localStorage.setItem(KEY, JSON.stringify(fromAccount)); } catch { /* ignorar */ } } else setPicking(true);
    }).catch(() => setPicking(true));
  }, []);
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
    void fetch("/api/me/prefs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hobbies: next }) }).catch(() => null); // guarda na conta, se houver sessão
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
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => { setTab(k); setFocus(null); }}>
            {k === "moments" ? `✨ ${t.exTabMoments}` : k === "places" ? `🎡 ${t.exTabPlaces}` : k === "events" ? `🎟 ${t.exTabEvents}` : `🤝 ${t.exTabCustoms}`}
          </button>
        ))}
      </div>

      {tab === "moments" && (
        <div ref={mapRef}>
          <MapView stops={route?.stops ?? []} done={route?.done ?? {}} museums={route?.museums ?? []} airport={route?.airport} pos={route?.pos ?? pos} focus={focus} t={t} gmapsKey={gmapsKey}
            extra={moments.map((m) => ({ lat: m.lat, lng: m.lng, icon: m.icon, title: m.title }))} center={center} legend={Boolean(route)} />
        </div>
      )}
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
                <button className={wished(m.title) ? "wish on" : "wish"} aria-pressed={wished(m.title)} onClick={() => heart({ title: m.title, lat: m.lat, lng: m.lng, icon: m.icon })}>{wished(m.title) ? "❤️" : "🤍"} {t.wlWish}</button>
                <button onClick={() => show({ lat: m.lat, lng: m.lng, name: m.title })}>📍 {t.map}</button>
                <a href={goLink(m)} target="_blank" rel="noreferrer">🧭 {t.exGo}</a>
                <a href={tiktok(`${m.title} ${cityName}`)} target="_blank" rel="noreferrer">♪ {t.exTiktok}</a>
                <button onClick={() => setToPlan({ title: m.title, lat: m.lat, lng: m.lng, icon: m.icon, kind: "moment" })}>🗺 {t.plAddTo}</button>
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
            <div ref={mapRef}>{gmapsKey && data.source === "google" ? <GoogleMap apiKey={gmapsKey} places={places} pos={pos} center={center} focus={focus} /> : <ExploreMap places={places} pos={pos} center={center} focus={focus} />}</div>
            <div className="ex-list">
              {places.map((p, i) => (
                <div key={p.id} className="ex-row" onClick={(e) => { if ((e.target as HTMLElement).closest("a,button")) return; show({ lat: p.lat, lng: p.lng, name: p.name }); }} style={{ cursor: "pointer" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.photo && i < 15 ? <img className="ex-ph" src={`/api/explore/photo?n=${encodeURIComponent(p.photo)}`} alt="" loading="lazy" /> : <span className="ex-ic sm" aria-hidden="true">{CAT_ICON[p.cat]}</span>}
                  <div className="stack" style={{ gap: 2, minWidth: 0, flex: 1 }}>
                    <b className="ad-ellip">{p.name}</b>
                    <span className="hint">
                      {p.rating ? <b className="ex-star">★ {p.rating.toFixed(1)}</b> : null}{p.rating ? ` (${(p.reviews ?? 0).toLocaleString(INTL_LOCALE[locale])}) · ` : ""}
                      {CAT_ICON[p.cat]} {t.cat[p.cat]} · {dist(p.d)}{p.fee === false ? ` · ${t.exFreeEntry}` : ""}
                      {p.openNow === true && <b className="ex-open"> · {t.exOpen}</b>}{p.openNow === false && <span> · {t.exClosed}</span>}
                    </span>
                    <span className="ex-acts sm">
                      <button className={wished(p.name) ? "wish on" : "wish"} aria-pressed={wished(p.name)} aria-label={t.wlWish} onClick={() => heart({ title: p.name, lat: p.lat, lng: p.lng, icon: CAT_ICON[p.cat] })}>{wished(p.name) ? "❤️" : "🤍"}</button>
                      <a href={p.gmaps ?? (p.d < 1800 ? walkLink(p) : goLink(p))} target="_blank" rel="noreferrer">🧭 {t.exGo}</a>
                      {gmapsKey && data.source === "google" && <button onClick={() => setSv(p)}>👁 Street View</button>}
                      {p.web && <a href={p.web} target="_blank" rel="noreferrer">{t.exWeb}</a>}
                      <a href={tiktok(`${p.name} ${cityName}`)} target="_blank" rel="noreferrer">♪ TikTok</a>
                      <button onClick={() => setToPlan({ title: p.name, lat: p.lat, lng: p.lng, icon: CAT_ICON[p.cat], kind: "place" })}>🗺 {t.plAddTo}</button>
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
                <a key={e.id} href={`/${locale}/wallet/agenda?city=${cityId}&ev=${encodeURIComponent(e.id)}`} className={`card ex-ev ${score(EVENT_HOBBY[e.kind], hobbies) ? "fit" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {e.image ? <img src={e.image} alt="" loading="lazy" /> : <span className="ex-ev-ph" aria-hidden="true">🎟</span>}
                  <span className="stack" style={{ gap: 2, minWidth: 0 }}>
                    <span className="label" style={{ color: "var(--cobalt)" }}>{t.evKind[e.kind]}{e.localTime ? ` · ${e.localTime}` : ""}</span>
                    <b className="ex-ev-t">{e.name}</b>
                    <span className="hint ad-ellip">{e.venue ?? ""}</span>
                    <span className={`ag-price ${e.free ? "free" : e.priceMin ? "" : "unk"}`}>{e.free ? `🆓 ${t.exFreeEntry}` : e.priceMin && e.currency ? `🎟 ${fmt(t.exFrom, { p: money(e.priceMin, e.currency) })}` : `🎟 ${t.evPriceSite}`}</span>
                  </span>
                </a>
              ))}
            </div>
          ))}
          <div className="card ex-agenda"><span className="hint">{data?.eventsEnabled ? "" : t.exEventsSoon}</span><a className="btn ghost press" href={`/${locale}/wallet/agenda?city=${cityId}`}>📅 {t.exAgenda}</a></div>
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

      {toPlan && <AddToPlan t={t} locale={locale} cityId={cityId} cityName={cityName} item={toPlan} onClose={(msg) => { setToPlan(null); if (msg) { setToast(msg); setTimeout(() => setToast(""), 3000); } }} />}
      {save && <SaveMemory t={t} cityId={cityId} cityName={cityName} item={save} onClose={(ok) => { setSave(null); if (ok) { setToast(t.exSaved); setTimeout(() => setToast(""), 2500); } }} />}
      {toast && <div className="ex-toast" role="status">{toast} <a href={`/${locale}/wallet`}>{t.wallet} →</a></div>}
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
            try { await saveMemoryAnywhere({ city: cityId, cityName, title: item.title, note: note.trim(), photo, lat: item.lat, lng: item.lng }); onClose(true); } catch { setBusy(false); }
          }}>{t.exSaveBtn}</button>
        </div>
      </div>
    </div>
  );
}

function ExploreMap({ places, pos, center, focus }: { places: (Place & { d: number })[]; pos: Pos | null; center: Pos; focus?: Focus | null }) {
  const view = useRef("");
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
    const key = `${places.map((p) => p.id).join(",")}|${focus?.lat},${focus?.lng}`;
    if (key === view.current) return;
    view.current = key;
    if (focus) { m.setView([focus.lat, focus.lng], 17); return; }
    const pts = places.slice(0, 25).map((p) => [p.lat, p.lng] as [number, number]);
    if (pts.length) m.fitBounds(L.latLngBounds(pts).pad(0.1), { maxZoom: 15 });
  }
  return <div ref={el} className="leaflet-box ex-map" role="region" aria-label="Map" />;
}


/* ---------- Google Maps (mapa e Street View) ---------- */
function GoogleMap({ apiKey, places, pos, center, focus }: { apiKey: string; places: (Place & { d: number })[]; pos: Pos | null; center: Pos; focus?: Focus | null }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<G>(null);
  const marks = useRef<G[]>([]);
  const view = useRef("");
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
    // Só reposiciona quando muda a lista ou o lugar escolhido (não a cada passo do GPS).
    const key = `${places.map((p) => p.id).join(",")}|${focus?.lat},${focus?.lng}`;
    if (key !== view.current) {
      view.current = key;
      if (focus) {
        map.current.panTo({ lat: focus.lat, lng: focus.lng }); map.current.setZoom(17);
        const hit = marks.current.find((mk) => mk.getTitle?.() === focus.name);
        if (hit) g.maps.event.trigger(hit, "click");
      } else if (places.length) { map.current.fitBounds(b, 40); if (places.length === 1) map.current.setZoom(16); }
    }
  }
  if (err) return <ExploreMap places={places} pos={pos} center={center} focus={focus} />;
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

export function AddToPlan({ t, locale, cityId, cityName, item, onClose }: { t: Dict; locale: Locale; cityId: string; cityName: string; item: { title: string; lat: number; lng: number; icon: string; kind: "moment" | "place" }; onClose: (msg?: string) => void }) {
  const [plans, setPlans] = useState<{ id: string; title: string; city: string | null; days: number }[] | null | "auth">(null);
  const [day, setDay] = useState(1);
  useEffect(() => { fetch("/api/me/plans").then((r) => (r.status === 401 ? "auth" : r.json().then((j) => j.plans))).then(setPlans).catch(() => setPlans([])); }, []);
  const mine = Array.isArray(plans) ? plans.filter((p) => p.city === cityId) : [];
  const it = { id: Math.random().toString(36).slice(2, 10), title: item.title, lat: item.lat, lng: item.lng, icon: item.icon, kind: item.kind };
  async function addTo(id: string) {
    const p = await fetch(`/api/me/plans/${id}`).then((r) => r.json());
    await fetch(`/api/me/plans/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: [...p.items, { ...it, day: Math.min(day, p.days) }] }) });
    onClose(t.plAdded);
  }
  async function createWith() {
    const r = await fetch("/api/me/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: cityName, city: cityId, cityName, startDate: null, days: 1, items: [{ ...it, day: 1 }] }) });
    if (r.ok) onClose(t.plAdded);
  }
  return (
    <div className="ex-modal" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card stack ex-sheet">
        <b style={{ fontSize: 18 }}>🗺 {item.title}</b>
        {plans === null && <p className="hint">…</p>}
        {plans === "auth" && <><p>{t.plSignIn}</p><a className="btn press" href={`/${locale}/wallet`}>{t.wallet}</a></>}
        {Array.isArray(plans) && <>
          <span className="hint">{t.plChoose}</span>
          {mine.some((p) => p.days > 1) && <div className="field"><select value={day} onChange={(e) => setDay(Number(e.target.value))}>{Array.from({ length: Math.max(...mine.map((p) => p.days)) }, (_, k) => k + 1).map((n) => <option key={n} value={n}>{fmt(t.plDay, { n })}</option>)}</select></div>}
          {mine.map((p) => <button key={p.id} className="btn ghost press" onClick={() => void addTo(p.id)}>{p.title}</button>)}
          <button className="btn press" onClick={() => void createWith()}>{t.plNew}</button>
        </>}
        <button className="link-btn" onClick={() => onClose()}>{t.exCancel}</button>
      </div>
    </div>
  );
}
