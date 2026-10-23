/** Dados do "Explorar" de uma cidade, já no idioma do viajante (usado na página da cidade e no roteiro). */
import { COUNTRY, type City } from "@/data/cities";
import { AGENDA, MOMENTS, momentDays } from "@/data/moments";
import { CITY_COMMUNITIES, COUNTRY_CUSTOMS, type Custom } from "@/data/customs";
import { cityCenter } from "./explore";
import type { CustomView, MomentView } from "@/components/Explore";

export function exploreProps(city: City, locale: string) {
  const pick = <T,>(x: { pt: T; en: T }) => (locale === "pt" ? x.pt : x.en);
  const custom = (community: boolean) => (x: Custom): CustomView => { const [title, text] = pick(x); return { icon: x.icon, title, text, community }; };
  const moments: MomentView[] = (MOMENTS[city.id] ?? []).map((x) => { const [title, text] = pick(x); return { id: x.id, icon: x.icon, when: x.when, h: x.h, lat: x.lat, lng: x.lng, title, text, days: momentDays(x) }; });
  const customs: CustomView[] = [...(CITY_COMMUNITIES[city.id] ?? []).map(custom(true)), ...(COUNTRY_CUSTOMS[COUNTRY[city.id]] ?? []).map(custom(false))];
  return { moments, customs, agenda: AGENDA[city.id], center: cityCenter(city), tz: city.tz, gmapsKey: process.env.GOOGLE_MAPS_BROWSER_KEY || undefined };
}
