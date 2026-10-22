/**
 * Acessibilidade indicativa por paragem (no caminho para lá ou no local): subida íngreme, escadas ou piso irregular.
 * Só estão marcadas as que conhecemos com segurança; o resto é plano ou quase. Confirmar no terreno.
 */
export type Access = "hill" | "steps" | "uneven";
export const ACCESS: Record<string, Access[]> = {
  // Lisboa: colinas da Sé, Alfama, Graça, Chiado e Bairro Alto (há elétrico 28, elevadores e o funicular da Glória)
  se: ["hill"], "santa-luzia": ["hill"], graca: ["hill", "steps"], carmo: ["hill"], "sao-pedro": ["hill"],
  // Porto
  clerigos: ["hill"], "se-porto": ["hill", "steps"], "ponte-luis": ["hill"], ribeira: ["steps"],
  // Paris
  montmartre: ["hill", "steps"], eiffel: ["steps"],
  // Roma
  vittoriano: ["steps"], spagna: ["steps"],
  // Edimburgo
  calton: ["hill", "steps"], castle: ["hill"], "st-giles": ["hill"], "victoria-st": ["hill", "steps"], holyrood: ["hill", "uneven"],
  // Glasgow
  necropolis: ["hill", "uneven"], "uni-gla": ["hill"],
  // Istambul
  galata: ["hill"], cistern: ["steps"], topkapi: ["hill"],
  // Praga
  hrad: ["hill", "steps"], "mala-strana": ["hill"], vysehrad: ["hill"],
  // Cairo e Amã
  pyramids: ["uneven"], sphinx: ["uneven"], "citadel-cai": ["hill"], citadel: ["hill"], "roman-theatre": ["steps"], rainbow: ["hill"],
  // Liverpool
  "met-cathedral": ["steps"],
  // São Francisco: colinas
  "sf-northbeach": ["hill"], "sf-lombard": ["hill", "steps"], "sf-chinatown": ["hill"],
  // Boston: Beacon Hill
  "bos-statehouse": ["hill"],
  "la-griffith": ["hill"], "la-gcm": ["hill"], "nola-royal": ["uneven"], "nola-garden": ["uneven"],
  "mx-templo": ["steps", "uneven"], "rio-selaron": ["steps"], "rio-arcos": ["uneven"], "rio-cristo": ["steps"], "ba-santelmo": ["uneven"], "ba-boca": ["uneven"]
};
export const accessOf = (id: string): Access[] => ACCESS[id] ?? [];
/** Quantas paragens do percurso têm subidas, escadas ou piso irregular. */
export const accessCount = (ids: string[]) => ids.filter((id) => ACCESS[id]?.length).length;

/** Mês em que as tarifas de transporte e os preços das entradas foram verificados (AAAA-MM). */
export const PRICES_CHECKED = "2026-10";
