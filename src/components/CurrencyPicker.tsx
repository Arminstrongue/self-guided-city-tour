"use client";
import { CURRENCIES, CURRENCY_COOKIE } from "@/lib/currency";

/** Seletor de moeda: guarda a escolha durante 12 meses e recarrega a página. `pill` = botão compacto em vidro. */
export function CurrencyPicker({ current, label, pill = false }: { current: string; label: string; pill?: boolean }) {
  const sel = (
    <select
      className={pill ? undefined : "cur-pick"} aria-label={label} title={label} value={current}
      onChange={(e) => {
        document.cookie = `${CURRENCY_COOKIE}=${e.target.value}; path=/; max-age=${365 * 86400}; samesite=lax`;
        window.location.reload();
      }}
    >
      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
  );
  if (!pill) return sel;
  return <label className="pick press"><span className="num">{current}</span>{sel}</label>;
}
