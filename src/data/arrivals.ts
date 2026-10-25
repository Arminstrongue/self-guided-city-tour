/**
 * "Acabei de chegar": do ponto de chegada (aeroporto, estação, terminal) até ao centro, um passo de cada vez,
 * com o nome que aparece nas placas. Começa por Londres. Preços aproximados (confirmar no local);
 * escrito pela VOYBU a partir da informação pública dos operadores — sem dados ao vivo.
 */
import { ARRIVALS_MORE } from "./arrivals-more";
import { ARRIVALS_WORLD } from "./arrivals-world";

export type Step = { pt: string; en: string; sign?: string; min?: number };
export type ArrivalOption = {
  id: string; name: string; min: number; fare: string; note?: { pt: string; en: string };
  to: { name: string; lat: number; lng: number }; // onde sai (o "centro" a partir do qual se continua)
  steps: Step[];
};
export type ArrivalPoint = { id: string; kind: "airport" | "station" | "port"; name: string; code?: string; lat: number; lng: number; options: ArrivalOption[] };

const contactless: Step = {
  pt: "Pague com cartão bancário contactless ou telemóvel nas barreiras (sem bilhete). Use sempre o mesmo cartão ou telemóvel: o preço diário tem limite.",
  en: "Pay with a contactless bank card or phone at the gates (no ticket needed). Always use the same card or phone: daily fares are capped.",
  sign: "Contactless · Oyster"
};

