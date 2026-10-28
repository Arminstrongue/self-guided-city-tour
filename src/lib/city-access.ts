import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "./access-token";
import { validAccessEmail } from "./session-revoke";
import { sessionEmail } from "./auth";
import { activeCities, findActiveAccess } from "./orders";
import { isFreeCity } from "./pricing";

/**
 * Conteúdo pago: o roteiro completo, mapas, direções passo a passo, tempos, planos dia a dia, lugares e informação local
 * só abrem com um passe ativo da cidade (ou numa cidade de demonstração gratuita). Sem passe vê-se apenas uma amostra.
 */
export async function travellerEmails(): Promise<string[]> {
  const raw = (await cookies()).get(ACCESS_COOKIE)?.value;
  const list = [await validAccessEmail(raw).catch(() => null), await sessionEmail().catch(() => null)];
  return list.filter((e): e is string => Boolean(e));
}

/** Tem passe para esta cidade? (não ativa o passe: o tempo só começa a contar ao abrir o roteiro). */
export async function hasCityAccess(cityId: string): Promise<boolean> {
  if (isFreeCity(cityId)) return true;
  const emails = await travellerEmails();
  if (!emails.length) return false;
  return Boolean(await findActiveAccess(emails, cityId).catch(() => null));
}

/** Uma só consulta para várias cidades. */
export async function openCities(): Promise<(id: string) => boolean> {
  const emails = await travellerEmails();
  const a = emails.length ? await activeCities(emails).catch(() => ({ all: false, cities: new Set<string>() })) : { all: false, cities: new Set<string>() };
  return (id: string) => isFreeCity(id) || a.all || a.cities.has(id);
}
