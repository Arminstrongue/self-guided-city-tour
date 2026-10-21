"use client";
/**
 * Comportamento comum de todas as folhas (.sheet dentro de .sheet-bg), sem mexer em cada uma:
 * - acessibilidade: role="dialog", foco vai para a folha ao abrir e volta ao botão ao fechar, Tab fica dentro, Esc fecha;
 * - gesto: arrastar para baixo (no topo da folha) fecha, como nas apps nativas.
 */
import { useEffect } from "react";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const topBg = () => { const all = document.querySelectorAll<HTMLElement>(".sheet-bg"); return all[all.length - 1] ?? null; };
const sheetOf = (bg: HTMLElement | null) => (bg ? (Array.from(bg.children).find((c) => c.classList.contains("sheet")) as HTMLElement | undefined) ?? null : null);

export function SheetManager() {
  useEffect(() => {
    const opener = new WeakMap<HTMLElement, Element | null>();
    const seen = new Set<HTMLElement>();
    let last: Element | null = null;
    const track = (e: Event) => { last = e.target as Element; };
    document.addEventListener("pointerdown", track, true);
    document.addEventListener("focusin", track, true);

    function setup(bg: HTMLElement) {
      if (seen.has(bg)) return; seen.add(bg);
      const sh = sheetOf(bg); if (!sh) return;
      if (!sh.getAttribute("role")) sh.setAttribute("role", "dialog");
      sh.setAttribute("aria-modal", "true");
      if (!sh.hasAttribute("tabindex")) sh.tabIndex = -1;
      opener.set(bg, last);
      requestAnimationFrame(() => { if (!sh.contains(document.activeElement)) sh.focus({ preventScroll: true }); });
    }
    function teardown(bg: HTMLElement) {
      seen.delete(bg);
      const back = opener.get(bg) as HTMLElement | null | undefined;
      if (back && document.contains(back) && typeof back.focus === "function") back.focus({ preventScroll: true });
    }
    document.querySelectorAll<HTMLElement>(".sheet-bg").forEach(setup);
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => { if (!(n instanceof HTMLElement)) return; if (n.classList.contains("sheet-bg")) setup(n); n.querySelectorAll?.<HTMLElement>(".sheet-bg").forEach(setup); });
        m.removedNodes.forEach((n) => { if (!(n instanceof HTMLElement)) return; const bgs = n.classList.contains("sheet-bg") ? [n] : Array.from(n.querySelectorAll?.<HTMLElement>(".sheet-bg") ?? []); bgs.forEach((b) => seen.has(b) && teardown(b)); });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    function key(e: KeyboardEvent) {
      const bg = topBg(); const sh = sheetOf(bg); if (!bg || !sh) return;
      if (e.key === "Escape") {
        // Um campo aberto (ex.: lista de emojis) trata o seu próprio Esc primeiro.
        if ((e.target as HTMLElement)?.closest?.("[data-own-esc]")) return;
        e.preventDefault(); bg.click(); return;
      }
      if (e.key !== "Tab") return;
      const f = Array.from(sh.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((x) => x.offsetParent !== null);
      if (!f.length) { e.preventDefault(); sh.focus(); return; }
      const first = f[0], end = f[f.length - 1];
      if (!sh.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && (document.activeElement === first || document.activeElement === sh)) { e.preventDefault(); end.focus(); }
      else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", key);

    /* Arrastar para baixo para fechar */
    let drag: { sh: HTMLElement; bg: HTMLElement; y0: number; x0: number; t0: number; dy: number; on: boolean } | null = null;
    const scrolledInside = (el: HTMLElement | null, stop: HTMLElement) => {
      for (let n = el; n && n !== stop.parentElement; n = n.parentElement) if (n.scrollTop > 0) return true;
      return false;
    };
    function start(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      const target = e.target as HTMLElement;
      const sh = target.closest?.(".sheet") as HTMLElement | null; if (!sh) return;
      const bg = sh.parentElement; if (!bg?.classList.contains("sheet-bg") || bg !== topBg()) return;
      if (target.closest("input,textarea,select,[type=range],.no-drag,video") || scrolledInside(target, sh)) return;
      drag = { sh, bg, y0: e.touches[0].clientY, x0: e.touches[0].clientX, t0: Date.now(), dy: 0, on: false };
    }
    function move(e: TouchEvent) {
      if (!drag) return;
      const dy = e.touches[0].clientY - drag.y0, dx = e.touches[0].clientX - drag.x0;
      if (!drag.on) {
        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) { drag = null; return; }
        if (dy < 8) { if (dy < -8) drag = null; return; }
        drag.on = true; drag.sh.style.transition = "none";
      }
      drag.dy = Math.max(0, dy);
      drag.sh.style.transform = `translateY(${drag.dy}px)`;
      drag.bg.style.backgroundColor = `rgba(0,0,0,${Math.max(0.05, 0.4 - drag.dy / 900)})`;
    }
    function end() {
      if (!drag) return;
      const { sh, bg, dy, t0, on } = drag; drag = null;
      if (!on) return;
      const fast = dy / Math.max(1, Date.now() - t0) > 0.6;
      sh.style.transition = "transform .22s ease";
      if (dy > Math.min(140, sh.offsetHeight * 0.25) || (fast && dy > 40)) {
        sh.style.transform = `translateY(${sh.offsetHeight}px)`;
        setTimeout(() => bg.click(), 180);
      } else {
        sh.style.transform = ""; bg.style.backgroundColor = "";
        setTimeout(() => { sh.style.transition = ""; }, 240);
      }
    }
    document.addEventListener("touchstart", start, { passive: true });
    document.addEventListener("touchmove", move, { passive: true });
    document.addEventListener("touchend", end);
    document.addEventListener("touchcancel", end);
    return () => {
      mo.disconnect();
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", track, true);
      document.removeEventListener("focusin", track, true);
      document.removeEventListener("touchstart", start);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
      document.removeEventListener("touchcancel", end);
    };
  }, []);
  return null;
}
