/**
 * Dicas de viagem mostradas ao marcar transporte ou fazer o plano. Cada dica factual tem a fonte oficial;
 * as dicas de conforto são conselhos gerais (sem números inventados). Nunca afirmar que um canal é "mais barato"
 * sem fonte: no Reino Unido os bilhetes Advance (comprados antes) costumam ser os mais baratos.
 */
import { COUNTRY } from "./city-meta";

export type TipId = "advance" | "railcard" | "fees" | "contactless" | "cardClash" | "platform" | "early" | "tightChange" | "offline" | "comfort";
export type Tip = { id: TipId; icon: string; src?: string };

const UK_RAIL: Tip[] = [
  { id: "advance", icon: "🎫", src: "https://www.northernrailway.co.uk/tickets/29-advance" },
  { id: "railcard", icon: "💳", src: "https://railcard.co.uk" },
  { id: "fees", icon: "🧾", src: "https://www.orr.gov.uk/monitoring-regulation/rail/passengers/consumer-law-investigation-and-enforcement/online-ticket-fees" }
];
const LONDON: Tip[] = [
  { id: "contactless", icon: "📲", src: "https://tfl.gov.uk/info-for/media/press-releases/2015/april/tfl-travel-tips-helping-customers-to-get-the-best-value" },
  { id: "cardClash", icon: "⚠️", src: "https://tfl.gov.uk/fares/how-to-pay-and-where-to-buy-tickets-and-oyster/pay-as-you-go/card-clash" }
];
const GENERAL: Tip[] = [
  { id: "platform", icon: "🚉" }, { id: "early", icon: "⏱" }, { id: "tightChange", icon: "🔁" }, { id: "offline", icon: "📴" }, { id: "comfort", icon: "🧃" }
];

/** Dicas para uma cidade e um meio de transporte (comboio/autocarro); `cities` são as cidades da viagem. */
export function tipsFor(o: { cities: string[]; mode: "train" | "bus" | "plane" | "ship" | "walk" | "stay" | "plan"; hasChange?: boolean }): Tip[] {
  const uk = o.cities.some((c) => COUNTRY[c] === "GB");
  const ldn = o.cities.includes("lon");
  const rail = o.mode === "train" || o.mode === "plan";
  return [
    ...(uk && rail ? UK_RAIL : []),
    ...(ldn ? LONDON : []),
    ...GENERAL.filter((g) => (g.id === "tightChange" ? o.hasChange !== false && (o.mode === "train" || o.mode === "bus") : g.id === "platform" ? o.mode === "train" || o.mode === "bus" : true))
  ];
}