export const ARRIVALS: Record<string, ArrivalPoint[]> = {
  lon: [
    {
      id: "lhr", kind: "airport", name: "Heathrow", code: "LHR", lat: 51.47, lng: -0.4543, options: [
        {
          id: "lhr-eliz", name: "Elizabeth line", min: 35, fare: "≈ £13", to: { name: "Tottenham Court Road", lat: 51.5165, lng: -0.131 },
          note: { pt: "O equilíbrio entre preço e rapidez para o centro.", en: "The best balance of price and speed into central London." },
          steps: [
            { pt: "Depois da bagagem e da alfândega, siga as placas de comboios.", en: "After baggage and customs, follow the train signs.", sign: "Trains · Elizabeth line", min: 8 },
            contactless,
            { pt: "Apanhe a Elizabeth line no sentido leste (para Abbey Wood ou Shenfield).", en: "Take the Elizabeth line eastbound (towards Abbey Wood or Shenfield).", sign: "Elizabeth line → Abbey Wood / Shenfield" },
            { pt: "Saia em Paddington, Bond Street, Tottenham Court Road ou Liverpool Street — a mais perto do seu destino.", en: "Get off at Paddington, Bond Street, Tottenham Court Road or Liverpool Street — whichever is closest to where you're going.", sign: "Paddington · Bond Street · Tottenham Court Road", min: 35 }
          ]
        },
        {
          id: "lhr-picc", name: "Piccadilly line (Underground)", min: 55, fare: "≈ £5.60", to: { name: "Piccadilly Circus", lat: 51.5098, lng: -0.1342 },
          note: { pt: "A opção mais barata; mais lenta e com escadas em algumas estações.", en: "The cheapest option; slower, with stairs at some stations." },
          steps: [
            { pt: "Siga as placas do metro (o símbolo vermelho e azul).", en: "Follow the Underground signs (the red and blue roundel).", sign: "Underground · Piccadilly line", min: 8 },
            contactless,
            { pt: "Apanhe a Piccadilly line para o centro (Cockfosters / Arnos Grove).", en: "Take the Piccadilly line into central London (towards Cockfosters / Arnos Grove).", sign: "Piccadilly line → Cockfosters" },
            { pt: "Saia em South Kensington, Green Park, Piccadilly Circus ou King's Cross, conforme o destino.", en: "Get off at South Kensington, Green Park, Piccadilly Circus or King's Cross, depending on where you're going.", sign: "Piccadilly Circus", min: 55 }
          ]
        },
        {
          id: "lhr-hex", name: "Heathrow Express", min: 15, fare: "≈ £25", to: { name: "Paddington", lat: 51.5154, lng: -0.1755 },
          note: { pt: "A mais rápida, só até Paddington; bilhetes antecipados mais baratos.", en: "The fastest, to Paddington only; advance tickets are cheaper." },
          steps: [
            { pt: "Siga as placas de comboios até à plataforma do Heathrow Express.", en: "Follow the train signs to the Heathrow Express platform.", sign: "Trains · Heathrow Express", min: 8 },
            { pt: "Compre o bilhete na app, máquina ou use contactless.", en: "Buy a ticket in the app or machine, or use contactless.", sign: "Heathrow Express tickets" },
            { pt: "Saia em Paddington (fim da linha).", en: "Get off at Paddington (end of the line).", sign: "Paddington", min: 15 }
          ]
        }
      ]
    },
    {
      id: "lgw", kind: "airport", name: "Gatwick", code: "LGW", lat: 51.1537, lng: -0.1821, options: [
        {
          id: "lgw-thl", name: "Thameslink", min: 45, fare: "≈ £15", to: { name: "London Bridge", lat: 51.5049, lng: -0.0863 },
          note: { pt: "Atravessa o centro (London Bridge, Farringdon, St Pancras).", en: "Runs through the centre (London Bridge, Farringdon, St Pancras)." },
          steps: [
            { pt: "Se chegou ao Terminal Norte, apanhe o shuttle gratuito para o Terminal Sul (2 min). A estação fica no Terminal Sul.", en: "If you arrived at the North Terminal, take the free shuttle to the South Terminal (2 min). The station is at the South Terminal.", sign: "Inter-terminal shuttle · Trains", min: 10 },
            contactless,
            { pt: "Apanhe o Thameslink para Londres (Bedford, Cambridge ou Peterborough).", en: "Take Thameslink into London (towards Bedford, Cambridge or Peterborough).", sign: "Thameslink → London Bridge" },
            { pt: "Saia em London Bridge, Blackfriars, Farringdon ou St Pancras.", en: "Get off at London Bridge, Blackfriars, Farringdon or St Pancras.", sign: "London Bridge", min: 35 }
          ]
        },
        {
          id: "lgw-gex", name: "Gatwick Express", min: 30, fare: "≈ £20", to: { name: "Victoria", lat: 51.4952, lng: -0.1441 },
          note: { pt: "Direto a Victoria, sem paragens.", en: "Non-stop to Victoria." },
          steps: [
            { pt: "Siga para a estação no Terminal Sul (shuttle gratuito se estiver no Norte).", en: "Go to the station at the South Terminal (free shuttle from North).", sign: "Trains · Gatwick Express", min: 10 },
            contactless,
            { pt: "Apanhe o Gatwick Express para London Victoria.", en: "Take the Gatwick Express to London Victoria.", sign: "Gatwick Express → Victoria" },
            { pt: "Saia em Victoria (fim da linha).", en: "Get off at Victoria (end of the line).", sign: "London Victoria", min: 30 }
          ]
        }
      ]
    },
    {
      id: "stn", kind: "airport", name: "Stansted", code: "STN", lat: 51.886, lng: 0.2389, options: [
        {
          id: "stn-sx", name: "Stansted Express", min: 50, fare: "≈ £21", to: { name: "Liverpool Street", lat: 51.5178, lng: -0.0823 },
          steps: [
            { pt: "A estação fica por baixo do terminal: siga as placas de comboios.", en: "The station is under the terminal: follow the train signs.", sign: "Trains · Stansted Express", min: 5 },
            { pt: "Compre o bilhete (app, máquina) ou use contactless.", en: "Buy a ticket (app, machine) or use contactless.", sign: "Tickets" },
            { pt: "Apanhe o Stansted Express para London Liverpool Street.", en: "Take the Stansted Express to London Liverpool Street.", sign: "Stansted Express → Liverpool Street" },
            { pt: "Saia em Tottenham Hale (metro Victoria line) ou Liverpool Street (fim).", en: "Get off at Tottenham Hale (Victoria line) or Liverpool Street (end).", sign: "Liverpool Street", min: 50 }
          ]
        }
      ]
    },
    {
      id: "ltn", kind: "airport", name: "Luton", code: "LTN", lat: 51.8747, lng: -0.3683, options: [
        {
          id: "ltn-lae", name: "Luton Airport Express (DART + comboio)", min: 40, fare: "≈ £20", to: { name: "St Pancras", lat: 51.5308, lng: -0.1238 },
          steps: [
            { pt: "Siga as placas do DART (shuttle automático) até Luton Airport Parkway (4 min).", en: "Follow the DART signs (automatic shuttle) to Luton Airport Parkway (4 min).", sign: "DART · Luton Airport Parkway", min: 8 },
            { pt: "Compre um bilhete que inclua o DART (app, máquina) — o contactless também funciona.", en: "Buy a ticket that includes the DART (app, machine) — contactless also works.", sign: "Tickets · DART" },
            { pt: "Em Parkway, apanhe o comboio para London St Pancras.", en: "At Parkway, take the train to London St Pancras.", sign: "London St Pancras" },
            { pt: "Saia em St Pancras International.", en: "Get off at St Pancras International.", sign: "St Pancras International", min: 30 }
          ]
        }
      ]
    },
    {
      id: "lcy", kind: "airport", name: "London City", code: "LCY", lat: 51.5048, lng: 0.0495, options: [
        {
          id: "lcy-dlr", name: "DLR", min: 25, fare: "≈ £3.50", to: { name: "Bank", lat: 51.5133, lng: -0.0886 },
          steps: [
            { pt: "A estação do DLR está junto ao terminal: siga as placas.", en: "The DLR station is next to the terminal: follow the signs.", sign: "DLR", min: 3 },
            contactless,
            { pt: "Apanhe o DLR para Bank (ou Tower Gateway).", en: "Take the DLR towards Bank (or Tower Gateway).", sign: "DLR → Bank" },
            { pt: "Saia em Bank para o metro ou continue a pé.", en: "Get off at Bank for the Underground or continue on foot.", sign: "Bank", min: 22 }
          ]
        }
      ]
    },
    {
      id: "stp", kind: "station", name: "St Pancras International (Eurostar)", lat: 51.5308, lng: -0.1238, options: [
        {
          id: "stp-tube", name: "Underground (King's Cross St Pancras)", min: 5, fare: "≈ £2.90", to: { name: "King's Cross St Pancras", lat: 51.5308, lng: -0.1238 },
          steps: [
            { pt: "Saia das chegadas do Eurostar e siga as placas do metro.", en: "Leave Eurostar arrivals and follow the Underground signs.", sign: "Underground · King's Cross St Pancras", min: 5 },
            contactless,
            { pt: "Escolha a linha para o seu destino: Victoria, Piccadilly, Northern, Circle, Hammersmith & City ou Metropolitan.", en: "Choose the line for your destination: Victoria, Piccadilly, Northern, Circle, Hammersmith & City or Metropolitan.", sign: "Victoria · Piccadilly · Northern" }
          ]
        }
      ]
    }
  ]
};

