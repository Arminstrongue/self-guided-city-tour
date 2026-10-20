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
  ist: [
    T("metro", "🚇", "Metro/elétrico (Istanbulkart)", "Metro/tram (Istanbulkart)", 42, "trip"), T("bus", "🚌", "Autocarro IETT", "IETT bus", 42, "trip"),
    T("ferry", "⛴", "Ferry no Bósforo (Şehir Hatları)", "Bosphorus ferry (Şehir Hatları)", 42, "trip"), T("marmaray", "🚆", "Marmaray (sob o Bósforo)", "Marmaray (under the Bosphorus)", 42, "trip"),
    T("funi", "🚠", "Funicular / Tünel", "Funicular / Tünel", 42, "trip"), T("cruise", "⛴", "Cruzeiro curto no Bósforo", "Short Bosphorus cruise", 300, "trip"),
    T("taxi", "🚕", "Táxi no centro", "Taxi in the centre", 450, "ride"), T("bitaksi", "🚗", "BiTaksi/Uber", "BiTaksi/Uber", 500, "ride")
  ]
};
