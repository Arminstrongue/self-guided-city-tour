/** Meteorologia por cidade (Open-Meteo, sem chave), guardada 30 minutos em memória. */
export type Hour = { t: string; temp: number; rain: number; code: number };
export type Weather = { now: Hour | null; hours: Hour[] };

const cache = new Map<string, { at: number; w: Weather }>();

export function summarise(hours: Hour[]) {
  const next = hours.slice(0, 8);
  const wet = next.filter((h) => h.rain >= 50);
  return { rainy: wet.length > 0, firstRain: wet[0]?.t ?? null, max: next.length ? Math.max(...next.map((h) => h.temp)) : null, min: next.length ? Math.min(...next.map((h) => h.temp)) : null };
}

export async function weatherFor(lat: number, lng: number, tz: string): Promise<Weather | null> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 30 * 60e3) return hit.w;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,precipitation_probability,weather_code&forecast_days=2&timezone=${encodeURIComponent(tz)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000), cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const j = await res.json() as { hourly: { time: string[]; temperature_2m: number[]; precipitation_probability: number[]; weather_code: number[] } };
    // Hora atual na cidade, no formato das horas da API ("2026-10-16T21:00").
    const nowLocal = new Intl.DateTimeFormat("sv-SE", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false }).format(new Date()).replace(" ", "T").slice(0, 13);
    const all: Hour[] = j.hourly.time.map((t, i) => ({ t, temp: Math.round(j.hourly.temperature_2m[i]), rain: j.hourly.precipitation_probability[i] ?? 0, code: j.hourly.weather_code[i] }));
    const from = Math.max(0, all.findIndex((h) => h.t.slice(0, 13) === nowLocal));
    const hours = all.slice(from, from + 12);
    const w = { now: hours[0] ?? null, hours };
    cache.set(key, { at: Date.now(), w });
    return w;
  } catch {
    return hit?.w ?? null;
  }
}

/** Ícone simples a partir do código WMO. */
export function icon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67 || (code >= 80 && code <= 82)) return "🌧️";
  if (code <= 77 || code === 85 || code === 86) return "❄️";
  return "⛈️";
}
