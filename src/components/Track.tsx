"use client";
import { useEffect } from "react";
import { track } from "@/lib/track";
import type { EventName } from "@/lib/metrics";

/** Regista um evento quando a página abre (uma vez por sessão, por defeito). */
export function Track({ name, city, locale, refCode, once = "session" }: { name: EventName; city?: string; locale?: string; refCode?: string; once?: "session" | "day" }) {
  useEffect(() => { track(name, { city, locale, ref: refCode || undefined }, once); }, [name, city, locale, refCode, once]);
  return null;
}
