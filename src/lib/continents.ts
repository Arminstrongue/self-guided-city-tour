/** Continente de cada país (ISO 3166-1 alfa-2), para contar continentes visitados. Países fora da lista não contam. */
const C: Record<string, string> = {};
const add = (k: string, list: string) => list.split(" ").forEach((cc) => { C[cc] = k; });
add("eu", "PT ES FR GB IE DE NL BE LU CH AT IT VA SM MT GR CY DK NO SE FI IS EE LV LT PL CZ SK HU SI HR BA RS ME MK AL XK RO BG MD UA BY RU LI MC AD");
add("af", "MA DZ TN LY EG SD SS ET ER DJ SO KE UG TZ RW BI CD CG CF CM GA GQ ST NG NE TD ML BF SN GM GW GN SL LR CI GH TG BJ MR CV AO ZM ZW MW MZ MG MU SC KM NA BW ZA LS SZ");
add("as", "TR GE AM AZ IR IQ SY LB JO IL PS SA YE OM AE QA BH KW AF PK IN NP BT BD LK MV CN MN KP KR JP TW HK MO VN LA KH TH MM MY SG ID BN PH TL KZ UZ TM KG TJ");
add("na", "US CA MX GT BZ SV HN NI CR PA CU JM HT DO PR BS BB TT LC VC GD AG DM KN");
add("sa", "CO VE GY SR EC PE BR BO PY UY AR CL");
add("oc", "AU NZ FJ PG SB VU WS TO KI FM MH PW NR TV");
export const continentOf = (cc: string) => C[cc.toUpperCase()] ?? null;
export const continentsCount = (ccs: Iterable<string>) => new Set([...ccs].map(continentOf).filter(Boolean)).size;
