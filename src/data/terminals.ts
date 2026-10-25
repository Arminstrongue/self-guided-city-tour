/**
 * Terminais dos aeroportos: nomes oficiais, que voos servem (só agrupamentos oficiais), transportes que lá param,
 * como passar de um para outro e quando chegar. Só factos de fontes oficiais; textos noutras línguas em
 * data/terminals-i18n/<l>.json (chave "IATA.campo" ou "IATA.código.campo").
 */
import type { GTxt } from "./arrival-guides";
import { TERMINALS_DATA } from "./terminals-data";

export type Terminal = { code: string; name: string; lat?: number; lng?: number; serves?: GTxt; transit?: GTxt };
export type AirportTerminals = { terminals: Terminal[]; between?: GTxt; arrive?: GTxt; sources: string[]; checked: string };
export const TERMINALS: Record<string, AirportTerminals> = TERMINALS_DATA;
export const terminalsOf = (iata?: string | null): AirportTerminals | null => (iata ? TERMINALS[iata.toUpperCase()] ?? null : null);
