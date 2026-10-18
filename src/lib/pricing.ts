/** Preços de venda (cêntimos, IVA incluído) e planos de comerciante. */
export const TOUR_PLANS = {
  city: { amount: 499, hours: 48, label: "city" },      // escala
  trip: { amount: 799, hours: 72, label: "trip" },      // férias curtas: 3 dias numa cidade
  all: { amount: 999, hours: 24 * 30, label: "all" }
} as const;
export type TourPlan = keyof typeof TOUR_PLANS;

export const MERCHANT_PLANS = {
  basic: { amount: 0 },
  featured: { amount: 1900 },
  partner: { amount: 4900 }
} as const;
export type MerchantPlan = keyof typeof MERCHANT_PLANS;

/** Comerciais independentes: 20% de cada fatura de assinatura do cliente angariado, nos primeiros 12 meses. */
export const AGENT_COMMISSION = 0.2;
export const AGENT_MONTHS = 12;

/** Comissão paga ao comerciante Parceiro QR sobre acessos vendidos pelo seu QR. */
export const PARTNER_COMMISSION = 0.2;
/** Margem antes do voo para estar no aeroporto (minutos). */
export const AIRPORT_BUFFER_MIN = 150;

/** Marketplace de guias: a plataforma fica com 20%, o guia recebe 80% (Stripe Connect). */
export const GUIDE_FEE = 0.2;
/** Horas que o guia tem para aceitar um pedido; sem resposta, o pedido expira e o cartão não é cobrado. */
export const GUIDE_RESPOND_HOURS = 48;
export const GUIDE_MIN_HOURLY = 1000;  // 10 €/h
export const GUIDE_MAX_HOURLY = 30000; // 300 €/h
