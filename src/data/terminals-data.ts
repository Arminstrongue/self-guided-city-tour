import type { AirportTerminals } from "./terminals";
// Gerado a partir da pesquisa em fontes oficiais (ver `sources`). Coordenadas não incluídas (não verificadas).
export const TERMINALS_DATA: Record<string, AirportTerminals> = {
 "LHR": {
  "terminals": [
   {
    "code": "2",
    "name": "Terminal 2 (The Queen's Terminal)",
    "transit": {
     "pt": "Elizabeth line, Piccadilly line e Heathrow Express: estação Heathrow Terminals 2 & 3, a poucos minutos a pé por passagem subterrânea",
     "en": "Elizabeth line, Piccadilly line and Heathrow Express: Heathrow Terminals 2 & 3 station, a few minutes' walk via subway"
    }
   },
   {
    "code": "3",
    "name": "Terminal 3",
    "transit": {
     "pt": "Elizabeth line, Piccadilly line e Heathrow Express: estação Heathrow Terminals 2 & 3, a poucos minutos a pé por passagem subterrânea",
     "en": "Elizabeth line, Piccadilly line and Heathrow Express: Heathrow Terminals 2 & 3 station, a few minutes' walk via subway"
    }
   },
   {
    "code": "4",
    "name": "Terminal 4",
    "transit": {
     "pt": "Elizabeth line (estação por baixo das Chegadas do T4) e Piccadilly line (alguns comboios). Sem Heathrow Express: troque grátis em Terminals 2 & 3.",
     "en": "Elizabeth line (station below T4 Arrivals) and Piccadilly line (some trains). No Heathrow Express: change free at Terminals 2 & 3."
    }
   },
   {
    "code": "5",
    "name": "Terminal 5",
    "serves": {
     "pt": "British Airways (alguns voos BA usam o Terminal 3). Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "British Airways (some BA flights use Terminal 3). Confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Elizabeth line, Piccadilly line e Heathrow Express: estação Heathrow Terminal 5",
     "en": "Elizabeth line, Piccadilly line and Heathrow Express: Heathrow Terminal 5 station"
    }
   }
  ],
  "sources": [
   "https://www.heathrow.com/heathrow-blog/top-tips-for-timing-your-airport-journey",
   "https://www.heathrow.com/transport-and-directions/by-rail-or-train/elizabeth-line",
   "https://www.heathrowairport.com/content/dam/heathrow/web/common/documents/transport/Status-of-rail-services.pdf",
   "https://www.heathrow.com/at-the-airport/airport-maps/travel-between-terminals",
   "https://www.britishairways.com/content/information/airport-information/london-heathrow-airport/heathrow-t5",
   "https://en.wikipedia.org/wiki/Heathrow_Terminal_2"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Grátis entre terminais no Heathrow Express, Elizabeth line e Piccadilly line (valide Oyster/contactless sem custo, ou bilhete de transferência grátis). T2 e T3: a pé.",
   "en": "Free between terminals on Heathrow Express, Elizabeth line and Piccadilly line (tap Oyster/contactless, not charged, or free transfer ticket). T2 and T3 are walkable."
  },
  "arrive": {
   "pt": "Chegue 2 h antes de voos no Reino Unido/Europa e 3 h antes de longo curso (conselho do aeroporto)",
   "en": "Arrive 2 h before UK/Europe flights, 3 h before long-haul (airport advice)"
  }
 },
 "LCY": {
  "terminals": [
   {
    "code": "T",
    "name": "Terminal",
    "serves": {
     "pt": "Terminal único para todos os voos. Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Single passenger terminal for all flights. Confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "DLR: estação London City Airport, com ligação coberta direta ao terminal",
     "en": "DLR: London City Airport station, with a covered link straight into the terminal"
    }
   }
  ],
  "sources": [
   "https://en.wikipedia.org/wiki/London_City_Airport",
   "https://en.wikipedia.org/wiki/London_City_Airport_DLR_station",
   "https://www.tfl.gov.uk/dlr/stop/940GZZDLLCA/london-city-airport-dlr-station"
  ],
  "checked": "2026-10"
 },
 "BCN": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Voos Schengen (portas A–C) e não-Schengen (portas D–E). Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Schengen (gates A–C) and non-Schengen (gates D–E) flights. Confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Metro L9 Sud: estação Aeroport T1 (por baixo do terminal); Aerobús A1 desde Pl. Catalunya. Sem comboio Rodalies: o R2 Nord só para no T2.",
     "en": "Metro L9 Sud: Aeroport T1 station (under the terminal); Aerobús A1 from Pl. Catalunya. No Rodalies train: R2 Nord stops at T2 only."
    }
   },
   {
    "code": "2",
    "name": "Terminal 2 (T2A, T2B, T2C)",
    "serves": {
     "pt": "Voos Schengen (portas R, S, U) e não-Schengen (portas W, Y, M). Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Schengen (gates R, S, U) and non-Schengen (gates W, Y, M) flights. Confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Comboio Rodalies R2 Nord e metro L9 Sud: estação Aeroport T2, passadiço até ao T2B; Aerobús A2 desde Pl. Catalunya",
     "en": "Rodalies R2 Nord train and metro L9 Sud: Aeroport T2 station, walkway to T2B; Aerobús A2 from Pl. Catalunya"
    }
   }
  ],
  "sources": [
   "https://www.aena.es/en/josep-tarradellas-barcelona-el-prat/airport-services/categories-and-terminals/connecting-flights.html",
   "https://omc.cat/web/portal-atm/atencio-informacio/informacio/informacio-servei-transport-public/com-arribar-aeroport",
   "https://en.wikipedia.org/wiki/Aeroport_T1_(Barcelona_Metro)",
   "https://en.wikipedia.org/wiki/Aeroport_T2_station"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Autocarro gratuito T1–T2: no T1 siga Saída e depois Free Bus Shuttle; 1.ª paragem T2B, depois T2C. O metro L9 Sud também liga ambos (com bilhete).",
   "en": "Free shuttle bus T1–T2: at T1 follow Exit, then Free Bus Shuttle; first stop T2B, then T2C. Metro L9 Sud also links both (ticket needed)."
  }
 },
 "AMS": {
  "terminals": [
   {
    "code": "T",
    "name": "Terminal (Departures 1, 2 and 3)",
    "serves": {
     "pt": "Terminal único; balcões 1–8 em Departures 1, 9–16 em Departures 2, 17–32 em Departures 3. Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Single terminal; check-in desks 1–8 in Departures 1, 9–16 in Departures 2, 17–32 in Departures 3. Confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Comboios NS: estação Schiphol Airport mesmo por baixo do terminal; suba à Schiphol Plaza, menos de 10 min a pé até ao check-in",
     "en": "NS trains: Schiphol Airport station directly below the terminal; go up to Schiphol Plaza, under 10 min walk to check-in"
    }
   }
  ],
  "sources": [
   "https://schiphol.nl/en/blog/when-do-i-need-to-be-where-at-schiphol",
   "https://www.schiphol.nl/en/blog/how-far-in-advance-do-i-need-to-be-at-schiphol",
   "https://www.schiphol.nl/en/from-to-schiphol/by-public-transport/train",
   "https://en.wikipedia.org/wiki/Schiphol_Airport_station"
  ],
  "checked": "2026-10",
  "arrive": {
   "pt": "Conselho do aeroporto: chegue pouco antes da abertura do check-in da sua companhia (ver app Schiphol) e siga o conselho da companhia",
   "en": "Airport advice: arrive shortly before your airline's check-in opens (see Schiphol app) and follow your airline's advice"
  }
 },
 "LPL": {
  "terminals": [
   {
    "code": "T",
    "name": "Terminal",
    "serves": {
     "pt": "Terminal único para todos os voos. Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Single passenger terminal for all flights. Confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Merseyrail até Liverpool South Parkway e depois autocarro 80A ou 86A, à porta da estação, até ao aeroporto",
     "en": "Merseyrail to Liverpool South Parkway, then bus 80A or 86A from outside the station to the airport"
    }
   }
  ],
  "sources": [
   "https://merseyrail.org/destination-merseyside/locations/liverpool-john-lennon-airport",
   "https://en.wikipedia.org/wiki/Liverpool_John_Lennon_Airport"
  ],
  "checked": "2026-10"
 },
 "FRA": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "transit": {
     "pt": "Estação regional (S-Bahn, RE/RB) por baixo do Terminal 1; estação de longo curso (ICE/IC) a cerca de 5 min a pé do Terminal 1",
     "en": "Regional station (S-Bahn, RE/RB) under Terminal 1; long-distance station (ICE/IC) about 5 min walk to Terminal 1"
    }
   },
   {
    "code": "3",
    "name": "Terminal 3 (G, H, J)",
    "serves": {
     "pt": "Companhias antes no Terminal 2 (fechado desde 9 junho 2026 até meados de 2030). Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Airlines formerly in Terminal 2 (closed since 9 June 2026 until mid-2030s). Confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Sem estação ferroviária: de qualquer estação apanhe o SkyLine até ao Terminal 3 (cerca de 10–15 min); siga 'Terminal 3 G, H, J'",
     "en": "No rail station: from either train station take the SkyLine to Terminal 3 (about 10–15 min); follow signs 'Terminal 3 G, H, J'"
    }
   }
  ],
  "sources": [
   "https://www.fraport.com/en/newsroom/press-releases/2026/q2/terminal-2-closed-for-refurbishment-starting-today.html",
   "https://www.frankfurt-airport.com/en/at-the-airport/orientation.html",
   "https://www.frankfurt-airport.com/en/transport-and-parking/to-from-the-airport/travel-by-train.html",
   "https://terminal3.frankfurt-airport.com/en/sky-line-people-mover",
   "https://en.wikipedia.org/wiki/Frankfurt_Airport",
   "https://en.wikipedia.org/wiki/Frankfurt_Airport_regional_station"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Comboio SkyLine gratuito T1–T3, a cada 2–3 min, 4:00–23:00; à noite (22:00–5:00) há autocarro a partir das zonas de chegadas. O Terminal 2 está fechado.",
   "en": "Free SkyLine train T1–T3, every 2–3 min, 4:00–23:00; at night (22:00–5:00) a shuttle bus runs from the arrivals forecourts. Terminal 2 is closed."
  }
 },
 "PRG": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Voos para países fora do espaço Schengen. Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Flights to countries outside the Schengen area. Confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Autocarro 59 desde Nádraží Veleslavín (metro A, ~15 min) e 100 desde Zličín (metro B, ~18 min) param nos dois terminais",
     "en": "Bus 59 from Nádraží Veleslavín (metro A, ~15 min) and bus 100 from Zličín (metro B, ~18 min) stop at both terminals"
    }
   },
   {
    "code": "2",
    "name": "Terminal 2",
    "serves": {
     "pt": "Voos dentro do espaço Schengen. Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Flights within the Schengen area. Confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Autocarro 59 desde Nádraží Veleslavín (metro A, ~15 min) e 100 desde Zličín (metro B, ~18 min) param nos dois terminais",
     "en": "Bus 59 from Nádraží Veleslavín (metro A, ~15 min) and bus 100 from Zličín (metro B, ~18 min) stop at both terminals"
    }
   }
  ],
  "sources": [
   "https://www.prg.aero/en/regular-and-charter-flights",
   "https://www.prg.aero/en/faq-frequently-asked-questions?page=3",
   "https://prg.aero/en/public-transport-buses-to-airport",
   "https://www.prg.aero/en/how-early-my-flight-departs-do-i-need-be-airport"
  ],
  "checked": "2026-10",
  "arrive": {
   "pt": "Chegue pelo menos 2 h antes da partida se despachar bagagem (conselho do aeroporto)",
   "en": "Arrive at least 2 h before departure if checking baggage (airport advice)"
  }
 },
 "DOH": {
  "terminals": [
   {
    "code": "T",
    "name": "Passenger Terminal",
    "serves": {
     "pt": "Terminal único para todos os voos. Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Single passenger terminal for all flights. Confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Metro de Doha, Linha Vermelha: estação Hamad International Airport junto ao terminal",
     "en": "Doha Metro Red Line: Hamad International Airport station at the terminal"
    }
   }
  ],
  "sources": [
   "https://www.dohahamadairport.com/airport-guide/to-from-the-airport/metro",
   "https://www.dohahamadairport.com/press-releases/news/smooth-travels-eid-hamad-international-airports-guide-passengers",
   "https://en.wikipedia.org/wiki/Hamad_International_Airport_T1_station"
  ],
  "checked": "2026-10",
  "arrive": {
   "pt": "Chegue pelo menos 3 h antes do voo (conselho do aeroporto para períodos de maior movimento)",
   "en": "Arrive at least 3 h before your flight (airport advice for busy periods)"
  }
 },
 "AMM": {
  "terminals": [
   {
    "code": "T",
    "name": "Passenger Terminal",
    "transit": {
     "pt": "Shuttle City Terminal da Royal Jordanian de/para o 7th Circle, Amã, a cada 30 min (4 JOD); autocarros públicos saem em frente ao terminal",
     "en": "Royal Jordanian City Terminal Shuttle to/from 7th Circle, Amman, every 30 min (JOD 4); public buses leave from in front of the terminal"
    }
   }
  ],
  "sources": [
   "https://www.rj.com/en/info-and-tips/our-hub-and-beyond/to-from-qaia",
   "https://en.wikipedia.org/wiki/Queen_Alia_International_Airport"
  ],
  "checked": "2026-10"
 },
 "LGW": {
  "terminals": [
   {
    "code": "N",
    "name": "North Terminal",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Sem estação ferroviária: apanhe o shuttle gratuito a partir do South Terminal (cerca de 2 min).",
     "en": "No railway station: take the free shuttle from the South Terminal (about 2 min)."
    }
   },
   {
    "code": "S",
    "name": "South Terminal",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "A estação Gatwick Airport (Gatwick Express, Thameslink, Southern, GWR) liga diretamente ao South Terminal.",
     "en": "Gatwick Airport station (Gatwick Express, Thameslink, Southern, GWR) connects directly to the South Terminal."
    }
   }
  ],
  "sources": [
   "https://www.gatwickairport.com/flights/flight-connections.html",
   "https://www.gatwickairport.com/checking-in.html",
   "https://en.wikipedia.org/wiki/Gatwick_Airport_railway_station",
   "https://en.wikipedia.org/wiki/Gatwick_Airport_Shuttle_Transit"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Shuttle gratuito entre terminais, cerca de 2 min, a cada poucos minutos, 24 h por dia, 365 dias por ano. Estação junto à estação de comboios do South Terminal.",
   "en": "Free inter-terminal shuttle train, about 2 min, every few minutes, 24 h a day, 365 days a year. Station next to the South Terminal train station."
  },
  "arrive": {
   "pt": "Chegue pelo menos 2 h antes do voo (conselho do aeroporto); os horários de check-in variam por companhia.",
   "en": "Arrive at least 2 h before your flight (airport advice); check-in times vary by airline."
  }
 },
 "LIS": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Terminal principal: todas as chegadas e a maioria das partidas. Confirme no cartão de embarque/app da companhia.",
     "en": "Main terminal: all arrivals and most departures. Confirm on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Metro Linha Vermelha, estação Aeroporto, ligada ao Terminal 1 por passagem subterrânea.",
     "en": "Metro Red Line, Aeroporto station, linked to Terminal 1 by an underground walkway."
    }
   },
   {
    "code": "2",
    "name": "Terminal 2",
    "serves": {
     "pt": "Só partidas, sobretudo algumas low-cost; todas as chegadas são no Terminal 1. Confirme no cartão de embarque/app da companhia.",
     "en": "Departures only, mainly some low-cost airlines; all arrivals use Terminal 1. Confirm on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Sem metro: vá de metro até ao T1 e apanhe o autocarro shuttle gratuito para o T2.",
     "en": "No metro: take the metro to T1, then the free shuttle bus to T2."
    }
   }
  ],
  "sources": [
   "https://pt.wikipedia.org/wiki/Aeroporto_Humberto_Delgado",
   "https://en.wikipedia.org/wiki/Aeroporto_Station_(Lisbon_Metro)",
   "https://en.wikivoyage.org/wiki/Lisbon_Airport",
   "https://lisbonlisboaportugal.com/lisbon-transport/terminal-2-lisbon-airport.html"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Autocarro shuttle gratuito entre o T1 (piso das partidas) e o T2, cerca de 3 min, aprox. a cada 10–12 min. Não é viável ir a pé.",
   "en": "Free shuttle bus between T1 (departures level) and T2, about 3 min ride, roughly every 10–12 min. Walking is not practical."
  }
 },
 "CDG": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Sobretudo companhias Star Alliance e outras. Confirme no cartão de embarque/app da companhia.",
     "en": "Mainly Star Alliance airlines and others. Confirm on your boarding pass/airline app."
    },
    "transit": {
     "pt": "RER B até 'Aéroport CDG 1' (Roissypôle, junto ao T3) e depois comboio gratuito CDGVAL até ao Terminal 1.",
     "en": "RER B to 'Aéroport CDG 1' (Roissypôle, by T3), then free CDGVAL train to Terminal 1."
    }
   },
   {
    "code": "2A",
    "name": "Terminal 2A",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Da estação 'Aéroport CDG 2 TGV' (RER B/TGV), siga a pé até aos halls 2A/2B.",
     "en": "From 'Aéroport CDG 2 TGV' station (RER B/TGV), walk to halls 2A/2B."
    }
   },
   {
    "code": "2B",
    "name": "Terminal 2B",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Da estação 'Aéroport CDG 2 TGV' (RER B/TGV), siga a pé até aos halls 2A/2B.",
     "en": "From 'Aéroport CDG 2 TGV' station (RER B/TGV), walk to halls 2A/2B."
    }
   },
   {
    "code": "2C",
    "name": "Terminal 2C",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Estação RER B / TGV 'Aéroport Charles de Gaulle 2 TGV' (paragem CDGVAL Terminal 2), entre os halls 2C/2D e 2E/2F.",
     "en": "RER B / TGV station 'Aéroport Charles de Gaulle 2 TGV' (CDGVAL stop Terminal 2), between halls 2C/2D and 2E/2F."
    }
   },
   {
    "code": "2D",
    "name": "Terminal 2D",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Estação RER B / TGV 'Aéroport Charles de Gaulle 2 TGV' (paragem CDGVAL Terminal 2), entre os halls 2C/2D e 2E/2F.",
     "en": "RER B / TGV station 'Aéroport Charles de Gaulle 2 TGV' (CDGVAL stop Terminal 2), between halls 2C/2D and 2E/2F."
    }
   },
   {
    "code": "2E",
    "name": "Terminal 2E",
    "serves": {
     "pt": "Air France e parceiros SkyTeam, entre outras. Confirme no cartão de embarque/app da companhia.",
     "en": "Air France and SkyTeam partners, plus others. Confirm on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Estação RER B / TGV 'Aéroport Charles de Gaulle 2 TGV' (paragem CDGVAL Terminal 2), entre os halls 2C/2D e 2E/2F.",
     "en": "RER B / TGV station 'Aéroport Charles de Gaulle 2 TGV' (CDGVAL stop Terminal 2), between halls 2C/2D and 2E/2F."
    }
   },
   {
    "code": "2F",
    "name": "Terminal 2F",
    "serves": {
     "pt": "Air France e parceiros SkyTeam; voos Schengen. Confirme no cartão de embarque/app da companhia.",
     "en": "Air France and SkyTeam partners; Schengen flights. Confirm on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Estação RER B / TGV 'Aéroport Charles de Gaulle 2 TGV' (paragem CDGVAL Terminal 2), entre os halls 2C/2D e 2E/2F.",
     "en": "RER B / TGV station 'Aéroport Charles de Gaulle 2 TGV' (CDGVAL stop Terminal 2), between halls 2C/2D and 2E/2F."
    }
   },
   {
    "code": "2G",
    "name": "Terminal 2G",
    "serves": {
     "pt": "Voos regionais Air France, Schengen. Confirme no cartão de embarque/app da companhia.",
     "en": "Air France regional, Schengen flights. Confirm on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Sem estação: da 'Aéroport CDG 2 TGV' vá a pé até ao 2F e apanhe o autocarro gratuito N2 até ao 2G.",
     "en": "No station: from 'Aéroport CDG 2 TGV' walk to 2F, then free N2 shuttle bus to 2G."
    }
   },
   {
    "code": "3",
    "name": "Terminal 3",
    "serves": {
     "pt": "Companhias charter e low-cost. Confirme no cartão de embarque/app da companhia.",
     "en": "Charter and low-cost airlines. Confirm on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Estação RER B 'Aéroport CDG 1' em Roissypôle, a cerca de 300 m a pé; também paragem CDGVAL 'Terminal 3 – Roissypôle'.",
     "en": "RER B 'Aéroport CDG 1' station at Roissypôle, about 300 m walk; also CDGVAL stop 'Terminal 3 – Roissypôle'."
    }
   }
  ],
  "sources": [
   "https://www.bonjour-ratp.fr/en/aeroports/roissy-charles-de-gaulle/acces/cdgval/",
   "https://en.wikipedia.org/wiki/Charles_de_Gaulle_Airport",
   "https://en.wikipedia.org/wiki/CDGVAL",
   "https://en.wikipedia.org/wiki/A%C3%A9roport_Charles_de_Gaulle_2_TGV_station"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Comboio gratuito CDGVAL liga T1, T3/Roissypôle e T2 a cada ~4 min, aprox. 04:00–01:00 (autocarro de noite), ~8 min. 2A–2F a pé; 2G pelo autocarro gratuito N2 do 2F.",
   "en": "Free CDGVAL train links T1, T3/Roissypôle and T2 every ~4 min, about 04:00–01:00 (bus overnight), ~8 min. 2A–2F on foot; 2G by free N2 bus from 2F."
  }
 },
 "EDI": {
  "terminals": [
   {
    "code": "T",
    "name": "Terminal",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Elétrico de Edimburgo: paragem mesmo à porta do terminal; a cada 7 min de dia (primeiro 06:30, último 22:52), ~30 min até ao centro.",
     "en": "Edinburgh Trams: airport stop right outside the terminal; every 7 min by day (first 06:30, last 22:52 from airport), ~30 min to city centre."
    }
   }
  ],
  "sources": [
   "https://edinburghairport.com/transport-links/trams",
   "https://edinburghtrams.com/stop/edinburgh-airport"
  ],
  "checked": "2026-10"
 },
 "BHX": {
  "terminals": [
   {
    "code": "T",
    "name": "Terminal",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Comboio até Birmingham International e depois o Air-Rail Link gratuito até ao terminal (diariamente 03:30–00:30).",
     "en": "Train to Birmingham International station, then the free Air-Rail Link to the terminal (daily 03:30–00:30)."
    }
   }
  ],
  "sources": [
   "https://www.birminghamairport.co.uk/transport-links/by-train/"
  ],
  "checked": "2026-10"
 },
 "BER": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Terminal principal; portas Schengen no piso E1, não-Schengen no E2. Confirme no cartão de embarque/app da companhia.",
     "en": "Main terminal; Schengen gates on level E1, non-Schengen on E2. Confirm on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Estação 'Flughafen BER' por baixo do T1 (piso U2): FEX, S9, S85, RE20, RB22, RB24, RB32, IC. Autocarros no piso das chegadas do T1.",
     "en": "'Flughafen BER' station directly below T1 (level U2): FEX, S9, S85, RE20, RB22, RB24, RB32, IC. Bus stops on T1 arrivals level."
    }
   },
   {
    "code": "2",
    "name": "Terminal 2",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Sem estação nem largada de carros no T2: use a estação/largada do T1 e caminhe alguns minutos pelo piso E0.",
     "en": "No station or car drop-off at T2: use the T1 station/drop-off and walk a few minutes via level E0."
    }
   }
  ],
  "sources": [
   "https://ber.berlin-airport.de/en/orientierung/terminals.html",
   "https://ber.berlin-airport.de/en/orientation/getting-here/public-transport"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "O T2 fica a poucos minutos a pé do T1 pela passagem no piso das chegadas E0; siga as indicações.",
   "en": "T2 is a few minutes' walk from T1 via the passage on arrivals level E0; follow signs."
  }
 },
 "SIN": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Sem MRT: da estação Changi Airport (T2/T3) apanhe o Skytrain gratuito ou vá a pé pelas pontes do Jewel.",
     "en": "No MRT stop: from Changi Airport MRT (T2/T3) take the free Skytrain or walk via Jewel link bridges."
    }
   },
   {
    "code": "2",
    "name": "Terminal 2",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "A estação MRT Changi Airport (CG2) liga diretamente ao T2; troque em Tanah Merah (EWL) ou Expo (DTL).",
     "en": "Changi Airport MRT (CG2) links directly to T2; change at Tanah Merah (EWL) or Expo (DTL)."
    }
   },
   {
    "code": "3",
    "name": "Terminal 3",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "A estação MRT Changi Airport (CG2) liga diretamente ao T3; troque em Tanah Merah (EWL) ou Expo (DTL).",
     "en": "Changi Airport MRT (CG2) links directly to T3; change at Tanah Merah (EWL) or Expo (DTL)."
    }
   },
   {
    "code": "4",
    "name": "Terminal 4",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Sem MRT: autocarro shuttle gratuito da porta 1 de chegadas do T2 (~5 min, 06:00–00:00) ou do T1/Jewel; ~10 min.",
     "en": "No MRT: free shuttle bus from T2 Arrival Pick-up Door 1 (every ~5 min, 06:00–00:00) or T1/Jewel; ~10 min."
    }
   }
  ],
  "sources": [
   "https://www.changiairport.com/en/airport-guide/transport/transfer-between-terminals-and-jewel.html",
   "https://www.changiairport.com/en/airport-guide/transport/getting-to-the-airport.html",
   "https://en.wikipedia.org/wiki/Changi_Airport",
   "https://en.wikipedia.org/wiki/Changi_Airport_MRT_station"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Skytrain gratuito T1–T2–T3 (zonas públicas e de trânsito), aprox. 05:00–02:00 (pode mudar; confirme). T4: autocarro gratuito, ~10 min; de noite circular a cada ~19 min.",
   "en": "Free Skytrain T1–T2–T3 (public and transit areas), about 05:00–02:00 (hours may change; check). T4: free shuttle bus, ~10 min; overnight loop bus ~every 19 min."
  }
 },
 "RUH": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Voos internacionais das companhias sauditas (nacionais). Confirme no cartão de embarque/app da companhia.",
     "en": "International flights of Saudi (national) airlines. Confirm on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Metro de Riade Linha 4 (Amarela): estação 'Terminal 1&2', junto às chegadas; 06:00–00:00.",
     "en": "Riyadh Metro Line 4 (Yellow): 'Terminal 1&2' station, near arrivals; 06:00–00:00."
    }
   },
   {
    "code": "2",
    "name": "Terminal 2",
    "serves": {
     "pt": "Voos internacionais das companhias sauditas (nacionais). Confirme no cartão de embarque/app da companhia.",
     "en": "International flights of Saudi (national) airlines. Confirm on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Metro de Riade Linha 4 (Amarela): estação 'Terminal 1&2', junto às chegadas; 06:00–00:00.",
     "en": "Riyadh Metro Line 4 (Yellow): 'Terminal 1&2' station, near arrivals; 06:00–00:00."
    }
   },
   {
    "code": "3",
    "name": "Terminal 3",
    "serves": {
     "pt": "Voos domésticos. Confirme no cartão de embarque/app da companhia.",
     "en": "Domestic flights. Confirm on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Metro de Riade Linha 4 (Amarela): estação 'Terminal 3&4', junto às chegadas/partidas; 06:00–00:00.",
     "en": "Riyadh Metro Line 4 (Yellow): 'Terminal 3&4' station, near arrivals/departures; 06:00–00:00."
    }
   },
   {
    "code": "4",
    "name": "Terminal 4",
    "serves": {
     "pt": "Voos domésticos. Confirme no cartão de embarque/app da companhia.",
     "en": "Domestic flights. Confirm on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Metro de Riade Linha 4 (Amarela): estação 'Terminal 3&4', junto às chegadas/partidas; 06:00–00:00.",
     "en": "Riyadh Metro Line 4 (Yellow): 'Terminal 3&4' station, near arrivals/departures; 06:00–00:00."
    }
   },
   {
    "code": "5",
    "name": "Terminal 5",
    "serves": {
     "pt": "Voos internacionais de companhias estrangeiras (desde fev. 2026). Confirme no cartão de embarque/app da companhia.",
     "en": "International flights of foreign airlines (since Feb 2026). Confirm on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Metro de Riade Linha 4 (Amarela): estação 'Terminal 5' à entrada principal do T5; 06:00–00:00.",
     "en": "Riyadh Metro Line 4 (Yellow): 'Terminal 5' station at the T5 main entrance; 06:00–00:00."
    }
   }
  ],
  "sources": [
   "https://www.kkia.sa/en/Parking-And-Transport/Metro",
   "https://www.kkia.sa/zh-cn/news/king-khalid-international-airport-to-begin-major-transformation-in-early-2026",
   "https://gulfnews.com/world/gulf/saudi/riyadh-airport-begins-biggest-overhaul-in-40-years-with-terminal-reshuffle-1.500444527"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "A Linha 4 do metro liga as três estações do aeroporto (T1&2, T3&4, T5).",
   "en": "Metro Line 4 links the three airport stations (T1&2, T3&4, T5)."
  }
 },
 "MCT": {
  "terminals": [
   {
    "code": "T",
    "name": "Passenger Terminal",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Autocarros públicos Mwasalat a partir da estação no piso térreo, à saída do terminal.",
     "en": "Mwasalat public buses from the bus station on the ground floor outside the terminal."
    }
   }
  ],
  "sources": [
   "https://www.muscatairport.co.om/content/to-from"
  ],
  "checked": "2026-10"
 },
 "ORD": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Linha Azul CTA, estação 'O'Hare', sob o parque de estacionamento T1–3; siga a pé até ao terminal.",
     "en": "CTA Blue Line 'O'Hare' station, under the T1–3 parking garage; walk to the terminal."
    }
   },
   {
    "code": "2",
    "name": "Terminal 2",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Linha Azul CTA, estação 'O'Hare', sob o parque de estacionamento T1–3; siga a pé até ao terminal.",
     "en": "CTA Blue Line 'O'Hare' station, under the T1–3 parking garage; walk to the terminal."
    }
   },
   {
    "code": "3",
    "name": "Terminal 3",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Linha Azul CTA, estação 'O'Hare', sob o parque de estacionamento T1–3; siga a pé até ao terminal.",
     "en": "CTA Blue Line 'O'Hare' station, under the T1–3 parking garage; walk to the terminal."
    }
   },
   {
    "code": "5",
    "name": "Terminal 5",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Sem paragem da Linha Azul: da estação O'Hare apanhe o comboio gratuito Airport Transit System (ATS) até ao T5.",
     "en": "No Blue Line stop: from O'Hare station take the free Airport Transit System (ATS) train to T5."
    }
   }
  ],
  "sources": [
   "https://www.flychicago.com/ohare/ServicesAmenities/services/Pages/ATS.aspx",
   "https://flychicago.com/ohare/ServicesAmenities/services/Pages/transitupdate.aspx",
   "https://en.wikipedia.org/wiki/Airport_Transit_System",
   "https://en.wikipedia.org/wiki/O%27Hare_station"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Comboio gratuito Airport Transit System (ATS), 24/7, liga T1, T2, T3, T5 e o Multi-Modal Facility. T1–T3 também ligados a pé após segurança.",
   "en": "Free Airport Transit System (ATS) train, 24/7, links T1, T2, T3, T5 and the Multi-Modal Facility. T1–T3 also connected on foot inside security."
  }
 },
 "LAS": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Autocarros RTC: linha 108 e Red Line param no Level Zero do Terminal 1.",
     "en": "RTC buses: Route 108 and Red Line stop on Level Zero at Terminal 1."
    }
   },
   {
    "code": "3",
    "name": "Terminal 3",
    "serves": {
     "pt": "Voos internacionais: todas as companhias estrangeiras e algumas dos EUA (algumas embarcam nas portas D). Confirme no cartão de embarque/app da companhia.",
     "en": "International service: all foreign airlines and some US airlines (some board at D gates). Confirm on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Sem paragem RTC: vá de autocarro RTC até ao T1 e apanhe o shuttle entre terminais para o T3.",
     "en": "No RTC stop: take the RTC bus to T1, then the inter-terminal shuttle to T3."
    }
   }
  ],
  "sources": [
   "https://stage1.harryreidairport.com/Terminals",
   "https://www.harryreidairport.com/busses-shuttles/public-bus",
   "https://en.wikipedia.org/wiki/Harry_Reid_International_Airport_Automated_People_Movers"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "O T1 e o T3 não estão ligados: use o shuttle entre terminais (lado terra). Portas D acessíveis por comboio automático a partir de ambos.",
   "en": "T1 and T3 are not physically connected: use the inter-terminal shuttle (landside). D gates reached by tram from both terminals."
  }
 },
 "MEX": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Metro Linha 5, estação 'Terminal Aérea', a poucos passos do T1; o Metrobús Linha 4 (rota aeroporto) também serve os terminais.",
     "en": "Metro Line 5, 'Terminal Aérea' station, a few steps from T1; Metrobús Line 4 (airport route) also serves the terminals."
    }
   },
   {
    "code": "2",
    "name": "Terminal 2",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Metrobús Linha 4 (rota aeroporto); ou metro até ao T1 e depois Aerotrén/autocarro entre terminais.",
     "en": "Metrobús Line 4 (airport route); or Metro to T1, then Aerotrén/inter-terminal bus."
    }
   }
  ],
  "sources": [
   "https://aicm.com.mx/transportation/aerotren",
   "https://mexicocity.cdmx.gob.mx/venues/aeropuerto-internacional-de-la-ciudad-de-mexico-aicm/?lang=en",
   "https://www.razon.com.mx/ciudad/2026/04/12/aicm-aerotren-entre-terminal-1-y-2-no-opera-por-mantenimiento/"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Aerotrén gratuito, ~5 min, 05:00–23:00, exige cartão de embarque. Em alternativa, autocarro entre terminais (T1 porta 6 / T2 porta 4). Não se vai a pé.",
   "en": "Free Aerotrén, ~5 min, 05:00–23:00, boarding pass required. Otherwise inter-terminal bus from T1 door 6 / T2 door 4. No walking route."
  }
 },
 "CMN": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Estação de comboios ONCF Al Bidaoui na cave do Terminal 1, com acesso direto ao átrio.",
     "en": "ONCF Al Bidaoui train station in the basement of Terminal 1, with direct access to the hall."
    }
   },
   {
    "code": "2",
    "name": "Terminal 2",
    "serves": {
     "pt": "Varia por companhia: confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Varies by airline: confirm the terminal on your boarding pass/airline app."
    }
   }
  ],
  "sources": [
   "https://Onda.ma/content/download/12177/151149/version/1/fichier/CP+transfert+des+vols+de+T2+au+T1+%2800000004%29.pdf",
   "https://fr.wikipedia.org/wiki/A%C3%A9roport_Mohammed-V_de_Casablanca",
   "https://en.wikipedia.org/wiki/Mohammed_V_International_Airport",
   "https://fr.le360.ma/economie/300-millions-de-dirhams-pour-redessiner-laeroport-mohammed-v-et-fusionner-les-terminaux-1-et-2_NADC3GNK4VAK5EU477JRACX7F4/"
  ],
  "checked": "2026-10"
 },
 "ADD": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal I",
    "serves": {
     "pt": "Voos domésticos. Confirme no cartão de embarque/app da companhia.",
     "en": "Domestic flights. Confirm on your boarding pass/airline app."
    }
   },
   {
    "code": "2",
    "name": "Terminal II",
    "serves": {
     "pt": "Voos internacionais. Confirme no cartão de embarque/app da companhia.",
     "en": "International flights. Confirm on your boarding pass/airline app."
    }
   }
  ],
  "sources": [
   "https://www.ethiopianairlines.com/se/services/services-at-the-airport/addis-ababa-airport"
  ],
  "checked": "2026-10"
 },
 "STN": {
  "terminals": [
   {
    "code": "T",
    "name": "Stansted Airport terminal",
    "serves": {
     "pt": "Terminal único para todos os voos. Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Single passenger terminal for all flights. Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "A estação Stansted Airport fica por baixo do terminal (Stansted Express, Greater Anglia, CrossCountry); estação de autocarros em frente à entrada, a 2 min a pé.",
     "en": "Stansted Airport station is directly beneath the terminal (Stansted Express, Greater Anglia, CrossCountry); coach station opposite main entrance, 2 min walk."
    }
   }
  ],
  "sources": [
   "https://www.stanstedairport.com/passenger-guides/first-time-flyers/",
   "https://www.stanstedairport.com/getting-to-and-from/stansted-airport-train-station/",
   "https://www.stanstedairport.com/getting-to-and-from/by-train/",
   "https://www.stanstedairport.com/getting-to-and-from/by-bus-and-coach/",
   "https://mapcarta.com/W147397185"
  ],
  "checked": "2026-10",
  "arrive": {
   "pt": "Chegue pelo menos 2 h antes de voos de curta distância e 3 h antes de longo curso (conselho do aeroporto).",
   "en": "Arrive at least 2 h before short-haul and 3 h before long-haul flights (airport advice)."
  }
 },
 "OPO": {
  "terminals": [
   {
    "code": "T",
    "name": "Passenger terminal (Aeroporto Francisco Sá Carne",
    "serves": {
     "pt": "Terminal único para todos os voos. Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Single passenger terminal for all flights. Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "Metro Linha E (Violeta), estação Aeroporto junto ao terminal, a cada 20–30 min; autocarros STCP também servem o aeroporto.",
     "en": "Metro Line E (Violet), Aeroporto station beside the terminal, every 20–30 min; STCP buses also serve the airport."
    }
   }
  ],
  "sources": [
   "https://www.aeroportoporto.pt/en/opo/access-parking/getting-to-and-from-the-airport/public-transportation",
   "https://www.portoairport.pt/en/opo/access-parking/getting-to-and-from-the-airport/public-transportation",
   "https://www.portoairport.pt/en/opo/departures",
   "https://mapcarta.com/W112023739"
  ],
  "checked": "2026-10"
 },
 "ORY": {
  "terminals": [
   {
    "code": "1",
    "name": "Orly 1",
    "transit": {
     "pt": "OrlyVal para na estação Orly 1,2,3 (piso 1, Orly 1); a estação Aéroport d'Orly do Metro 14 fica junto ao Orly 3, a poucos minutos a pé; autocarros 91-10/480 na estação de Orly 1,2,3.",
     "en": "OrlyVal stops at Orly 1,2,3 station (level 1, Orly 1); Metro 14 Aéroport d'Orly station is next to Orly 3, a short walk; buses 91-10/480 at Orly 1,2,3 bus station."
    }
   },
   {
    "code": "2",
    "name": "Orly 2",
    "transit": {
     "pt": "OrlyVal para na estação Orly 1,2,3 (piso 1, Orly 1); a estação Aéroport d'Orly do Metro 14 fica junto ao Orly 3, a poucos minutos a pé; autocarros 91-10/480 na estação de Orly 1,2,3.",
     "en": "OrlyVal stops at Orly 1,2,3 station (level 1, Orly 1); Metro 14 Aéroport d'Orly station is next to Orly 3, a short walk; buses 91-10/480 at Orly 1,2,3 bus station."
    }
   },
   {
    "code": "3",
    "name": "Orly 3",
    "serves": {
     "pt": "Tem controlos Schengen (porta E) e internacionais (porta D). Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Has Schengen (gate E) and international (gate D) security. Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "A estação Aéroport d'Orly do Metro 14 fica junto ao Orly 3; estação OrlyVal Orly 1,2,3 a cerca de 10 min a pé.",
     "en": "Metro 14 Aéroport d'Orly station is next to Orly 3; OrlyVal Orly 1,2,3 station about 10 min walk."
    }
   },
   {
    "code": "4",
    "name": "Orly 4",
    "serves": {
     "pt": "Maior terminal: controlos Schengen (porta E) e internacionais (porta F). Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Largest terminal: Schengen (gate E) and international (gate F) security. Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "Elétrico T7, autocarros 183, 91-10, 480 e OrlyVal (porta 48a) param no Orly 4; do Metro 14 vá a pé ou de OrlyVal.",
     "en": "Tram T7, bus 183, 91-10, 480 and OrlyVal (door 48a) stop at Orly 4; from Metro 14 walk or take OrlyVal."
    }
   }
  ],
  "sources": [
   "https://www.bonjour-ratp.fr/en/aeroports/orly/",
   "https://www.bonjour-ratp.fr/en/aeroports/orly/terminal-1/",
   "https://www.bonjour-ratp.fr/en/aeroports/orly/terminal-2/",
   "https://www.bonjour-ratp.fr/aeroports/orly/terminal-3/",
   "https://www.bonjour-ratp.fr/en/aeroports/orly/terminal-4/",
   "https://www.bonjour-ratp.fr/en/lignes-metro/ligne-orlyval/"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Orly 1, 2 e 3 formam um só edifício, a poucos minutos a pé. Para o Orly 4 use o OrlyVal (grátis entre terminais, ~2 min, 6:00–23:35). O Orlybus terminou em março de 2025.",
   "en": "Orly 1, 2 and 3 are one building, a few minutes' walk apart. To/from Orly 4 take OrlyVal (free between terminals, ~2 min, 6:00–23:35). Orlybus ended March 2025."
  }
 },
 "MAN": {
  "terminals": [
   {
    "code": "2",
    "name": "Terminal 2",
    "serves": {
     "pt": "Todas as companhias exceto a Ryanair. Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "All airlines except Ryanair. Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "Estação ferroviária Manchester Airport (entre T2 e T3): cerca de 10 min a pé por passadiços cobertos.",
     "en": "Manchester Airport railway station (between T2 and T3): about 10 min walk via covered walkways."
    }
   },
   {
    "code": "3",
    "name": "Terminal 3",
    "serves": {
     "pt": "Voos da Ryanair. Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Ryanair flights. Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "Estação ferroviária Manchester Airport: cerca de 5 min a pé.",
     "en": "Manchester Airport railway station: about 5 min walk."
    }
   }
  ],
  "sources": [
   "https://www.manchesterairport.co.uk/parking/terminal-and-parking-name-changes/",
   "https://mediacentre.manchesterairport.co.uk/records-tumble-and-eras-end-at-manchester-airport/",
   "https://www.manchesterairport.co.uk/getting-to-and-from/by-train/",
   "https://www.manchesterairport.co.uk/help/frequently-asked-questions/",
   "https://en.wikipedia.org/wiki/Manchester_Airport",
   "https://mapcarta.com/W18515536"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "T2 e T3 ficam a curta distância a pé pelos passadiços e tapetes rolantes da estação (lado terra). O Terminal 1 encerrou (março 2026).",
   "en": "T2 and T3 are within walking distance via the station's walkways and travelators (landside). Terminal 1 has closed (March 2026)."
  }
 },
 "IST": {
  "terminals": [
   {
    "code": "T",
    "name": "Istanbul Airport terminal",
    "serves": {
     "pt": "Terminal único: doméstico pela entrada 1 (Pier G), internacional pelas entradas 3 e 7. Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Single terminal: domestic via entrance 1 (Pier G), international via entrances 3 and 7. Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "Metro M11 (Gayrettepe–Halkalı), estação Istanbul Airport sob o terminal; autocarros Havaist deixam nas entradas 1–4 das Partidas.",
     "en": "Metro M11 (Gayrettepe–Halkalı), Istanbul Airport station below the terminal; Havaist buses drop at Departures entrances 1–4."
    }
   }
  ],
  "sources": [
   "https://www.istairport.com/en/contact-us/faq?locale=en",
   "https://www.istairport.com/en/airport/airport-transportation/urban-transportation/public-transportation?locale=en",
   "https://mapcarta.com/N7246055799"
  ],
  "checked": "2026-10",
  "arrive": {
   "pt": "Chegue pelo menos 3 h antes de voos internacionais e 2 h antes de domésticos (conselho do aeroporto).",
   "en": "Arrive at least 3 h before international and 2 h before domestic flights (airport advice)."
  }
 },
 "MUC": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "S-Bahn S1/S8: estação Flughafen München, entre o T1 e o T2; o Lufthansa Express Bus para no T1.",
     "en": "S1/S8 S-Bahn: Flughafen München station, between T1 and T2; Lufthansa Express Bus stops at T1."
    }
   },
   {
    "code": "2",
    "name": "Terminal 2",
    "serves": {
     "pt": "Lufthansa e parceiros Star Alliance. Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Lufthansa and its Star Alliance partners. Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "S-Bahn S1/S8: estação Flughafen München, entre o T1 e o T2; Lufthansa Express Bus paragem 1; FlixBus paragens 21/22.",
     "en": "S1/S8 S-Bahn: Flughafen München station, between T1 and T2; Lufthansa Express Bus stop 1; FlixBus stops 21/22."
    }
   }
  ],
  "sources": [
   "https://www.munich-airport.com/terminal-2-gesellschaft-4047628",
   "https://www.munich-airport.com/public-transport-260822",
   "https://www.munich-airport.com/frequently-asked-questions-376207",
   "https://mapcarta.com/W360544293",
   "https://mapcarta.com/W891180342"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Do lado terra, o T1 fica a 5–10 min a pé das paragens do T2; autocarro gratuito para passageiros em ligação. O Hall F alcança-se a pé pela zona pública.",
   "en": "Landside, T1 is a 5–10 min walk from T2's bus stops through the public area; free shuttle bus for connecting passengers. Hall F is reached on foot via the public area."
  }
 },
 "DXB": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "Metro do Dubai, Linha Vermelha: estação Airport Terminal 1; autocarros RTA nas Chegadas do T1.",
     "en": "Dubai Metro Red Line: Airport Terminal 1 station; RTA buses from T1 Arrivals."
    }
   },
   {
    "code": "2",
    "name": "Terminal 2",
    "serves": {
     "pt": "Voos regulares, charter e especiais (peregrinação). Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Scheduled, charter and special (pilgrimage) flights. Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "Sem metro: autocarros RTA nas Chegadas do T2, ou táxi.",
     "en": "No metro: RTA buses from T2 Arrivals stands, or taxi."
    }
   },
   {
    "code": "3",
    "name": "Terminal 3",
    "serves": {
     "pt": "Exclusivo da Emirates. Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Dedicated to Emirates. Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "Metro do Dubai, Linha Vermelha: estação Airport Terminal 3; autocarros RTA nas Chegadas do T3.",
     "en": "Dubai Metro Red Line: Airport Terminal 3 station; RTA buses from T3 Arrivals."
    }
   }
  ],
  "sources": [
   "https://media.dubaiairports.ae/dubai-airports-main-fact-file/",
   "https://dubaiairports.ae/transport/metro",
   "https://www.dubaiairports.ae/before-you-fly/to-from-the-airport/by-bus",
   "https://dubaiairports.ae/information/transfers",
   "https://www.emirates.com/english/before-you-fly/dubai-international-airport/transferring-between-terminals/",
   "https://mapcarta.com/W98425182"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "T1 e T3 ligam-se no lado ar por comboio interno. Do lado terra, use a Linha Vermelha (T1–T3), autocarro ou táxi; o T2 é separado, acessível de autocarro ou táxi.",
   "en": "T1 and T3 are linked airside by airport train. Landside, use the Metro Red Line (T1–T3), bus or taxi; T2 is a separate site, reached by bus or taxi."
  }
 },
 "JED": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Principal terminal de voos domésticos e internacionais. Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Main hub for domestic and international flights. Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "Comboio de Alta Velocidade Haramain: a estação KAIA está integrada no edifício do terminal principal.",
     "en": "Haramain High-Speed Railway: KAIA station is integrated in the main terminal building."
    }
   },
   {
    "code": "4",
    "name": "Terminal 4",
    "serves": {
     "pt": "Novo terminal (abertura faseada desde 27/09/2026) para companhias vindas do Terminal Norte e algumas do T1/Hajj. Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "New terminal (phased opening from 27 Sep 2026) for airlines moved from the North Terminal and some from T1/Hajj terminals. Confirm the terminal on your boarding pass or airline app."
    }
   },
   {
    "code": "HU",
    "name": "Hajj and Umrah Terminals",
    "serves": {
     "pt": "Voos de peregrinos e algumas companhias vindas do Terminal Norte. Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Pilgrim flights and some airlines moved from the North Terminal. Confirm the terminal on your boarding pass or airline app."
    }
   }
  ],
  "sources": [
   "https://www.kaia.sa/en/About-KAIA",
   "https://www.kaia.sa/en/Pages/Terminal1.aspx",
   "https://www.kaia.sa/Parking-and-Transport",
   "https://sar.hhr.sa/-/king-abdulaziz-international-airport",
   "https://www.khaleejtimes.com/aviation/jeddah-airport-move-north-terminal-flights-to-t4-hajj-umrah-terminals-oct-17",
   "https://gulfnews.com/world/gulf/saudi/flying-to-saudi-arabia-jeddah-airport-opens-new-terminal-4-with-phased-airline-moves-1.500689328"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Autocarros vaivém ligam os terminais. O Terminal Norte fechou a 17/10/2026; os voos passaram para o T4 e os terminais Hajj e Umrah.",
   "en": "Shuttle buses connect the terminals. The North Terminal closed on 17 Oct 2026; its flights moved to T4 and the Hajj and Umrah terminals."
  }
 },
 "JFK": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "O AirTrain JFK para neste terminal; liga a Jamaica (LIRR, metro) e Howard Beach (metro), bilhete de 8,75 USD.",
     "en": "AirTrain JFK stops at this terminal; connects to Jamaica (LIRR, subway) and Howard Beach (subway), $8.75 fare."
    }
   },
   {
    "code": "4",
    "name": "Terminal 4",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "O AirTrain JFK para neste terminal; liga a Jamaica (LIRR, metro) e Howard Beach (metro), bilhete de 8,75 USD.",
     "en": "AirTrain JFK stops at this terminal; connects to Jamaica (LIRR, subway) and Howard Beach (subway), $8.75 fare."
    }
   },
   {
    "code": "5",
    "name": "Terminal 5",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "O AirTrain JFK para neste terminal; liga a Jamaica (LIRR, metro) e Howard Beach (metro), bilhete de 8,75 USD.",
     "en": "AirTrain JFK stops at this terminal; connects to Jamaica (LIRR, subway) and Howard Beach (subway), $8.75 fare."
    }
   },
   {
    "code": "7",
    "name": "Terminal 7",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "O AirTrain JFK para neste terminal; liga a Jamaica (LIRR, metro) e Howard Beach (metro), bilhete de 8,75 USD.",
     "en": "AirTrain JFK stops at this terminal; connects to Jamaica (LIRR, subway) and Howard Beach (subway), $8.75 fare."
    }
   },
   {
    "code": "8",
    "name": "Terminal 8",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "O AirTrain JFK para neste terminal; liga a Jamaica (LIRR, metro) e Howard Beach (metro), bilhete de 8,75 USD.",
     "en": "AirTrain JFK stops at this terminal; connects to Jamaica (LIRR, subway) and Howard Beach (subway), $8.75 fare."
    }
   }
  ],
  "sources": [
   "https://www.jfkairport.com/explore-jfk/terminals",
   "https://www.jfkairport.com/transportation/airtrain",
   "https://www.jfkairport.com/alerts-advisories",
   "https://mapcarta.com/25033354",
   "https://mapcarta.com/N277752285",
   "https://mapcarta.com/25033366"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "O AirTrain JFK é grátis entre terminais, a cada 5–15 min, menos de 10 min. Novos terminais (T6, New Terminal One) em obras; conte com atrasos rodoviários.",
   "en": "AirTrain JFK is free between terminals, every 5–15 min, under 10 min. New terminals (T6, New Terminal One) are under construction; expect roadway delays."
  }
 },
 "MSY": {
  "terminals": [
   {
    "code": "T",
    "name": "Terminal",
    "serves": {
     "pt": "Terminal único para todos os voos. Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Single terminal for all flights. Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "Autocarros RTA 202 Airport Express e JeT E1: piso 1 (recolha de bagagem), porta 2, zonas B4–B5.",
     "en": "RTA 202 Airport Express and JeT E1 buses: Level 1 Baggage Claim, outside Door 2, zones B4–B5."
    }
   }
  ],
  "sources": [
   "https://flymsy.com/faqs/",
   "https://flymsy.com/public-transportation/",
   "https://mapcarta.com/W706272510"
  ],
  "checked": "2026-10",
  "arrive": {
   "pt": "Chegue pelo menos 2 h antes de voos domésticos e 3 h antes de internacionais (conselho do aeroporto).",
   "en": "Arrive at least 2 h before domestic and 3 h before international flights (airport advice)."
  }
 },
 "CPT": {
  "terminals": [
   {
    "code": "CTB",
    "name": "Central Terminal Building",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Confirm the terminal on your boarding pass or airline app."
    },
    "transit": {
     "pt": "Shuttles esperam nas chegadas (faixa interior internacional); táxis autorizados nos quiosques do Central Terminal Building.",
     "en": "Shuttles meet passengers at arrivals (international inner lane); authorised taxis from kiosks in the Central Terminal Building."
    }
   }
  ],
  "sources": [
   "https://www.airports.co.za/airports/cape-town-international-airport/the-airport/about-the-airport",
   "https://www.airports.co.za/airports/cape-town-international-airport/transport/public-transport"
  ],
  "checked": "2026-10"
 },
 "NBO": {
  "terminals": [
   {
    "code": "1A",
    "name": "Terminal 1A",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Confirm the terminal on your boarding pass or airline app."
    }
   },
   {
    "code": "1B",
    "name": "Terminal 1B",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Confirm the terminal on your boarding pass or airline app."
    }
   },
   {
    "code": "1C",
    "name": "Terminal 1C",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Confirm the terminal on your boarding pass or airline app."
    }
   },
   {
    "code": "1D",
    "name": "Terminal 1D",
    "serves": {
     "pt": "Voos domésticos (Kenya Airways, Jambojet). Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Domestic flights (Kenya Airways, Jambojet). Confirm the terminal on your boarding pass or airline app."
    }
   },
   {
    "code": "1E",
    "name": "Terminal 1E",
    "serves": {
     "pt": "Chegadas internacionais. Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "International arrivals. Confirm the terminal on your boarding pass or airline app."
    }
   },
   {
    "code": "2",
    "name": "Terminal 2",
    "serves": {
     "pt": "Voos para a Somália e da ONU. Confirme o terminal no cartão de embarque ou na app da companhia.",
     "en": "Somalia and UN flights. Confirm the terminal on your boarding pass or airline app."
    }
   }
  ],
  "sources": [
   "https://www.kaa.go.ke/airports/jkia/",
   "https://www.kaa.go.ke/travel-information/before-you-fly/",
   "https://www.kaa.go.ke/getting-here/"
  ],
  "checked": "2026-10",
  "arrive": {
   "pt": "Chegue pelo menos 3 h antes de voos internacionais e 2 h antes de domésticos (conselho do aeroporto).",
   "en": "Arrive at least 3 h before international and 2 h before domestic flights (airport advice)."
  }
 },
 "LTN": {
  "terminals": [
   {
    "code": "T",
    "name": "Terminal",
    "serves": {
     "pt": "Terminal único para todos os voos. Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Single passenger terminal for all flights. Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Comboio até Luton Airport Parkway e depois o shuttle Luton DART até ao terminal (<4 min, 24h). Autocarros param à porta do terminal.",
     "en": "Train to Luton Airport Parkway, then Luton DART shuttle to the terminal (<4 min, 24/7). Coaches and buses stop outside the terminal."
    }
   }
  ],
  "sources": [
   "https://www.london-luton.co.uk/to-and-from-lla",
   "https://www.london-luton.co.uk/to-and-from-lla/trains/luton-dart"
  ],
  "checked": "2026-10"
 },
 "MAD": {
  "terminals": [
   {
    "code": "T1",
    "name": "Terminal T1",
    "transit": {
     "pt": "Metro L8: estação Aeropuerto T1-T2-T3 (junto ao T2). Autocarro Exprés Aeropuerto (24 h) para no T2 e no T1.",
     "en": "Metro L8: Aeropuerto T1-T2-T3 station (next to T2). Exprés Aeropuerto bus (24 h) stops at T2 and T1."
    }
   },
   {
    "code": "T2",
    "name": "Terminal T2",
    "transit": {
     "pt": "Metro L8: estação Aeropuerto T1-T2-T3 (junto ao T2). Autocarro Exprés Aeropuerto (24 h) para no T2 e no T1.",
     "en": "Metro L8: Aeropuerto T1-T2-T3 station (next to T2). Exprés Aeropuerto bus (24 h) stops at T2 and T1."
    }
   },
   {
    "code": "T3",
    "name": "Terminal T3",
    "transit": {
     "pt": "Metro L8: estação Aeropuerto T1-T2-T3. O autocarro gratuito entre terminais para no T3 (não a partir do T1).",
     "en": "Metro L8: Aeropuerto T1-T2-T3 station. Free inter-terminal bus stops at T3 (not from T1)."
    }
   },
   {
    "code": "T4",
    "name": "Terminal T4",
    "serves": {
     "pt": "Iberia e parceiras da aliança oneworld (atribuição da Aena). Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Iberia and its oneworld alliance partners (Aena allocation). Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Metro L8 e Cercanías C1: estação Aeropuerto T4. Autocarro Exprés Aeropuerto (24 h) tem terminal no T4.",
     "en": "Metro L8 and Cercanías C1: Aeropuerto T4 station. Exprés Aeropuerto bus (24 h) starts/ends at T4."
    }
   },
   {
    "code": "T4S",
    "name": "Terminal T4 Satélite (T4S)",
    "serves": {
     "pt": "Iberia e parceiras da aliança oneworld (atribuição da Aena). Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Iberia and its oneworld alliance partners (Aena allocation). Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Vá primeiro ao T4; o T4S é acedido a partir do T4 pelo comboio automático subterrâneo (APM).",
     "en": "Go to T4 first; T4S is reached from T4 by the underground automatic train (APM)."
    }
   }
  ],
  "sources": [
   "https://www.aena.es/es/adolfo-suarez-madrid-barajas/servicios-del-aeropuerto/categorias-y-terminales/conexion-de-vuelos.html",
   "https://www.aena.es/en/adolfo-suarez-madrid-barajas/airlines-and-destinations/airlines.html",
   "https://www.aena.es/doc/detalleprensa/medios-transporte-acceso-mad.pdf",
   "https://www.aena.es/doc/detalleprensa/asignacion-t4-iberia.-consejo-2-nov.pdf",
   "https://www.esmadrid.com/bus-expres-aeropuerto-madrid",
   "https://www.esmadrid.com/avion-madrid"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Autocarro gratuito 24 h liga T1, T2, T3 e T4 (T1–T2 ~2 min, T1–T4 ~10 min). T4–T4S: comboio automático subterrâneo.",
   "en": "Free 24 h bus links T1, T2, T3 and T4 (T1–T2 ~2 min, T1–T4 ~10 min). T4–T4S: underground automatic train."
  }
 },
 "FCO": {
  "terminals": [
   {
    "code": "T1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Sobretudo voos domésticos e Schengen. Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Mainly domestic and Schengen flights. Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "A estação Fiumicino Aeroporto fica dentro do aeroporto, junto aos terminais: Leonardo Express para Roma Termini (32 min, a cada 15 min) e comboios FL1.",
     "en": "Fiumicino Aeroporto station is inside the airport near the terminals: Leonardo Express to Roma Termini (32 min, every 15 min) and FL1 trains."
    }
   },
   {
    "code": "T3",
    "name": "Terminal 3",
    "serves": {
     "pt": "Voos não-Schengen e intercontinentais, e alguns voos europeus. Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Non-Schengen and intercontinental flights, plus some European flights. Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "A estação Fiumicino Aeroporto fica dentro do aeroporto, junto aos terminais: Leonardo Express para Roma Termini (32 min, a cada 15 min) e comboios FL1.",
     "en": "Fiumicino Aeroporto station is inside the airport near the terminals: Leonardo Express to Roma Termini (32 min, every 15 min) and FL1 trains."
    }
   }
  ],
  "sources": [
   "https://www.adr.it/pax-fco-quale-terminal",
   "https://www.adr.it/en/web/aeroporti-di-roma-en/train",
   "https://www.trenitalia.com/de/services/leonardo-express.html",
   "https://en.wikipedia.org/wiki/Fiumicino_Aeroporto_railway_station",
   "https://en.wikipedia.org/wiki/Rome_Fiumicino_Airport"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Os Terminais 1 e 3 estão ligados por percursos pedonais interiores com sinalética própria.",
   "en": "Terminals 1 and 3 are connected by internal walkways with dedicated signage."
  }
 },
 "GLA": {
  "terminals": [
   {
    "code": "T",
    "name": "Terminal",
    "serves": {
     "pt": "Terminal único para todos os voos. Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Single passenger terminal for all flights. Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Autocarro Glasgow Airport Express 500 desde Buchanan Bus Station (desde 15 min, a cada 10 min de dia). De comboio: até Paisley Gilmour Street e autocarro 757.",
     "en": "Glasgow Airport Express 500 from Buchanan Bus Station (from 15 min, every 10 min by day). By rail: train to Paisley Gilmour Street, then bus 757."
    }
   }
  ],
  "sources": [
   "https://www.glasgowairport.com/to-and-from/glasgow-airport-express-service-500/",
   "https://www.scotrail.co.uk/plan-your-journey/travel-connections/airports"
  ],
  "checked": "2026-10"
 },
 "SAW": {
  "terminals": [
   {
    "code": "T",
    "name": "Passenger Terminal",
    "serves": {
     "pt": "Um só edifício para voos domésticos e internacionais. Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "One terminal building for domestic and international flights. Confirm your terminal on your boarding pass/airline app."
    }
   }
  ],
  "sources": [
   "https://en.wikipedia.org/wiki/Sabiha_G%C3%B6k%C3%A7en_International_Airport",
   "https://en.wikipedia.org/wiki/Sabiha_G%C3%B6k%C3%A7en_Havaliman%C4%B1_(Istanbul_Metro)"
  ],
  "checked": "2026-10"
 },
 "VIE": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "transit": {
     "pt": "A estação ferroviária (CAT, S-Bahn, comboios ÖBB) fica por baixo do aeroporto, a poucos passos dos terminais.",
     "en": "Airport railway station (CAT, S-Bahn, ÖBB trains) is under the airport, a short walk from the terminals."
    }
   },
   {
    "code": "1A",
    "name": "Terminal 1A",
    "transit": {
     "pt": "A estação ferroviária (CAT, S-Bahn, comboios ÖBB) fica por baixo do aeroporto, a poucos passos dos terminais.",
     "en": "Airport railway station (CAT, S-Bahn, ÖBB trains) is under the airport, a short walk from the terminals."
    }
   },
   {
    "code": "3",
    "name": "Terminal 3",
    "serves": {
     "pt": "Terminal Star Alliance da Austrian Airlines. Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Austrian Airlines' Star Alliance terminal. Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "A estação ferroviária (CAT, S-Bahn, comboios ÖBB) fica por baixo do aeroporto, a poucos passos dos terminais.",
     "en": "Airport railway station (CAT, S-Bahn, ÖBB trains) is under the airport, a short walk from the terminals."
    }
   }
  ],
  "sources": [
   "https://www.viennaairport.com/en/passengers/airport/check-in",
   "https://www.austrian.com/de/en/arrival-vienna-airport",
   "https://en.wikipedia.org/wiki/Vienna_International_Airport"
  ],
  "checked": "2026-10",
  "arrive": {
   "pt": "Chegue 2 h antes em voos até 6 h; 3 h em voos de 6 h ou mais e para Telavive, Nova Iorque e Toronto (conselho do aeroporto).",
   "en": "Arrive 2 h before domestic/international flights up to 6 h; 3 h for flights of 6 h+ and to Tel Aviv, New York, Toronto (airport advice)."
  }
 },
 "AUH": {
  "terminals": [
   {
    "code": "A",
    "name": "Terminal A",
    "serves": {
     "pt": "Todas as companhias passaram para o Terminal A em nov. 2023; é o terminal de passageiros. Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "All airlines moved to Terminal A in Nov 2023; it is the passenger terminal. Confirm your terminal on your boarding pass/airline app."
    }
   }
  ],
  "sources": [
   "https://www.mediaoffice.abudhabi/en/topic/terminal-a-at-zayed-international-airport/",
   "https://airlinegeeks.com/2023/10/31/abu-dhabi-airport-debuts-long-awaited-new-terminal/",
   "https://etihad.com/en/fly-etihad/airport-information/terminal-a-experience"
  ],
  "checked": "2026-10"
 },
 "CAI": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1"
   },
   {
    "code": "2",
    "name": "Terminal 2"
   },
   {
    "code": "3",
    "name": "Terminal 3"
   }
  ],
  "sources": [
   "https://en.wikipedia.org/wiki/Cairo_International_Airport"
  ],
  "checked": "2026-10"
 },
 "IAD": {
  "terminals": [
   {
    "code": "MAIN",
    "name": "Main Terminal",
    "serves": {
     "pt": "Terminal único para todos os voos; as portas ficam nos concourses. Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Single landside terminal for all flights; gates are in concourses. Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Metro Silver Line: estação Washington Dulles International Airport, ligada ao Main Terminal por túnel interior com tapetes rolantes.",
     "en": "Metrorail Silver Line: Washington Dulles International Airport station, linked to the Main Terminal by an indoor tunnel with moving walkways."
    }
   }
  ],
  "sources": [
   "https://www.flydulles.com/metro",
   "https://www.flydulles.com/news/dulles-international-airport-welcomes-silver-line"
  ],
  "checked": "2026-10"
 },
 "MIA": {
  "terminals": [
   {
    "code": "N",
    "name": "North Terminal (Concourse D)",
    "transit": {
     "pt": "Metrorail, Tri-Rail e Metrobus no Miami Intermodal Center/MIA Central Station; MIA Mover a partir do Piso 3 do terminal (entre os parques Dolphin e Flamingo).",
     "en": "Metrorail, Tri-Rail and Metrobus at Miami Intermodal Center/MIA Central Station; take the MIA Mover from terminal Level 3 (between Dolphin and Flamingo garages)."
    }
   },
   {
    "code": "C",
    "name": "Central Terminal",
    "transit": {
     "pt": "Metrorail, Tri-Rail e Metrobus no Miami Intermodal Center/MIA Central Station; MIA Mover a partir do Piso 3 do terminal (entre os parques Dolphin e Flamingo).",
     "en": "Metrorail, Tri-Rail and Metrobus at Miami Intermodal Center/MIA Central Station; take the MIA Mover from terminal Level 3 (between Dolphin and Flamingo garages)."
    }
   },
   {
    "code": "S",
    "name": "South Terminal",
    "transit": {
     "pt": "Metrorail, Tri-Rail e Metrobus no Miami Intermodal Center/MIA Central Station; MIA Mover a partir do Piso 3 do terminal (entre os parques Dolphin e Flamingo).",
     "en": "Metrorail, Tri-Rail and Metrobus at Miami Intermodal Center/MIA Central Station; take the MIA Mover from terminal Level 3 (between Dolphin and Flamingo garages)."
    }
   }
  ],
  "sources": [
   "https://www.miami-airport.com/bus_and_rail_info.asp",
   "https://miami-airport.com/getting-around-mia.asp",
   "https://upgradedpoints.com/travel/airports/miami-international-mia-airport/"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Um só edifício: circule entre North, Central e South pelos tapetes rolantes do Piso 3. Check-in no Piso 2.",
   "en": "One terminal building: walk between North, Central and South via moving walkways on Level 3. Check-in on Level 2."
  }
 },
 "MCO": {
  "terminals": [
   {
    "code": "A",
    "name": "Terminal A",
    "transit": {
     "pt": "Da estação Brightline (junto ao Terminal C), apanhe o comboio Terminal Link (~4 min) até aos Terminais A e B.",
     "en": "From the Brightline/Train Station (next to Terminal C), take the Terminal Link train (~4 min) to Terminals A & B."
    }
   },
   {
    "code": "B",
    "name": "Terminal B",
    "transit": {
     "pt": "Da estação Brightline (junto ao Terminal C), apanhe o comboio Terminal Link (~4 min) até aos Terminais A e B.",
     "en": "From the Brightline/Train Station (next to Terminal C), take the Terminal Link train (~4 min) to Terminals A & B."
    }
   },
   {
    "code": "C",
    "name": "Terminal C",
    "transit": {
     "pt": "Os comboios Brightline (sul da Florida) param na estação contígua ao Terminal C.",
     "en": "Brightline trains (South Florida) stop at the Train Station adjacent to Terminal C."
    }
   }
  ],
  "sources": [
   "https://flymco.com/frequently-asked-questions/terminal-c/",
   "https://flymco.com/connect-transfer/brightline-connections/"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Comboio automático Terminal Link entre o Terminal C e os Terminais A e B (~4 min); estação de A&B no Piso 3.",
   "en": "Terminal Link automated train between Terminal C and Terminals A & B (~4 min); A&B station on Level 3."
  }
 },
 "EZE": {
  "terminals": [
   {
    "code": "A",
    "name": "Terminal A"
   },
   {
    "code": "C",
    "name": "Terminal C"
   }
  ],
  "sources": [
   "https://www.cronista.com/negocios/cambios-en-ezeiza-habra-una-terminal-exclusiva-para-los-arribos-de-cabotaje/",
   "https://promociones-aereas.com.ar/noticias/ezeiza-cambia-la-operacion-de-vuelos-nacionales-que-deben-saber-los-pasajeros",
   "https://www.sirchandler.com.ar/2026/10/la-nueva-gran-reforma-de-ezeiza-ahora-si/",
   "https://en.wikipedia.org/wiki/Ministro_Pistarini_International_Airport"
  ],
  "checked": "2026-10"
 },
 "ZNZ": {
  "terminals": [
   {
    "code": "3",
    "name": "Terminal 3"
   },
   {
    "code": "2",
    "name": "Terminal 2"
   }
  ],
  "sources": [
   "https://en.wikipedia.org/wiki/Abeid_Amani_Karume_International_Airport"
  ],
  "checked": "2026-10"
 },
 "NBJ": {
  "terminals": [
   {
    "code": "T",
    "name": "Passenger Terminal",
    "serves": {
     "pt": "Terminal único para voos nacionais e internacionais; companhias transferidas do antigo aeroporto até mar. 2026. Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Single terminal for domestic and international flights; all airlines moved from the old Luanda airport by Mar 2026. Confirm your terminal on your boarding pass/airline app."
    }
   }
  ],
  "sources": [
   "https://www.forbespt.com/luanda-inaugura-novo-aeroporto-internacional-o-que-precisa-de-saber",
   "https://en.wikipedia.org/wiki/Dr._Ant%C3%B3nio_Agostinho_Neto_International_Airport",
   "https://www.opais.ao/economia/concluida-transferencia-de-operacoes-de-passageiros-para-o-novo-aeroporto/"
  ],
  "checked": "2026-10"
 },
 "LAX": {
  "terminals": [
   {
    "code": "1",
    "name": "Terminal 1",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Autocarro FlyAway (Union Station, Van Nuys) e LAX Shuttle gratuito param em todos os terminais; Metro linhas C e K via shuttle gratuito até ao LAX/Metro Transit Center.",
     "en": "FlyAway bus (Union Station, Van Nuys) and free LAX Shuttle stop at every terminal; Metro C & K Lines via free Metro Connector Shuttle to LAX/Metro Transit Center."
    }
   },
   {
    "code": "2",
    "name": "Terminal 2",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Autocarro FlyAway (Union Station, Van Nuys) e LAX Shuttle gratuito param em todos os terminais; Metro linhas C e K via shuttle gratuito até ao LAX/Metro Transit Center.",
     "en": "FlyAway bus (Union Station, Van Nuys) and free LAX Shuttle stop at every terminal; Metro C & K Lines via free Metro Connector Shuttle to LAX/Metro Transit Center."
    }
   },
   {
    "code": "3",
    "name": "Terminal 3",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Autocarro FlyAway (Union Station, Van Nuys) e LAX Shuttle gratuito param em todos os terminais; Metro linhas C e K via shuttle gratuito até ao LAX/Metro Transit Center.",
     "en": "FlyAway bus (Union Station, Van Nuys) and free LAX Shuttle stop at every terminal; Metro C & K Lines via free Metro Connector Shuttle to LAX/Metro Transit Center."
    }
   },
   {
    "code": "4",
    "name": "Terminal 4",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Autocarro FlyAway (Union Station, Van Nuys) e LAX Shuttle gratuito param em todos os terminais; Metro linhas C e K via shuttle gratuito até ao LAX/Metro Transit Center.",
     "en": "FlyAway bus (Union Station, Van Nuys) and free LAX Shuttle stop at every terminal; Metro C & K Lines via free Metro Connector Shuttle to LAX/Metro Transit Center."
    }
   },
   {
    "code": "5",
    "name": "Terminal 5",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Autocarro FlyAway (Union Station, Van Nuys) e LAX Shuttle gratuito param em todos os terminais; Metro linhas C e K via shuttle gratuito até ao LAX/Metro Transit Center.",
     "en": "FlyAway bus (Union Station, Van Nuys) and free LAX Shuttle stop at every terminal; Metro C & K Lines via free Metro Connector Shuttle to LAX/Metro Transit Center."
    }
   },
   {
    "code": "6",
    "name": "Terminal 6",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Autocarro FlyAway (Union Station, Van Nuys) e LAX Shuttle gratuito param em todos os terminais; Metro linhas C e K via shuttle gratuito até ao LAX/Metro Transit Center.",
     "en": "FlyAway bus (Union Station, Van Nuys) and free LAX Shuttle stop at every terminal; Metro C & K Lines via free Metro Connector Shuttle to LAX/Metro Transit Center."
    }
   },
   {
    "code": "7",
    "name": "Terminal 7",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Autocarro FlyAway (Union Station, Van Nuys) e LAX Shuttle gratuito param em todos os terminais; Metro linhas C e K via shuttle gratuito até ao LAX/Metro Transit Center.",
     "en": "FlyAway bus (Union Station, Van Nuys) and free LAX Shuttle stop at every terminal; Metro C & K Lines via free Metro Connector Shuttle to LAX/Metro Transit Center."
    }
   },
   {
    "code": "8",
    "name": "Terminal 8",
    "serves": {
     "pt": "Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Autocarro FlyAway (Union Station, Van Nuys) e LAX Shuttle gratuito param em todos os terminais; Metro linhas C e K via shuttle gratuito até ao LAX/Metro Transit Center.",
     "en": "FlyAway bus (Union Station, Van Nuys) and free LAX Shuttle stop at every terminal; Metro C & K Lines via free Metro Connector Shuttle to LAX/Metro Transit Center."
    }
   },
   {
    "code": "B",
    "name": "Tom Bradley International Terminal (Terminal B)",
    "serves": {
     "pt": "Voos internacionais, incl. West Gates (201–225). Confirme o terminal no cartão de embarque/app da companhia.",
     "en": "International flights, incl. West Gates (201–225). Confirm your terminal on your boarding pass/airline app."
    },
    "transit": {
     "pt": "Autocarro FlyAway (Union Station, Van Nuys) e LAX Shuttle gratuito param em todos os terminais; Metro linhas C e K via shuttle gratuito até ao LAX/Metro Transit Center.",
     "en": "FlyAway bus (Union Station, Van Nuys) and free LAX Shuttle stop at every terminal; Metro C & K Lines via free Metro Connector Shuttle to LAX/Metro Transit Center."
    }
   }
  ],
  "sources": [
   "https://www.flylax.com/",
   "https://www.flylax.com/terminals/terminal-b",
   "https://www.flylax.com/lax-terminal-maps",
   "https://www.flylax.com/inter-terminal-connections",
   "https://www.flylax.com/lax-traffic-and-ground-transportation"
  ],
  "checked": "2026-10",
  "between": {
   "pt": "Corredores após o controlo de segurança ligam todos os terminais (T1 a T8 cerca de 3 km); há também shuttles gratuitos frequentes entre terminais.",
   "en": "Airside walkways link all terminals after security (T1 to T8 about 2 miles); frequent free courtesy shuttles also run between terminals."
  }
 }
};
