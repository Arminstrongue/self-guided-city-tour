"use client";
/**
 * Barra de baixo em todo o site/app (como nas apps de viagem): Início · Agora · Explorar · Minha viagem · Perfil.
 * A carteira usa exatamente as mesmas 5 entradas, pela mesma ordem, para nunca mudar de "mapa" ao navegar.
 * Navegação do lado do cliente (next/link, com pré-carregamento): trocar de separador não recarrega a página nem pisca.
 * Nunca há becos sem saída. A carteira (/wallet) tem a sua própria barra; portais e admin não mostram nenhuma.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Compass, Home, Luggage, UserRound, Zap } from "lucide-react";
import { useDict } from "@/i18n/client-dict";

/**
 * Um só mapa de páginas → separador (a mesma regra em todo o lado):
 * - Minha viagem: planear e seguir a viagem (planeador, roteiro, planos dia a dia, rota partilhada, escala, pagamento concluído).
 * - Agora: ajudas do momento (acabei de chegar, tempo livre).
 * - Explorar: cidades, guias locais, encontros, eventos.
 * - Perfil: perfis e diário.
 */
const TABS: [RegExp, "home" | "trip" | "now" | "explore" | "profile"][] = [
  [/^\/[a-z]{2}\/(tour|plan|start|r|layover|success)(\/|$)/, "trip"],
  [/^\/[a-z]{2}\/(arrive|free)(\/|$)/, "now"],
  [/^\/[a-z]{2}\/guides\/join/, "home"],
  [/^\/[a-z]{2}\/(c|guides|g|meet|eco)(\/|$)/, "explore"],
  [/^\/[a-z]{2}\/(u|i|diary)(\/|$)/, "profile"]
];
export const tabFor = (path: string) => TABS.find(([re]) => re.test(path))?.[1] ?? "home";

const HIDE = /^\/[a-z]{2}\/(wallet|admin|guides\/portal|merchants\/manage|agents\/portal|v\/)/;

/** Renova a sessão uma vez por dia neste aparelho (não é preciso voltar a entrar). */
function useKeepSignedIn() {
  useEffect(() => {
    try { const k = "sgct:renew"; const last = Number(localStorage.getItem(k) ?? 0); if (Date.now() - last < 12 * 3600_000) return; localStorage.setItem(k, String(Date.now())); } catch { /* ignorar */ }
    void fetch("/api/me/renew", { method: "POST" }).catch(() => null);
  }, []);
}

export function AppNav({ locale }: { locale: string }) {
  const t = useDict();
  const path = usePathname() ?? "";
  useKeepSignedIn();
  if (HIDE.test(path)) return null;
  const active = tabFor(path);
  const items = [
    { k: "home", href: `/${locale}`, icon: Home, label: t.nvHome },
    { k: "now", href: `/${locale}/wallet`, icon: Zap, label: t.nvNow },
    { k: "explore", href: `/${locale}/wallet#explore`, icon: Compass, label: t.nvExplore },
    { k: "trip", href: `/${locale}/wallet#trip`, icon: Luggage, label: t.nvTrip },
    { k: "profile", href: `/${locale}/wallet#profile`, icon: UserRound, label: t.nvProfile }
  ] as const;
  return (
    <nav className="nv appnav" aria-label="VOYBU">
      {items.map(({ k, href, icon: I, label }) => (
        <Link key={k} href={href} prefetch className={active === k ? "on" : ""} aria-current={active === k ? "page" : undefined}>
          <span><I size={22} strokeWidth={active === k ? 2.4 : 1.9} aria-hidden="true" /></span><small>{label}</small>
        </Link>
      ))}
    </nav>
  );
}
