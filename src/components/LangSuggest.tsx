"use client";
import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { FLAG, LANG_NAMES, LANG_SRC, countryLang, deviceLang, switchLang } from "./Header";

const OK = "sgct_lang_ok";
const done = () => { document.cookie = `${OK}=1; path=/; max-age=31536000; samesite=lax`; };

/**
 * Na primeira visita, se o idioma do país e o do dispositivo forem diferentes (ou diferentes do atual),
 * pergunta uma vez qual prefere. A escolha fica guardada; o seletor do topo continua disponível.
 */
export function LangSuggest({ locale }: { locale: string }) {
  const [opts, setOpts] = useState<{ v: string; why: string }[] | null>(null);
  useEffect(() => {
    if (document.cookie.includes(`${OK}=1`)) return;
    const [, cl, dl] = LANG_SRC[locale] ?? LANG_SRC.en;
    const c = countryLang(), d = deviceLang();
    const out: { v: string; why: string }[] = [];
    if (c) out.push({ v: c, why: cl });
    if (d) { const same = out.find((x) => x.v === d); if (same) same.why = `${cl} · ${dl}`; else out.push({ v: d, why: dl }); }
    if (!out.some((x) => x.v === locale)) out.unshift({ v: locale, why: "" });
    if (out.length < 2) { done(); return; }
    const id = setTimeout(() => setOpts(out), 900);
    return () => clearTimeout(id);
  }, [locale]);
  if (!opts) return null;
  const [q] = LANG_SRC[locale] ?? LANG_SRC.en;
  const close = () => { done(); setOpts(null); };
  return (
    <div className="ls-ban" role="dialog" aria-label={q}>
      <div className="ls-top"><b>{q}</b><button type="button" className="ls-x press" onClick={close} aria-label="✕"><X size={16} aria-hidden="true" /></button></div>
      <div className="ls-opts">
        {opts.map((x) => (
          <button key={x.v} type="button" lang={x.v} className={`ls-o press${x.v === locale ? " on" : ""}`} onClick={() => (x.v === locale ? close() : switchLang(x.v))}>
            <span className="ls-f" aria-hidden="true">{FLAG[x.v] ?? "🌐"}</span>
            <span className="ls-t"><b>{LANG_NAMES[x.v] ?? x.v}</b>{x.why && <small lang={locale}>{x.why}</small>}</span>
            {x.v === locale && <Check size={16} strokeWidth={2.8} aria-hidden="true" />}
          </button>
        ))}
      </div>
    </div>
  );
}
