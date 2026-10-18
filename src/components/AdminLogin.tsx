"use client";
import { useState } from "react";

/** Entrada na administração por link no email (só funciona para os emails em ADMIN_EMAILS). */
export function AdminLogin({ locale, expired, social }: { locale: string; expired?: boolean; social: { id: string; name: string }[] }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "err">("idle");
  const [dev, setDev] = useState<string | null>(null);
  return (
    <div className="login-wrap">
      <div className="card login-card stack" style={{ gap: 14 }}>
        <span className="login-badge" aria-hidden="true">🔐</span>
        <h1 style={{ fontSize: 26 }}>Administração</h1>
        {expired && <p className="note">O link expirou ou não é válido. Peça um novo.</p>}
        {state === "sent" ? (
          <>
            <p>Se <b>{email}</b> for um email de administração, enviámos um link de entrada. Vale 20 minutos.</p>
            {dev && <a className="mini" href={dev}>Abrir link (só em desenvolvimento)</a>}
            <button className="link-btn" onClick={() => setState("idle")}>Usar outro email</button>
          </>
        ) : (
          <form className="stack" style={{ gap: 12 }} onSubmit={async (e) => {
            e.preventDefault(); setState("busy");
            const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, locale }) }).catch(() => null);
            const j = r?.ok ? await r.json().catch(() => ({})) : null;
            if (!j) return setState("err");
            setDev(j.devLink ?? null); setState("sent");
          }}>
            <p className="hint">Receba um link de entrada no seu email.</p>
            <label className="field"><span className="label">Email</span>
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@empresa.com" /></label>
            <button className="btn press" disabled={state === "busy"}>{state === "busy" ? "A enviar…" : "Enviar link de entrada"}</button>
            {state === "err" && <p className="bad-txt" style={{ fontSize: 14 }}>Não foi possível enviar. Tente daqui a um minuto.</p>}
          </form>
        )}
        {social.length > 0 && <>
          <div className="or">ou</div>
          {social.map((p) => <a key={p.id} className="btn ghost press" href={`/api/auth/signin/${p.id}?callbackUrl=/${locale}/admin`}>Entrar com {p.name}</a>)}
        </>}
      </div>
    </div>
  );
}
