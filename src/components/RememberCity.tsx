"use client";
import { useEffect } from "react";
import { rememberCity } from "@/lib/last-city";

/** Guarda a cidade aberta: "Essenciais", "Explorar" e outros ecrãs abrem nela. */
export function RememberCity({ id }: { id: string }) {
  useEffect(() => { rememberCity(id); }, [id]);
  return null;
}
