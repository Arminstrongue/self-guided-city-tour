"use client";
import { useEffect, useMemo, useState } from "react";
import type { City, Leg, Stop } from "@/data/cities";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/dictionaries";
import { fitRoute, hasExtension, leaveBy, optionByKey, routeOptions } from "@/lib/route-cost";
import { AIRPORT_BUFFER_MIN } from "@/lib/pricing";
import { BackNow, CityGuide, dayNames, EatNearby, FlightCard, RouteFit, Speak, useGeo, WeatherCard, weekdayIn, type FlightOverride } from "./TourExtras";
import type { Offer } from "@/lib/merchants";
import { dualMoney, type FxContext } from "@/lib/currency";
import { CurrencyPicker } from "./CurrencyPicker";
import { ExtLink } from "./ExtLink";
import { MapView, type Focus } from "./MapView";
import { DayPlan, MuseumsTab } from "./Museums";
import { stopName } from "@/data/stop-names";
import type { Museum } from "@/data/museums";
import { Img, StopMedia, useCityMedia } from "./Media";
import { SosButton } from "./Safety";
import { COUNTRY } from "@/data/cities";

type Props = {
  locale: Locale; t: Dict; city: City; cityLabel: string; flightAt: string | null;
  offers: Offer[]; otherCities: { id: string; name: string }[]; fx: FxContext;
  flightNo: string | null; flightApi: boolean; museums: Museum[]; plan: string;
  bios: Record<string, { text: string; lang: string }>; enBios: Record<string, string>;
};

const hrs = (m: number) => { const v = Math.max(0, Math.round(m)); return `${Math.floor(v / 60)} h ${String(v % 60).padStart(2, "0")}`; };

function useLocalState<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  useEffect(() => { try { const s = localStorage.getItem(key); if (s) setV(JSON.parse(s)); } catch { /* sem armazenamento */ } }, [key]);
  const set = (nv: T) => { setV(nv); try { localStorage.setItem(key, JSON.stringify(nv)); } catch { /* ignorar */ } };
  return [v, set] as const;
}

