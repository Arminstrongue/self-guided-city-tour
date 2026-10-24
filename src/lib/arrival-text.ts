"use client";
/**
 * Passos de «Acabei de chegar» noutras línguas: o texto base está em pt/en (data/arrivals*.ts);
 * os pacotes por língua (data/arrivals-i18n/<l>.json) são carregados só quando necessários.
 */
import { useEffect, useState } from "react";

type Pack = { taxiApp: string; taxiRide: string; s: string[] };
export const ARRIVAL_LANGS = ["es", "fr", "de", "it", "zh", "ar", "ja", "ko", "ru", "tr"] as const;
const TAXI_APP = /^Turn on data or airport Wi-Fi and book in the app \((.+)\), or follow the Taxi signs to the official rank\.$/;
const TAXI_RIDE = /^Ride to the centre \((.+)\)\.$/;

export function makeTx(locale: string, keys: string[] | null, pack: Pack | null) {
  const map = keys && pack ? new Map(keys.map((k, i) => [k, pack.s[i]])) : null;
  return (s: { pt: string; en: string }) => {
    if (locale === "pt") return s.pt;
    if (!map || !pack) return s.en;
    const hit = map.get(s.en);
    if (hit) return hit;
    const a = TAXI_APP.exec(s.en); if (a) return pack.taxiApp.replace("{apps}", a[1]);
    const r = TAXI_RIDE.exec(s.en); if (r) return pack.taxiRide.replace("{to}", r[1]);
    return s.en;
  };
}

/** Função de tradução dos passos; mostra inglês até o pacote chegar (é pequeno e fica em cache). */
export function useArrivalTx(locale: string) {
  const [data, setData] = useState<{ keys: string[]; pack: Pack } | null>(null);
  useEffect(() => {
    if (!(ARRIVAL_LANGS as readonly string[]).includes(locale)) return;
    let live = true;
    void Promise.all([import("@/data/arrivals-i18n/keys.json"), import(`@/data/arrivals-i18n/${locale}.json`)])
      .then(([k, p]) => { if (live) setData({ keys: (k.default ?? k) as string[], pack: (p.default ?? p) as Pack }); }).catch(() => null);
    return () => { live = false; };
  }, [locale]);
  return makeTx(locale, data?.keys ?? null, data?.pack ?? null);
}
