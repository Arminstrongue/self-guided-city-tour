"use client";
/**
 * Secções pesadas da página da cidade carregadas só quando ficam perto do ecrã (Explorar, Segurança,
 * Comentários): a página abre mais depressa e quem não desce não descarrega esse código.
 */
import { useEffect, useRef, useState, type ComponentProps } from "react";
import dynamic from "next/dynamic";
import type { Explore as ExploreT } from "./Explore";
import type { SafetyPanel as SafetyT } from "./Safety";
import type { PlaceComments as CommentsT } from "./Comments";

const ExploreD = dynamic(() => import("./Explore").then((m) => m.Explore), { ssr: false });
const SafetyD = dynamic(() => import("./Safety").then((m) => m.SafetyPanel), { ssr: false });
const CommentsD = dynamic(() => import("./Comments").then((m) => m.PlaceComments), { ssr: false });

function WhenNear({ minH, children }: { minH: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || on) return;
    if (!("IntersectionObserver" in window)) { setOn(true); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setOn(true); io.disconnect(); } }, { rootMargin: "600px 0px" });
    io.observe(el);
    // Links com âncora (#explore) ou pesquisa no navegador: carrega também passado um momento.
    const idle = window.setTimeout(() => setOn(true), 6000);
    return () => { io.disconnect(); window.clearTimeout(idle); };
  }, [on]);
  return <div ref={ref} style={on ? undefined : { minHeight: minH }}>{on ? children : null}</div>;
}

export const LazyExplore = (p: ComponentProps<typeof ExploreT>) => <WhenNear minH={420}><ExploreD {...p} /></WhenNear>;
export const LazySafety = (p: ComponentProps<typeof SafetyT>) => <WhenNear minH={160}><SafetyD {...p} /></WhenNear>;
export const LazyComments = (p: ComponentProps<typeof CommentsT>) => <WhenNear minH={120}><CommentsD {...p} /></WhenNear>;
