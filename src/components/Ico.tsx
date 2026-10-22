"use client";
/**
 * Ícones da app: traço fino e cantos redondos (Lucide), sempre na cor do texto.
 * `on` = estado ativo (traço mais forte e fundo suave); `solid` = preenchido (gosto, guardado).
 */
import type { LucideIcon } from "lucide-react";
export {
  House, Compass, Clapperboard, Plus, Bell, MessageCircle, Heart, Send, Bookmark, Volume2, VolumeX, Maximize2, Play, Pause,
  Settings, Menu, Map as MapIcon, Globe, Sparkles, CalendarDays, Wrench, Ticket, BookOpen, Mic, Image as ImageIcon, MapPin, Ellipsis,
  ArrowLeftRight, CloudDownload, Receipt, Search, X, ChevronLeft, Camera, Users, SendHorizontal, LayoutGrid, Luggage, Zap
} from "lucide-react";

export function I({ icon: Icon, size = 24, on = false, solid = false, className, stroke = 2 }: {
  icon: LucideIcon; size?: number; on?: boolean; solid?: boolean; className?: string; stroke?: number;
}) {
  return (
    <Icon size={size} strokeWidth={on || solid ? Math.max(stroke, 2.25) : stroke}
      fill={on || solid ? "currentColor" : "none"} fillOpacity={solid ? 1 : on ? 0.16 : 0}
      className={`ico${on ? " on" : ""}${solid ? " solid" : ""}${className ? ` ${className}` : ""}`} aria-hidden="true" />
  );
}
