"use client";
import { lastCity } from "@/lib/last-city";
import { EmailSignIn } from "./EmailSignIn";
import { useDict } from "@/i18n/client-dict";
/** Carteira do viajante: passes, reservas de guias, memórias, carimbos e interesses — na conta, em qualquer dispositivo. */
import { useEffect, useMemo, useState } from "react";
import { fmt, INTL_LOCALE } from "@/i18n/core";
import type { Dict, Locale } from "@/i18n/dictionaries";
import { deleteMemory, listMemories, syncLocalToAccount, type Memory } from "@/lib/diary";
import type { Wallet } from "@/lib/wallet";
import { COUNTRY_CODES, flag } from "@/data/countries";
import { loadWish, saveWish, wishKey, type Wish } from "@/lib/wishlist";
import { SearchPick } from "./SearchPick";
import { InterestsOnboarding, ONBOARDED } from "./Interests";
import { NewsFeed } from "./NewsFeed";
import { NeedNow } from "./NeedNow";
import type { ToolTab } from "./TravelTools";
import { I, House, Luggage, Zap, Compass, Clapperboard, Plus, Bell, MessageCircle, Settings, Menu, MapIcon, Globe, Wrench, Sparkles, CalendarDays, Ticket, Heart, BookOpen, Bookmark, Search, Users, LayoutGrid, MapPin } from "./Ico";
import { CloudOff, Copy, Trash2, UserRound } from "lucide-react";
import { toast, withUndo } from "@/lib/toast";
import Portal from "./Portal";
import type { LucideIcon } from "lucide-react";
import { currencyForCountry } from "@/lib/currency";
import { useUnread } from "@/lib/unread-client";
import { PointsCard, usePoints } from "./Points";
import { TravelStats } from "./TravelStats";
import { useLiveConnection } from "@/lib/live-client";
import dynamic from "next/dynamic";
import Link from "next/link";
// Ecrãs e folhas que só carregam quando são abertos (a carteira abre mais depressa).
const Composer = dynamic(() => import("./Feed").then((m) => m.Composer), { ssr: false });
const FeedTab = dynamic(() => import("./Feed").then((m) => m.FeedTab), { ssr: false });
const AddToPlan = dynamic(() => import("./Explore").then((m) => m.AddToPlan), { ssr: false });
const CitySheet = dynamic(() => import("./CitySheet").then((m) => m.CitySheet), { ssr: false });
const PostSheet = dynamic(() => import("./PostExtras").then((m) => m.PostSheet), { ssr: false });
const SavedGrid = dynamic(() => import("./PostExtras").then((m) => m.SavedGrid), { ssr: false });
const TagSheet = dynamic(() => import("./PostExtras").then((m) => m.TagSheet), { ssr: false });
const ToolsSheet = dynamic(() => import("./TravelTools").then((m) => m.ToolsSheet), { ssr: false });
const VideosTab = dynamic(() => import("./Reels").then((m) => m.VideosTab), { ssr: false });
const ChatTab = dynamic(() => import("./Chat").then((m) => m.ChatTab), { ssr: false });
const InstallApp = dynamic(() => import("./InstallApp").then((m) => m.InstallApp), { ssr: false });
const PointsSheet = dynamic(() => import("./PointsSheet").then((m) => m.PointsSheet), { ssr: false });
const GlobalSearch = dynamic(() => import("./GlobalSearch").then((m) => m.GlobalSearch), { ssr: false });
const NotifsSheet = dynamic(() => import("./Notifs").then((m) => m.NotifsSheet), { ssr: false });
const InviteSheet = dynamic(() => import("./Invite").then((m) => m.InviteSheet), { ssr: false });
const signIn = (...a: Parameters<typeof import("next-auth/react").signIn>) => import("next-auth/react").then((m) => m.signIn(...a));

import { Avatar, PeopleTab, ProfileEditor, SettingsSheet, loadSocial, type Social } from "./Social";
import { NowPanel } from "./NowPanel";
import { Reservations } from "./Reservations";

type Mem = Memory & { local?: boolean };

function left(ms: number, locale: Locale) {
  const h = Math.max(0, Math.round(ms / 3600_000));
  const rtf = new Intl.NumberFormat(INTL_LOCALE[locale], { style: "unit", unit: h >= 48 ? "day" : "hour", unitDisplay: "long" });
  return rtf.format(h >= 48 ? Math.round(h / 24) : h);
}

const SNAP = "sgct:wallet-snap";
type Tab = "home" | "explore" | "videos" | "chat" | "people" | "profile" | "trip" | "passes" | "res" | "plans" | "wish" | "places" | "memories" | "saved";
type Section = "home" | "explore" | "videos" | "chat" | "people" | "profile" | "trip";
const TABS: Tab[] = ["home", "explore", "videos", "chat", "people", "profile", "trip", "passes", "res", "plans", "wish", "places", "memories", "saved"];
/** Minha viagem: passes, reservas e bilhetes, planos, wishlist, memórias. Perfil: cidades e guardados. */
const TRIP_SUB: Tab[] = ["passes", "res", "plans", "wish", "memories"];
const PROFILE_SUB: Tab[] = ["places", "saved"];
const SUB: Tab[] = [...TRIP_SUB, ...PROFILE_SUB];
/** Vibração curta ao tocar (Android); no iPhone não faz nada. */
/** A vibração ao tocar é global (Feel); aqui fica só para pontos que não são botões. */
const buzz = () => undefined;
const LEVELS = [0, 1, 3, 6, 12] as const; // cidades necessárias para cada nível

/** Cor do bilhete de cada cidade (estável). */
function hue(id: string) { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }

