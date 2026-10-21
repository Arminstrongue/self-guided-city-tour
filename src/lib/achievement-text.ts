import type { Dict } from "@/i18n/dictionaries";

/**
 * Texto de uma conquista (sem dependências do servidor: usado no push e no centro de notificações do browser).
 * Formato: "level:3" | "badge:cities-5" | "reward:1000:100" (pontos:cêntimos).
 */
export function achievementText(code: string, t: Dict) {
  const [kind, v, c] = code.split(":");
  if (kind === "level") { const n = Number(v); return t.achLevel.replace("{n}", String(n + 1)).replace("{x}", t.ptLevels[n] ?? ""); }
  if (kind === "badge") return t.achBadge.replace("{x}", (t.ptBadgeNames as Record<string, string>)[v] ?? v);
  if (kind === "reward") { const cents = Number(c) || 0; return t.achReward.replace("{x}", `€${Number.isInteger(cents / 100) ? cents / 100 : (cents / 100).toFixed(2)}`); }
  return "";
}
