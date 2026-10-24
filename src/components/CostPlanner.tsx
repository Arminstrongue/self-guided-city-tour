"use client";
/** Custos: todos os transportes da cidade e outras atrações/despesas, somados ao total do dia (guardado no dispositivo). */
import { useEffect, useMemo, useState } from "react";
import { fmt } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { TRANSPORT, type Transport } from "@/data/transport";
import type { Museum } from "@/data/museums";

type Extra = { id: string; name: string; price: number; qty: number };
type State = { tr: Record<string, number>; mu: Record<string, number>; extras: Extra[] };
const EMPTY: State = { tr: {}, mu: {}, extras: [] };

/** Tipo de paragem para procurar no mapa (o Google Maps mostra as próximas partidas de cada estação). */
const STOP_Q: Record<string, string> = { "🚇": "metro station", "🚋": "tram stop", "🚊": "tram stop", "🚌": "bus stop", "🚆": "train station", "⛴": "ferry terminal", "🚠": "funicular", "🚡": "cable car" };

export function CostPlanner({ cityId, t, locale, museums, base, money, cityName, center }: {
  cityId: string; t: Dict; locale: Locale; museums: Museum[]; base: number; money: (v: number) => React.ReactNode;
  cityName: string; center: { lat: number; lng: number };
}) {
  const key = `sgct:costs:${cityId}`;
  const [s, setS] = useState<State>(EMPTY);
  const [form, setForm] = useState({ name: "", price: "" });
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(key) ?? "null"); if (v && v.tr) setS(v); } catch { /* ignorar */ } }, [key]);
  const save = (n: State) => { setS(n); try { localStorage.setItem(key, JSON.stringify(n)); } catch { /* ignorar */ } };
  const step = (k: "tr" | "mu", id: string, d: number) => save({ ...s, [k]: { ...s[k], [id]: Math.max(0, (s[k][id] ?? 0) + d) } });
  const name = (x: Transport) => (locale === "pt" ? x.pt : x.en);
  const transport = TRANSPORT[cityId] ?? [];
  const sumTr = useMemo(() => transport.reduce((a, x) => a + x.price * (s.tr[x.id] ?? 0), 0), [transport, s.tr]);
  const sumMu = useMemo(() => museums.reduce((a, x) => a + x.price * (s.mu[x.id] ?? 0), 0), [museums, s.mu]);
  const sumEx = s.extras.reduce((a, x) => a + x.price * x.qty, 0);
  const total = base + sumTr + sumMu + sumEx;
  const Stepper = ({ n, on }: { n: number; on: (d: number) => void }) => (
    <span className="cp-step"><button aria-label="−" onClick={() => on(-1)} disabled={!n}>−</button><b className="num">{n}</b><button aria-label="+" onClick={() => on(1)}>+</button></span>
  );
  return (
    <div className="stack" style={{ gap: 14 }}>
      <section className="card stack cp">
        <b>🚇 {t.cpTransport}</b>
        {transport.map((x) => (
          <div key={x.id} className={`cp-row ${(s.tr[x.id] ?? 0) > 0 ? "on" : ""}`}>
            <span className="cp-ic" aria-hidden="true">{x.icon}</span>
            <span className="stack" style={{ gap: 0, flex: 1, minWidth: 0 }}><span className="cp-n">{name(x)}</span><span className="hint num">{x.price === 0 ? t.exFreeEntry : <>{money(x.price)} / {t.cpUnit[x.u]}</>}</span>
              {STOP_Q[x.icon] && x.u === "trip" && (
                <a className="cp-times" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${STOP_Q[x.icon]} ${cityName}`)}&center=${center.lat},${center.lng}`} target="_blank" rel="noopener noreferrer">🕒 {t.rfTimes} ↗</a>
              )}</span>
            <Stepper n={s.tr[x.id] ?? 0} on={(d) => step("tr", x.id, d)} />
          </div>
        ))}
      </section>

      {museums.length > 0 && (
        <section className="card stack cp">
          <b>🎟 {t.cpEntries}</b>
          {museums.map((x) => (
            <div key={x.id} className={`cp-row ${(s.mu[x.id] ?? 0) > 0 ? "on" : ""}`}>
              <span className="cp-ic" aria-hidden="true">🏛</span>
              <span className="stack" style={{ gap: 0, flex: 1, minWidth: 0 }}><span className="cp-n">{x.n}</span><span className="hint num">{x.price === 0 ? t.exFreeEntry : money(x.price)}</span></span>
              <Stepper n={s.mu[x.id] ?? 0} on={(d) => step("mu", x.id, d)} />
            </div>
          ))}
        </section>
      )}

      <section className="card stack cp">
        <b>➕ {t.cpExtras}</b>
        {s.extras.map((x) => (
          <div key={x.id} className="cp-row on">
            <span className="cp-ic" aria-hidden="true">🧾</span>
            <span className="stack" style={{ gap: 0, flex: 1, minWidth: 0 }}><span className="cp-n">{x.name}</span><span className="hint num">{money(x.price)}</span></span>
            <Stepper n={x.qty} on={(d) => save({ ...s, extras: s.extras.map((e) => (e.id === x.id ? { ...e, qty: Math.max(0, e.qty + d) } : e)).filter((e) => e.qty > 0) })} />
          </div>
        ))}
        <form className="cp-add" onSubmit={(e) => {
          e.preventDefault();
          const price = Number(form.price.replace(",", "."));
          if (!form.name.trim() || !Number.isFinite(price) || price < 0) return;
          save({ ...s, extras: [...s.extras, { id: Math.random().toString(36).slice(2, 9), name: form.name.trim().slice(0, 80), price, qty: 1 }] });
          setForm({ name: "", price: "" });
        }}>
          <input placeholder={t.cpName} value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label={t.cpName} />
          <input placeholder={t.cpPrice} inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} aria-label={t.cpPrice} style={{ flex: "none", width: 90 }} />
          <button className="btn press" style={{ width: "auto", padding: "10px 16px" }}>{t.cpAdd}</button>
        </form>
      </section>

      <section className="card rows cp-total" style={{ paddingBlock: 6 }}>
        <div><span>{t.cpBase}</span><span className="num">{money(base)}</span></div>
        {sumTr > 0 && <div><span>{t.cpTransport}</span><span className="num">{money(sumTr)}</span></div>}
        {sumMu > 0 && <div><span>{t.cpEntries}</span><span className="num">{money(sumMu)}</span></div>}
        {sumEx > 0 && <div><span>{t.cpExtras}</span><span className="num">{money(sumEx)}</span></div>}
        <div><b>{t.cpTotal}</b><b className="num">{money(total)}</b></div>
      </section>
      {(sumTr + sumMu + sumEx) > 0 && <button className="link-btn" onClick={() => save(EMPTY)}>{t.cpReset}</button>}
      <p className="hint">{fmt(t.cpNote, {})}</p>
    </div>
  );
}
