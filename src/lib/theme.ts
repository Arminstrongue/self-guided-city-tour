"use client";
/** Tema da app (auto / dia / noite) e cor de destaque, guardados no dispositivo e, com perfil, na conta. */
export type Theme = "auto" | "light" | "dark";
export type Accent = "blue" | "purple" | "green" | "orange" | "pink" | "teal";
export const ACCENT_HEX: Record<Accent, string> = { blue: "#0071e3", purple: "#7d5cff", green: "#1f9d55", orange: "#f07300", pink: "#e5317a", teal: "#0e9aa7" };

export function readTheme(): { theme: Theme; accent: Accent } {
  try { return { theme: (localStorage.getItem("sgct:theme") as Theme) || "auto", accent: (localStorage.getItem("sgct:accent") as Accent) || "blue" }; }
  catch { return { theme: "auto", accent: "blue" }; }
}
export function applyTheme(theme: Theme, accent: Accent, save = true) {
  const d = document.documentElement;
  if (theme === "auto") delete d.dataset.theme; else d.dataset.theme = theme;
  if (accent === "blue") delete d.dataset.accent; else d.dataset.accent = accent;
  if (!save) return;
  try { localStorage.setItem("sgct:theme", theme); localStorage.setItem("sgct:accent", accent); } catch { /* ignorar */ }
  void fetch("/api/me/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ theme, accent }) }).catch(() => null);
}
/** Está escuro agora? (para o botão sol/lua) */
export const isDark = (theme: Theme) => theme === "dark" || (theme === "auto" && typeof matchMedia !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches);