/** Nomes das opções estão em português; noutras línguas trocamos as palavras comuns (os nomes próprios ficam). */
const EN_WORDS: [RegExp, string][] = [
  [/Táxi oficial/g, "Official taxi"], [/táxi autorizado \(balcão pré-pago\)/g, "authorised taxi (prepaid counter)"], [/táxi do balcão/g, "taxi from the counter"],
  [/táxi do aeroporto/g, "airport taxi"], [/táxi amarelo/g, "yellow taxi"], [/táxi oficial/g, "official taxi"], [/transfer do hotel/g, "hotel transfer"],
  [/Comboio urbano para/g, "Local train to"], [/Comboio regional/g, "Regional train"], [/Comboio para/g, "Train to"], [/Comboio/g, "Train"], [/comboio/g, "train"],
  [/Autocarro/g, "Bus"], [/autocarro/g, "bus"], [/Elétrico/g, "Tram"], [/elétrico/g, "tram"], [/A pé ou/g, "On foot or"], [/A pé/g, "On foot"],
  [/linha Vermelha/g, "Red line"], [/linha Amarela/g, "Yellow line"], [/linha Prata/g, "Silver line"], [/Linha Azul/g, "Blue Line"], [/Linha (\d)/g, "Line $1"],
  [/linha (\d+)/g, "line $1"], [/linha E, violeta/g, "line E, violet"], [/\(só T2\)/g, "(T2 only)"], [/grátis/g, "free"], [/ ou /g, " or "]
];
export function optionName(o: Pick<ArrivalOption, "name">, locale: string): string {
  return locale === "pt" ? o.name : EN_WORDS.reduce((a, [re, to]) => a.replace(re, to), o.name);
}
/** Valor numérico e moeda de uma tarifa ("≈ £13" → {cur:"£", v:13}; "grátis" → 0). Sem número (ou cartão) → null. */
export function fareValue(fare: string): { cur: string; v: number } | null {
  if (/grátis|free/i.test(fare)) return { cur: "*", v: 0 };
  const m = /([^\d\s≈.,]*)\s*([\d][\d\s]*(?:[.,]\d+)?)\s*([A-Z]{3})?/.exec(fare.replace("≈", ""));
  if (!m) return null;
  const v = Number(m[2].replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(v)) return null;
  return { cur: (m[1] || m[3] || "").trim(), v };
}

/** Etiquetas "mais barato" e "mais rápido" num ponto de chegada (só com 2+ opções comparáveis; empates não ganham). */
export function optionBadges(options: { id: string; min: number; fare: string }[]): { cheap?: string; fast?: string } {
  const out: { cheap?: string; fast?: string } = {};
  if (options.length < 2) return out;
  const priced = options.map((o) => ({ o, f: fareValue(o.fare) })).filter((x) => x.f) as { o: { id: string }; f: { cur: string; v: number } }[];
  const curs = new Set(priced.filter((x) => x.f.cur !== "*").map((x) => x.f.cur));
  if (priced.length >= 2 && curs.size <= 1) {
    const min = Math.min(...priced.map((x) => x.f.v));
    const best = priced.filter((x) => x.f.v === min);
    if (best.length === 1) out.cheap = best[0].o.id;
  }
  const fastest = Math.min(...options.map((o) => o.min));
  const quick = options.filter((o) => o.min === fastest);
  if (quick.length === 1) out.fast = quick[0].id;
  return out;
}

export const fareText = (fare: string, locale: string) => (locale === "pt" ? fare : fare.replace("grátis", "free"));

export const arrivalsFor = (city: string): ArrivalPoint[] => ARRIVALS[city] ?? ARRIVALS_MORE[city] ?? ARRIVALS_WORLD[city] ?? [];
