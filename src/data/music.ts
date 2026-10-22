/** VOYBU Originals: faixas originais da casa (30 s), livres para usar em publicações e histórias. */
export type Track = { id: string; title: string; mood: "chill" | "upbeat" | "jazz" | "tropical" | "night" | "epic" | "acoustic" | "oriental"; bpm: number; colors: [string, string] };
export const MUSIC: Track[] = [
  { id: "golden-hour", title: "Golden Hour", mood: "chill", bpm: 78, colors: ["#ff9f0a", "#ff375f"] },
  { id: "city-walk", title: "City Walk", mood: "upbeat", bpm: 112, colors: ["#30d158", "#0a84ff"] },
  { id: "cafe-morning", title: "Café Morning", mood: "jazz", bpm: 92, colors: ["#a2845e", "#5e3a1e"] },
  { id: "beach-breeze", title: "Beach Breeze", mood: "tropical", bpm: 100, colors: ["#64d2ff", "#0fb5ae"] },
  { id: "night-lights", title: "Night Lights", mood: "night", bpm: 100, colors: ["#5e5ce6", "#bf5af2"] },
  { id: "adventure", title: "Adventure", mood: "epic", bpm: 90, colors: ["#1c1c1e", "#ff453a"] },
  { id: "sunday-market", title: "Sunday Market", mood: "acoustic", bpm: 104, colors: ["#ffd60a", "#ff9f0a"] },
  { id: "desert-dusk", title: "Desert Dusk", mood: "oriental", bpm: 96, colors: ["#ff9f0a", "#8e3b1f"] }
];
export const MUSIC_ARTIST = "VOYBU Originals";
export const trackById = (id: string) => MUSIC.find((t) => t.id === id) ?? null;
