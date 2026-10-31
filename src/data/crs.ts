/** Códigos CRS (3 letras) das estações que a VOYBU usa, para pedir os painéis em tempo real à National Rail. */
import { normStation } from "./rail-lines";
const CRS: Record<string, string> = {
  "manchester piccadilly": "MAN", "manchester oxford road": "MCO", "manchester victoria": "MCV", "manchester airport": "MIA",
  "stockport": "SPT", "crewe": "CRE", "levenshulme": "LVM", "heaton chapel": "HTC", "cheadle hulme": "CHU", "handforth": "HTF",
  "wilmslow": "WML", "alderley edge": "ALD", "holmes chapel": "HCH", "sandbach": "SDB", "macclesfield": "MAC", "stoke on trent": "SOT",
  "liverpool lime street": "LIV", "leeds": "LDS", "sheffield": "SHF", "preston": "PRE", "york": "YRK", "birmingham new street": "BHM",
  "london euston": "EUS", "london king's cross": "KGX", "london st pancras international": "STP", "london paddington": "PAD",
  "edinburgh": "EDB", "edinburgh waverley": "EDB", "glasgow central": "GLC", "warrington bank quay": "WBQ", "milton keynes central": "MKC",
  "stafford": "STA", "lancaster": "LAN", "newcastle": "NCL",
  "rugby": "RUG", "coventry": "COV", "birmingham international": "BHI", "wolverhampton": "WVH", "wigan north western": "WGN",
  "liverpool south parkway": "LPY", "runcorn": "RUN", "watford junction": "WFJ", "chester": "CTR", "holyhead": "HHD",
  "carlisle": "CAR", "oxenholme lake district": "OXN", "tring": "TRI", "northampton": "NMP", "nuneaton": "NUN"
};
export const crsOf = (name: string | undefined | null) => (name ? CRS[normStation(name)] ?? null : null);

export const KNOWN_CRS = new Set(Object.values(CRS));
