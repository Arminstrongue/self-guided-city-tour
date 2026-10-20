"use client";
import { useMemo, useState } from "react";
import type { Alt, City, Leg, Mode, Stop } from "@/data/cities";
import { planRoute } from "@/lib/route-cost";

type Props = { initial: City; isNew: boolean; edited: boolean; active: boolean; locale: string };
const MODES: [Mode, string][] = [["walk", "A pé"], ["metro", "Metro"], ["tram", "Elétrico"], ["bus", "Autocarro"], ["train", "Comboio"], ["ferry", "Ferry / barco"], ["car", "Táxi / Uber"]];
const LANGS = ["pt", "en", "es", "fr", "de"] as const;

const num = (v: string) => (v === "" ? undefined : Number(v.replace(",", ".")));
const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <div className="field" style={wide ? { gridColumn: "1 / -1" } : undefined}><label>{label}</label>{children}</div>;
}

function LegEditor({ leg, onChange, title }: { leg: Leg; onChange: (l: Leg) => void; title: string }) {
  return (
    <fieldset className="card" style={{ padding: 12 }}>
      <legend className="label">{title}</legend>
      <div className="ed-grid">
        <Field label="Meio"><select value={leg.m} onChange={(e) => onChange({ ...leg, m: e.target.value as Mode })}>{MODES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
        <Field label="Minutos"><input type="number" min={0} value={leg.min} onChange={(e) => onChange({ ...leg, min: num(e.target.value) ?? 0 })} /></Field>
        <Field label="Viagens com tarifa da cidade"><input type="number" min={0} value={leg.r ?? ""} onChange={(e) => onChange({ ...leg, r: num(e.target.value) })} /></Field>
        <Field label="Bilhete fixo (ex.: aeroporto)"><input type="number" step="0.01" min={0} value={leg.f ?? ""} onChange={(e) => onChange({ ...leg, f: num(e.target.value) })} /></Field>
        <Field label="Linha / indicação" wide><input value={leg.line ?? ""} onChange={(e) => onChange({ ...leg, line: e.target.value })} /></Field>
      </div>
    </fieldset>
  );
}

export function CityEditor({ initial, isNew, edited, active: initialActive, locale }: Props) {
  const [c, setC] = useState<City>(initial);
  const [active, setActive] = useState(initialActive);
  const [open, setOpen] = useState<number | null>(isNew ? null : 0);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string; issues?: { path: string; message: string }[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const set = (patch: Partial<City>) => setC((p) => ({ ...p, ...patch }));
  const setStop = (i: number, s: Stop) => setC((p) => ({ ...p, stops: p.stops.map((x, j) => (j === i ? s : x)) }));
  const move = (i: number, d: number) => setC((p) => { const a = [...p.stops]; const j = i + d; if (j < 0 || j >= a.length) return p; [a[i], a[j]] = [a[j], a[i]]; return { ...p, stops: a }; });

  const preview = useMemo(() => {
    if (c.stops.length < 2) return null;
    try { return { core: planRoute(c, false), ext: planRoute(c, true) }; } catch { return null; }
  }, [c]);

  async function save() {
    setBusy(true); setMsg(null);
    const res = await fetch(`/api/admin/content/${c.id || "x"}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ city: c, active }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setMsg({ kind: "ok", text: "Guardado. As alterações já estão na app." });
      if (isNew) window.location.href = `/${locale}/admin/content/${c.id}`;
    } else setMsg({ kind: "err", text: data.error === "invalid" ? "Há campos por corrigir:" : data.error === "id_mismatch" ? "Indique um código de cidade válido (2 a 5 letras minúsculas)." : "Não foi possível guardar. Tente outra vez.", issues: data.issues });
  }
  async function reset() {
    if (!confirmReset) return setConfirmReset(true);
    setBusy(true);
    await fetch(`/api/admin/content/${c.id}`, { method: "DELETE" });
    window.location.reload();
  }

  const altType = c.alt?.type ?? "none";
  const setAlt = (a: Alt | null) => set({ alt: a });

  return (
    <div className="stack">
      <section className="card stack">
        <h2 style={{ fontSize: 20 }}>Geral</h2>
        <div className="ed-grid">
          <Field label="Código (2–5 letras, usado no QR)"><input value={c.id} disabled={!isNew} onChange={(e) => set({ id: e.target.value.toLowerCase().replace(/[^a-z]/g, "").slice(0, 5) })} /></Field>
          <Field label="Moeda"><select value={c.cur} onChange={(e) => set({ cur: e.target.value as City["cur"] })}><option>EUR</option><option>GBP</option><option>TRY</option></select></Field>
          {LANGS.map((l) => <Field key={l} label={`Nome (${l.toUpperCase()})`}><input value={c.n[l] ?? ""} onChange={(e) => set({ n: { ...c.n, [l]: e.target.value } })} /></Field>)}
          <Field label="Bilhete simples"><input type="number" step="0.01" value={c.single} onChange={(e) => set({ single: num(e.target.value) ?? 0 })} /></Field>
          <Field label="Cartão recarregável (preço)"><input type="number" step="0.01" value={c.card} onChange={(e) => set({ card: num(e.target.value) ?? 0 })} /></Field>
          <Field label="Nome do cartão"><input value={c.cardName} onChange={(e) => set({ cardName: e.target.value })} /></Field>
          <Field label="Alternativa aos bilhetes simples">
            <select value={altType} onChange={(e) => {
              const t = e.target.value;
              setAlt(t === "none" ? null : t === "pack" ? { type: "pack", price: c.alt?.price ?? 0, n: 10, name: c.alt?.name ?? "" } : { type: t as "pass" | "cap", price: c.alt?.price ?? 0, name: c.alt?.name ?? "" });
            }}>
              <option value="none">Nenhuma</option><option value="pass">Passe diário</option><option value="pack">Pacote de viagens</option><option value="cap">Teto diário automático</option>
            </select>
          </Field>
          {c.alt && <>
            <Field label="Preço da alternativa"><input type="number" step="0.01" value={c.alt.price} onChange={(e) => setAlt({ ...c.alt!, price: num(e.target.value) ?? 0 } as Alt)} /></Field>
            <Field label="Nome da alternativa"><input value={c.alt.name} onChange={(e) => setAlt({ ...c.alt!, name: e.target.value } as Alt)} /></Field>
            {c.alt.type === "pack" && <Field label="Viagens no pacote"><input type="number" value={c.alt.n} onChange={(e) => setAlt({ ...c.alt!, n: num(e.target.value) ?? 10 } as Alt)} /></Field>}
            {c.alt.type === "pass" && <Field label="Inclui o aeroporto?"><select value={c.alt.includesAirport ? "1" : "0"} onChange={(e) => setAlt({ ...c.alt!, includesAirport: e.target.value === "1" } as Alt)}><option value="0">Não</option><option value="1">Sim</option></select></Field>}
          </>}
          <Field label="Visível na app"><select value={active ? "1" : "0"} onChange={(e) => setActive(e.target.value === "1")}><option value="1">Sim</option><option value="0">Não (oculta)</option></select></Field>
        </div>
      </section>

      <section className="card stack">
        <h2 style={{ fontSize: 20 }}>Ligações ao aeroporto</h2>
        <LegEditor title="Aeroporto → 1.ª paragem" leg={c.air} onChange={(air) => set({ air })} />
        <LegEditor title="Regresso sem extensão" leg={c.ret.core} onChange={(core) => set({ ret: { ...c.ret, core } })} />
        <LegEditor title="Regresso com extensão" leg={c.ret.extra} onChange={(extra) => set({ ret: { ...c.ret, extra } })} />
      </section>

      <section className="card stack">
        <div className="top-row"><h2 style={{ fontSize: 20 }}>Paragens ({c.stops.length})</h2>
          <button className="mini" onClick={() => { setC((p) => ({ ...p, stops: [...p.stops, { id: `paragem-${p.stops.length + 1}`, n: "", a: "", lat: 0, lng: 0, v: 15, leg: { m: "walk", min: 10, line: "" }, pt: "", en: "" }] })); setOpen(c.stops.length); }}>+ Paragem</button></div>
        {c.stops.map((s, i) => (
          <div key={i} className="card" style={{ padding: 12 }}>
            <div className="top-row">
              <button className="stop-toggle" onClick={() => setOpen(open === i ? null : i)}><b>{i + 1}. {s.n || "(sem nome)"}</b> <span className="hint">{s.a}{s.x ? " · extensão" : ""}{s.top ? " · top" : ""}</span></button>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="mini" onClick={() => move(i, -1)} aria-label="Subir">↑</button>
                <button className="mini" onClick={() => move(i, 1)} aria-label="Descer">↓</button>
                <button className="mini" onClick={() => setC((p) => ({ ...p, stops: p.stops.filter((_, j) => j !== i) }))}>Remover</button>
              </div>
            </div>
            {open === i && (
              <div className="stack" style={{ marginTop: 10 }}>
                <div className="ed-grid">
                  <Field label="Nome"><input value={s.n} onChange={(e) => setStop(i, { ...s, n: e.target.value, id: isNew || !initial.stops.some((o) => o.id === s.id) ? slug(e.target.value) || s.id : s.id })} /></Field>
                  <Field label="Bairro / zona"><input value={s.a} onChange={(e) => setStop(i, { ...s, a: e.target.value })} /></Field>
                  <Field label="Latitude"><input type="number" step="0.0001" value={s.lat} onChange={(e) => setStop(i, { ...s, lat: num(e.target.value) ?? 0 })} /></Field>
                  <Field label="Longitude"><input type="number" step="0.0001" value={s.lng} onChange={(e) => setStop(i, { ...s, lng: num(e.target.value) ?? 0 })} /></Field>
                  <Field label="Minutos de visita"><input type="number" value={s.v} onChange={(e) => setStop(i, { ...s, v: num(e.target.value) ?? 0 })} /></Field>
                  <Field label="Custo incluído (opcional)"><input type="number" step="0.01" value={s.c ?? ""} onChange={(e) => setStop(i, { ...s, c: num(e.target.value) })} /></Field>
                  <Field label="Marcações" wide>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <label><input type="checkbox" checked={Boolean(s.top)} onChange={(e) => setStop(i, { ...s, top: e.target.checked })} /> Ponto mais famoso</label>
                      <label><input type="checkbox" checked={Boolean(s.x)} onChange={(e) => setStop(i, { ...s, x: e.target.checked })} /> Faz parte da extensão</label>
                      <label><input type="checkbox" checked={Boolean(s.o)} onChange={(e) => setStop(i, { ...s, o: e.target.checked })} /> Interior pago opcional</label>
                    </div>
                  </Field>
                  <Field label="Texto (PT)" wide><textarea rows={3} value={s.pt} onChange={(e) => setStop(i, { ...s, pt: e.target.value })} /></Field>
                  <Field label="Texto (EN)" wide><textarea rows={3} value={s.en} onChange={(e) => setStop(i, { ...s, en: e.target.value })} /></Field>
                  <Field label="Identificador (usado pelos comerciantes)"><input value={s.id} disabled={initial.stops.some((o) => o.id === s.id) && !isNew} onChange={(e) => setStop(i, { ...s, id: slug(e.target.value) })} /></Field>
                </div>
                <LegEditor title={i === 0 ? "Ligação (a 1.ª paragem usa a ligação ao aeroporto)" : "Como chegar desde a paragem anterior"} leg={s.leg} onChange={(leg) => setStop(i, { ...s, leg })} />
              </div>
            )}
          </div>
        ))}
      </section>

      {preview && (
        <section className="card stack" style={{ gap: 6 }}>
          <h2 style={{ fontSize: 20 }}>Pré-visualização do cálculo</h2>
          <div className="rows">
            <div><span>Sem extensão: {preview.core.stops.length} paragens, {Math.round(preview.core.minutesTour / 6) / 10} h</span><b className="num">{preview.core.transport.toFixed(2)} {c.cur} ({preview.core.best === "singles" ? "bilhetes simples" : c.alt?.name})</b></div>
            <div><span>Com extensão: {preview.ext.stops.length} paragens, {Math.round(preview.ext.minutesTour / 6) / 10} h</span><b className="num">{preview.ext.transport.toFixed(2)} {c.cur} ({preview.ext.best === "singles" ? "bilhetes simples" : c.alt?.name})</b></div>
          </div>
        </section>
      )}

      {msg && (
        <div className={msg.kind === "ok" ? "fit ok" : "fit bad"} role="status">
          {msg.text}
          {msg.issues && <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>{msg.issues.slice(0, 10).map((x, k) => <li key={k}><code>{x.path}</code>: {x.message}</li>)}</ul>}
        </div>
      )}
      <div className="ed-actions">
        <button className="btn tram" onClick={save} disabled={busy}>{busy ? "A guardar…" : "Guardar e publicar"}</button>
        {edited && !isNew && <button className="btn ghost" onClick={reset} disabled={busy}>{confirmReset ? "Confirmar: repor o conteúdo de origem" : "Repor conteúdo de origem"}</button>}
      </div>
    </div>
  );
}
