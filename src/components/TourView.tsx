"use client";
import { useDict } from "@/i18n/client-dict";
import { useEffect, useMemo, useState } from "react";
import type { City, Leg, Stop } from "@/data/cities";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import { hasExtension, minutesLeft, optionByKey, routeOptions, type Base, type CityHop } from "@/lib/route-cost";
import { BUFFER_MIN, breakdown, defaultTrip, endLegs, parseTrip, sameEnd, tripReady, whenLabel, type Endpoint, type Trip } from "@/lib/trip";
import { TimeBreakdown, TripPicker, endIcon, endLabel } from "./TripPicker";
import { loadTrip, saveTrip, tripKey } from "./trip-store";
import { accessCount, accessOf, PRICES_CHECKED } from "@/data/access";
import { cityCenterOf } from "@/lib/city-center";
import { NextCard, BackNow, dayNames, FlightCard, RouteFit, Speak, useGeo, WeatherCard, weekdayIn, type FlightOverride } from "./TourExtras";
import type { Offer } from "@/lib/merchants";
import { dualMoney, type FxContext } from "@/lib/currency";
import { CurrencyPicker } from "./CurrencyPicker";
import { ExtLink } from "./ExtLink";
import type { Focus } from "./MapView";
import { stopName, lineText } from "@/data/stop-names";
import type { Museum } from "@/data/museums";
import { Img, StopMedia, useCityMedia } from "./Media";
import { SosButton } from "./SosButton";
import { WalkTools } from "./WalkTools";
import { RatingCard } from "./Rating";
import { OfflineButton } from "./TravelTools";
import { OfflineCheck, OfflineStatus } from "./OfflineCheck";
import { PlanChanged } from "./PlanChanged";
import { StopReport } from "./StopReport";
import { zonedToDate } from "@/lib/zoned";
import { RouteSketch } from "./RouteSketch";
import { SheetX } from "./WinNav";
import { TRANSPORT } from "@/data/transport";
import { track } from "@/lib/track";
import { COUNTRY } from "@/data/city-meta";
import dynamic from "next/dynamic";
import { ArrowLeftRight, ChevronRight, Wallet } from "lucide-react";
import { toast } from "@/lib/toast";
import { CommentsButton } from "./Comments";
import Portal from "@/components/Portal";
import { OfferCard } from "@/components/OfferCard";
import { achievementText } from "@/lib/achievement-text";
// Separadores carregados só quando abertos.
const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), { ssr: false });
const DayPlan = dynamic(() => import("./Museums").then((m) => m.DayPlan), { ssr: false });
const MuseumsTab = dynamic(() => import("./Museums").then((m) => m.MuseumsTab), { ssr: false });
const Explore = dynamic(() => import("./Explore").then((m) => m.Explore), { ssr: false });
const CostPlanner = dynamic(() => import("./CostPlanner").then((m) => m.CostPlanner), { ssr: false });
const CityGuide = dynamic(() => import("./CityGuide").then((m) => m.CityGuide), { ssr: false });
const FxConverter = dynamic(() => import("./TravelTools").then((m) => m.FxConverter), { ssr: false });

type Props = {
  locale: Locale; t?: Dict; city: City; cityLabel: string; flightAt: string | null;
  offers: Offer[]; otherCities: { id: string; name: string }[]; fx: FxContext;
  flightNo: string | null; flightApi: boolean; museums: Museum[]; plan: string;
  explore?: Omit<React.ComponentProps<typeof Explore>, "cityId" | "cityName" | "locale" | "t">;
  bios: Record<string, { text: string; lang: string }>; enBios: Record<string, string>;
  /** Amostra grátis: só a 1.ª paragem está aberta. */
  preview?: { buy: string; price: string; signIn: string };
  /** Plano guardado na compra (para abrir noutro dispositivo com o mesmo início, fim e modalidade). */
  tripIn?: unknown;
};

const hrs = (m: number) => { const v = Math.max(0, Math.round(m)); return `${Math.floor(v / 60)} h ${String(v % 60).padStart(2, "0")}`; };

function useLocalState<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  useEffect(() => { try { const s = localStorage.getItem(key); if (s) setV(JSON.parse(s)); } catch { /* sem armazenamento */ } }, [key]);
  const set = (nv: T) => { setV(nv); try { localStorage.setItem(key, JSON.stringify(nv)); } catch { /* ignorar */ } };
  return [v, set] as const;
}

