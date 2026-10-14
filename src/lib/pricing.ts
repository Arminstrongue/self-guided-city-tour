/** Preços de venda (cêntimos, IVA incluído) e planos de comerciante. */
export const TOUR_PLANS = {
  city: { amount: 499, hours: 48, label: "city" },
  all: { amount: 999, hours: 24 * 30, label: "all" }
} as const;
export type TourPlan = keyof typeof TOUR_PLANS;

export const MERCHANT_PLANS = {
  basic: { amount: 0 },
  featured: { amount: 1900 },
  partner: { amount: 4900 }
} as const;
export type MerchantPlan = keyof typeof MERCHANT_PLANS;

/** Comissão paga ao comerciante Parceiro QR sobre acessos vendidos pelo seu QR. */
export const PARTNER_COMMISSION = 0.2;
/** Margem antes do voo para estar no aeroporto (minutos). */
export const AIRPORT_BUFFER_MIN = 150;
