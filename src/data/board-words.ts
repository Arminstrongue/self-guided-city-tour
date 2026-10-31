/**
 * Como os nomes aparecem nos painéis de partidas do Reino Unido (abreviados por falta de espaço),
 * a partir dos painéis fotografados pela VOYBU em Londres Euston (out. 2026): "Manchester Picc", "Milton Keynes Ctl",
 * "Liverpool South PW", "Warrington Bk Quay", "Lichfield T Valley", "Edinburgh Wav", "Birmingham N St", "Birmingham Intl".
 */
const RULES: [RegExp, string][] = [
  [/\bPiccadilly\b/, "Picc"], [/\bCentral\b/, "Ctl"], [/\bParkway\b/, "PW"], [/\bBank Quay\b/, "Bk Quay"],
  [/\bTrent Valley\b/, "T Valley"], [/\bWaverley\b/, "Wav"], [/\bNew Street\b/, "N St"], [/\bInternational\b/, "Intl"],
  [/\bLime Street\b/, "Lime St"], [/\bJunction\b/, "Jn"], [/\bStreet\b/, "St"], [/\bRoad\b/, "Rd"], [/\bNorth Western\b/, "North West"]
];

/** Formas em que o nome de uma estação pode aparecer num painel (nome completo + abreviaturas). */
export function boardNames(full: string): string[] {
  const name = full.trim().replace(/\s+/g, " ");
  if (!name) return [];
  const out = new Set<string>([name]);
  let cur = name;
  for (const [re, ab] of RULES) if (re.test(cur)) { cur = cur.replace(re, ab); out.add(cur); }
  // Também cada regra sozinha (os painéis nem sempre abreviam tudo).
  for (const [re, ab] of RULES) if (re.test(name)) out.add(name.replace(re, ab));
  // "London Euston" aparece muitas vezes só como "Euston" nos painéis de outras estações.
  if (/^London /.test(name)) out.add(name.replace(/^London /, ""));
  return [...out];
}

/** O nome do painel corresponde à estação? (para destacar "a sua paragem" na lista "Calling at"). */
export function sameStation(board: string, full: string) {
  const n = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return boardNames(full).some((v) => n(v) === n(board));
}