export function TourView({ locale, t: tProp, city: cityIn, cityLabel, flightAt, offers, otherCities, fx, flightNo, flightApi, museums, plan: accessPlan, bios, enBios, explore, preview, tripIn }: Props) {
  const t = useDict(tProp);
  // Nomes das paragens no idioma do viajante (os dados estão em português).
  const city = useMemo(() => ({ ...cityIn, stops: cityIn.stops.map((s) => ({ ...s, n: stopName(s, locale) })) }), [cityIn, locale]);
  const [lvl, setLvl] = useLocalState<string>(`sgct:lvl:${city.id}`, "");
  const [fo, setFo] = useLocalState<FlightOverride | null>("sgct:flight", null);
  const [done, setDone] = useLocalState<Record<string, boolean>>(`sgct:done:${city.id}`, {});
  // Paragens saltadas ("o plano mudou") e hora a que o viajante tem de voltar (sem voo).
  const [skip, setSkip] = useLocalState<Record<string, boolean>>(`sgct:skip:${city.id}`, {});
  const [endHM, setEndHM] = useLocalState<string>(`sgct:end:${city.id}`, "");
  const [warn, setWarn] = useState<Record<string, string[]>>({});
  useEffect(() => { fetch(`/api/stop-reports?city=${city.id}`).then((r) => (r.ok ? r.json() : null)).then((j) => j?.warnings && setWarn(j.warnings)).catch(() => null); }, [city.id]);
  const [open, setOpen] = useState<string>(city.stops[0].id);
  const [tab, setTab] = useState<"route" | "live" | "map" | "cost" | "museums" | "guide">("route");
  const [focus, setFocus] = useState<Focus | null>(null);
  // O mapa vive dentro de "Explorar": mostrar um lugar abre esse separador já centrado nele.
  const showOnMap = (f: Focus) => { setFocus({ ...f }); setTab(explore ? "live" : "map"); };
  const geo = useGeo();
  const cm = useCityMedia(city.id);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [online, setOnline] = useState(true);
  const [notice, setNotice] = useState("");
  const [fxOpen, setFxOpen] = useState(false);
  // Plano de viagem (início, fim, modalidade, horas): o mesmo do planeador e da compra.
  const [trip, setTripState] = useState<Trip>(defaultTrip());
  const [baseOpen, setBaseOpen] = useState(false);
  useEffect(() => {
    let saved = false; try { saved = Boolean(localStorage.getItem(tripKey(city.id))); } catch { /* ignorar */ }
    const srv = parseTrip(tripIn);
    setTripState(!saved && srv ? srv : loadTrip(city.id));
  }, [city.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const setTrip = (v: Trip) => { setTripState(v); if (tripReady(v)) saveTrip(city.id, v); };
  const tz = city.tz ?? "UTC";
  const toBase = (e: Endpoint): Base => (e.kind === "airport" ? { kind: "airport" } : { kind: "place", lat: e.lat, lng: e.lng, label: e.label, here: e.kind === "here" });
  useEffect(() => {
    const up = () => setOnline(navigator.onLine);
    up(); window.addEventListener("online", up); window.addEventListener("offline", up);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", up); };
  }, []);
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(i); }, []);

  // Partida: o voo alterado neste dispositivo, o da compra ou a hora indicada no planeador (comboio, navio, voltar até).
  const flightIso = fo?.at ?? flightAt ?? (trip.deadline ? zonedToDate(trip.deadline, tz).toISOString() : null);
  const flightNoEff = fo?.no ?? flightNo ?? "";
  const flightDate = useMemo(() => (flightIso ? new Date(flightIso) : null), [flightIso]);
  const options = useMemo(() => routeOptions(city), [city]);
  // Sem escolha guardada: o roteiro mais completo que cabe no tempo até ao voo.
  const autoKey = useMemo(() => {
    if (!flightDate) return hasExtension(city) ? "ext" : "core";
    const avail = (flightDate.getTime() - Date.now()) / 60000;
    const fits = options.filter((o) => breakdown(city, o.plan, trip).needed <= avail);
    return (fits[fits.length - 1] ?? options[0]).key;
  }, [city, flightDate, options, trip]);
  const chosen = optionByKey(city, lvl) ?? optionByKey(city, autoKey) ?? options[options.length - 1];
  const planAll = chosen.plan;
  const plan = useMemo(() => ({ ...planAll, stops: planAll.stops.filter((x) => !skip[x.id]).length ? planAll.stops.filter((x) => !skip[x.id]) : planAll.stops }), [planAll, skip]);
  const ext = chosen.key === "ext";
  // Tarifas na moeda da cidade (a que se paga na máquina) e, se diferente, o aproximado na moeda do viajante.
  const money = (v: number) => dualMoney(v, city.cur, fx, INTL_LOCALE[locale]).main;
  const both = (v: number) => { const d = dualMoney(v, city.cur, fx, INTL_LOCALE[locale]); return d.local ? <>{d.main} <span className="fx">{d.local}</span></> : d.main; };
  const hm = (d: Date) => (Number.isFinite(d.getTime()) ? d.toLocaleTimeString(INTL_LOCALE[locale], { hour: "2-digit", minute: "2-digit" }) : "—");
  const legs = endLegs(city, plan, trip.start, trip.end);
  const bd = breakdown(city, plan, trip);
  const buffer = BUFFER_MIN[trip.mode];
  // Hora de sair da última paragem: partida − margem da modalidade − regresso ao ponto final (aeroporto, estação, terminal…).
  const leave = flightDate ? new Date(flightDate.getTime() - (buffer + bd.back) * 60_000) : null;
  const bp = { to: legs.toHop, back: legs.backHop, minutesTotal: bd.total };
  const deadline = useMemo(() => {
    if (flightDate) return new Date(flightDate.getTime() - buffer * 60_000);
    if (!endHM) return null;
    const day = new Intl.DateTimeFormat("sv-SE", { timeZone: city.tz ?? "UTC" }).format(new Date(now));
    return zonedToDate(`${day}T${endHM}`, city.tz ?? "UTC");
  }, [flightDate, endHM, city.tz, now, buffer]);
  const leftStops = plan.stops.filter((x) => !done[x.id]);
  const startPlace = trip.start.kind !== "airport";
  const atPlace = trip.end.kind !== "airport";
  const backAt = atPlace ? new Date(now + minutesLeft(plan, bp, done) * 60_000) : null;
  const words = { today: t.tpToday, tomorrow: t.tpTomorrow };
  const when = (d: Date) => whenLabel(d.getTime(), tz, INTL_LOCALE[locale], words, now);
  const endName = endLabel(trip.end, t);
  const hopView = (h: CityHop) => (
    <div className="leg">
      {h.m === "walk" ? <span className="chip walk">{t.walk} · {t.free.toLowerCase()}</span> : <span className="chip paid num">{t.bpTransit} · ~{money(city.single)}</span>}
      <span className="num">~{h.min} min</span>
    </div>
  );
  const today = weekdayIn(city.tz, now);
  const closedToday = (s: Stop) => Boolean(s.cl?.includes(today));
  const nextStop = plan.stops.find((s) => !done[s.id]) ?? null;
  // Tempo até sair da última paragem; antes de começar, desconta a ida até à 1.ª paragem.
  const avail = leave ? Math.round((leave.getTime() - now) / 60000) - (Object.keys(done).length ? 0 : bd.to) : null;
  const fits = avail === null || avail >= plan.minutesTour;
  const extras = city.stops.filter((s) => s.x);
  const extraMin = extras.reduce((a, s) => a + s.v + s.leg.min, 0) + (city.ret.extra.min - city.ret.core.min);
  const doneN = plan.stops.filter((s) => done[s.id]).length;
  const [going, setGoing] = useLocalState<boolean>(`sgct:go:${city.id}`, false);
  const started = going || doneN > 0;
  // Folga para o regresso: tempo disponível menos o que falta das paragens por fazer (e o resto fixo do roteiro).
  const stopsMin = plan.stops.reduce((a, s) => a + s.v + s.leg.min, 0);
  const leftMin = plan.stops.filter((s) => !done[s.id]).reduce((a, s) => a + s.v + s.leg.min, 0);
  const slack = avail === null ? null : Math.round(avail - leftMin - Math.max(0, plan.minutesTour - stopsMin));
  // Para "Continuar onde ficou" no início: último passeio em curso, com o nome legível e o progresso.
  useEffect(() => { if (started) try { localStorage.setItem("sgct:last-tour", JSON.stringify({ id: city.id, name: cityLabel, done: doneN, n: plan.stops.length, at: Date.now() })); } catch { /* ignorar */ } }, [started, city.id, cityLabel, doneN, plan.stops.length]);
  const [planOpen, setPlanOpen] = useState(false);
  // Começa à noite (19h–7h na hora da cidade)? Interiores pagos passam a "só exterior".
  const startHour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: city.tz ?? "UTC", hour: "2-digit", hour12: false }).format(((d) => (Number.isFinite(d.getTime()) ? d : new Date()))(trip.startAt ? zonedToDate(trip.startAt, city.tz ?? "UTC") : new Date())).slice(0, 2));
  const night = startHour >= 19 || startHour < 7;
  const desc = (s: Stop) => (locale === "pt" ? s.pt : s.en);

  const legView = (l: Leg) => {
    const cost = (l.f ?? 0) + (l.r ?? 0) * city.single;
    return (
      <div className="leg">
        {l.m === "walk"
          ? <span className="chip walk">{t.walk} · {t.free.toLowerCase()}</span>
          : <span className="chip paid num">{t[l.m]} · {money(cost)}</span>}
        <span>{l.line ? `${lineText(l.line, locale)} · ` : ""}<span className="num">{l.min} min</span></span>
      </div>
    );
  };

  useEffect(() => { track("tour_open", { city: city.id, locale }, "day"); }, [city.id, locale]);
  // Progresso para o ecrã "Agora" da My Trip (neste telemóvel).
  useEffect(() => {
    if (preview) return;
    try {
      const all = JSON.parse(localStorage.getItem("sgct:progress") ?? "{}");
      all[city.id] = { city: city.id, name: cityLabel, next: nextStop?.n ?? "", i: doneN, total: plan.stops.length, at: Date.now() };
      localStorage.setItem("sgct:progress", JSON.stringify(all));
    } catch { /* ignorar */ }
  }, [doneN, plan.stops.length, nextStop?.n]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pontos: cada paragem marcada conta (com GPS por perto vale o dobro); sincroniza entre dispositivos.
  const [cmCounts, setCmCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    fetch(`/api/comments?city=${city.id}&counts=1`).then((r) => (r.ok ? r.json() : null)).then((j) => j && setCmCounts(j.counts)).catch(() => null);
    fetch(`/api/me/checkin?city=${city.id}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j: { checkins?: { stop: string }[] } | null) => {
      const srv = (j?.checkins ?? []).filter((c) => c.stop).map((c) => c.stop);
      if (srv.some((x) => !done[x])) setDone({ ...done, ...Object.fromEntries(srv.map((x) => [x, true])) });
    }).catch(() => null);
  }, [city.id]); // eslint-disable-line react-hooks/exhaustive-deps
  async function syncCheckin(id: string, on: boolean) {
    const r = await fetch("/api/me/checkin", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: city.id, stop: id, ...(on ? (geo.pos ? { lat: geo.pos.lat, lng: geo.pos.lng } : {}) : { undo: true }) }) }).catch(() => null);
    const j = await r?.json().catch(() => null);
    if (on && j?.pts) toast(fmt(t.ptCheckin, { n: j.pts }), { icon: j.verified ? "📡" : "⭐" });
    // Conquistas desbloqueadas por este check-in: um aviso de celebração a seguir (com um pequeno intervalo).
    (j?.won as string[] | undefined)?.forEach((k, i) => setTimeout(() => toast(achievementText(k, t), { ms: 5000 }), 1400 * (i + 1)));
    window.dispatchEvent(new Event("sgct:points"));
  }
  function toggleDone(id: string) {
    const nv = { ...done, [id]: !done[id] };
    setDone(nv);
    void syncCheckin(id, Boolean(nv[id]));
    if (nv[id]) {
      track("stop_done", { city: city.id, stop: id });
      if (!Object.values(done).some(Boolean)) track("first_stop", { city: city.id, locale }, "day");
      if (plan.stops.every((s) => nv[s.id])) track("tour_done", { city: city.id, locale }, "day");
    }
    if (nv[id]) { const i = plan.stops.findIndex((s) => s.id === id); const next = plan.stops[i + 1]; if (next) setOpen(next.id); }
  }

  async function remind() {
    if (!leave) return;
    const at = new Date(leave.getTime() - 15 * 60_000);
    const body = fmt(t.tpReturnSub[trip.mode], { t: when(leave) });
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    try {
      if (cap?.isNativePlatform?.()) {
        // App nativa: notificação agendada no sistema, funciona com a app fechada.
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        const perm = await LocalNotifications.requestPermissions();
        if (perm.display !== "granted") return setNotice(t.notifyDenied);
        await LocalNotifications.schedule({ notifications: [{ id: 1, title: fmt(t.tpNotifyTitle, { p: endName }), body, schedule: { at } }] });
      } else {
        // Navegador: aviso enquanto a página estiver aberta.
        if (!("Notification" in window) || (await Notification.requestPermission()) !== "granted") return setNotice(t.notifyDenied);
        const ms = Math.max(0, at.getTime() - Date.now());
        setTimeout(() => {
          const show = () => { new Notification(fmt(t.tpNotifyTitle, { p: endName }), { body }); };
          navigator.serviceWorker?.getRegistration()
            .then((r) => { if (r) void r.showNotification(fmt(t.tpNotifyTitle, { p: endName }), { body }); else show(); })
            .catch(show);
        }, ms);
      }
      setNotice(fmt(t.notifyOn, { t: hm(at) }));
    } catch { setNotice(t.notifyDenied); }
  }

  // Só diz "visitei" quando o passeio terminou; antes é um plano ou progresso parcial.
  const shareVars = { city: cityLabel, n: plan.stops.length, k: doneN, c: money(plan.transport) };
  const shareText = fmt(doneN >= plan.stops.length ? t.shareText : doneN > 0 ? t.shareSome : t.sharePlan, shareVars);

  return (
    <>
      <header className="top">
        <div className="top-row">
          <div style={{ minWidth: 0 }}>
            <span className="label">{t.yourRoute}</span>
            {otherCities.length > 0 ? (
              <select aria-label={cityLabel} value={city.id} onChange={(e) => { window.location.href = `/${locale}/tour/${e.target.value}`; }}
                style={{ display: "block", fontFamily: "var(--display)", fontWeight: 700, fontSize: 24, letterSpacing: "-.03em", border: 0, background: "none", padding: 0 }}>
                {otherCities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : <h2 style={{ fontSize: 24 }}>{cityLabel}</h2>}
          </div>
          <span className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
            <a className="hb-ic press" href={`/${locale}/wallet`} aria-label={t.wallet} title={t.wallet}><Wallet size={18} strokeWidth={2} aria-hidden="true" /></a>
            <CurrencyPicker current={fx.cur} label={t.currency} />
          </span>
          {leave ? <div className="clock"><small>{t.leaveBy}</small><b className="num">{when(leave)}</b></div>
            : backAt && <div className="clock"><small>{t.bpBackShort}</small><b className="num">{when(backAt)}</b></div>}
        </div>
        <div className="progress"><i style={{ width: `${(doneN / plan.stops.length) * 100}%` }} /></div>
        <div className="tabs" role="tablist">
          {(preview ? (["route"] as const) : (["route", ...(explore ? ["live" as const] : ["map" as const]), "cost", "museums", "guide"] as const)).map((k) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => { setTab(k); if (k === "map" || k === "live") setFocus(null); }}>{k === "route" ? t.route : k === "live" ? `✨ ${t.tabLive}` : k === "map" ? t.map : k === "cost" ? t.costs : k === "museums" ? t.museums : t.guide}</button>
          ))}
        </div>
      </header>

      <div className="stack" style={{ marginTop: 14 }}>
        {preview && (
          <div className="card pv">
            <b>🎧 {t.pvTitle}</b>
            <p className="hint">{t.pvSub}</p>
            <a className="btn tram press" href={preview.buy}>{fmt(t.pvUnlock, { p: preview.price })}</a>
            <a className="link-btn" href={preview.signIn}>{t.pvHave}</a>
          </div>
        )}
        {started && tab === "route" && !preview ? (<>
          {/* A caminhar: o próximo passo é a primeira coisa no ecrã; o plano fica recolhido. */}
        {(
          <NextCard city={city} stops={plan.stops} done={done} startHop={bp.to} backLabel={atPlace ? fmt(t.bpBackAt, { p: endName, t: backAt ? when(backAt) : "" }) : undefined} museums={museums} today={today} money={money} t={t} locale={locale}
            onDone={(id) => toggleDone(id)}
            onOpen={(id) => { setOpen(id); requestAnimationFrame(() => document.getElementById(`s-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })); }} />
        )}
          <WalkTools t={t} locale={locale} cityId={city.id} slack={slack}
            places={plan.stops.filter((s) => !done[s.id]).map((s) => ({ id: s.id, name: stopName(s, locale), lat: s.lat, lng: s.lng }))} />
          <button type="button" className="ios-row press" onClick={() => setPlanOpen(!planOpen)} aria-expanded={planOpen}>
            <span className="ios-tx"><b>{t.tg.plan}</b><small>{fmt(t.fitOpt, { n: plan.stops.length, h: hrs(plan.minutesTour) })}</small></span>
            <ChevronRight size={18} className="ios-chev" style={{ transform: planOpen ? "rotate(90deg)" : undefined }} aria-hidden="true" />
          </button>
          {planOpen && <>
        <div className="card stack" style={{ gap: 10, padding: 14 }}>
          <WeatherCard cityId={city.id} t={t} locale={locale} />
          <div className="bp-line">
            <span>{endIcon(trip.start)} {endLabel(trip.start, t)} → {endIcon(trip.end)} {endName}</span>
            <button className="link-btn" onClick={() => setBaseOpen(!baseOpen)}>{baseOpen ? t.close : t.bpChange}</button>
          </div>
          {baseOpen && <TripPicker t={t} locale={locale} city={city.id} cityName={cityLabel} center={cityCenterOf(city)} value={trip} onChange={setTrip} />}
          {baseOpen && !tripReady(trip) && <p className="tp-need">{t.tpNeedEnd}</p>}
          <RouteFit options={options} value={chosen.key} onChange={setLvl} availMin={avail} t={t} extName={[...new Set(extras.map((s) => s.a))].join(", ")}
            locale={locale} single={city.single} money={money} tz={city.tz ?? "UTC"} ticket={city.cardName} night={night}
            from={trip.start.kind === "airport" ? (city.ap ? { lat: city.ap.lat, lng: city.ap.lng, n: t.bpAirport } : null) : Number.isFinite(trip.start.lat) ? { lat: trip.start.lat, lng: trip.start.lng, n: endLabel(trip.start, t) } : null} />
          <TimeBreakdown b={bd} t={t} trip={trip} hrs={hrs} />
          {!lvl && flightDate && fits && <p className="hint">{t.fitAuto}</p>}
          {accessCount(plan.stops.map((s) => s.id)) > 0 && <p className="hint">♿ {fmt(t.acSum, { n: accessCount(plan.stops.map((s) => s.id)) })}</p>}
          {hasExtension(city) && <p className="hint">{t.extras}: {fmt(t.extrasSub, { n: extras.length, h: hrs(extraMin) })}</p>}
          {avail !== null && leave && (
            <p className={`fit ${fits ? "ok" : "bad"}`}>
              {fits ? fmt(t.tpFitsOk, { a: hrs(plan.minutesTour), b: hrs(avail), p: endName })
                : avail <= 0 ? fmt(t.tpLate, { p: endName, t: when(leave) })
                  : fmt(t.fitsBad, { a: hrs(plan.minutesTour), b: hrs(avail) }) + (ext && hasExtension(city) ? t.fitsTip : t.fitsTip2)}
            </p>
          )}
          {leave && avail !== null && avail > 15 && (
            notice ? <p className="hint">🔔 {notice}</p> : <button className="btn ghost" style={{ padding: 10, fontSize: 14 }} onClick={remind}>🔔 {t.notifyBtn}</button>
          )}
          {trip.mode === "plane" && <FlightCard city={city} flightNo={flightNoEff} flightAt={flightDate} enabled={flightApi} t={t} locale={locale}
            onUse={(iso) => setFo({ at: iso, no: flightNoEff })} onEdit={(o) => setFo(o)} />}
          {!online && <p className="note">{t.offline}</p>}
          {!preview && <OfflineButton t={t} locale={locale} city={city.id} />}
          {!preview && <OfflineStatus t={t} locale={locale} city={city.id} audioLang={Object.values(bios)[0]?.lang ?? (locale === "pt" ? "pt" : "en")} />}
          {!preview && <OfflineCheck t={t} locale={locale} city={city.id} audioLang={Object.values(bios)[0]?.lang ?? (locale === "pt" ? "pt" : "en")} />}
          <button type="button" className="ios-row press" onClick={() => setFxOpen(true)}>
            <span className="ios-ic" style={{ background: "#ff9500" }}><ArrowLeftRight size={17} color="#fff" aria-hidden="true" /></span>
            <span className="ios-tx"><b>{t.ttFx}</b>{city.cur !== fx.cur && <small>{city.cur} → {fx.cur}</small>}</span><ChevronRight size={18} className="ios-chev" aria-hidden="true" />
          </button>
          {t.contentNote && Object.values(bios)[0]?.lang !== locale && <p className="note">{t.contentNote}</p>}
        </div>
          </>}
        </>) : (<>
        <div className="card stack" style={{ gap: 10, padding: 14 }}>
          <WeatherCard cityId={city.id} t={t} locale={locale} />
          <div className="bp-line">
            <span>{endIcon(trip.start)} {endLabel(trip.start, t)} → {endIcon(trip.end)} {endName}</span>
            <button className="link-btn" onClick={() => setBaseOpen(!baseOpen)}>{baseOpen ? t.close : t.bpChange}</button>
          </div>
          {baseOpen && <TripPicker t={t} locale={locale} city={city.id} cityName={cityLabel} center={cityCenterOf(city)} value={trip} onChange={setTrip} />}
          {baseOpen && !tripReady(trip) && <p className="tp-need">{t.tpNeedEnd}</p>}
          <RouteFit options={options} value={chosen.key} onChange={setLvl} availMin={avail} t={t} extName={[...new Set(extras.map((s) => s.a))].join(", ")}
            locale={locale} single={city.single} money={money} tz={city.tz ?? "UTC"} ticket={city.cardName} night={night}
            from={trip.start.kind === "airport" ? (city.ap ? { lat: city.ap.lat, lng: city.ap.lng, n: t.bpAirport } : null) : Number.isFinite(trip.start.lat) ? { lat: trip.start.lat, lng: trip.start.lng, n: endLabel(trip.start, t) } : null} />
          <TimeBreakdown b={bd} t={t} trip={trip} hrs={hrs} />
          {!lvl && flightDate && fits && <p className="hint">{t.fitAuto}</p>}
          {accessCount(plan.stops.map((s) => s.id)) > 0 && <p className="hint">♿ {fmt(t.acSum, { n: accessCount(plan.stops.map((s) => s.id)) })}</p>}
          {hasExtension(city) && <p className="hint">{t.extras}: {fmt(t.extrasSub, { n: extras.length, h: hrs(extraMin) })}</p>}
          {avail !== null && leave && (
            <p className={`fit ${fits ? "ok" : "bad"}`}>
              {fits ? fmt(t.tpFitsOk, { a: hrs(plan.minutesTour), b: hrs(avail), p: endName })
                : avail <= 0 ? fmt(t.tpLate, { p: endName, t: when(leave) })
                  : fmt(t.fitsBad, { a: hrs(plan.minutesTour), b: hrs(avail) }) + (ext && hasExtension(city) ? t.fitsTip : t.fitsTip2)}
            </p>
          )}
          {leave && avail !== null && avail > 15 && (
            notice ? <p className="hint">🔔 {notice}</p> : <button className="btn ghost" style={{ padding: 10, fontSize: 14 }} onClick={remind}>🔔 {t.notifyBtn}</button>
          )}
          {trip.mode === "plane" && <FlightCard city={city} flightNo={flightNoEff} flightAt={flightDate} enabled={flightApi} t={t} locale={locale}
            onUse={(iso) => setFo({ at: iso, no: flightNoEff })} onEdit={(o) => setFo(o)} />}
          {!online && <p className="note">{t.offline}</p>}
          {!preview && <OfflineButton t={t} locale={locale} city={city.id} />}
          {!preview && <OfflineStatus t={t} locale={locale} city={city.id} audioLang={Object.values(bios)[0]?.lang ?? (locale === "pt" ? "pt" : "en")} />}
          {!preview && <OfflineCheck t={t} locale={locale} city={city.id} audioLang={Object.values(bios)[0]?.lang ?? (locale === "pt" ? "pt" : "en")} />}
          <button type="button" className="ios-row press" onClick={() => setFxOpen(true)}>
            <span className="ios-ic" style={{ background: "#ff9500" }}><ArrowLeftRight size={17} color="#fff" aria-hidden="true" /></span>
            <span className="ios-tx"><b>{t.ttFx}</b>{city.cur !== fx.cur && <small>{city.cur} → {fx.cur}</small>}</span><ChevronRight size={18} className="ios-chev" aria-hidden="true" />
          </button>
          {t.contentNote && Object.values(bios)[0]?.lang !== locale && <p className="note">{t.contentNote}</p>}
        </div>
          {tab === "route" && !preview && (
            <button type="button" className="btn tram press tg-go" onClick={() => { setGoing(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <span>▶ {t.tg.start}</span><small>{t.tg.startSub}</small>
            </button>
          )}
        {tab === "route" && !preview && (
          <NextCard city={city} stops={plan.stops} done={done} startHop={bp.to} backLabel={atPlace ? fmt(t.bpBackAt, { p: endName, t: backAt ? when(backAt) : "" }) : undefined} museums={museums} today={today} money={money} t={t} locale={locale}
            onDone={(id) => toggleDone(id)}
            onOpen={(id) => { setOpen(id); requestAnimationFrame(() => document.getElementById(`s-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })); }} />
        )}
        </>)}

        {tab === "route" && flightDate && trip.mode === "plane" && trip.end.kind === "airport" && (
          <BackNow city={city} cityName={cityLabel} flightAt={leave && flightDate ? flightDate : null} pos={geo.pos} geoState={geo.state} onGeo={geo.start}
            next={nextStop} now={now} t={t} locale={locale} />
        )}

        <SosButton cityId={city.id} country={COUNTRY[city.id]} cityName={cityLabel} center={{ lat: city.stops[0].lat, lng: city.stops[0].lng }} t={t} locale={locale} />
        {(tab === "map" || tab === "live") && !online && <RouteSketch stops={plan.stops} done={done} base={toBase(trip.start)} pos={geo.pos} t={t} />}
        {tab === "live" && explore && online && <Explore cityId={city.id} cityName={cityLabel} locale={locale} t={t} bare {...explore}
          route={{ stops: plan.stops, done, museums, airport: city.ap, pos: geo.pos }} focusIn={focus} />}
        {tab === "guide" && <CityGuide city={city} cityLabel={cityLabel} t={t} locale={locale} money={both} />}


        {tab === "route" && !preview && leftStops.length > 0 ? (
          <PlanChanged t={t} locale={locale} left={leftStops} remaining={minutesLeft(plan, bp, done)} deadline={deadline} endSet={Boolean(flightDate || endHM)}
            onSetEnd={setEndHM} onSkip={(ids) => setSkip({ ...skip, ...Object.fromEntries(ids.map((x) => [x, true])) })} now={now}
            back={{ label: atPlace ? endName : t.airport, to: trip.end.kind !== "airport" ? trip.end : (city.ap ?? city.stops[0]), from: geo.pos ?? leftStops[0] ?? null }} />
        ) : null}
        {tab === "route" && (
          <div className="route">
            {startPlace && bp.to ? (
              <>
                <div className="stop endpoint"><span className="pin">{endIcon(trip.start)}</span><div className="body"><h3>{endLabel(trip.start, t)}</h3><p className="meta">{sameEnd(trip.start, trip.end) ? t.bpStartHere : t.tpStartHere}</p></div></div>
                {hopView(bp.to)}
              </>
            ) : (
              <>
                <div className="stop endpoint"><span className="pin">✈</span><div className="body"><h3>{t.airport}</h3>
                  {city.cardName && <p className="meta">{fmt(t.fromAirport, { card: city.cardName + (city.card ? ` (${money(city.card)})` : "") })}</p>}</div></div>
                {legView(city.air)}
              </>
            )}
            {planAll.stops.map((s, i) => {
              const here = offers.filter((o) => o.stopId === s.id);
              const isOpen = open === s.id;
              if (skip[s.id] && !preview) return (
                <div key={s.id}>
                  <div className="stop skipped"><span className="pin num">{i + 1}</span>
                    <div className="body"><div className="head"><div style={{ minWidth: 0 }}><h3>{s.n}</h3><p className="meta">{t.pcSkipped}</p></div>
                      <button className="link-btn" onClick={() => { const n = { ...skip }; delete n[s.id]; setSkip(n); }}>{t.pcUndo}</button></div></div>
                  </div>
                </div>
              );
              if (preview && i > 0) return (
                <div key={s.id}>
                  {legView(s.leg)}
                  <div className="stop locked">
                    <span className="pin num">{i + 1}</span>
                    <div className="body"><a className="head pv-lock" href={preview.buy}>
                      <div style={{ minWidth: 0 }}><h3>{s.n}{s.top && <span className="top-badge">Top</span>}</h3><p className="meta">{s.a} · {s.v} {t.visit}</p></div>
                      <span aria-label={t.pvLocked}>🔒</span>
                    </a></div>
                  </div>
                </div>
              );
              return (
                <div key={s.id}>
                  {i > 0 && legView(s.leg)}
                  <div id={`s-${s.id}`} className={`stop ${done[s.id] ? "done" : ""}`}>
                    <span className="pin num">{done[s.id] ? "✓" : i + 1}</span>
                    <div className="body">
                      <button className="cover" tabIndex={-1} aria-hidden="true" onClick={() => setOpen(isOpen ? "" : s.id)}>
                        {cm ? <Img src={cm.stops[s.id]?.thumb.replace("/500px-", "/960px-")} alt="" /> : <span className="skel" style={{ position: "absolute", inset: 0 }} />}
                        <span className="ov"><span>{s.a}</span><span className="num">{s.v} min</span></span>
                      </button>
                      <button className="head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? "" : s.id)}>
                        <div style={{ minWidth: 0 }}>
                          <h3>{s.n}{s.top && <span className="top-badge">Top</span>}</h3>
                          <p className="meta">{s.a} · {s.v} {t.visit}{s.o ? ` · ${t.optPaid}` : ""}{here.length ? ` · ${here.length} ★` : ""}</p>
                          {closedToday(s) && <span className="closed-chip">{t.closedToday}</span>}
                          {(warn[s.id] ?? []).map((k) => <span key={k} className="ac-chip warn">⚠ {t.rpWarn[k as keyof Dict["rpWarn"]]}</span>)}
                          {accessOf(s.id).map((a) => <span key={a} className={`ac-chip ${a}`}>{a === "hill" ? "⛰" : a === "steps" ? "🪜" : "🪨"} {t.ac[a]}</span>)}
                        </div>
                        <span className="cost-tag num" style={{ color: s.c ? "var(--warn)" : "var(--good)" }}>{s.c ? `~${money(s.c)}` : t.free}</span>
                      </button>
                      {isOpen && (
                        <div className="detail">
                          <p className="bio">{bios[s.id]?.text ?? desc(s)}</p>
                          {s.cl?.length ? <p className="hint">🕒 {fmt(t.closedNote, { d: dayNames(s.cl, locale) })}</p> : null}
                          <StopMedia cityId={city.id} stopId={s.id} name={s.n} t={t} locale={locale} />
                          {here.length > 0 && (
                            <>
                              <span className="label">{t.nearby} · <span className="ad-tag">{t.adPartner}</span></span>
                              <div className="offers">
                                {here.map((o) => <OfferCard key={o.id} o={o} t={t} locale={locale} />)}
                              </div>
                            </>
                          )}
                          <div className="acts">
                            <button type="button" className="sec" onClick={() => showOnMap({ lat: s.lat, lng: s.lng, name: s.n, walk: s.leg.m === "walk" })}>{t.directions}</button>
                            <Speak text={`${s.n}. ${bios[s.id]?.text ?? desc(s)}`} lang={bios[s.id]?.lang ?? (locale === "pt" ? "pt" : "en")}
                              fallback={`${s.n}. ${enBios[s.id] ?? s.en}`} t={t} />
                            <ExtLink href={`https://www.google.com/maps/search/${encodeURIComponent(t.eatNear)}/@${s.lat},${s.lng},17z`}>🍽 {t.eatNear}</ExtLink>
                            <button onClick={() => toggleDone(s.id)}>{done[s.id] ? t.visited : t.arrived}</button>
                          </div>
                          <StopReport t={t} city={city.id} stop={s.id} name={s.n} />
                          <CommentsButton t={t} locale={locale} city={city.id} stop={s.id} title={stopName(s, locale)} count={cmCounts[s.id] ?? 0} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {atPlace && bp.back ? (
              <>
                {hopView(bp.back)}
                <div className="stop endpoint"><span className="pin">{endIcon(trip.end)}</span><div className="body"><h3>{fmt(t.bpBack, { p: endName })}</h3>
                  {backAt && <p className="meta">{fmt(t.bpAround, { t: when(backAt) })}</p>}
                  {leave && <p className="meta">{endIcon(trip.end)} {fmt(t.tpReturnSub[trip.mode], { t: when(leave) })}</p>}</div></div>
              </>
            ) : (
              <>
                {legView(plan.ret)}
                <div className="stop endpoint"><span className="pin">✈</span><div className="body"><h3>{t.returnAirport}</h3>
                  {leave && <p className="meta">{fmt(t.tpReturnSub[trip.mode], { t: when(leave) })}</p>}</div></div>
              </>
            )}
          </div>
        )}

        {tab === "map" && online && <MapView stops={plan.stops} done={done} museums={museums} airport={city.ap} pos={geo.pos} focus={focus} t={t} gmapsKey={explore?.gmapsKey} />}

        {tab === "museums" && (
          <>
            {(accessPlan === "trip" || accessPlan === "all" || !flightDate) && (
              <DayPlan core={city.stops.filter((s) => !s.x)} extra={extras} museums={museums} t={t} extName={[...new Set(extras.map((s) => s.a))].join(", ")} />
            )}
            <p className="hint">{fmt(t.pcChecked, { d: new Intl.DateTimeFormat(INTL_LOCALE[locale], { month: "long", year: "numeric" }).format(new Date(`${PRICES_CHECKED}-15`)) })}</p>
            <MuseumsTab city={city} museums={museums} t={t} money={both} locale={locale}
              onMap={(m) => showOnMap({ lat: m.lat, lng: m.lng, name: m.n, walk: false })} />
          </>
        )}

        {tab === "cost" && (
          <>
            <div className="verdict">
              <div className={`opt ${plan.best === "singles" ? "best" : ""}`}>
                <span className={`tag ${plan.best === "singles" ? "" : "n"}`}>{plan.best === "singles" ? t.cheapest : t.singles}</span>
                <b className="num">{both(plan.singles)}</b>
                <small>{fmt(t.singlesN, { n: plan.rides, p: money(city.single) })}{city.card ? ` + ${city.cardName}` : ""} + {t.fixedLeg.toLowerCase()}</small>
              </div>
              {city.alt && plan.alt !== null ? (
                <div className={`opt ${plan.best === "alt" ? "best" : ""}`}>
                  <span className={`tag ${plan.best === "alt" ? "" : "n"}`}>{plan.best === "alt" ? t.cheapest : city.alt.type === "cap" ? t.capAuto : city.alt.name}</span>
                  <b className="num">{both(plan.alt)}</b>
                  <small>{city.alt.type === "cap" ? t.capAuto : city.alt.name} · {money(city.alt.price)}</small>
                </div>
              ) : <div className="opt"><span className="tag n">—</span><small>{t.only}</small></div>}
            </div>
            <div className="card rows" style={{ paddingBlock: 6 }}>
              <div><span>{t.fixedLeg}: {lineText(city.air.line, locale)}</span><span className="num">{money(plan.fixed)}</span></div>
              <div><span>{t.route}: {plan.rides} × {money(city.single)}</span><span className="num">{money(plan.rides * city.single)}</span></div>
              <div><span>{t.paidEntries}</span><span className="num">{money(plan.entries)}</span></div>
            </div>
            <p className="hint">{fmt(t.pcChecked, { d: new Intl.DateTimeFormat(INTL_LOCALE[locale], { month: "long", year: "numeric" }).format(new Date(`${PRICES_CHECKED}-15`)) })}</p>
            <CostPlanner cityId={city.id} t={t} locale={locale} transport={TRANSPORT[city.id] ?? []} museums={museums} base={plan.transport + plan.entries} money={both} cityName={cityLabel} center={cityCenterOf(city)} />
          </>
        )}

        {accessPlan !== "free" && accessPlan !== "preview" && doneN >= Math.max(1, Math.ceil(plan.stops.length / 2)) && (
          <RatingCard cityId={city.id} cityLabel={cityLabel} t={t} locale={locale}
            onShare={async () => { try { if (navigator.share) await navigator.share({ text: shareText }); else window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener"); } catch { /* cancelado */ } }} />
        )}

        <div className="card stack" style={{ gap: 10, padding: 14 }}>
          <b>{t.share}</b>
          <div className="share">
            <ExtLink href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}>WhatsApp</ExtLink>
            <ExtLink href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}>X</ExtLink>
            <button onClick={async () => {
              try { if (navigator.share) await navigator.share({ text: shareText }); else await navigator.clipboard.writeText(shareText); setCopied(true); } catch { /* cancelado */ }
            }}>{copied ? t.copied : t.copy}</button>
          </div>
        </div>
      </div>
      {fxOpen && (
        <Portal><div className="sheet-bg" onClick={() => setFxOpen(false)}>
          <div className="sheet stack" style={{ gap: 12 }} onClick={(e) => e.stopPropagation()}>
            <SheetX onClose={() => setFxOpen(false)} label={t.close} />
            <b style={{ fontSize: 18 }}>💱 {t.ttFx}</b>
            <FxConverter t={t} locale={locale} from={city.cur} />
          </div>
        </div></Portal>
      )}
    </>
  );
}

