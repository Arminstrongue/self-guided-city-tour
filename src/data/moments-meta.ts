/** Só os ícones e o tipo dos momentos (sem os dados): para componentes do cliente não levarem moments.ts inteiro. */
export type When = "sunset" | "morning" | "night" | "weekend" | "day";
export const WHEN_ICON: Record<When, string> = { sunset: "🌅", morning: "☀️", night: "🌙", weekend: "📅", day: "🕐" };
