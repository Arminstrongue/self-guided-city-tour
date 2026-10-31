/**
 * Metro de Londres: ordem das estações das linhas Northern e Victoria (dos painéis das plataformas, fotografados pela VOYBU
 * em out. 2026) e o conselho "que comboio apanho": linha, sentido, ramal (via Charing Cross / via Bank), destinos a procurar
 * na frente do comboio, n.º de paragens e onde mudar. Os serviços podem mudar: confirmar sempre o destino no ecrã da plataforma.
 */
export type TubeLine = "northern" | "victoria";
type Path = { line: TubeLine; via?: "cx" | "bank"; st: string[] };   // ordem: norte → sul

const N_EDG = ["Edgware", "Burnt Oak", "Colindale", "Hendon Central", "Brent Cross", "Golders Green", "Hampstead", "Belsize Park", "Chalk Farm"];
const N_HB = ["High Barnet", "Totteridge & Whetstone", "Woodside Park", "West Finchley", "Finchley Central", "East Finchley", "Highgate", "Archway", "Tufnell Park", "Kentish Town"];
const N_MHE = ["Mill Hill East", "Finchley Central", "East Finchley", "Highgate", "Archway", "Tufnell Park", "Kentish Town"];
const N_CX = ["Camden Town", "Mornington Crescent", "Euston", "Warren Street", "Goodge Street", "Tottenham Court Road", "Leicester Square", "Charing Cross", "Embankment", "Waterloo", "Kennington"];
const N_BANK = ["Camden Town", "Euston", "King's Cross St. Pancras", "Angel", "Old Street", "Moorgate", "Bank", "London Bridge", "Borough", "Elephant & Castle", "Kennington"];
const N_MOR = ["Oval", "Stockwell", "Clapham North", "Clapham Common", "Clapham South", "Balham", "Tooting Bec", "Tooting Broadway", "Colliers Wood", "South Wimbledon", "Morden"];
const N_BPS = ["Nine Elms", "Battersea Power Station"];
const VIC = ["Walthamstow Central", "Blackhorse Road", "Tottenham Hale", "Seven Sisters", "Finsbury Park", "Highbury & Islington", "King's Cross St. Pancras", "Euston", "Warren Street", "Oxford Circus", "Green Park", "Victoria", "Pimlico", "Vauxhall", "Stockwell", "Brixton"];

const PATHS: Path[] = [];
for (const north of [N_EDG, N_HB, N_MHE]) for (const [via, mid] of [["cx", N_CX], ["bank", N_BANK]] as const) for (const south of [N_MOR, N_BPS]) {
  PATHS.push({ line: "northern", via, st: [...north, ...mid, ...south] });
}
PATHS.push({ line: "victoria", st: VIC });

const norm = (s: string) => s.toLowerCase().replace(/\bst\.?\b/g, "st").replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
export const TUBE_STATIONS = [...new Set(PATHS.flatMap((p) => p.st))].sort((a, b) => a.localeCompare(b));
export const findStation = (s: string) => TUBE_STATIONS.find((x) => norm(x) === norm(s)) ?? null;

export type TubeLeg = { line: TubeLine; via?: "cx" | "bank"; dir: "N" | "S"; from: string; to: string; stops: number; ends: string[] };
export type TubeAdvice = { legs: TubeLeg[] } | null;

/** Troço direto numa linha: todos os percursos com as duas estações; destinos = terminais no sentido da viagem. */
function direct(a: string, b: string): TubeLeg[] {
  const ok = PATHS.filter((p) => p.st.includes(a) && p.st.includes(b));
  if (!ok.length) return [];
  const byKey = new Map<string, Path[]>();
  for (const p of ok) { const k = `${p.line}|${p.st.indexOf(a) > p.st.indexOf(b) ? "N" : "S"}|${p.via && sameCentre(p, a, b) ? p.via : ""}`; byKey.set(k, [...(byKey.get(k) ?? []), p]); }
  return [...byKey.entries()].map(([k, ps]) => {
    const [line, dir, via] = k.split("|") as [TubeLine, "N" | "S", string];
    const p = ps[0];
    return { line, dir, via: (via || undefined) as TubeLeg["via"], from: a, to: b, stops: Math.abs(p.st.indexOf(a) - p.st.indexOf(b)),
      // Mill Hill East é um ramal curto com poucos comboios: só aparece quando é para lá que vai.
      ends: [...new Set(ps.map((x) => (dir === "N" ? x.st[0] : x.st[x.st.length - 1])))].filter((e, _i, all) => e !== "Mill Hill East" || b === "Mill Hill East" || all.length === 1) };
  }).sort((x, y) => x.stops - y.stops);
}
/** A viagem passa pelo troço central (entre Camden Town e Kennington), onde os ramais Charing Cross e Bank se separam? */
function sameCentre(p: Path, a: string, b: string) {
  const i = p.st.indexOf(a), j = p.st.indexOf(b), lo = Math.min(i, j), hi = Math.max(i, j);
  const c0 = p.st.indexOf("Camden Town"), c1 = p.st.indexOf("Kennington");
  return hi > c0 && lo < c1;
}

/** Conselho de viagem com, no máximo, uma mudança. */
export function tubeAdvice(fromIn: string, toIn: string): TubeAdvice {
  const a = findStation(fromIn), b = findStation(toIn);
  if (!a || !b || a === b) return null;
  const d = direct(a, b);
  if (d.length) {
    // Os dois ramais centrais servem a viagem (ex.: Camden Town → Kennington): mostra o mais curto primeiro.
    return { legs: [d[0]] };
  }
  let best: { legs: TubeLeg[]; n: number } | null = null;
  for (const x of TUBE_STATIONS) {
    if (x === a || x === b) continue;
    const l1 = direct(a, x)[0], l2 = direct(x, b)[0];
    if (l1 && l2 && (!best || l1.stops + l2.stops < best.n)) best = { legs: [l1, l2], n: l1.stops + l2.stops };
  }
  return best ? { legs: best.legs } : null;
}
