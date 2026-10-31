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
