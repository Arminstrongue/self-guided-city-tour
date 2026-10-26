/**
 * Imagens ilustrativas do site (geradas para a VOYBU; não são fotografias de serviços reais).
 * Ficheiros em /public/img/site/<slug>-640.webp e -1280.webp. "fp" = ponto de foco (object-position).
 */
export const SITE_IMAGES = {
  "homepage-hero": { fp: "60% 40%" }, "airport-arrival": { fp: "38% 35%" }, "find-my-way": { fp: "42% 30%" },
  "london-explore": { fp: "55% 35%" }, "tube-navigation": { fp: "70% 35%" }, "nyc-neighbourhood": { fp: "40% 40%" },
  "nyc-subway": { fp: "45% 35%" }, "dubai-old-city": { fp: "45% 45%" }, "dubai-metro": { fp: "50% 35%" },
  "dubai-city": { fp: "70% 40%" }, "audio-walk": { fp: "28% 35%" }, "trip-wallet": { fp: "40% 50%" },
  "family-travel": { fp: "50% 45%" }, "accessible-city": { fp: "40% 50%" }, "local-food": { fp: "65% 40%" },
  "nearby-essentials": { fp: "50% 40%" }, "luggage-storage": { fp: "50% 40%" }, "stay-connected": { fp: "40% 40%" },
  "pharmacy-help": { fp: "50% 35%" }, "local-partner": { fp: "50% 40%" }
} as const;
export type SiteImageKey = keyof typeof SITE_IMAGES;
export const siteImg = (k: SiteImageKey, w: 640 | 1280 = 1280) => `/img/site/${k}-${w}.webp`;
