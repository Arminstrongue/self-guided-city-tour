"use client";
/** Mensagens e notificações por ler (selos da carteira), atualizado em tempo real. */
import { useCallback, useEffect, useRef, useState } from "react";
import { useLive, type LiveEvent } from "./live-client";

export function useUnread(enabled: boolean) {
  const [n, setN] = useState({ chats: 0, notifs: 0 });
  const check = useCallback(() => fetch("/api/me/notifications?count=1", { cache: "no-store" }).then((r) => r.json()).then((j) => setN({ chats: j.chats ?? 0, notifs: j.n ?? 0 })).catch(() => null), []);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useLive(useCallback((ev: LiveEvent) => {
    if (ev.t === "msg" || ev.t === "notif" || ev.t === "read") { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => void check(), 400); }
  }, [check]));
  useEffect(() => {
    if (!enabled) return;
    void check();
    const id = setInterval(() => { if (document.visibilityState === "visible") void check(); }, 60_000);
    const vis = () => { if (document.visibilityState === "visible") void check(); };
    document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", vis); };
  }, [enabled, check]);
  return { unread: n.chats, notifs: n.notifs, refreshUnread: check };
}
