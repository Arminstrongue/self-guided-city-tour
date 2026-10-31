import { zonedToDate } from "./zoned";
import type { Reservation } from "./trip-local";

/** Horas reais de cada troço (passando a meia-noite quando a hora "volta atrás"). */
export function legDates(r: Pick<Reservation, "localAt" | "startsAt" | "tz" | "journey">) {
  const day = r.localAt.slice(0, 10);
  let last = new Date(r.startsAt).getTime() - 60_000;
  const at = (hm: string) => { let d = zonedToDate(`${day}T${hm}`, r.tz).getTime(); while (d < last) d += 86400_000; last = d; return new Date(d); };
  return (r.journey?.legs ?? []).map((l) => ({ dep: at(l.dep), arr: at(l.arr) }));
}
