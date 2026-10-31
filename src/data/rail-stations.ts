/**
 * Estações de comboio para escolher ao marcar uma viagem (sem ter de escrever o nome todo).
 * Destinos e paragens dos painéis de partidas de Manchester Piccadilly (fotografados pela VOYBU, out. 2026),
 * com os nomes oficiais por extenso, mais as estações principais da rede.
 */
export const PICCADILLY_DESTINATIONS = [
  "Altrincham", "Barrow-in-Furness", "Blackpool North", "Buxton", "Cardiff Central", "Cleethorpes", "Crewe", "Edinburgh",
  "Hadfield", "Holyhead", "Leeds", "Liverpool Lime Street", "London Euston", "Manchester Airport", "New Mills Central",
  "Rose Hill Marple", "Sheffield", "Stoke-on-Trent", "Wakefield Kirkgate"
];
export const PICCADILLY_CALLING = [
  "Mossley", "Mouldsworth", "Nantwich", "Navigation Road", "New Mills Newtown", "Newport", "Newton for Hyde", "Newton-le-Willows",
  "Northwich", "Nuneaton", "Oxenholme Lake District", "Patricroft", "Penmaenmawr", "Penrith North Lakes", "Plumley",
  "Pontypool and New Inn", "Poynton", "Prestatyn", "Prestbury", "Preston", "Rainhill", "Reddish North", "Rhosneigr", "Rhyl",
  "Romiley", "Runcorn East", "Ryder Brow", "Salford Crescent"
];
const MAIN = [
  "Manchester Piccadilly", "Manchester Oxford Road", "Manchester Victoria", "Stockport", "Wilmslow", "Macclesfield", "Stafford",
  "Birmingham New Street", "Milton Keynes Central", "Warrington Bank Quay", "Lancaster", "York", "Newcastle", "Glasgow Central",
  "London King's Cross", "London St Pancras International", "London Paddington"
];
export const RAIL_STATIONS = [...new Set([...MAIN, ...PICCADILLY_DESTINATIONS, ...PICCADILLY_CALLING])].sort((a, b) => a.localeCompare(b));

/** Fotografias próprias da estação (sem caras: pessoas desfocadas). Manchester é a cidade grátis: são públicas. */
export const PICCADILLY_PHOTOS = {
  concourse: "/img/own/man/station/piccadilly-concourse",
  board: "/img/own/man/station/piccadilly-board"
};
/** A viagem passa por Manchester Piccadilly? */
export const touchesPiccadilly = (texts: (string | undefined | null)[]) => texts.some((s) => /piccadilly/i.test(s ?? "") && /manchester|picc/i.test(s ?? ""));

/** Coordenadas das estações principais (entrada principal): para calcular a hora de sair sem ter de escrever a morada. */
const STATION_COORDS: Record<string, [number, number]> = {
  "manchester piccadilly": [53.4774, -2.2309], "manchester oxford road": [53.4740, -2.2420], "manchester victoria": [53.4875, -2.2425],
  "manchester airport": [53.3654, -2.2729], "stockport": [53.4055, -2.1630], "crewe": [53.0896, -2.4331],
  "liverpool lime street": [53.4074, -2.9776], "leeds": [53.7955, -1.5481], "sheffield": [53.3781, -1.4623], "preston": [53.7566, -2.7077],
  "york": [53.9580, -1.0930], "birmingham new street": [52.4778, -1.8996], "london euston": [51.5282, -0.1337],
  "london king's cross": [51.5308, -0.1238], "london st pancras international": [51.5320, -0.1263], "london paddington": [51.5154, -0.1755],
  "edinburgh": [55.9520, -3.1890], "edinburgh waverley": [55.9520, -3.1890], "glasgow central": [55.8590, -4.2580]
};
export function stationCoords(name: string | undefined | null): { lat: number; lng: number } | null {
  const k = (name ?? "").trim().toLowerCase().replace(/\bst\b\.?$/, "street").replace(/\s+/g, " ");
  const c = STATION_COORDS[k] ?? STATION_COORDS[k.replace(/ station$/, "")];
  return c ? { lat: c[0], lng: c[1] } : null;
}
