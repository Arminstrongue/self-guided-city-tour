"use client";
import { useEffect } from "react";
import { track } from "@/lib/track";

/** Conta (uma vez por sessão, sem dados pessoais) quando a página dá um erro no navegador. */
export function ErrorTracker() {
  useEffect(() => {
    const on = () => track("client_error", {}, "session");
    window.addEventListener("error", on);
    window.addEventListener("unhandledrejection", on);
    return () => { window.removeEventListener("error", on); window.removeEventListener("unhandledrejection", on); };
  }, []);
  return null;
}
