"use client";
/**
 * Barra de baixo em todo o site/app (como nas apps de viagem): Início · Agora · Explorar · Minha viagem · Perfil.
 * A carteira usa exatamente as mesmas 5 entradas, pela mesma ordem, para nunca mudar de "mapa" ao navegar.
 * Nunca há becos sem saída. A carteira (/wallet) tem a sua própria barra; portais e admin não mostram nenhuma.
 */
import { usePathname } from "next/navigation";
import { Compass, Home, Luggage, UserRound, Zap } from "lucide-react";
import { useDict } from "@/i18n/client-dict";

const HIDE = /^\/[a-z]{2}\/(wallet|admin|guides\/portal|merchants\/manage|agents\/portal|v\/)/;

export function AppNav({ locale }: { locale: string }) {
  const t = useDict();
  const path = usePathname() ?? "";
  if (HIDE.test(path)) return null;
  const active = /^\/[a-z]{2}\/tour\//.test(path) ? "trip" : /^\/[a-z]{2}\/(arrive|free|plan|layover|start)/.test(path) ? "now" : /^\/[a-z]{2}\/(guides|meet|eco|c\/)/.test(path) ? "explore" : /^\/[a-z]{2}\/(u|i)\//.test(path) ? "profile" : "home";
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
        <a key={k} href={href} className={active === k ? "on" : ""} aria-current={active === k ? "page" : undefined}>
          <span><I size={22} strokeWidth={active === k ? 2.4 : 1.9} aria-hidden="true" /></span><small>{label}</small>
        </a>
      ))}
    </nav>
  );
}
