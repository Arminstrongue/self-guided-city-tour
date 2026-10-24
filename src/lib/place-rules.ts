/**
 * Regras de acesso habituais por tipo de lugar (mochilas, revista, bilhete, vestuário…), deduzidas do nome
 * e do ícone do lugar no plano. São indicações gerais — o ecrã pede sempre para confirmar no site oficial.
 */
export type PlaceType = "museum" | "library" | "religious" | "music" | "theatre" | "stadium" | "castle" | "park" | "view" | "market" | "other";
export const RULES = ["bagsCloak", "bagsSmall", "security", "noFood", "noFlash", "id18", "dress", "quiet", "ticket", "dusk", "dogs", "noGlass", "cash", "weather"] as const;
export type Rule = (typeof RULES)[number];
/** Regras que mudam o que leva ou veste (aparecem primeiro, com aviso). */
export const WARN: ReadonlySet<Rule> = new Set(["bagsCloak", "bagsSmall", "security", "id18", "dress", "ticket", "noGlass"]);

const KW: [PlaceType, RegExp][] = [
  ["religious", /\b(cathedral|church|abbey|basilica|chapel|mosque|masjid|temple|synagogue|minster|kirk|sé|igreja|catedral|iglesia|église|kirche|dom|duomo|chiesa|cami|camii)\b/i],
  ["stadium", /\b(stadium|arena|ground|old trafford|etihad|anfield|wembley|estádio|estadio|stade|stadion|stadio)\b/i],
  ["music", /\b(live music|concert|gig|band on the wall|club|jazz|music hall|o2|academy|ritz|night|bar)\b/i],
  ["theatre", /\b(theatre|theater|opera|ballet|playhouse|teatro|théâtre)\b/i],
  ["library", /\b(library|biblioteca|bibliothèque|bibliothek)\b/i],
  ["museum", /\b(museum|gallery|galleries|museu|museo|musée|exhibition|whitworth|tate|louvre|prado|uffizi|rijksmuseum)\b/i],
  ["castle", /\b(castle|palace|tower|fort|fortress|castelo|palácio|castillo|palacio|château|schloss|burg|palazzo|kremlin)\b/i],
  ["market", /\b(market|mercado|marché|markt|mercato|souk|bazaar|çarşı)\b/i],
  ["park", /\b(park|garden|gardens|fields|common|heath|jardim|parque|jardín|jardin|garten|giardino|bahçe)\b/i],
  ["view", /\b(view|viewpoint|lookout|passage|bridge|miradouro|mirador|belvédère|aussicht)\b/i]
];
const ICON_TYPE: Record<string, PlaceType> = { "🌳": "park", "🌅": "view", "🎵": "music", "🌙": "music", "🏟": "stadium", "🧺": "market", "⛪": "religious", "🕌": "religious", "🏰": "castle", "🏛": "museum", "🖼": "museum", "🎭": "museum", "📚": "library" };

export function placeType(title: string, icon?: string): PlaceType {
  for (const [ty, re] of KW) if (re.test(title)) return ty;
  return (icon && ICON_TYPE[icon]) || "other";
}

const BY_TYPE: Record<PlaceType, Rule[]> = {
  museum: ["bagsCloak", "noFood", "noFlash", "ticket"],
  library: ["bagsCloak", "quiet", "noFood", "noFlash"],
  religious: ["dress", "quiet", "noFlash"],
  music: ["bagsSmall", "security", "id18", "noGlass", "ticket"],
  theatre: ["bagsSmall", "ticket", "noFood"],
  stadium: ["bagsSmall", "security", "noGlass", "ticket"],
  castle: ["security", "ticket", "bagsCloak"],
  park: ["dusk", "dogs", "weather"],
  view: ["weather"],
  market: ["cash", "weather"],
  other: []
};

/** Regras do lugar, avisos primeiro. */
export function placeRules(title: string, icon?: string): Rule[] {
  const r = BY_TYPE[placeType(title, icon)];
  return [...r.filter((x) => WARN.has(x)), ...r.filter((x) => !WARN.has(x))];
}

export const RULE_ICON: Record<Rule, string> = {
  bagsCloak: "🎒", bagsSmall: "👜", security: "🛂", noFood: "🥪", noFlash: "📷", id18: "🪪", dress: "👕", quiet: "🤫",
  ticket: "🎟", dusk: "🌇", dogs: "🐕", noGlass: "🍾", cash: "💶", weather: "🌦"
};

/** Pesquisa das regras oficiais do lugar (página de visita / política de sacos). */
export const officialRulesUrl = (title: string, city: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(`${title} ${city} visitor information bag policy`)}`;
