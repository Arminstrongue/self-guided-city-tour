/**
 * Todos os transportes terrestres de cada cidade, com tarifa de referência em moeda local (outubro de 2026).
 * u: unidade do preço ("trip" viagem, "day" dia, "ride" corrida típica no centro, "min" por minuto, "km").
 * Valores indicativos: mudam sem aviso. A app mostra sempre "confirme no local".
 */
export type Transport = { id: string; icon: string; pt: string; en: string; price: number; u: "trip" | "day" | "ride" | "min" | "km" };
const T = (id: string, icon: string, pt: string, en: string, price: number, u: Transport["u"]): Transport => ({ id, icon, pt, en, price, u });

export const TRANSPORT: Record<string, Transport[]> = {
  lis: [
    T("metro", "🚇", "Metro (viagem, cartão Navegante)", "Metro (single, Navegante card)", 1.9, "trip"), T("bus", "🚌", "Autocarro Carris", "Carris bus", 1.9, "trip"),
    T("tram28", "🚋", "Elétrico 28 (a bordo)", "Tram 28 (on board)", 3.2, "trip"), T("elev", "🚠", "Elevador de Santa Justa / Glória", "Santa Justa / Glória lift", 3.1, "trip"),
    T("pass24", "🎫", "Passe 24 h Carris/Metro", "24h Carris/Metro pass", 7.25, "day"), T("train", "🚆", "Comboio CP (Cascais/Sintra)", "CP train (Cascais/Sintra)", 2.4, "trip"),
    T("ferry", "⛴", "Barco para Cacilhas", "Ferry to Cacilhas", 1.6, "trip"), T("uber", "🚗", "Uber/Bolt no centro", "Uber/Bolt in the centre", 8, "ride"),
    T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 10, "ride"), T("bike", "🚲", "Bicicleta Gira (passe diário)", "Gira bike (day pass)", 2, "day"), T("scoot", "🛴", "Trotinete elétrica", "E-scooter", 0.25, "min")
  ],
  opo: [
    T("metro", "🚇", "Metro (Andante Z2)", "Metro (Andante Z2)", 1.4, "trip"), T("bus", "🚌", "Autocarro STCP", "STCP bus", 2.1, "trip"),
    T("tram", "🚋", "Elétrico histórico", "Heritage tram", 6, "trip"), T("funi", "🚠", "Funicular dos Guindais", "Guindais funicular", 4.5, "trip"),
    T("pass24", "🎫", "Andante 24", "Andante 24", 7.4, "day"), T("uber", "🚗", "Uber/Bolt no centro", "Uber/Bolt in the centre", 7, "ride"),
    T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 9, "ride"), T("boat", "⛴", "Cruzeiro das 6 pontes", "Six bridges cruise", 18, "trip")
  ],
  mad: [
    T("metro", "🚇", "Metro (viagem simples)", "Metro (single)", 2, "trip"), T("bus", "🚌", "Autocarro EMT", "EMT bus", 1.5, "trip"),
    T("t10", "🎫", "Metrobús 10 viagens", "10-trip Metrobús", 7.3, "trip"), T("tourist", "🎫", "Abono turístico 1 dia", "1-day tourist pass", 8.4, "day"),
    T("cerc", "🚆", "Cercanías", "Cercanías train", 1.7, "trip"), T("uber", "🚗", "Uber/Cabify no centro", "Uber/Cabify in the centre", 10, "ride"),
    T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 11, "ride"), T("bike", "🚲", "BiciMAD (viagem)", "BiciMAD (ride)", 0.5, "trip")
  ],
  bcn: [
    T("metro", "🚇", "Metro (viagem simples)", "Metro (single)", 2.9, "trip"), T("tcasual", "🎫", "T-casual (por viagem)", "T-casual (per trip)", 1.3, "trip"),
    T("hola", "🎫", "Hola Barcelona 48 h", "Hola Barcelona 48h", 19.5, "day"), T("bus", "🚌", "Autocarro TMB", "TMB bus", 2.9, "trip"),
    T("tram", "🚋", "Tram", "Tram", 2.9, "trip"), T("cable", "🚠", "Teleférico de Montjuïc", "Montjuïc cable car", 16.5, "trip"),
    T("funi", "🚠", "Funicular de Montjuïc", "Montjuïc funicular", 2.9, "trip"), T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 12, "ride"),
    T("uber", "🚗", "Uber/Cabify", "Uber/Cabify", 13, "ride"), T("scoot", "🛴", "Bicicleta partilhada", "Shared bike", 0.3, "min")
  ],
  par: [
    T("metro", "🚇", "Metro / RER na cidade", "Metro / RER in the city", 2.55, "trip"), T("bus", "🚌", "Autocarro RATP", "RATP bus", 2.55, "trip"),
    T("visite", "🎫", "Paris Visite 1 dia", "Paris Visite 1 day", 30.6, "day"), T("navigo", "🎫", "Navigo Jour (zonas 1–5)", "Navigo day (zones 1–5)", 12, "day"),
    T("rer", "🚆", "RER para Versalhes", "RER to Versailles", 4.4, "trip"), T("boat", "⛴", "Batobus (dia)", "Batobus (day)", 23, "day"),
    T("velib", "🚲", "Vélib' (passe diário)", "Vélib' (day pass)", 5, "day"), T("uber", "🚗", "Uber/Bolt no centro", "Uber/Bolt in the centre", 15, "ride"),
    T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 17, "ride")
  ],
  lon: [
    T("tube", "🚇", "Metro (contactless, zonas 1–2)", "Tube (contactless, zones 1–2)", 3, "trip"), T("bus", "🚌", "Autocarro (Hopper 1 h)", "Bus (1-hour Hopper)", 1.75, "trip"),
    T("cap", "🎫", "Teto diário zonas 1–2", "Daily cap zones 1–2", 8.9, "day"), T("dlr", "🚈", "DLR / Overground", "DLR / Overground", 3, "trip"),
    T("boat", "⛴", "Uber Boat Thames Clippers", "Uber Boat Thames Clippers", 7.5, "trip"), T("cable", "🚠", "IFS Cloud Cable Car", "IFS Cloud Cable Car", 7, "trip"),
    T("bike", "🚲", "Santander Cycles (30 min)", "Santander Cycles (30 min)", 1.75, "trip"), T("uber", "🚗", "Uber no centro", "Uber in the centre", 18, "ride"),
    T("taxi", "🚕", "Black cab no centro", "Black cab in the centre", 20, "ride")
  ],
  rom: [
    T("metro", "🚇", "Metro / autocarro (BIT 100 min)", "Metro / bus (BIT 100 min)", 1.5, "trip"), T("pass24", "🎫", "Passe 24 h ATAC", "24h ATAC pass", 8.5, "day"),
    T("pass48", "🎫", "Passe 48 h ATAC", "48h ATAC pass", 15, "day"), T("tram", "🚋", "Elétrico 8 (Trastevere)", "Tram 8 (Trastevere)", 1.5, "trip"),
    T("train", "🚆", "Comboio regional (Ostia/Tivoli)", "Regional train (Ostia/Tivoli)", 2.5, "trip"), T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 14, "ride"),
    T("uber", "🚗", "Uber/FreeNow", "Uber/FreeNow", 16, "ride"), T("scoot", "🛴", "Trotinete elétrica", "E-scooter", 0.29, "min")
  ],
  ams: [
    T("ov", "🚋", "Elétrico/metro GVB (1 h)", "GVB tram/metro (1 hour)", 3.4, "trip"), T("gvb24", "🎫", "GVB 24 h", "GVB 24h", 10, "day"),
    T("gvb48", "🎫", "GVB 48 h", "GVB 48h", 16.5, "day"), T("ferry", "⛴", "Ferry do IJ (grátis)", "IJ ferry (free)", 0, "trip"),
    T("bike", "🚲", "Aluguer de bicicleta (dia)", "Bike rental (day)", 14, "day"), T("ns", "🚆", "Comboio NS (Zaandam/Haarlem)", "NS train (Zaandam/Haarlem)", 4.5, "trip"),
    T("canal", "⛴", "Barco nos canais (1 h)", "Canal cruise (1 hour)", 18, "trip"), T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 18, "ride"),
    T("uber", "🚗", "Uber/Bolt", "Uber/Bolt", 16, "ride")
  ],
  edi: [
    T("bus", "🚌", "Autocarro Lothian", "Lothian bus", 2.4, "trip"), T("tram", "🚋", "Elétrico (cidade)", "Tram (city)", 2.4, "trip"),
    T("day", "🎫", "Bilhete diário Lothian", "Lothian day ticket", 5.5, "day"), T("train", "🚆", "Comboio (North Berwick)", "Train (North Berwick)", 9, "trip"),
    T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 12, "ride"), T("uber", "🚗", "Uber", "Uber", 11, "ride")
  ],
  man: [
    T("metrolink", "🚋", "Metrolink (zona 1)", "Metrolink (zone 1)", 2.8, "trip"), T("bus", "🚌", "Autocarro Bee Network (teto £2)", "Bee Network bus (£2 cap)", 2, "trip"),
    T("free", "🚌", "Free Bus no centro", "Free Bus in the centre", 0, "trip"), T("mlday", "🎫", "Metrolink dia (zonas 1–2)", "Metrolink day (zones 1–2)", 5.9, "day"),
    T("busday", "🎫", "Autocarros: teto diário", "Buses: daily cap", 5, "day"), T("train", "🚆", "Comboio Northern", "Northern train", 4.5, "trip"),
    T("bike", "🚲", "Starling Bank Bikes", "Starling Bank Bikes", 1, "trip"), T("uber", "🚗", "Uber/Bolt no centro", "Uber/Bolt in the centre", 9, "ride"),
    T("taxi", "🚕", "Táxi (black cab)", "Taxi (black cab)", 12, "ride")
  ],
  gla: [
    T("subway", "🚇", "Subway", "Subway", 1.85, "trip"), T("subday", "🎫", "Subway Daily", "Subway Daily", 4.45, "day"),
    T("bus", "🚌", "Autocarro First", "First bus", 2.25, "trip"), T("busday", "🎫", "Autocarro First (dia)", "First bus (day)", 5.4, "day"),
    T("train", "🚆", "Comboio ScotRail", "ScotRail train", 3.5, "trip"), T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 10, "ride"), T("uber", "🚗", "Uber", "Uber", 9, "ride")
  ],
  liv: [
    T("bus", "🚌", "Autocarro (teto £2)", "Bus (£2 cap)", 2, "trip"), T("merseyrail", "🚆", "Merseyrail", "Merseyrail", 2.8, "trip"),
    T("saveaway", "🎫", "Saveaway (dia)", "Saveaway (day)", 6.4, "day"), T("ferry", "⛴", "Ferry no Mersey", "Mersey Ferry", 13, "trip"),
    T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 9, "ride"), T("uber", "🚗", "Uber", "Uber", 8, "ride")
  ],
  bir: [
    T("bus", "🚌", "Autocarro (teto £2)", "Bus (£2 cap)", 2, "trip"), T("tram", "🚋", "West Midlands Metro", "West Midlands Metro", 2.5, "trip"),
    T("day", "🎫", "nBus dia", "nBus day", 5, "day"), T("train", "🚆", "Comboio regional", "Regional train", 3.5, "trip"),
    T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 10, "ride"), T("uber", "🚗", "Uber", "Uber", 9, "ride")
  ],
  dxb: [
    T("metro", "🚇", "Metro (Nol Silver, 2 zonas)", "Metro (Nol Silver, 2 zones)", 5, "trip"), T("tram", "🚋", "Elétrico do Dubai (Marina)", "Dubai Tram (Marina)", 3, "trip"),
    T("bus", "🚌", "Autocarro RTA", "RTA bus", 3, "trip"), T("abra", "⛵", "Abra no Creek (dinheiro)", "Creek abra (cash)", 1, "trip"),
    T("ferry", "⛴", "Ferry do Dubai", "Dubai Ferry", 50, "trip"), T("taxi", "🚕", "Táxi RTA no centro", "RTA taxi in the centre", 30, "ride"),
    T("uber", "🚗", "Uber / Careem", "Uber / Careem", 35, "ride")
  ],
  auh: [
    T("bus", "🚌", "Autocarro (Hafilat)", "Bus (Hafilat)", 4, "trip"), T("airbus", "🚌", "Autocarro do aeroporto A1/A2", "Airport bus A1/A2", 4, "trip"),
    T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 25, "ride"), T("uber", "🚗", "Uber / Careem", "Uber / Careem", 30, "ride"),
    T("bike", "🚲", "Bicicleta partilhada (Corniche)", "Shared bike (Corniche)", 20, "day")
  ],
  doh: [
    T("metro", "🚇", "Metro (Standard)", "Metro (Standard)", 2, "trip"), T("tram", "🚋", "Elétrico de Lusail / Msheireb", "Lusail / Msheireb tram", 2, "trip"),
    T("bus", "🚌", "Autocarro Karwa", "Karwa bus", 3, "trip"), T("taxi", "🚕", "Táxi Karwa", "Karwa taxi", 25, "ride"),
    T("uber", "🚗", "Uber / Careem", "Uber / Careem", 25, "ride"), T("dhow", "⛵", "Passeio de dhow (Corniche)", "Dhow ride (Corniche)", 30, "trip")
  ],
  ruh: [
    T("metro", "🚇", "Metro (bilhete 2 h)", "Metro (2-hour ticket)", 4, "trip"), T("metro3", "🎟", "Metro, passe de 3 dias", "Metro, 3-day pass", 20, "day"),
    T("bus", "🚌", "Autocarro Riyadh Bus", "Riyadh Bus", 4, "trip"), T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 35, "ride"),
    T("uber", "🚗", "Uber / Careem", "Uber / Careem", 30, "ride")
  ],
  jed: [
    T("bus", "🚌", "Autocarro Jeddah Bus", "Jeddah Bus", 4, "trip"), T("train", "🚆", "Comboio Haramain (aeroporto ↔ Sulaymaniyah)", "Haramain train (airport ↔ Sulaymaniyah)", 70, "trip"),
    T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 30, "ride"), T("uber", "🚗", "Uber / Careem", "Uber / Careem", 25, "ride")
  ],
  cai: [
    T("metro", "🚇", "Metro (até 9 estações)", "Metro (up to 9 stations)", 10, "trip"), T("metro16", "🚇", "Metro (até 16 estações)", "Metro (up to 16 stations)", 12, "trip"),
    T("bus", "🚌", "Autocarro CTA / micro-autocarro", "CTA bus / minibus", 10, "trip"), T("felucca", "⛵", "Felucca no Nilo (1 hora)", "Nile felucca (1 hour)", 300, "trip"),
    T("taxi", "🚕", "Táxi branco (com taxímetro)", "White taxi (metered)", 100, "ride"), T("uber", "🚗", "Uber / Careem", "Uber / Careem", 120, "ride")
  ],
  amm: [
    T("airbus", "🚌", "Sariyah Airport Express", "Sariyah Airport Express", 3.3, "trip"), T("brt", "🚌", "BRT de Amã", "Amman BRT", 0.5, "trip"),
    T("service", "🚐", "Táxi partilhado (service)", "Shared taxi (service)", 0.5, "trip"), T("taxi", "🚕", "Táxi amarelo (taxímetro)", "Yellow taxi (metered)", 3, "ride"),
    T("uber", "🚗", "Careem / Uber", "Careem / Uber", 3, "ride")
  ],
  mct: [
    T("bus", "🚌", "Autocarro Mwasalat", "Mwasalat bus", 0.5, "trip"), T("taxi", "🚕", "Táxi laranja-e-branco (combinar)", "Orange-and-white taxi (agree fare)", 5, "ride"),
    T("otaxi", "🚗", "Otaxi / Careem", "Otaxi / Careem", 4, "ride"), T("boat", "⛴", "Barco para ver golfinhos", "Dolphin-watching boat", 20, "trip")
  ],
  ist: [
    T("metro", "🚇", "Metro/elétrico (Istanbulkart)", "Metro/tram (Istanbulkart)", 42, "trip"), T("bus", "🚌", "Autocarro IETT", "IETT bus", 42, "trip"),
    T("ferry", "⛴", "Ferry no Bósforo (Şehir Hatları)", "Bosphorus ferry (Şehir Hatları)", 42, "trip"), T("marmaray", "🚆", "Marmaray (sob o Bósforo)", "Marmaray (under the Bosphorus)", 42, "trip"),
    T("funi", "🚠", "Funicular / Tünel", "Funicular / Tünel", 42, "trip"), T("cruise", "⛴", "Cruzeiro curto no Bósforo", "Short Bosphorus cruise", 300, "trip"),
    T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 450, "ride"), T("bitaksi", "🚗", "BiTaksi/Uber", "BiTaksi/Uber", 500, "ride")
  ],
  fra: [
    T("sbahn", "🚆", "S-Bahn / U-Bahn / elétrico (Frankfurt)", "S-Bahn / U-Bahn / tram (Frankfurt)", 3.8, "trip"), T("air", "✈", "Bilhete aeroporto ↔ cidade (S8/S9)", "Airport ↔ city ticket (S8/S9)", 6.3, "trip"),
    T("day", "🎫", "Tageskarte Frankfurt com aeroporto", "Frankfurt day ticket incl. airport", 12.0, "day"), T("bus", "🚌", "Autocarro", "Bus", 3.8, "trip"),
    T("ferry", "⛴", "Barco no Meno (Primus-Linie)", "Main river boat (Primus-Linie)", 13, "trip"), T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 15, "ride"),
    T("uber", "🚗", "Uber/Bolt no centro", "Uber/Bolt in the centre", 13, "ride"), T("bike", "🚲", "Bicicleta Nextbike (30 min)", "Nextbike (30 min)", 1, "trip"), T("scoot", "🛴", "Trotinete elétrica", "E-scooter", 0.25, "min")
  ],
  ber: [
    T("ab", "🚇", "U-Bahn / S-Bahn / elétrico (zona AB)", "U-Bahn / S-Bahn / tram (zone AB)", 3.8, "trip"), T("abc", "✈", "Bilhete ABC (aeroporto BER)", "ABC ticket (BER airport)", 4.7, "trip"),
    T("short", "🎟", "Kurzstrecke (3 estações de metro)", "Short trip (3 rail stops)", 2.6, "trip"), T("day", "🎫", "24-Stunden-Karte ABC", "24-hour ticket ABC", 12.9, "day"),
    T("bus100", "🚌", "Autocarro 100/300 (passa pelos monumentos)", "Bus 100/300 (passes the sights)", 3.8, "trip"), T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 18, "ride"),
    T("uber", "🚗", "Uber/Bolt no centro", "Uber/Bolt in the centre", 14, "ride"), T("bike", "🚲", "Bicicleta partilhada", "Shared bike", 1.5, "trip"), T("scoot", "🛴", "Trotinete elétrica", "E-scooter", 0.25, "min")
  ],
  muc: [
    T("m", "🚇", "U-Bahn / S-Bahn / elétrico (zona M)", "U-Bahn / S-Bahn / tram (zone M)", 4.1, "trip"), T("air", "✈", "Bilhete aeroporto ↔ cidade", "Airport ↔ city single", 13.0, "trip"),
    T("aircity", "🎫", "Airport-City-Day-Ticket", "Airport-City-Day-Ticket", 16.0, "day"), T("day", "🎫", "Bilhete diário zona M", "Zone M day ticket", 9.7, "day"),
    T("bus", "🚌", "Autocarro", "Bus", 4.1, "trip"), T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 16, "ride"),
    T("uber", "🚗", "Uber/Bolt no centro", "Uber/Bolt in the centre", 14, "ride"), T("bike", "🚲", "MVG Rad (por minuto)", "MVG bike (per minute)", 0.1, "min")
  ],
  vie: [
    T("single", "🚇", "U-Bahn / elétrico / autocarro (Wiener Linien)", "U-Bahn / tram / bus (Wiener Linien)", 3.2, "trip"), T("s7", "✈", "S7 aeroporto ↔ cidade", "S7 airport ↔ city", 4.4, "trip"),
    T("cat", "🚆", "CAT (City Airport Train, 16 min sem paragens)", "CAT (City Airport Train, 16 min non-stop)", 14.9, "trip"), T("day", "🎫", "Bilhete 24 h", "24-hour ticket", 8.0, "day"),
    T("tram", "🚋", "Elétricos 1 e 2 no Ring", "Trams 1 and 2 around the Ring", 3.2, "trip"), T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 15, "ride"),
    T("uber", "🚗", "Uber/Bolt no centro", "Uber/Bolt in the centre", 13, "ride"), T("bike", "🚲", "WienMobil Rad", "WienMobil bike", 0.6, "trip")
  ],
  prg: [
    T("t30", "🚋", "Bilhete 30 min (metro/elétrico/autocarro)", "30-minute ticket (metro/tram/bus)", 30, "trip"), T("t90", "🚇", "Bilhete 90 min (inclui autocarro 119 do aeroporto)", "90-minute ticket (incl. airport bus 119)", 40, "trip"),
    T("day", "🎫", "Bilhete 24 h", "24-hour ticket", 120, "day"), T("ae", "✈", "Airport Express (AE) → estação central", "Airport Express (AE) → main station", 100, "trip"),
    T("funi", "🚠", "Funicular de Petřín (bilhete normal)", "Petřín funicular (normal ticket)", 40, "trip"), T("taxi", "🚕", "Táxi no centro (use app)", "Taxi in the centre (use an app)", 250, "ride"),
    T("bolt", "🚗", "Bolt/Uber no centro", "Bolt/Uber in the centre", 200, "ride")
  ],
  sin: [
    T("mrt", "🚇", "MRT (contactless, conforme a distância)", "MRT (contactless, by distance)", 2.0, "trip"), T("bus", "🚌", "Autocarro (contactless)", "Bus (contactless)", 2.0, "trip"),
    T("stp", "🎫", "Singapore Tourist Pass 1 dia", "Singapore Tourist Pass, 1 day", 17, "day"), T("grab", "🚗", "Grab/Gojek no centro", "Grab/Gojek in the centre", 15, "ride"),
    T("taxi", "🚕", "Táxi do aeroporto para o centro", "Taxi from the airport to the centre", 30, "ride"), T("bumboat", "⛵", "Barco no rio Singapura", "Singapore River boat", 28, "trip")
  ],
  zrh: [
    T("single", "🚋", "Elétrico / autocarro / S-Bahn, 1 h (zona 110, cidade)", "Tram / bus / S-Bahn, 1 h (zone 110, city)", 4.7, "trip"), T("short", "🎫", "Bilhete percurso curto (Kurzstrecke, 30 min)", "Short-hop ticket (Kurzstrecke, 30 min)", 2.8, "trip"),
    T("day", "🎫", "Bilhete 24 h zona 110 (cidade)", "24-hour ticket, zone 110 (city)", 9.4, "day"), T("air", "✈", "Aeroporto ↔ Zürich HB (3 zonas, 1 h)", "Airport ↔ Zürich HB (3 zones, 1 h)", 7.2, "trip"),
    T("airday", "🎫", "Bilhete 24 h com aeroporto (3 zonas)", "24-hour ticket incl. airport (3 zones)", 14.4, "day"), T("card", "🎫", "Zürich Card 24 h (transportes, aeroporto, barcos e museus)", "Zürich Card 24 h (transport, airport, boats and museums)", 29, "day"),
    T("poly", "🚠", "Polybahn (funicular Central → ETH)", "Polybahn (funicular Central → ETH)", 1.2, "trip")
  ],
  brn: [
    T("single", "🚋", "Elétrico / autocarro, 1 h (zonas 100/101, Libero)", "Tram / bus, 1 h (zones 100/101, Libero)", 5.2, "trip"), T("day", "🎫", "Tageskarte Libero zonas 100/101 (até às 5h do dia seguinte)", "Libero day ticket, zones 100/101 (until 05:00 next day)", 10.4, "day"),
    T("bernticket", "🏨", "Bern-Ticket: grátis para quem dorme em Berna (zonas 100/101, Gurten e Marzilibahn)", "Bern-Ticket: free for overnight guests in Bern (zones 100/101, Gurten and Marzili funiculars)", 0, "day")
  ],
  ath: [
    T("single", "🚇", "Bilhete 90 min (metro/elétrico/autocarro)", "90-minute ticket (metro/tram/bus)", 1.2, "trip"), T("airmetro", "✈", "Metro aeroporto (linha 3, só ida)", "Airport metro (line 3, one way)", 9.0, "trip"),
    T("airreturn", "✈", "Metro aeroporto ida e volta", "Airport metro return", 16.0, "trip"), T("x95", "🚌", "Autocarro expresso X95 aeroporto ↔ Syntagma (24 h)", "X95 express bus airport ↔ Syntagma (24 h)", 5.5, "trip"),
    T("day", "🎫", "Bilhete 24 h (sem aeroporto)", "24-hour ticket (excl. airport)", 4.1, "day"), T("tram", "🚋", "Elétrico Syntagma → litoral (bilhete 90 min)", "Tram Syntagma → coast (90-minute ticket)", 1.2, "trip")
  ],
  fnc: [
    T("single", "🚌", "Autocarro urbano (bilhete a bordo)", "City bus (ticket on board)", 2.05, "trip"), T("giro", "🎫", "Viagem pré-paga no cartão GIRO (cartão 0,50 €)", "Prepaid trip on a GIRO card (card €0.50)", 1.45, "trip"),
    T("day", "🎫", "Passe 1 dia (municipal)", "1-day pass (municipal)", 4.95, "day"), T("aerobus", "✈", "Aerobus aeroporto ↔ Funchal (pré-comprado)", "Aerobus airport ↔ Funchal (pre-purchased)", 5.55, "trip"),
    T("cable", "🚠", "Teleférico Funchal → Monte (só ida, online)", "Funchal → Monte cable car (one way, online)", 14.5, "trip")
  ],
  dub: [
    T("bus", "🚌", "Autocarro Dublin Bus (dinheiro, só moedas)", "Dublin Bus (cash, coins only)", 2.6, "trip"), T("leap", "💳", "Autocarro / Luas / DART com TFI Leap (90 min)", "Bus / Luas / DART on TFI Leap (90 min)", 2.0, "trip"),
    T("luas", "🚋", "Luas (bilhete simples, zona 1)", "Luas (single ticket, zone 1)", 2.0, "trip"), T("visitor", "🎫", "TFI Leap Visitor Card 24 h", "TFI Leap Visitor Card 24 h", 8.0, "day"),
    T("express", "✈", "Dublin Express aeroporto ↔ cidade (online)", "Dublin Express airport ↔ city (online)", 8.0, "trip"), T("aircoach", "✈", "Aircoach 700 aeroporto ↔ centro", "Aircoach 700 airport ↔ centre", 8.0, "trip"),
    T("taxi", "🚕", "Táxi aeroporto → centro (taxímetro)", "Taxi airport → centre (metered)", 30, "ride")
  ],
  dar: [
    T("brt", "🚌", "Autocarro rápido DART (mwendokasi)", "DART rapid bus (mwendokasi)", 1000, "trip"), T("bolt", "🚗", "Bolt/inDrive no centro", "Bolt/inDrive in the centre", 5000, "ride"),
    T("taxi", "🚕", "Bolt/táxi aeroporto → centro", "Bolt/taxi airport → centre", 20000, "ride"), T("ferry", "⛴", "Ferry rápido para Zanzibar", "Fast ferry to Zanzibar", 90000, "trip")
  ],
  hkg: [
    T("mtr", "🚇", "MTR (Octopus ou contactless, conforme a distância)", "MTR (Octopus or contactless, by distance)", 12, "trip"), T("ael", "✈", "Airport Express aeroporto → Hong Kong (Octopus/contactless)", "Airport Express airport → Hong Kong (Octopus/contactless)", 120, "trip"),
    T("tdp", "🎫", "MTR Tourist Day Pass (24 h, sem Airport Express)", "MTR Tourist Day Pass (24 h, excl. Airport Express)", 75, "day"), T("tram", "🚋", "Elétrico «Ding Ding» da Ilha de Hong Kong", "Hong Kong Island «Ding Ding» tram", 3.3, "trip"),
    T("ferry", "⛴", "Star Ferry Central ↔ Tsim Sha Tsui (convés superior, dia útil)", "Star Ferry Central ↔ Tsim Sha Tsui (upper deck, weekday)", 5, "trip"), T("peak", "🚠", "Peak Tram (ida e volta)", "Peak Tram (return)", 116, "trip"),
    T("taxi", "🚕", "Táxi vermelho do aeroporto para Central (taxímetro, mais portagens e bagagem)", "Red taxi from the airport to Central (meter, plus tolls and luggage)", 350, "ride")
  ],
  bkk: [
    T("mrt", "🚇", "MRT linha Azul (conforme a distância, 17–44 THB)", "MRT Blue Line (by distance, THB 17–44)", 25, "trip"), T("bts", "🚝", "BTS Skytrain (conforme a distância)", "BTS Skytrain (by distance)", 30, "trip"),
    T("arl", "✈", "Airport Rail Link aeroporto → Phaya Thai", "Airport Rail Link airport → Phaya Thai", 45, "trip"), T("boat", "⛴", "Barco expresso do Chao Phraya (bandeira laranja, preço único)", "Chao Phraya Express Boat (orange flag, flat fare)", 19, "trip"),
    T("taxi", "🚕", "Táxi com taxímetro (bandeirada; mais 50 THB desde o aeroporto)", "Metered taxi (flag fall; THB 50 extra from the airport)", 35, "ride")
  ],
  dps: [
    T("grab", "🚗", "Grab aeroporto → Denpasar (13 km, desde)", "Grab airport → Denpasar (13 km, from)", 90000, "ride"),
    T("kura", "🚌", "Kura-Kura Bus Kuta/Sanur ⇄ Ubud (só ida)", "Kura-Kura Bus Kuta/Sanur ⇄ Ubud (one way)", 100000, "trip")
  ],
  nyc: [
    T("subway", "🚇", "Metro/autocarro (OMNY contactless)", "Subway/bus (OMNY contactless)", 3.0, "trip"), T("airtrain", "✈", "AirTrain JFK (mais o metro)", "AirTrain JFK (plus subway)", 8.5, "trip"),
    T("lirr", "🚆", "Comboio LIRR Jamaica → Penn Station", "LIRR train Jamaica → Penn Station", 7.0, "trip"), T("ferry", "⛴", "Staten Island Ferry", "Staten Island Ferry", 0, "trip"),
    T("nycferry", "🛥", "NYC Ferry (East River)", "NYC Ferry (East River)", 4.5, "trip"), T("citibike", "🚲", "Citi Bike (passe de 1 dia)", "Citi Bike (day pass)", 25, "day"),
    T("taxi", "🚕", "Táxi amarelo JFK → Manhattan (tarifa fixa, sem portagens e gorjeta)", "Yellow cab JFK → Manhattan (flat fare, before tolls and tip)", 70, "ride"), T("uber", "🚗", "Uber/Lyft em Manhattan", "Uber/Lyft in Manhattan", 25, "ride")
  ],
  was: [
    T("metro", "🚇", "Metrorail (conforme a distância e a hora)", "Metrorail (by distance and time)", 2.25, "trip"), T("bus", "🚌", "Metrobus", "Metrobus", 2.25, "trip"),
    T("day", "🎫", "Passe de 1 dia Metro", "Metro 1-day pass", 13.5, "day"), T("iad", "✈", "Linha Prata até Dulles (tarifa máxima)", "Silver Line to Dulles (max fare)", 6.75, "trip"),
    T("bike", "🚲", "Capital Bikeshare (passe de 1 dia)", "Capital Bikeshare (day pass)", 8, "day"), T("uber", "🚗", "Uber/Lyft no centro", "Uber/Lyft downtown", 15, "ride")
  ],
  sfo: [
    T("muni", "🚌", "Muni autocarro/metro (Clipper ou contactless)", "Muni bus/rail (Clipper or contactless)", 3.0, "trip"), T("cable", "🚋", "Cable car (viagem)", "Cable car (single ride)", 9, "trip"),
    T("day", "🎫", "Visitor Passport Muni 1 dia (inclui cable car)", "Muni Visitor Passport 1 day (incl. cable car)", 13, "day"), T("bart", "🚆", "BART SFO → centro", "BART SFO → downtown", 11, "trip"),
    T("ferry", "⛴", "Ferry para Sausalito", "Ferry to Sausalito", 15, "trip"), T("uber", "🚗", "Uber/Lyft no centro", "Uber/Lyft downtown", 18, "ride")
  ],
  chi: [
    T("l", "🚇", "Comboio «L» / autocarro CTA", "CTA «L» train / bus", 2.5, "trip"), T("ohare", "✈", "Linha Azul a partir de O'Hare", "Blue Line from O'Hare", 5, "trip"),
    T("day", "🎫", "Passe de 1 dia Ventra", "Ventra 1-day pass", 5, "day"), T("divvy", "🚲", "Divvy (passe de 1 dia)", "Divvy (day pass)", 18, "day"),
    T("watertaxi", "🛥", "Táxi aquático do rio", "River water taxi", 8, "trip"), T("uber", "🚗", "Uber/Lyft no centro", "Uber/Lyft downtown", 15, "ride")
  ],
  bos: [
    T("t", "🚇", "Metro «T» (CharlieCard ou contactless)", "«T» subway (CharlieCard or contactless)", 2.4, "trip"), T("bus", "🚌", "Autocarro MBTA", "MBTA bus", 1.7, "trip"),
    T("sl1", "✈", "SL1 desde o aeroporto (grátis)", "SL1 from the airport (free)", 0, "trip"), T("day", "🎫", "Passe de 1 dia MBTA", "MBTA 1-day pass", 11, "day"),
    T("ferry", "⛴", "Ferry do porto (Charlestown)", "Harbour ferry (Charlestown)", 2.4, "trip"), T("bluebikes", "🚲", "Bluebikes (passe de 1 dia)", "Bluebikes (day pass)", 10, "day")
  ],
  mia: [
    T("metrorail", "🚇", "Metrorail / Metrobus", "Metrorail / Metrobus", 2.25, "trip"), T("mover", "🚝", "Metromover no centro (grátis)", "Downtown Metromover (free)", 0, "trip"),
    T("150", "✈", "Autocarro 150 Airport Express → Miami Beach", "Bus 150 Airport Express → Miami Beach", 2.25, "trip"), T("trolley", "🚎", "Trolley de Miami Beach (grátis)", "Miami Beach trolley (free)", 0, "trip"),
    T("day", "🎫", "Passe de 1 dia EASY Card", "EASY Card 1-day pass", 5.65, "day"), T("uber", "🚗", "Uber/Lyft South Beach → Wynwood", "Uber/Lyft South Beach → Wynwood", 25, "ride")
  ],
  lax: [
    T("metro", "🚇", "Metro LA (TAP ou contactless)", "LA Metro (TAP or contactless)", 1.75, "trip"), T("cap", "🎫", "Teto diário TAP", "TAP daily cap", 5, "day"),
    T("flyaway", "✈", "FlyAway LAX ↔ Union Station", "FlyAway LAX ↔ Union Station", 9.75, "trip"), T("dash", "🚌", "Autocarro DASH", "DASH bus", 0.5, "trip"),
    T("uber", "🚗", "Uber/Lyft Downtown → Hollywood", "Uber/Lyft Downtown → Hollywood", 25, "ride")
  ],
  las: [
    T("deuce", "🚌", "Autocarro Deuce na Strip (2 horas)", "Deuce bus on the Strip (2 hours)", 6, "trip"), T("day", "🎫", "Passe 24 h RTC", "RTC 24-hour pass", 8, "day"),
    T("monorail", "🚝", "Monorail de Las Vegas", "Las Vegas Monorail", 6.5, "trip"), T("uber", "🚗", "Uber/Lyft na Strip", "Uber/Lyft on the Strip", 15, "ride"),
    T("taxi", "🚕", "Táxi aeroporto → Strip", "Taxi airport → Strip", 25, "ride")
  ],
  msy: [
    T("streetcar", "🚋", "Elétrico ou autocarro RTA", "RTA streetcar or bus", 1.25, "trip"), T("jazzy", "🎫", "Jazzy Pass 1 dia", "1-day Jazzy Pass", 3, "day"),
    T("202", "✈", "Autocarro 202 Airport Express", "Bus 202 Airport Express", 1.5, "trip"), T("ferry", "⛴", "Ferry para Algiers Point", "Ferry to Algiers Point", 2, "trip"),
    T("uber", "🚗", "Uber/Lyft no centro", "Uber/Lyft in the centre", 15, "ride")
  ],
  mco: [
    T("lynx", "🚌", "Autocarro LYNX", "LYNX bus", 2, "trip"), T("day", "🎫", "Passe 1 dia LYNX", "LYNX 1-day pass", 4.5, "day"),
    T("sunrail", "🚆", "Comboio SunRail", "SunRail train", 2, "trip"), T("lymmo", "🚌", "LYMMO no centro (grátis)", "Downtown LYMMO (free)", 0, "trip"),
    T("uber", "🚗", "Uber/Lyft centro → parques", "Uber/Lyft downtown → parks", 35, "ride")
  ],
  yyz: [
    T("ttc", "🚇", "Metro, elétrico ou autocarro TTC (PRESTO ou contactless)", "TTC subway, streetcar or bus (PRESTO or contactless)", 3.3, "trip"), T("day", "🎫", "Passe de 1 dia TTC", "TTC day pass", 13.5, "day"),
    T("up", "✈", "UP Express Pearson ↔ Union", "UP Express Pearson ↔ Union", 12.35, "trip"), T("ferry", "⛴", "Ferry para as Toronto Islands", "Toronto Islands ferry", 9.11, "trip"),
    T("bikeshare", "🚲", "Bike Share Toronto (passe de 1 dia)", "Bike Share Toronto (day pass)", 15, "day"), T("uber", "🚗", "Uber/Lyft no centro", "Uber/Lyft in the centre", 18, "ride")
  ],
  mex: [
    T("metro", "🚇", "Metro (cartão de Movilidad Integrada)", "Metro (Movilidad Integrada card)", 5, "trip"), T("metrobus", "🚌", "Metrobús", "Metrobús", 6, "trip"),
    T("airbus", "✈", "Metrobús Linha 4 desde o aeroporto", "Metrobús Line 4 from the airport", 30, "trip"), T("ecobici", "🚲", "Ecobici (1 dia)", "Ecobici (1 day)", 130, "day"),
    T("uber", "🚗", "Uber/DiDi no centro", "Uber/DiDi in the centre", 90, "ride"), T("taxi", "🚕", "Táxi autorizado do aeroporto", "Authorised airport taxi", 300, "ride")
  ],
  rio: [
    T("metro", "🚇", "MetrôRio (contactless)", "MetrôRio (contactless)", 7.9, "trip"), T("vlt", "🚋", "VLT Carioca no centro", "VLT Carioca downtown tram", 4.7, "trip"),
    T("bus", "🚌", "Autocarro municipal", "City bus", 4.7, "trip"), T("bonde", "🚋", "Bondinho de Santa Teresa", "Santa Teresa tram", 20, "trip"),
    T("uber", "🚗", "Uber/99 Centro → Copacabana", "Uber/99 Centro → Copacabana", 30, "ride")
  ],
  bue: [
    T("subte", "🚇", "Subte (cartão SUBE ou contactless)", "Subte (SUBE card or contactless)", 1400, "trip"), T("colectivo", "🚌", "Autocarro (colectivo)", "City bus (colectivo)", 700, "trip"),
    T("tiendaleon", "✈", "Tienda León Ezeiza → Puerto Madero", "Tienda León Ezeiza → Puerto Madero", 20000, "trip"), T("ecobici", "🚲", "EcoBici (passe de 1 dia)", "EcoBici (day pass)", 3000, "day"),
    T("uber", "🚗", "Uber/Cabify no centro", "Uber/Cabify in the centre", 7000, "ride"), T("taxi", "🚕", "Remis Ezeiza → centro", "Remis Ezeiza → centre", 45000, "ride")
  ],
  rak: [
    T("bus19", "✈", "Autocarro 19 Aeroporto ↔ Medina", "Bus 19 Airport ↔ Medina", 30, "trip"), T("bus", "🚌", "Autocarro urbano Alsa", "Alsa city bus", 4, "trip"),
    T("petit", "🚕", "Petit taxi na cidade (com taxímetro)", "Petit taxi in town (metered)", 20, "ride"), T("caleche", "🐴", "Caleche (passeio de charrete, por hora)", "Calèche (horse carriage, per hour)", 150, "ride")
  ],
  cas: [
    T("tram", "🚋", "Elétrico de Casablanca", "Casablanca tram", 8, "trip"), T("train", "✈", "Comboio ONCF Aeroporto ↔ Casa Voyageurs", "ONCF train Airport ↔ Casa Voyageurs", 50, "trip"),
    T("petit", "🚕", "Petit taxi vermelho (com taxímetro)", "Red petit taxi (metered)", 20, "ride"), T("grand", "🚖", "Grand taxi para o aeroporto", "Grand taxi to the airport", 300, "ride")
  ],
  cpt: [
    T("myciti", "🚌", "Autocarro MyCiTi (myconnect)", "MyCiTi bus (myconnect)", 15, "trip"), T("a01", "✈", "MyCiTi A01 Aeroporto ↔ Civic Centre", "MyCiTi A01 Airport ↔ Civic Centre", 100, "trip"),
    T("uber", "🚗", "Uber/Bolt no centro", "Uber/Bolt in the centre", 60, "ride"), T("hop", "🚌", "Autocarro turístico hop-on hop-off (1 dia)", "Hop-on hop-off bus (1 day)", 300, "day")
  ],
  zan: [
    T("daladala", "🚐", "Dala-dala (miniautocarro)", "Dala-dala (minibus)", 1000, "trip"), T("taxi", "🚕", "Táxi aeroporto ↔ Stone Town", "Taxi airport ↔ Stone Town", 30000, "ride"),
    T("boat", "⛵", "Barco para a Ilha da Prisão", "Boat to Prison Island", 40000, "trip"), T("ferry", "⛴", "Ferry rápido para Dar es Salaam", "Fast ferry to Dar es Salaam", 90000, "trip")
  ],
  tun: [
    T("metro", "🚋", "Metro ligeiro de Tunes", "Tunis light rail", 0.8, "trip"), T("tgm", "🚆", "Comboio TGM (Cartago, Sidi Bou Said, La Marsa)", "TGM train (Carthage, Sidi Bou Said, La Marsa)", 1, "trip"),
    T("taxi", "🚕", "Táxi amarelo (com taxímetro)", "Yellow taxi (metered)", 6, "ride"), T("bolt", "🚗", "Bolt no centro", "Bolt in the centre", 8, "ride")
  ],
  add: [
    T("lrt", "🚋", "Metro ligeiro de Adis Abeba", "Addis Ababa light rail", 6, "trip"), T("minibus", "🚐", "Minibus azul e branco", "Blue-and-white minibus", 15, "trip"),
    T("ride", "🚗", "Ride/Feres no centro", "Ride/Feres in the centre", 300, "ride"), T("taxi", "🚕", "Táxi do aeroporto ao centro", "Airport taxi to the centre", 600, "ride")
  ],
  nbo: [
    T("matatu", "🚐", "Matatu (miniautocarro)", "Matatu (minibus)", 100, "trip"), T("sgr", "🚆", "Comboio SGR para Mombaça (económica)", "SGR train to Mombasa (economy)", 1500, "trip"),
    T("uber", "🚗", "Uber/Bolt no centro", "Uber/Bolt in the centre", 500, "ride"), T("taxi", "🚕", "Uber/Bolt aeroporto → centro", "Uber/Bolt airport → centre", 2000, "ride")
  ],
  lad: [
    T("candongueiro", "🚐", "Candongueiro (táxi coletivo)", "Candongueiro (shared minibus)", 300, "trip"), T("yango", "🚗", "Yango/Heetch no centro", "Yango/Heetch in the centre", 2500, "ride"),
    T("taxi", "🚕", "Táxi aeroporto NBJ → centro", "Taxi NBJ airport → centre", 25000, "ride"), T("boat", "⛵", "Barco para o Mussulo", "Boat to Mussulo", 5000, "trip")
  ],
  acc: [
    T("trotro", "🚐", "Trotro (miniautocarro)", "Trotro (minibus)", 7, "trip"), T("uber", "🚗", "Uber/Bolt no centro", "Uber/Bolt in the centre", 40, "ride"),
    T("taxi", "🚕", "Uber/Bolt aeroporto → centro", "Uber/Bolt airport → centre", 80, "ride"), T("okada", "🏍", "Mota-táxi (pouco segura)", "Motorbike taxi (unsafe)", 20, "ride")
  ],
  kgl: [
    T("bus", "🚌", "Autocarro urbano (cartão Tap&Go)", "City bus (Tap&Go card)", 500, "trip"), T("moto", "🏍", "Mota-táxi com capacete", "Moto taxi with helmet", 1000, "ride"),
    T("move", "🚗", "Táxi Move/Yego no centro", "Move/Yego taxi in the centre", 5000, "ride"), T("taxi", "🚕", "Táxi aeroporto → centro", "Taxi airport → centre", 8000, "ride")
  ],
  dkr: [
    T("brt", "🚌", "BRT de Dacar", "Dakar BRT", 400, "trip"), T("ter", "🚆", "TER (comboio regional)", "TER (regional train)", 1000, "trip"),
    T("chaloupe", "⛴", "Chaloupe para Gorée (ida e volta, estrangeiros)", "Gorée ferry (return, foreigners)", 5200, "trip"), T("taxi", "🚕", "Táxi no centro (combinar o preço)", "Taxi in the centre (agree the price)", 2000, "ride"),
    T("aibd", "✈", "Táxi AIBD → centro", "Taxi AIBD → centre", 25000, "ride")
  ]
};
