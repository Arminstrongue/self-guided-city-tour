"use client";
import { useEffect, useMemo, useState } from "react";
import type { City, Leg, Stop } from "@/data/cities";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { fmt, INTL_LOCALE } from "@/i18n/dictionaries";
import { fitRoute, hasExtension, leaveBy, optionByKey, routeOptions } from "@/lib/route-cost";
import { AIRPORT_BUFFER_MIN } from "@/lib/pricing";
import { BackNow, CityGuide, dayNames, FlightCard, RouteFit, Speak, useGeo, WeatherCard, weekdayIn, type FlightOverride } from "./TourExtras";
import type { Offer } from "@/lib/merchants";
import { dualMoney, type FxContext } from "@/lib/currency";
import { CurrencyPicker } from "./CurrencyPicker";

type Props = {
  locale: Locale; t: Dict; city: City; cityLabel: string; flightAt: string | null;
  offers: Offer[]; otherCities: { id: string; name: string }[]; fx: FxContext;
  flightNo: string | null; flightApi: boolean;
};

const hrs = (m: number) => { const v = Math.max(0, Math.round(m)); return `${Math.floor(v / 60)} h ${String(v % 60).padStart(2, "0")}`; };

function useLocalState<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  useEffect(() => { try { const s = localStorage.getItem(key); if (s) setV(JSON.parse(s)); } catch { /* sem armazenamento */ } }, [key]);
  const set = (nv: T) => { setV(nv); try { localStorage.setItem(key, JSON.stringify(nv)); } catch { /* ignorar */ } };
  return [v, set] as const;
}

export function TourView({ locale, t, city, cityLabel, flightAt, offers, otherCities, fx, flightNo, flightApi }: Props) {
  const [lvl, setLvl] = useLocalState<string>(`sgct:lvl:${city.id}`, "");
  const [fo, setFo] = useLocalState<FlightOverride | null>("sgct:flight", null);
  const [done, setDone] = useLocalState<Record<string, boolean>>(`sgct:done:${city.id}`, {});
  const [open, setOpen] = useState<string>(city.stops[0].id);
  const [tab, setTab] = useState<"route" | "map" | "cost" | "guide">("route");
  const geo = useGeo();
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
  const voiceLang = locale === "pt" ? "pt-PT" : "en-GB";
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
                style={{ display: "block", fontFamily: "var(--display)", fontWeight: 800, fontSize: 22, border: 0, background: "none", padding: 0 }}>
                {otherCities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : <h2 style={{ fontSize: 22 }}>{cityLabel}</h2>}
          </div>
          <CurrencyPicker current={fx.cur} label={t.currency} />
          {leave && <div className="clock"><small>{t.leaveBy}</small><b className="num">{hm(leave)}</b></div>}
        </div>
        <div className="progress"><i style={{ width: `${(doneN / plan.stops.length) * 100}%` }} /></div>
        <div className="tabs" role="tablist">
          {(["route", "map", "cost", "guide"] as const).map((k) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{k === "route" ? t.route : k === "map" ? t.map : k === "cost" ? t.costs : t.guide}</button>
          ))}
        </div>
      </header>

      <div className="stack" style={{ marginTop: 14 }}>
        <div className="card stack" style={{ gap: 10, padding: 14 }}>
          <WeatherCard cityId={city.id} t={t} />
          <RouteFit options={options} value={chosen.key} onChange={setLvl} availMin={avail} t={t} extName={[...new Set(extras.map((s) => s.a))].join(", ")} />
          {!lvl && flightDate && <p className="hint">{t.fitAuto}</p>}
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
          {t.contentNote && locale !== "pt" && locale !== "en" && <p className="note">{t.contentNote}</p>}
        </div>

        {tab === "route" && (
          <BackNow city={city} flightAt={leave && flightDate ? flightDate : null} pos={geo.pos} geoState={geo.state} onGeo={geo.start}
            next={nextStop} now={now} t={t} locale={locale} />
        )}

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
                          <p>{desc(s)}</p>
                          {s.cl?.length ? <p className="hint">🕒 {fmt(t.closedNote, { d: dayNames(s.cl, locale) })}</p> : null}
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
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&travelmode=${s.leg.m === "walk" ? "walking" : "transit"}`} target="_blank" rel="noopener noreferrer">{t.directions}</a>
                            <Speak text={`${s.n}. ${desc(s)}`} lang={voiceLang} t={t} />
                            <a href={`https://www.google.com/maps/search/${encodeURIComponent(t.eatNear)}/@${s.lat},${s.lng},17z`} target="_blank" rel="noopener noreferrer">🍽 {t.eatNear}</a>
                            <button onClick={() => toggleDone(s.id)}>{done[s.id] ? t.visited : t.arrived}</button>
                          </div>
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

        {tab === "map" && <RouteMap stops={plan.stops} done={done} t={t} airMin={city.air.min} />}

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
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">X</a>
            <button onClick={async () => {
              try { if (navigator.share) await navigator.share({ text: shareText }); else await navigator.clipboard.writeText(shareText); setCopied(true); } catch { /* cancelado */ }
            }}>{copied ? t.copied : t.copy}</button>
          </div>
        </div>
      </div>
    </>
  );
}

function RouteMap({ stops, done, t, airMin }: { stops: Stop[]; done: Record<string, boolean>; t: Dict; airMin: number }) {
  const W = 360, H = 280, pad = 30, k = Math.cos((stops[0].lat * Math.PI) / 180);
  const xs = stops.map((s) => s.lng * k), ys = stops.map((s) => s.lat);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const sc = Math.min((W - 2 * pad) / (maxX - minX || 0.001), (H - 2 * pad) / (maxY - minY || 0.001));
  const ox = (W - (maxX - minX) * sc) / 2, oy = (H - (maxY - minY) * sc) / 2;
  const P = (s: Stop) => [ox + (s.lng * k - minX) * sc, H - oy - (s.lat - minY) * sc] as const;
  return (
    <>
      <div className="mapwrap">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.map}>
          {stops.slice(1).map((s, i) => {
            const [a, b] = P(stops[i]); const [x, y] = P(s); const paid = s.leg.m !== "walk";
            return <line key={s.id} x1={a} y1={b} x2={x} y2={y} stroke={paid ? "var(--tram)" : "var(--cobalt)"} strokeWidth={3} strokeDasharray={paid ? "6 5" : undefined} strokeLinecap="round" />;
          })}
          {stops.map((s, i) => {
            const [x, y] = P(s); const d = done[s.id];
            return (
              <g key={s.id}>
                <circle cx={x} cy={y} r={11} fill={d ? "var(--cobalt)" : "var(--surface)"} stroke="var(--cobalt)" strokeWidth={2} />
                <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={800} fill={d ? "var(--surface)" : "var(--cobalt)"}>{i + 1}</text>
              </g>
            );
          })}
          <text x={W - 8} y={16} textAnchor="end" fontSize={11} fill="var(--muted)">✈ {t.airport}: {airMin} min</text>
        </svg>
      </div>
      <div className="legend"><span>━ {t.walk}</span><span>┅ {t.metro} / {t.tram} / {t.bus}</span></div>
      <div className="card rows" style={{ paddingBlock: 6 }}>
        {stops.map((s, i) => <div key={s.id}><span>{i + 1}. {s.n}</span><span className="hint">{s.a}</span></div>)}
      </div>
    </>
  );
}