export function WalletView({ t: tProp, locale, cities, free, countryOf, tzOf = {}, popular = [], providers = [] }: { t?: Dict; locale: Locale; cities: Record<string, string>; free: string[]; countryOf: Record<string, string>; tzOf?: Record<string, string>; popular?: string[]; providers?: { id: string; name: string }[] }) {
  const t = useDict(tProp);
  const [composing, setComposing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pulling, setPulling] = useState(0);
  const [searching, setSearching] = useState(false);
  const [pointsOpen, setPointsOpen] = useState(false);
  const [pendingCompose, setPendingCompose] = useState<string | null>(null);
  const [composeText, setComposeText] = useState("");
  const [w, setW] = useState<Wallet | null | "anon">(null);
  const [loadErr, setLoadErr] = useState(false);
  const [local, setLocal] = useState<Mem[]>([]);
  const [synced, setSynced] = useState(0);
  const [tab, setTabState] = useState<Tab>("home");
  const [wish, setWish] = useState<Wish[] | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [social, setSocial] = useState<Social | null>(null);
  const [editing, setEditing] = useState(false);
  const [onboard, setOnboard] = useState(false);
  const [settings, setSettings] = useState(false);
  const [shared, setShared] = useState(false);
  const goSignIn = () => { setTabState("home"); setTimeout(() => { const e = document.getElementById("wl-email"); e?.scrollIntoView({ behavior: "smooth", block: "center" }); (e as HTMLInputElement | null)?.focus(); }, 50); };
  const [socialDone, setSocialDone] = useState(false);
  const refreshSocial = () => void loadSocial().then((x) => { setSocial(x); setSocialDone(true); });

  async function load() {
    // Conta e perfil social pedidos em paralelo (antes o perfil só começava depois da conta).
    const socialP = loadSocial();
    const r = await fetch("/api/me", { cache: "no-store" }).catch(() => null);
    // Erro do servidor (não "sem sessão"): não mostrar o formulário de entrada, que dava a ideia de que o login falhou.
    // Sem ligação ou erro do servidor: mostrar "tentar de novo", nunca o formulário de entrada (dava a ideia de sessão perdida).
    const failed = !r || r.status >= 500;
    setLoadErr(failed);
    if (failed) return;
    if (r?.ok) {
      const n = await syncLocalToAccount().catch(() => 0); // memórias deste dispositivo passam para a conta
      if (n) { setSynced(n); const again = await fetch("/api/me", { cache: "no-store" }).catch(() => null); setW(again?.ok ? await again.json() : await r.json()); } else setW(await r.json());
      setLocal(await listMemories());
    } else { setW("anon"); setLocal((await listMemories()).map((m) => ({ ...m, local: true }))); }
    void loadWish().then((x) => setWish(x.list));
    if (r?.ok) void socialP.then((x) => { setSocial(x); setSocialDone(true); });
  }
  useEffect(() => {
    // Abre logo com a última cópia deste telemóvel (conta e perfil) e atualiza em segundo plano — sem esqueletos ao voltar à app.
    // A cópia apaga-se ao terminar a sessão (o "Terminar sessão" limpa o armazenamento local) ou quando o servidor diz "sem sessão".
    try {
      const snap = JSON.parse(localStorage.getItem(SNAP) ?? "null") as { w: Wallet; s: Social | null; at: number } | null;
      if (snap?.w && Date.now() - snap.at < 14 * 86400_000) { setW(snap.w); setSocial(snap.s); setSocialDone(true); }
    } catch { /* cópia inválida: carrega normalmente */ }
    void load(); const f = () => void load(); window.addEventListener("sgct:diary", f); return () => window.removeEventListener("sgct:diary", f);
  }, []);
  useEffect(() => {
    try {
      if (w === "anon") localStorage.removeItem(SNAP);
      else if (w && socialDone) { const v = JSON.stringify({ w, s: social, at: Date.now() }); if (v.length < 300_000) localStorage.setItem(SNAP, v); }
    } catch { /* armazenamento cheio: fica sem cópia */ }
  }, [w, social, socialDone]);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(id); }, []);
  useEffect(() => {
    const read = () => { const raw = window.location.hash.slice(1).split(":")[0]; const h = (raw === "feed" ? "home" : raw) as Tab; setTabState(TABS.includes(h) ? h : "home"); };
    read(); window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  const setTab = (x: Tab) => { setTabState(x); try { if (x !== tab) history.pushState(null, "", x === "home" ? window.location.pathname : `#${x}`); } catch { /* ignorar */ } window.scrollTo({ top: 0 }); };

  const signed = w && w !== "anon" ? w : null;
  // Enquanto a sessão e o perfil carregam, mostra-se um esqueleto (antes aparecia "Entrar" por instantes a quem já tinha sessão).
  const pending = w === null || (Boolean(signed) && social === null && !socialDone);
  const nudge = pending ? <div className="wl-skel" aria-hidden="true"><i /><i /></div> : <SignNudge t={t} onClick={goSignIn} />;
  // Preferências de viagem da conta também neste telemóvel (o planeador usa-as sem nova ida ao servidor).
  useEffect(() => { if (signed?.travel) { try { localStorage.setItem("sgct:travel", JSON.stringify(signed.travel)); } catch { /* ignorar */ } } }, [signed?.travel]);
  // Roteiro de vários dias criado antes de entrar: grava-o agora e abre-o.
  useEffect(() => {
    if (!signed) return;
    let draft: string | null = null;
    try { draft = localStorage.getItem("sgct:plan-draft"); } catch { /* ignorar */ }
    if (!draft) return;
    void fetch("/api/me/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: draft }).then((r) => (r.ok ? r.json() : null)).then((j: { id?: string } | null) => {
      try { localStorage.removeItem("sgct:plan-draft"); } catch { /* ignorar */ }
      if (j?.id) { toast(t.dp.saved); window.location.href = `/${locale}/plan/${j.id}`; }
    }).catch(() => null);
  }, [Boolean(signed)]); // eslint-disable-line react-hooks/exhaustive-deps
  // Primeira vez com sessão e sem interesses: "Escolha o que gosta".
  useEffect(() => {
    if (!signed || signed.hobbies.length) return;
    let done = false; try { done = Boolean(localStorage.getItem(ONBOARDED)); } catch { /* ignorar */ }
    if (!done && !new URLSearchParams(window.location.search).get("signin")) setOnboard(true);
  }, [signed]);
  // Vindo do ecrã de boas-vindas: depois de entrar, volta à página onde estava (até 30 min).
  useEffect(() => {
    if (!w || w === "anon") return;
    try {
      const r = JSON.parse(localStorage.getItem("sgct:after-signin") || "null") as { to?: string; at?: number } | null;
      if (!r) return;
      localStorage.removeItem("sgct:after-signin");
      if (r.to && /^\/[a-z]{2}(\/|\?|#|$)/.test(r.to) && !r.to.startsWith("//") && Date.now() - (r.at ?? 0) < 30 * 60_000 && !r.to.includes("/wallet")) window.location.replace(r.to);
    } catch { /* ignorar */ }
  }, [w]);
  // Vindo de Definições → Viagens e preferências (?settings=1): abre as preferências.
  useEffect(() => {
    if (!w || w === "anon") return;
    const q = new URLSearchParams(window.location.search);
    if (q.get("settings") !== "1") return;
    setSettings(true); q.delete("settings");
    history.replaceState(null, "", `${location.pathname}${q.size ? `?${q}` : ""}${location.hash}`);
  }, [w]);
  // Vindo de "Entrar" num roteiro (?signin=1&city=…): foca o email; se já tem sessão, volta ao roteiro.
  const [retCity, setRetCity] = useState<string | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("signin") !== "1") return;
    const c = q.get("city"); const city = c && /^[a-z]{2,12}$/.test(c) ? c : null;
    setRetCity(city);
    if (w === "anon") goSignIn();
    else if (w && city) window.location.replace(`/${locale}/tour/${city}`);
  }, [w]); // eslint-disable-line react-hooks/exhaustive-deps
  const memories: Mem[] = useMemo(() => [...(signed?.memories ?? []), ...local.map((m) => ({ ...m, local: true }))].sort((a, b) => b.at - a.at), [signed, local]);
  // Cidades e países: passes, memórias e as acrescentadas à mão.
  const world = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of signed?.passes ?? []) if (p.city && cities[p.city]) m.set(cities[p.city].toLowerCase(), countryOf[p.city] ?? "");
    for (const x of memories) m.set(x.cityName.toLowerCase(), countryOf[x.city] ?? "");
    for (const v of signed?.visited ?? []) if (!v.want) m.set(v.name.toLowerCase(), v.country);
    const ccs = new Set([...m.values()].filter(Boolean));
    return { cities: m.size, countries: ccs.size, ccs: [...ccs] };
  }, [signed, memories, cities, countryOf]);
  const lvl = LEVELS.filter((n) => world.cities >= n).length - 1;
  const nextAt = LEVELS[lvl + 1];
  const pct = nextAt ? Math.round(((world.cities - LEVELS[lvl]) / (nextAt - LEVELS[lvl])) * 100) : 100;

  const dt = new Intl.DateTimeFormat(INTL_LOCALE[locale], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const d = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "short", year: "numeric" });
  const eur = (c: number) => new Intl.NumberFormat(INTL_LOCALE[locale], { style: "currency", currency: "EUR" }).format(c / 100);

  async function remove(m: Mem) {
    if (m.local) await deleteMemory(m.id); else await fetch(`/api/me/memories/${m.id}`, { method: "DELETE" }).catch(() => null);
    void load();
  }
  async function share(x: Mem) {
    const text = `${x.title} · ${x.cityName}${x.note ? ` — ${x.note}` : ""}\n${window.location.host}/${x.city}`;
    try {
      if (x.photo && navigator.canShare) {
        const file = new File([await (await fetch(x.photo)).blob()], "memory.jpg", { type: "image/jpeg" });
        if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); return; }
      }
      if (navigator.share) await navigator.share({ text }); else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    } catch { /* cancelado */ }
  }

  const passes = useMemo(() => signed?.passes ?? [], [signed]);
  const active = useMemo(() => passes.filter((p) => new Date(p.expiresAt).getTime() > now), [passes, now]);
  // Último roteiro escolhido em "Começar em 3 passos" (neste dispositivo): é a viagem do viajante, não a demonstração.
  const [planned, setPlanned] = useState<{ city: string; n: number; h: string; open: boolean; base?: string; end?: string; mode?: "plane" | "train" | "ship" | "stay"; startAt?: string } | null>(null);
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem("sgct:planned") ?? "null"); if (v?.city) setPlanned(v); } catch { /* ignorar */ } }, []);
  const myCities = useMemo(() => [...new Set([...active.map((p) => p.city ?? ""), ...(signed?.plans ?? []).map((p) => p.city ?? ""), ...(wish ?? []).map((w) => w.city), ...(social?.profile?.cities ?? []), ...(planned ? [planned.city] : [])])].filter(Boolean), [active, signed, wish, social, planned]);
  // Explorar: primeiro as minhas cidades, depois a última que abri, depois as mais procuradas; o resto por ordem alfabética.
  const [recent, setRecent] = useState("");
  useEffect(() => { setRecent(lastCity()); }, []);
  const cityOrder = useMemo(() => {
    const rank = (id: string) => { const m = myCities.indexOf(id); if (m >= 0) return m; if (id === recent) return 100; const p = popular.indexOf(id); return p >= 0 && p < 12 ? 200 + p : 1000; };
    return Object.entries(cities).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1].localeCompare(b[1]));
  }, [cities, myCities, recent, popular]);
  const prof = social?.profile ?? null;
  const points = usePoints(Boolean(signed));
  // Na app nativa (Capacitor) o Google recusa o login dentro da app ("disallowed_useragent"): fica só a Apple e o email.
  const [native, setNative] = useState(false);
  useEffect(() => { setNative(Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.())); }, []);
  // Nas apps nativas só "Entrar com a Apple" (e o código por email): Google e Facebook bloqueiam o início de sessão dentro de apps (WebView),
  // e a Apple (regra 4.8) exige uma opção equivalente quando há início de sessão de terceiros.
  const shownProviders = native ? providers.filter((p) => p.id === "apple") : providers;
  const { unread, notifs, refreshUnread } = useUnread(Boolean(prof));
  useLiveConnection(Boolean(signed));
  const [notifOpen, setNotifOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  useEffect(() => { if (window.location.hash === "#notifs") setNotifOpen(true); }, []);
  useEffect(() => { // aviso de conquista (push ou centro de notificações) → abre os pontos
    const f = () => { if (window.location.hash === "#points" && points) { setPointsOpen(true); history.replaceState(null, "", window.location.pathname); } };
    f(); window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f);
  }, [points]);
  // #post:<id> e #tag:<hashtag> abrem por cima de qualquer separador.
  const [deep, setDeep] = useState<{ post?: string; tag?: string } | null>(null);
  const [tools, setTools] = useState<{ tab: ToolTab; split?: string } | null>(null);
  useEffect(() => {
    const read = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      if (h.startsWith("post:")) setDeep({ post: h.slice(5) }); else if (h.startsWith("tag:")) setDeep({ tag: h.slice(4) }); else setDeep(null);
      // Atalhos da app instalada e "partilhar para a app": #compose[:texto] e #search.
      if (h === "compose" || h.startsWith("compose:")) { setPendingCompose(h.slice(8)); history.replaceState(null, "", window.location.pathname); }
      if (h === "search") { setSearching(true); history.replaceState(null, "", window.location.pathname); }
      if (h.startsWith("split:")) setTools({ tab: "split", split: h.slice(6) }); else if (h === "tools" || h === "split" || h === "offline") setTools({ tab: h === "split" ? "split" : h === "offline" ? "offline" : "fx" });
    };
    read(); window.addEventListener("popstate", read); window.addEventListener("hashchange", read);
    return () => { window.removeEventListener("popstate", read); window.removeEventListener("hashchange", read); };
  }, []);
  const closeDeep = () => { setDeep(null); history.replaceState(null, "", window.location.pathname + (tab !== "home" ? `#${tab}` : "")); };
  async function shareProfile() {
    if (!prof) return;
    const url = `${location.origin}/${locale}/u/${prof.handle}`;
    try { if (navigator.share) await navigator.share({ title: prof.name, url }); else { await navigator.clipboard.writeText(url); setShared(true); setTimeout(() => setShared(false), 2000); } } catch { /* cancelado */ }
  }
  // Puxar para atualizar (no topo da página).
  useEffect(() => {
    let y0: number | null = null, dy = 0;
    const start = (e: TouchEvent) => { y0 = window.scrollY <= 0 && !document.querySelector(".sheet-bg,.rl,.ch-view,.ob,.st-view") ? e.touches[0].clientY : null; dy = 0; };
    const move = (e: TouchEvent) => { if (y0 === null) return; dy = e.touches[0].clientY - y0; setPulling(dy > 8 ? dy * 0.5 : 0); };
    const end = () => { if (y0 !== null && dy * 0.5 > 60) { buzz(); void load(); setRefreshKey((k) => k + 1); } y0 = null; setPulling(0); };
    window.addEventListener("touchstart", start, { passive: true }); window.addEventListener("touchmove", move, { passive: true }); window.addEventListener("touchend", end);
    return () => { window.removeEventListener("touchstart", start); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", end); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const counts: Record<Tab, number | null> = { home: null, explore: null, profile: null, saved: null, videos: null, chat: unread || null, people: social?.count.requests || null, trip: null, res: null, passes: passes.length + free.length, plans: signed?.plans.length ?? 0, wish: wish?.length ?? 0, places: world.cities, memories: memories.length };
  const icon: Record<Tab, LucideIcon> = { trip: Luggage, res: Ticket, home: LayoutGrid, explore: Search, profile: Users, saved: Bookmark, videos: Clapperboard, chat: MessageCircle, people: Users, passes: Ticket, plans: MapIcon, wish: Heart, places: Globe, memories: BookOpen };

  const Pass = ({ href, city, label, title, sub, right, off }: { href: string; city: string; label: string; title: string; sub?: string; right: React.ReactNode; off?: boolean }) => (
    <a href={href} className={`wl-ticket press ${off ? "off" : ""}`} style={{ ["--h" as string]: hue(city) }}>
      <span className="wl-ticket-l"><span className="wl-ticket-k">{label}</span><b className="wl-ticket-t">{title}</b>{sub && <span className="wl-ticket-s">{sub}</span>}</span>
      <span className="wl-ticket-cut" aria-hidden="true" />
      <span className="wl-ticket-r">{right}</span>
    </a>
  );
  const passCards = (limit?: number) => [
    ...passes.map((p) => {
      const on = new Date(p.expiresAt).getTime() > now;
      return <Pass key={p.id} href={p.scope === "all" ? `/${locale}#cities` : `/${locale}/tour/${p.city}`} city={p.city ?? "all"} off={!on}
        label={p.scope === "all" ? t.wAllCities : p.plan === "trip" ? "3 days" : "48 h"} title={p.scope === "all" ? `🌍 ${t.wAllCities}` : cities[p.city ?? ""] ?? p.city ?? ""}
        sub={`${d.format(new Date(p.createdAt))} · ${eur(p.amountCents)}${p.flightNo ? ` · ${fmt(t.wFlight, { f: p.flightNo })}` : ""}`}
        right={on ? <>{p.activatedAt === null ? <span className="wl-ticket-live">○ {fmt(t.wNotStarted, { d: d.format(new Date(p.expiresAt)) })}</span> : <span className="wl-ticket-live">● {fmt(t.wActive, { t: left(new Date(p.expiresAt).getTime() - now, locale) })}</span>}<b>{t.wOpen} →</b></> : <span>{t.wExpired}</span>} />;
    }),
    ...free.filter((id) => cities[id]).map((id) => <Pass key={`f-${id}`} href={`/${locale}/tour/${id}`} city={id} label={`🎁 ${t.wDemo}`} title={cities[id]} right={<b>{t.wOpen} →</b>} />)
  ].slice(0, limit);

  const section: Section = tab === "chat" || tab === "people" || tab === "explore" || tab === "videos" ? tab : TRIP_SUB.includes(tab) || tab === "trip" ? "trip" : PROFILE_SUB.includes(tab) || tab === "profile" ? "profile" : "home";
  const sub: Tab = SUB.includes(tab) ? tab : section === "profile" ? "places" : "passes";
  const go = (x: Tab) => { buzz(); setTab(x); };
  useEffect(() => {
    if (pendingCompose === null || w === null || (w !== "anon" && !social)) return;
    const txt = pendingCompose; setPendingCompose(null);
    if (!signed) return goSignIn();
    if (!prof) return setEditing(true);
    setComposeText(txt); setComposing(true);
  }, [pendingCompose, w, signed, prof, social]); // eslint-disable-line react-hooks/exhaustive-deps
  // Contador no ícone da app instalada (mensagens + notificações por ler).
  useEffect(() => {
    const n = unread + notifs; const nav = navigator as Navigator & { setAppBadge?: (n: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
    try { if (n > 0) void nav.setAppBadge?.(n).catch(() => null); else void nav.clearAppBadge?.().catch(() => null); } catch { /* sem suporte */ }
  }, [unread, notifs]);
  const create = () => { buzz(); if (!signed) return goSignIn(); if (!prof) return setEditing(true); setComposing(true); };
  const title = section === "home" ? null : section === "trip" ? t.wallet : section === "profile" ? (prof ? `@${prof.handle}` : t.nvProfile) : section === "explore" ? t.nvExplore : section === "chat" ? t.chTab : section === "people" ? t.wTabs.people : t.rlTitle;
  const profileSubs: Tab[] = section === "trip" ? TRIP_SUB : PROFILE_SUB;

  return (
    <div className="stack wl wl-app" style={{ gap: 14 }}>
      {/* Barra de cima: título + notificações e mensagens (como no Instagram) */}
      <div className="wl-bar">
        {/* Cada separador tem o seu nome (antes o "Agora" chamava-se "Minha viagem", igual ao separador seguinte). */}
        {title ? <b className="wl-bar-t">{title}</b> : <b className="wl-bar-t">{t.nvNow}</b>}
        <span className="row" style={{ gap: 4 }}>
          {section === "profile" && <button className="wl-bar-ic" aria-label={t.scSettings} title={t.scSettings} onClick={() => setSettings(true)}><I icon={Settings} size={22} /></button>}
          {section === "profile" && signed && <a className="wl-bar-ic" aria-label={t.acTitle} title={t.acTitle} href={`/${locale}/wallet/account`}><I icon={Menu} size={22} /></a>}
          <button className="wl-bar-ic" aria-label={t.gsTitle} title={t.gsTitle} onClick={() => setSearching(true)}><I icon={Search} size={22} /></button>
          {prof && <button className="wl-bar-ic" aria-label={t.ntTitle} title={t.ntTitle} onClick={() => { buzz(); setNotifOpen(true); }}><I icon={Bell} size={23} className={notifs > 0 ? "ring" : ""} />{notifs > 0 && <span className="wl-badge">{notifs > 9 ? "9+" : notifs}</span>}</button>}
          {prof && <button className="wl-bar-ic" aria-label={t.chTab} title={t.chTab} onClick={() => go("chat")}><I icon={MessageCircle} size={23} />{unread > 0 && <span className="wl-badge">{unread > 9 ? "9+" : unread}</span>}</button>}
          {!signed && w !== null && <button className="gp-out wl-in" onClick={goSignIn}>{t.wSignIn}</button>}
        </span>
      </div>
      {pulling > 0 && <div className="wl-ptr" style={{ height: Math.min(pulling, 70) }}><span className={pulling > 60 ? "go" : ""}>↻</span></div>}
      {synced > 0 && <p className="note">✓ {fmt(t.wSynced, { n: synced })}</p>}

      {/* ---------- Início: o que vem a seguir + histórias + feed ---------- */}
      {section === "home" && <>
        {loadErr ? <section className="card stack" role="alert" style={{ gap: 10 }}><b>⚠️ {t.esi.loadErr}</b><button className="btn press" onClick={() => void load()}>{t.esi.retry}</button></section>
          : w === null && <div className="wl-skel" aria-hidden="true"><i /><i /><i /></div>}
        {/* Agora: o próximo passo (reserva, visita com guia, roteiro em curso ou roteiro planeado) */}
        <NowPanel t={t} locale={locale} cities={cities} signed={Boolean(signed)} planned={planned} hasPass={active.length > 0}
          bookings={(signed?.bookings ?? []).map((b) => ({ id: b.id, guide: b.guide, guideId: b.guideId, startAt: b.startAt, city: b.city, status: b.status, meeting: "meeting" in b ? (b.meeting as string | null) : null }))} />
        <NeedNow t={t} locale={locale} city={planned?.city ?? myCities[0] ?? (recent || "lon")} compact />
        {w === "anon" && (
          <section className="card stack wl-sign">
            <b style={{ fontSize: 17 }}>🔐 {t.wSignTitle}</b>
            <ul className="wl-benefits">{t.wBenefits.map((b) => <li key={b}>✓ {b}</li>)}</ul>
            {shownProviders.length > 0 && <div className="wl-oauth">{shownProviders.map((p) => (
              <button key={p.id} type="button" className={`wl-oauth-b ${p.id}`} onClick={() => void signIn(p.id, { callbackUrl: `/api/me/oauth?next=${encodeURIComponent(`/${locale}/wallet${retCity ? `?signin=1&city=${retCity}` : ""}`)}` })}>
                <span aria-hidden="true">{p.id === "google" ? "G" : p.id === "apple" ? "" : "f"}</span>{fmt(t.nvContinue, { p: p.name })}
              </button>
            ))}<span className="wl-or">{t.nvOr}</span></div>}
            <EmailSignIn t={t} locale={locale} city={retCity} />
          </section>
        )}

        {signed && <InstallApp t={t} />}
        {active[0] && <section className="stack" style={{ gap: 8 }}>{passCards(1)}</section>}
        <div className="wl-quick">
          <button className="press" onClick={() => go("plans")}><span className="qi q1"><I icon={MapIcon} size={22} /></span>{t.wQuickPlan}</button>
          <button className="press" onClick={() => go("places")}><span className="qi q2"><I icon={Globe} size={22} /></span>{t.wQuickCity}</button>
          <button className="press" onClick={() => setTools({ tab: "fx" })}><span className="qi q3"><I icon={Wrench} size={22} /></span>{t.wQuickTools}</button>
          <a className="press" href={`/${locale}#cities`}><span className="qi q4"><I icon={Sparkles} size={22} /></span>{t.wQuickExplore}</a>
          <a className="press" href={`/${locale}/wallet/agenda${(myCities[0] || recent) ? `?city=${myCities[0] || recent}` : ""}`}><span className="qi q5"><I icon={CalendarDays} size={22} /></span>{t.evTitle}</a>
          <a className="press" href={`/${locale}/wallet/essentials${myCities[0] ? `?city=${myCities[0]}` : ""}`}><span className="qi q1"><I icon={CloudOff} size={22} /></span>{t.ess.essentials}</a>
        </div>
        {/* Alertas só com viagem: sem destino, não mostra notícias do mundo inteiro. */}
        {myCities.length > 0 && <NewsFeed t={t} locale={locale} cities={cities} mine={myCities} />}
      </>}

      {/* ---------- Explorar: pessoas, cidades e o que há ---------- */}
      {section === "explore" && <>
        <div id="wl-stories" className="wl-stories" />
        <div className="ex-top">
          <button className="btn press" onClick={create}><I icon={Plus} size={18} stroke={2.6} /> {t.pfNew}</button>
          <button className="btn ghost press" onClick={() => go("videos")}><I icon={Clapperboard} size={18} /> {t.rlTitle}</button>
        </div>
        <button className="gs-fake press" onClick={() => setSearching(true)}><I icon={Search} size={18} /><span>{t.gsPlaceholder}</span></button>
        <div className="nv-cities">
          <a className="nv-city ev" href={`/${locale}/wallet/agenda${(myCities[0] || recent) ? `?city=${myCities[0] || recent}` : ""}`}><span><I icon={CalendarDays} size={22} /></span><b>{t.evTitle}</b></a>
          {cityOrder.map(([id, n]) => (
            <a key={id} className="nv-city" href={`#feed:${id}`}><span>{flag(countryOf[id] ?? "")}</span><b>{n}</b></a>
          ))}
        </div>
        {/* O feed fica por baixo da pesquisa e das cidades: ao chegar, já não empurra o ecrã para baixo. */}
        {!social && pending && <div className="pf-skel card" aria-hidden="true" />}
        {social && <FeedTab key={refreshKey} t={t} locale={locale} social={social} cities={cities} myCities={myCities} onEdit={() => setEditing(true)} />}
        {social?.profile && <button className="btn ghost press iv-open" onClick={() => setInviting(true)}>✉️ {t.ivTitle}</button>}
        {/* Sem perfil, o convite para criar perfil já aparece no feed: não repetir. */}
        {social ? (social.profile && <PeopleTab t={t} locale={locale} social={social} cities={cities} onChange={refreshSocial} onEdit={() => setEditing(true)} />) : nudge}
      </>}

      {section === "people" && (social ? <PeopleTab t={t} locale={locale} social={social} cities={cities} onChange={refreshSocial} onEdit={() => setEditing(true)} /> : nudge)}

      {section === "videos" && (signed ? <VideosTab t={t} locale={locale} social={social} cities={cities} onEdit={() => setEditing(true)} onClose={() => setTab("home")} /> : nudge)}

      {section === "chat" && (social ? <ChatTab t={t} locale={locale} social={social} onEdit={() => setEditing(true)} onRead={() => void refreshUnread()} /> : nudge)}

      {/* ---------- Perfil: cartão + passes, planos, wishlist, cidades, memórias ---------- */}
      {(section === "profile" || section === "trip") && <>
        {section === "profile" && <><section className="wl-card wl-card-sm">
          {prof ? <>
            <div className="wl-me">
              <button className="wl-me-av" onClick={() => setEditing(true)} aria-label={t.scEdit}><Avatar p={prof} size={68} /></button>
              <div className="wl-me-nums">
                <button onClick={() => go("places")}><b className="num">{Math.max(world.cities, points?.cities ?? 0)}</b><small>{t.wStatCities}</small></button>
                <button onClick={() => go("people")}><b className="num">{social!.count.followers}</b><small>{social!.count.followers === 1 ? t.scFollower : t.scFollowers}</small></button>
                <button onClick={() => go("people")}><b className="num">{social!.count.following}</b><small>{t.scFollowingN}</small></button>
              </div>
            </div>
            <div className="stack" style={{ gap: 2 }}>
              <b className="wl-me-n">{prof.name}{prof.isPrivate ? " 🔒" : ""}</b>
              {prof.bio && <p className="wl-me-bio">{prof.bio}</p>}
              <span className="wl-mini-stats"><span className="wl-lvl">{["🧳", "🧭", "✈️", "🌍", "👑"][lvl]} {t.wLevels[lvl]}</span><span>{world.countries} {t.wStatCountries.toLowerCase()}</span><span>{memories.length} {t.wStatMem.toLowerCase()}</span></span>
            </div>
          </> : pending ? <div className="wl-skel" aria-hidden="true"><i /></div> : <>
            <div className="wl-level">
              <span className="wl-level-b">{["🧳", "🧭", "✈️", "🌍", "👑"][lvl]} {t.wLevels[lvl]}</span>
              <span className="wl-who">{signed ? signed.email : t.walletSub}</span>
            </div>
            <div className="wl-prog" role="progressbar" aria-label={t.wLevels[lvl]} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${pct}%` }} /></div>
            <span className="wl-prog-l">{nextAt ? fmt(nextAt - world.cities === 1 ? t.wLevelNext1 : t.wLevelNext, { n: nextAt - world.cities, l: t.wLevels[lvl + 1] }) : t.wLevelMax}</span>
            {w === "anon" && <button className="btn press wl-in-cta" onClick={goSignIn}>🔐 {t.wSignIn}</button>}
          </>}
          {signed && social && <div className="wl-me-acts">
            <button onClick={() => setEditing(true)}>{prof ? t.scEdit : t.scCreate}</button>
            {prof && <button onClick={() => void shareProfile()}>{shared ? `✓ ${t.scCopied}` : t.scShare}</button>}
            {prof && <button aria-label={t.ivTitle} title={t.ivTitle} onClick={() => setInviting(true)}>✉️</button>}
          </div>}
        </section>
        {signed && <PointsCard t={t} locale={locale} s={points} onOpen={() => setPointsOpen(true)} />}
        {signed && <TravelStats t={t} locale={locale} world={world} plans={signed.plans} travel={signed.travel} onEdit={() => setSettings(true)} />}</>}
        <nav className="wl-seg" role="tablist">
          {profileSubs.map((k) => (
            <button key={k} role="tab" aria-selected={sub === k} className={sub === k ? "on" : ""} onClick={() => go(k)}>
              <span aria-hidden="true"><I icon={icon[k]} size={20} on={sub === k} /></span><small>{k === "saved" ? t.svTab : k === "res" ? t.rsTab : t.wTabs[k as keyof typeof t.wTabs]}</small>{counts[k] ? <i className="num">{counts[k]}</i> : null}
            </button>
          ))}
        </nav>

        {sub === "passes" && <>
          <section className="stack" style={{ gap: 10 }}>
            {passCards()}
            {signed && passes.length === 0 && <a className="btn ghost press" href={`/${locale}#cities`}>{t.wBuy}</a>}
            {!signed && <button className="btn ghost press" onClick={goSignIn}>🔐 {t.wSignTitle}</button>}
          </section>
          {signed && signed.bookings.length > 0 && (
            <section className="stack" style={{ gap: 10 }}>
              <h2 className="gp-h2 sm">🧑‍💼 {t.wBookings}</h2>
              {signed.bookings.map((b) => (
                <a key={b.id} href={`/${locale}/g/${b.guideId}`} className="card bk" style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="row-between"><b style={{ fontSize: 16 }}>{b.guide}</b><span className={`chip st-${b.status}`}>{t.gpBs[b.status as keyof typeof t.gpBs] ?? b.status}</span></div>
                  <span className="bk-when">📅 {dt.format(new Date(b.startAt))} · {b.hours} h · {b.people} 👤 · {cities[b.city] ?? b.city}</span>
                  {"guidePhone" in b && b.guidePhone && <span className="hint">📞 {t.wGuideContact}: {b.guidePhone}</span>}
                  {"meeting" in b && b.meeting && <span className="hint">📍 {t.wMeet}: {b.meeting}</span>}
                </a>
              ))}
            </section>
          )}
        </>}
        {sub === "res" && <Reservations t={t} locale={locale} cities={cities} tzOf={tzOf} signed={Boolean(signed)} />}
        {sub === "saved" && (social?.profile ? <SavedGrid t={t} locale={locale} cities={cities} /> : nudge)}
        {sub === "plans" && (signed ? <Plans t={t} locale={locale} cities={cities} plans={signed.plans} /> : nudge)}
        {sub === "wish" && <Wishlist t={t} locale={locale} cities={cities} signed={Boolean(signed)} list={wish} setList={setWish} />}
        {sub === "places" && (signed ? <Visited t={t} locale={locale} wallet={signed} cities={cities} countryOf={countryOf} memories={memories} onChange={(visited) => setW({ ...signed, visited })} /> : nudge)}
        {sub === "memories" && (
          <section className="stack" style={{ gap: 10 }}>
            {memories.length === 0 && w !== null && <div className="card gp-empty"><span aria-hidden="true">📔</span><b>{t.diaryEmpty}</b><a className="btn press" href={`/${locale}#cities`} style={{ width: "auto", marginTop: 8 }}>{t.diaryExplore}</a></div>}
            <div className="wl-mems">
              {memories.map((x) => (
                <article key={x.id} className="card dy-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {x.photo && <img src={x.photo} alt="" loading="lazy" />}
                  <div className="stack" style={{ gap: 4, padding: 14 }}>
                    <span className="label" style={{ color: "var(--cobalt)" }}>📍 {x.cityName}{x.local ? ` · ${t.wLocalOnly}` : ""}</span>
                    <b>{x.title}</b>
                    <span className="hint">{d.format(new Date(x.at))}</span>
                    {x.note && <p style={{ margin: 0 }}>{x.note}</p>}
                    <div className="ex-acts">
                      <button onClick={() => void share(x)}>↗ {t.diaryShare}</button>
                      <button onClick={() => void remove(x)}>🗑 {t.diaryDelete}</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </>}

      {/* ---------- Barra de baixo ---------- */}
      <Portal><nav className="nv" aria-label={t.wallet}>
        <Link href={`/${locale}`} prefetch aria-label={t.nvHome}><span><I icon={House} on={false} /></span><small>{t.nvHome}</small></Link>
        <button className={section === "home" ? "on" : ""} onClick={() => { if (section === "home") window.scrollTo({ top: 0, behavior: "smooth" }); go("home"); }} aria-label={t.nvNow}><span><I icon={Zap} on={section === "home"} /></span><small>{t.nvNow}</small></button>
        <button className={section === "explore" || section === "videos" ? "on" : ""} onClick={() => go("explore")} aria-label={t.nvExplore}><span><I icon={Compass} on={section === "explore"} /></span><small>{t.nvExplore}</small></button>
        <button className={section === "trip" ? "on" : ""} onClick={() => go("trip")} aria-label={t.wallet}><span><I icon={Luggage} on={section === "trip"} /></span><small>{t.nvTrip}</small></button>
        <button className={section === "profile" ? "on" : ""} onClick={() => go("profile")} aria-label={t.nvProfile}>
          <span>{prof ? <Avatar p={prof} size={26} /> : <I icon={UserRound} on={section === "profile"} />}</span><small>{t.nvProfile}</small>
        </button>
      </nav></Portal>

      {tools && <ToolsSheet t={t} locale={locale} cities={cities} mine={myCities} localCur={myCities[0] ? currencyForCountry(countryOf[myCities[0]]) : null} tab={tools.tab} split={tools.split ?? null} signed={Boolean(signed)}
        onClose={() => { setTools(null); if (/^#(split|tools|offline)/.test(window.location.hash)) history.replaceState(null, "", window.location.pathname + (tab !== "home" ? `#${tab}` : "")); }} />}
      {deep?.post && signed && <PostSheet t={t} locale={locale} id={deep.post} cities={cities} onClose={closeDeep} />}
      {deep?.tag && signed && <TagSheet t={t} locale={locale} tag={deep.tag} cities={cities} onClose={closeDeep} />}
      {composing && social && <Composer t={t} social={social} cities={cities} defaultCity={myCities[0] ?? null} initialText={composeText} onClose={(c) => { setComposing(false); setComposeText(""); if (c) { setRefreshKey((k) => k + 1); if (section !== "home") setTab("home"); } }} />}
      {editing && <ProfileEditor t={t} initial={prof} onClose={(c) => { setEditing(false); if (c) refreshSocial(); }} />}
      {onboard && signed && <InterestsOnboarding t={t} initial={signed.hobbies} onDone={(h) => { setOnboard(false); if (h) setW({ ...signed, hobbies: h }); }} />}
      {inviting && <InviteSheet t={t} locale={locale} onClose={() => setInviting(false)} />}
      {pointsOpen && points && <PointsSheet t={t} locale={locale} s={points} onClose={() => setPointsOpen(false)} />}
      {searching && <GlobalSearch t={t} locale={locale} cities={cities} onClose={() => setSearching(false)} />}
      {notifOpen && <NotifsSheet t={t} locale={locale} cities={cities} onRead={() => void refreshUnread()} onClose={() => { setNotifOpen(false); if (window.location.hash === "#notifs") history.replaceState(null, "", window.location.pathname); }} />}
      {settings && <SettingsSheet t={t} locale={locale} hobbies={signed?.hobbies ?? []} social={social} cities={cities} onHobbies={(h) => signed && setW({ ...signed, hobbies: h })} onClose={(c) => { setSettings(false); if (c) refreshSocial(); }} />}
    </div>
  );
}

function SignNudge({ t, onClick }: { t: Dict; onClick: () => void }) {
  return <div className="card gp-empty"><span aria-hidden="true">🔐</span><b>{t.wSignTitle}</b><p className="hint" style={{ margin: 0 }}>{t.wSignSub}</p><button className="btn press" style={{ width: "auto", marginTop: 8 }} onClick={onClick}>{t.wSignBtn}</button></div>;
}

/* ---------- Wishlist ---------- */
function Wishlist({ t, locale, cities, signed, list, setList }: { t: Dict; locale: Locale; cities: Record<string, string>; signed: boolean; list: Wish[] | null; setList: (l: Wish[]) => void }) {
  const [toPlan, setToPlan] = useState<Wish | null>(null);
  const [msg, setMsg] = useState("");
  const groups = useMemo(() => { const m = new Map<string, Wish[]>(); for (const w of list ?? []) m.set(w.city, [...(m.get(w.city) ?? []), w]); return [...m.entries()]; }, [list]);
  if (!list) return null;
  const remove = (w: Wish) => { const next = list.filter((x) => wishKey(x) !== wishKey(w)); setList(next); void saveWish(next); };
  return (
    <section className="stack" style={{ gap: 10 }} id="wishlist">
      {list.length === 0 && <div className="card gp-empty"><span aria-hidden="true">🤍</span><b>{t.wlWishEmpty}</b><a className="btn press" href={`/${locale}#cities`} style={{ width: "auto", marginTop: 8 }}>{t.diaryExplore}</a></div>}
      {list.length > 0 && !signed && <p className="hint" style={{ margin: 0 }}>{t.wlWishLocal}</p>}
      {groups.map(([city, items]) => (
        <div key={city} className="card stack wl-wish">
          <a className="wl-wish-h" href={`/${locale}/c/${city}#explore`}><b>📍 {cities[city] ?? items[0].cityName ?? city}</b><span className="hint num">{items.length} →</span></a>
          {items.map((w) => (
            <div key={wishKey(w)} className="wl-wish-row">
              <span className="cp-ic" aria-hidden="true">{w.icon ?? "📍"}</span>
              <b className="ad-ellip" style={{ flex: 1, minWidth: 0 }}>{w.title}</b>
              <span className="ex-acts sm">
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${w.lat},${w.lng}`} target="_blank" rel="noreferrer">🧭 {t.exGo}</a>
                {signed && <button onClick={() => setToPlan(w)}>🗺 {t.plAddTo}</button>}
                <button aria-label={t.wlRemove} title={t.wlRemove} onClick={() => remove(w)}>✕</button>
              </span>
            </div>
          ))}
        </div>
      ))}
      {msg && <p className="note">✓ {msg}</p>}
      {toPlan && <AddToPlan t={t} locale={locale} cityId={toPlan.city} cityName={cities[toPlan.city] ?? toPlan.cityName ?? toPlan.city} item={{ title: toPlan.title, lat: toPlan.lat, lng: toPlan.lng, icon: toPlan.icon ?? "📍", kind: "place" }} onClose={(m) => { setToPlan(null); if (m) { setMsg(m); setTimeout(() => setMsg(""), 3000); } }} />}
    </section>
  );
}

/* ---------- Planos de viagem ---------- */
/** Estado do plano em relação a hoje: a decorrer, hoje, amanhã, daqui a N dias ou terminado. */
function planStatus(start: string | null, days: number): { k: "now" | "today" | "tomorrow" | "past" | "in"; n: number } | null {
  if (!start) return null;
  const day = (s: Date) => Math.floor((s.getTime() - s.getTimezoneOffset() * 60000) / 86400_000);
  const a = day(new Date(`${start}T12:00:00`)), today = day(new Date());
  if (today > a + days - 1) return { k: "past", n: 0 };
  if (today === a) return { k: days > 1 ? "now" : "today", n: 0 };
  if (today > a) return { k: "now", n: 0 };
  if (a - today === 1) return { k: "tomorrow", n: 1 };
  return { k: "in", n: a - today };
}
const mapUrl = (pts: { lat: number; lng: number }[]) => {
  const ll = (p: { lat: number; lng: number }) => `${p.lat},${p.lng}`;
  if (pts.length === 1) return `https://www.google.com/maps/search/?api=1&query=${ll(pts[0])}`;
  const q = new URLSearchParams({ api: "1", origin: ll(pts[0]), destination: ll(pts[pts.length - 1]), travelmode: "walking" });
  if (pts.length > 2) q.set("waypoints", pts.slice(1, -1).map(ll).join("|"));
  return `https://www.google.com/maps/dir/?${q.toString()}`;
};
function Plans({ t, locale, cities, plans }: { t: Dict; locale: Locale; cities: Record<string, string>; plans: Wallet["plans"] }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", city: Object.keys(cities)[0] ?? "", other: "", start: "", days: 2 });
  const [busy, setBusy] = useState(false);
  const d = new Intl.DateTimeFormat(INTL_LOCALE[locale], { day: "numeric", month: "short" });
  // Apagar sem abrir o plano: some logo e pode anular durante 5 s.
  const [list, setList] = useState(plans);
  useEffect(() => setList(plans), [plans]);
  function remove(id: string) {
    const before = list;
    withUndo(t.pc.deleted, t.pc.undo, {
      apply: () => setList((l) => l.filter((x) => x.id !== id)), revert: () => setList(before),
      commit: () => fetch(`/api/me/plans/${id}`, { method: "DELETE" }).catch(() => null), icon: "🗑"
    });
  }
  async function duplicate(p: Wallet["plans"][number]) {
    const full = await fetch(`/api/me/plans/${p.id}`).then((r) => (r.ok ? r.json() : null)).catch(() => null) as { items?: unknown[] } | null;
    const r = await fetch("/api/me/plans", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `${p.title} ${t.pc.copy}`.slice(0, 120), city: p.city, cityName: p.cityName, startDate: p.startDate, days: p.days, items: full?.items ?? [] }) }).then((x) => (x.ok ? x.json() : null)).catch(() => null) as { id?: string } | null;
    if (!r?.id) { toast(t.tsError, { tone: "err" }); return; }
    toast(t.pc.duplicated);
    setList((l) => [{ ...p, id: r.id!, title: `${p.title} ${t.pc.copy}`.slice(0, 120), updatedAt: new Date().toISOString() }, ...l]);
  }
  async function create(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const other = f.city === "__other";
    const cityName = other ? f.other.trim() : cities[f.city];
    const r = await fetch("/api/me/plans", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: f.title.trim() || cityName, city: other ? null : f.city, cityName, startDate: f.start || null, days: f.days }) }).catch(() => null);
    const j = r?.ok ? await r.json() : null;
    if (j?.id) window.location.href = `/${locale}/plan/${j.id}`; else setBusy(false);
  }
  return (
    <section className="stack" style={{ gap: 10 }}>
      <div className="row-between"><h2 className="gp-h2">🗺 {t.plTitle}</h2><button className="link-btn" onClick={() => setOpen(!open)}>{t.plNew}</button></div>
      <a className="qs-days press" href={`/${locale}/plan/new`}><span aria-hidden="true">✨</span><span><b>{t.dp.cta}</b><small>{t.dp.ctaSub}</small></span></a>
      {open && (
        <form className="card stack wl-form" onSubmit={create}>
          <div className="field"><label htmlFor="pn">{t.plName}</label><input id="pn" value={f.title} maxLength={120} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder={f.city === "__other" ? f.other : cities[f.city]} /></div>
          <div className="grid2">
            <SearchPick id="pc" free label={t.plCity} placeholder={t.spCity} value={f.city === "__other" ? f.other || null : f.city}
              onChange={(v, l) => (v && cities[v] ? setF({ ...f, city: v, other: "" }) : setF({ ...f, city: "__other", other: (l ?? v ?? "").slice(0, 80) }))}
              options={Object.entries(cities).sort((a, b) => a[1].localeCompare(b[1])).map(([id, n]) => ({ value: id, label: n, icon: "📍" }))} />
          </div>
          <div className="grid2">
            <div className="field"><label htmlFor="ps">{t.plStart}</label><input id="ps" type="date" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></div>
            <div className="field"><label htmlFor="pd">{t.plDays}</label><select id="pd" value={f.days} onChange={(e) => setF({ ...f, days: Number(e.target.value) })}>{Array.from({ length: 14 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
          </div>
          <button className="btn press" disabled={busy || (f.city === "__other" && !f.other.trim())}>{t.plCreate}</button>
        </form>
      )}
      {list.map((p) => {
        const st = planStatus(p.startDate, p.days);
        const end = p.startDate ? new Date(new Date(`${p.startDate}T12:00:00`).getTime() + (p.days - 1) * 86400_000) : null;
        const dates = p.startDate ? (p.days > 1 && end ? `${d.format(new Date(`${p.startDate}T12:00:00`))} – ${d.format(end)}` : d.format(new Date(`${p.startDate}T12:00:00`))) : "";
        const more = p.count - p.preview.length;
        return (
          <article key={p.id} className="pc-card">
            <a href={`/${locale}/plan/${p.id}`} className="pc-main press">
              <span className="pc-top">
                <span className="label">📍 {p.cityName}{dates ? ` · ${dates}` : ""}</span>
                {st && <span className={`pc-st ${st.k}`}>{st.k === "in" ? fmt(t.pc.inDays, { n: st.n }) : t.pc[st.k]}</span>}
              </span>
              <b className="wl-city">{p.title}</b>
              {p.preview.length ? (
                <span className="pc-prev">{p.preview.map((x, i) => <span key={i}>{x.icon} {x.title}</span>)}{more > 0 && <span className="pc-more">+{more}</span>}</span>
              ) : <span className="hint">{t.pc.empty}</span>}
              <span className="hint">{p.days === 1 ? fmt(t.plDay, { n: 1 }) : fmt(t.plDaysN, { n: p.days })} · {p.count === 1 ? t.pc.one : fmt(t.plItems, { n: p.count })}</span>
            </a>
            <span className="pc-acts">
              {p.pts.length > 0 && <a className="pc-ic" href={mapUrl(p.pts)} target="_blank" rel="noopener noreferrer" aria-label={t.pc.map} title={t.pc.map}><I icon={MapIcon} size={17} /></a>}
              <button type="button" className="pc-ic" aria-label={t.pc.duplicate} title={t.pc.duplicate} onClick={() => void duplicate(p)}><Copy size={17} aria-hidden="true" /></button>
              <button type="button" className="pc-ic red" aria-label={t.pc.delete} title={t.pc.delete} onClick={() => remove(p.id)}><Trash2 size={17} aria-hidden="true" /></button>
            </span>
          </article>
        );
      })}
      {!list.length && !open && <button className="btn ghost press" onClick={() => setOpen(true)}>{t.plNew}</button>}
    </section>
  );
}

/* ---------- Cidades visitadas ---------- */
function Visited({ t, locale, wallet, cities, countryOf, memories, onChange }: { t: Dict; locale: Locale; wallet: Wallet; cities: Record<string, string>; countryOf: Record<string, string>; memories: Memory[]; onChange: (v: Wallet["visited"]) => void }) {
  const [open, setOpen] = useState<"visited" | "wish" | null>(null);
  const [spot, setSpot] = useState<{ name: string; country: string; year?: number; mine: boolean; want?: boolean } | null>(null);
  const [f, setF] = useState({ name: "", country: "", year: "" });
  const region = useMemo(() => { try { return new Intl.DisplayNames([INTL_LOCALE[locale]], { type: "region" }); } catch { return null; } }, [locale]);
  const countries = useMemo(() => COUNTRY_CODES.map((c) => ({ c, n: region?.of(c) ?? c })).sort((a, b) => a.n.localeCompare(b.n)), [region]);
  // Visitadas com a app (passes e memórias) + as que o viajante acrescentou; "quero visitar" à parte.
  const auto = useMemo(() => {
    const m = new Map<string, { name: string; country: string }>();
    for (const p of wallet.passes) if (p.city && cities[p.city]) m.set(p.city, { name: cities[p.city], country: countryOf[p.city] ?? "" });
    for (const x of memories) if (!m.has(x.city)) m.set(x.city, { name: x.cityName, country: countryOf[x.city] ?? "" });
    return [...m.values()];
  }, [wallet.passes, memories, cities, countryOf]);
  const been = useMemo(() => {
    const seen = new Set(auto.map((a) => a.name.toLowerCase()));
    return [...auto.map((a) => ({ ...a, mine: false, at: 0, year: undefined as number | undefined })), ...wallet.visited.filter((v) => !v.want && !seen.has(v.name.toLowerCase())).map((v) => ({ ...v, mine: true }))];
  }, [auto, wallet.visited]);
  const wish = wallet.visited.filter((v) => v.want);
  const nCountries = new Set(been.map((a) => a.country).filter(Boolean)).size;
  const same = (a: { name: string; country: string }, b: { name: string; country: string }) => a.name === b.name && a.country === b.country;
  async function save(visited: Wallet["visited"]) {
    onChange(visited);
    await fetch("/api/me/prefs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visited }) }).catch(() => null);
  }
  const ourId = (name: string) => Object.entries(cities).find(([, n]) => n.toLowerCase() === name.toLowerCase())?.[0];
  return (
    <section className="stack" style={{ gap: 12 }}>
      <div className="row-between"><h2 className="gp-h2">🌍 {t.vTitle}</h2><span className="hint">{fmt(t.vStats, { c: been.length, p: nCountries })}</span></div>
      <div className="vs-grid">{been.map((v) => (
        <span key={`${v.name}-${v.country}`} className={`vs-chip ${v.mine ? "" : "auto"}`}>
          <button className="vs-open" onClick={() => setSpot(v)} aria-label={v.name}><span aria-hidden="true">{flag(v.country)}</span><b>{v.name}</b>{v.year ? <small>{v.year}</small> : !v.mine ? <small>{t.vAuto}</small> : null}</button>
          {v.mine && <button aria-label="✕" onClick={() => void save(wallet.visited.filter((x) => !same(x, v)))}>✕</button>}
        </span>
      ))}</div>

      <div className="row-between" style={{ marginTop: 6 }}><h2 className="gp-h2" style={{ fontSize: 18 }}>✈️ {t.vWishTitle}</h2><span className="hint">{wish.length}</span></div>
      {wish.length > 0 && <div className="vs-grid">{wish.map((v) => {
        const id = ourId(v.name);
        return (
          <span key={`w-${v.name}-${v.country}`} className="vs-chip wish">
            <button className="vs-open" onClick={() => setSpot({ ...v, mine: true, want: true })} aria-label={v.name}><span aria-hidden="true">{flag(v.country)}</span><b>{v.name}</b>{v.year ? <small>{v.year}</small> : null}</button>
            {id && <a href={`/${locale}/c/${id}`} title={t.wOpen}>→</a>}
            <button title={t.vBeen} onClick={() => void save(wallet.visited.map((x) => (same(x, v) ? { name: x.name, country: x.country, at: Date.now(), year: new Date().getFullYear() } : x)))}>✓</button>
            <button aria-label="✕" onClick={() => void save(wallet.visited.filter((x) => !same(x, v)))}>✕</button>
          </span>
        );
      })}</div>}

      {spot && <CitySheet t={t} locale={locale} spot={spot} id={ourId(spot.name) ?? null} wallet={wallet} memories={memories} onClose={() => setSpot(null)} />}
      {open ? (
        <form className="card stack wl-form" onSubmit={(e) => { e.preventDefault(); if (!f.name.trim() || !f.country) return; void save([...wallet.visited.filter((x) => !same(x, { name: f.name.trim(), country: f.country })), { name: f.name.trim(), country: f.country, ...(f.year ? { year: Number(f.year) } : {}), ...(open === "wish" ? { want: true } : {}), at: Date.now() }]); setF({ name: "", country: f.country, year: "" }); setOpen(null); }}>
          <div className="ex-tabs" role="tablist">
            <button type="button" className={open === "visited" ? "on" : ""} onClick={() => setOpen("visited")}>🌍 {t.vKindBeen}</button>
            <button type="button" className={open === "wish" ? "on" : ""} onClick={() => setOpen("wish")}>✈️ {t.vKindWish}</button>
          </div>
          <div className="grid2">
            <SearchPick id="vc" free label={t.vCity} placeholder={t.spCity} value={f.name || null}
              onChange={(v, l) => { const id = v && cities[v] ? v : null; setF({ ...f, name: id ? cities[id] : l ?? v ?? "", country: id && countryOf[id] ? countryOf[id] : f.country }); }}
              options={Object.entries(cities).map(([id, n]) => ({ value: id, label: n, icon: flag(countryOf[id] ?? ""), sub: region?.of(countryOf[id] ?? "") ?? "" })).sort((a, b) => a.label.localeCompare(b.label))} />
            <SearchPick id="vk" label={t.vCountry} placeholder={t.spCountry} value={f.country || null} onChange={(v) => setF({ ...f, country: v ?? "" })}
              options={countries.map((x) => ({ value: x.c, label: x.n, icon: flag(x.c) }))} />
          </div>
          <div className="field"><label htmlFor="vy">{open === "wish" ? t.vYearWish : t.vYear}</label><input id="vy" inputMode="numeric" maxLength={4} value={f.year} onChange={(e) => setF({ ...f, year: e.target.value.replace(/\D/g, "") })} /></div>
          <div className="grid2"><button type="button" className="btn ghost press" onClick={() => setOpen(null)}>{t.exCancel}</button><button className="btn press">{t.vSave}</button></div>
        </form>
      ) : (
        <div className="grid2">
          <button className="btn ghost press" onClick={() => setOpen("visited")}>{t.vAdd}</button>
          <button className="btn ghost press" onClick={() => setOpen("wish")}>{t.vAddWish}</button>
        </div>
      )}
    </section>
  );
}