export function TourView({ locale, t, city: cityIn, cityLabel, flightAt, offers, otherCities, fx, flightNo, flightApi, museums, plan: accessPlan, bios, enBios }: Props) {
  // Nomes das paragens no idioma do viajante (os dados estão em português).
  const city = useMemo(() => ({ ...cityIn, stops: cityIn.stops.map((s) => ({ ...s, n: stopName(s, locale) })) }), [cityIn, locale]);
  const [lvl, setLvl] = useLocalState<string>(`sgct:lvl:${city.id}`, "");
  const [fo, setFo] = useLocalState<FlightOverride | null>("sgct:flight", null);
  const [done, setDone] = useLocalState<Record<string, boolean>>(`sgct:done:${city.id}`, {});
  const [open, setOpen] = useState<string>(city.stops[0].id);
  const [tab, setTab] = useState<"route" | "map" | "cost" | "museums" | "guide">("route");
  const [focus, setFocus] = useState<Focus | null>(null);
  const showOnMap = (f: Focus) => { setFocus(f); setTab("map"); window.scrollTo({ top: 0 }); };
  const geo = useGeo();
  const cm = useCityMedia(city.id);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [online, setOnline] = useState(true);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const up = () => setOnline(navigator.onLine);
    up(); window.addEventListener("online", up); window.addEventListener("offline", up);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", up); };
  }, []);
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(i); }, []);

  // Voo: o que o viajante alterou neste dispositivo tem prioridade sobre o da compra.
  const flightIso = fo?.at ?? flightAt;
  const flightNoEff = fo?.no ?? flightNo ?? "";
  const flightDate = useMemo(() => (flightIso ? new Date(flightIso) : null), [flightIso]);
  const options = useMemo(() => routeOptions(city), [city]);
  // Sem escolha guardada: o roteiro mais completo que cabe no tempo até ao voo.
  const autoKey = useMemo(() => {
    if (!flightDate) return hasExtension(city) ? "ext" : "core";
    const avail = (flightDate.getTime() - Date.now()) / 60000 - AIRPORT_BUFFER_MIN;
    return fitRoute(city, avail)?.key ?? options[0].key;
  }, [city, flightDate, options]);
  const chosen = optionByKey(city, lvl) ?? optionByKey(city, autoKey) ?? options[options.length - 1];
  const plan = chosen.plan;
  const ext = chosen.key === "ext";
  // Tarifas na moeda da cidade (a que se paga na máquina) e, se diferente, o aproximado na moeda do viajante.
  const money = (v: number) => dualMoney(v, city.cur, fx, INTL_LOCALE[locale]).main;
  const both = (v: number) => { const d = dualMoney(v, city.cur, fx, INTL_LOCALE[locale]); return d.local ? <>{d.main} <span className="fx">{d.local}</span></> : d.main; };
  const hm = (d: Date) => d.toLocaleTimeString(INTL_LOCALE[locale], { hour: "2-digit", minute: "2-digit" });
  const leave = flightDate ? leaveBy(flightDate, plan.ret) : null;
  const today = weekdayIn(city.tz, now);
  const closedToday = (s: Stop) => Boolean(s.cl?.includes(today));
  const nextStop = plan.stops.find((s) => !done[s.id]) ?? null;
  const avail = leave ? Math.round((leave.getTime() - now) / 60000) : null;
  const fits = avail === null || avail >= plan.minutesTour;
  const extras = city.stops.filter((s) => s.x);
  const extraMin = extras.reduce((a, s) => a + s.v + s.leg.min, 0) + (city.ret.extra.min - city.ret.core.min);
  const doneN = plan.stops.filter((s) => done[s.id]).length;
  const desc = (s: Stop) => (locale === "pt" ? s.pt : s.en);

  const legView = (l: Leg) => {
    const cost = (l.f ?? 0) + (l.r ?? 0) * city.single;
    return (
      <div className="leg">
        {l.m === "walk"
          ? <span className="chip walk">{t.walk} · {t.free.toLowerCase()}</span>
          : <span className="chip paid num">{t[l.m]} · {money(cost)}</span>}
        <span>{l.line ? `${l.line} · ` : ""}<span className="num">{l.min} min</span></span>
      </div>
    );
  };

  function toggleDone(id: string) {
    const nv = { ...done, [id]: !done[id] };
    setDone(nv);
    if (nv[id]) { const i = plan.stops.findIndex((s) => s.id === id); const next = plan.stops[i + 1]; if (next) setOpen(next.id); }
  }

  async function remind() {
    if (!leave) return;
    const at = new Date(leave.getTime() - 15 * 60_000);
    const body = fmt(t.notifyBody, { t: hm(leave) });
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    try {
      if (cap?.isNativePlatform?.()) {
        // App nativa: notificação agendada no sistema, funciona com a app fechada.
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        const perm = await LocalNotifications.requestPermissions();
        if (perm.display !== "granted") return setNotice(t.notifyDenied);
        await LocalNotifications.schedule({ notifications: [{ id: 1, title: t.notifyTitle, body, schedule: { at } }] });
      } else {
        // Navegador: aviso enquanto a página estiver aberta.
        if (!("Notification" in window) || (await Notification.requestPermission()) !== "granted") return setNotice(t.notifyDenied);
        const ms = Math.max(0, at.getTime() - Date.now());
        setTimeout(() => {
          const show = () => { new Notification(t.notifyTitle, { body }); };
          navigator.serviceWorker?.getRegistration()
            .then((r) => { if (r) void r.showNotification(t.notifyTitle, { body }); else show(); })
            .catch(show);
        }, ms);
      }
      setNotice(fmt(t.notifyOn, { t: hm(at) }));
    } catch { setNotice(t.notifyDenied); }
  }

  const shareText = fmt(t.shareText, { city: cityLabel, n: plan.stops.length, c: money(plan.transport) });

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
          <CurrencyPicker current={fx.cur} label={t.currency} />
          {leave && <div className="clock"><small>{t.leaveBy}</small><b className="num">{hm(leave)}</b></div>}
        </div>
        <div className="progress"><i style={{ width: `${(doneN / plan.stops.length) * 100}%` }} /></div>
        <div className="tabs" role="tablist">
          {(["route", "map", "cost", "museums", "guide"] as const).map((k) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => { setTab(k); if (k === "map") setFocus(null); }}>{k === "route" ? t.route : k === "map" ? t.map : k === "cost" ? t.costs : k === "museums" ? t.museums : t.guide}</button>
          ))}
        </div>
      </header>

      <div className="stack" style={{ marginTop: 14 }}>
        <div className="card stack" style={{ gap: 10, padding: 14 }}>
          <WeatherCard cityId={city.id} t={t} />
          <RouteFit options={options} value={chosen.key} onChange={setLvl} availMin={avail} t={t} extName={[...new Set(extras.map((s) => s.a))].join(", ")} />
          {!lvl && flightDate && fits && <p className="hint">{t.fitAuto}</p>}
          {hasExtension(city) && <p className="hint">{t.extras}: {fmt(t.extrasSub, { n: extras.length, h: hrs(extraMin) })}</p>}
          {avail !== null && leave && (
            <p className={`fit ${fits ? "ok" : "bad"}`}>
              {fits ? fmt(t.fitsOk, { a: hrs(plan.minutesTour), b: hrs(avail) })
                : avail <= 0 ? fmt(t.late, { t: hm(leave) })
                  : fmt(t.fitsBad, { a: hrs(plan.minutesTour), b: hrs(avail) }) + (ext && hasExtension(city) ? t.fitsTip : t.fitsTip2)}
            </p>
          )}
          {leave && avail !== null && avail > 15 && (
            notice ? <p className="hint">🔔 {notice}</p> : <button className="btn ghost" style={{ padding: 10, fontSize: 14 }} onClick={remind}>🔔 {t.notifyBtn}</button>
          )}
          <FlightCard city={city} flightNo={flightNoEff} flightAt={flightDate} enabled={flightApi} t={t} locale={locale}
            onUse={(iso) => setFo({ at: iso, no: flightNoEff })} onEdit={(o) => setFo(o)} />
          {!online && <p className="note">{t.offline}</p>}
          {t.contentNote && Object.values(bios)[0]?.lang !== locale && <p className="note">{t.contentNote}</p>}
        </div>

        {tab === "route" && (
          <BackNow city={city} cityName={cityLabel} flightAt={leave && flightDate ? flightDate : null} pos={geo.pos} geoState={geo.state} onGeo={geo.start}
            next={nextStop} now={now} t={t} locale={locale} />
        )}

        <SosButton cityId={city.id} country={COUNTRY[city.id]} cityName={cityLabel} center={{ lat: city.stops[0].lat, lng: city.stops[0].lng }} t={t} locale={locale} />
        {tab === "guide" && <CityGuide city={city} cityLabel={cityLabel} t={t} locale={locale} money={both} />}

        {tab === "route" && (
          <div className="route">
            <div className="stop endpoint"><span className="pin">✈</span><div className="body"><h3>{t.airport}</h3>
              {city.cardName && <p className="meta">{fmt(t.fromAirport, { card: city.cardName + (city.card ? ` (${money(city.card)})` : "") })}</p>}</div></div>
            {legView(city.air)}
            {plan.stops.map((s, i) => {
              const here = offers.filter((o) => o.stopId === s.id);
              const isOpen = open === s.id;
              return (
                <div key={s.id}>
                  {i > 0 && legView(s.leg)}
                  <div className={`stop ${done[s.id] ? "done" : ""}`}>
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
                              <span className="label">{t.nearby}</span>
                              <div className="offers">
                                {here.map((o) => (
                                  <div key={o.id} className="offer">
                                    <div>
                                      <span className="cat">{t.cats[o.category as keyof Dict["cats"]] ?? o.category}</span>
                                      <b>{o.name}</b>{o.offer}
                                      {o.instagram && <div className="hint">@{o.instagram}</div>}
                                    </div>
                                    {o.featured && <span className="feat">{t.featured}</span>}
                                  </div>
                                ))}
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
                          <EatNearby cityId={city.id} stopId={s.id} locale={locale} t={t} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {legView(plan.ret)}
            <div className="stop endpoint"><span className="pin">✈</span><div className="body"><h3>{t.returnAirport}</h3>
              {leave && <p className="meta">{fmt(t.returnSub, { t: hm(leave) })}</p>}</div></div>
          </div>
        )}

        {tab === "map" && <MapView stops={plan.stops} done={done} museums={museums} airport={city.ap} pos={geo.pos} focus={focus} t={t} />}

        {tab === "museums" && (
          <>
            {(accessPlan === "trip" || accessPlan === "all" || !flightDate) && (
              <DayPlan core={city.stops.filter((s) => !s.x)} extra={extras} museums={museums} t={t} extName={[...new Set(extras.map((s) => s.a))].join(", ")} />
            )}
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
              <div><span>{t.fixedLeg}: {city.air.line}</span><span className="num">{money(plan.fixed)}</span></div>
              <div><span>{t.route}: {plan.rides} × {money(city.single)}</span><span className="num">{money(plan.rides * city.single)}</span></div>
              <div><span>{t.paidEntries}</span><span className="num">{money(plan.entries)}</span></div>
              <div><b>{t.totalDay}</b><b className="num">{both(plan.transport + plan.entries)}</b></div>
            </div>
            <p className="hint">{t.costNote}</p>
          </>
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
    </>
  );
}

