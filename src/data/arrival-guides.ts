/**
 * Guia da estação para cada opção de «Acabei de chegar»: da recolha de bagagem até ao comboio, metro, autocarro ou táxi.
 * Só factos verificados em fontes oficiais (aeroporto, operador de transportes); campo sem confirmação fica vazio.
 * Texto base em pt/en; as outras línguas em data/arrival-guides-i18n/<l>.json (chave "opção.campo").
 */
export type GTxt = { pt: string; en: string };
export type StationGuide = {
  walkMin?: number;
  fromBaggage?: GTxt;
  follow?: GTxt & { label: string; color?: string };
  lift?: GTxt;
  luggage?: GTxt;
  escalator?: GTxt;
  tickets?: GTxt;
  platforms?: GTxt;
  photo?: { page: string; image: string; author: string; license: string };
  sources: string[];
  checked: string; // "AAAA-MM"
};
export const GUIDE_FIELDS = ["fromBaggage", "follow", "lift", "luggage", "escalator", "tickets", "platforms"] as const;
export type GuideField = (typeof GUIDE_FIELDS)[number];

import { GUIDES_DATA } from "./arrival-guides-data";
export const GUIDES: Record<string, StationGuide> = GUIDES_DATA;
export const guideFor = (optionId: string): StationGuide | null => GUIDES[optionId] ?? null;
