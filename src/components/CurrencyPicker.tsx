"use client";
import { CURRENCIES, CURRENCY_COOKIE } from "@/lib/currency";

/** Seletor de moeda: guarda a escolha durante 12 meses e recarrega a página. */
export function CurrencyPicker({ current, label }: { current: string; label: string }) {
  return (
    <select
      className="cur-pick" aria-label={label} title={label} value={current}
      onChange={(e) => {
        document.cookie = `${CURRENCY_COOKIE}=${e.target.value}; path=/; max-age=${365 * 86400}; samesite=lax`;
        window.location.reload();
      }}
    >
      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
  );
}
