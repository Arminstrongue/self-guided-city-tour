/**
 * "Acabei de chegar" — aeroportos das restantes cidades (Europa central, Médio Oriente, Américas, África, Ásia).
 * Escrito pela VOYBU a partir da informação pública dos operadores; preços aproximados, sem dados ao vivo.
 * Onde não há transporte público prático do aeroporto, explicamos o táxi oficial / app com segurança.
 */
import type { ArrivalOption, ArrivalPoint, Step } from "./arrivals";

const s = (pt: string, en: string, sign?: string, min?: number): Step => ({ pt, en, ...(sign ? { sign } : {}), ...(min ? { min } : {}) });
type To = ArrivalOption["to"];
const ap = (id: string, name: string, code: string, lat: number, lng: number, options: ArrivalOption[]): ArrivalPoint => ({ id, kind: "airport", name, code, lat, lng, options });

/** Táxi oficial ou app: o mais seguro quando não há transporte público prático. */
function taxi(id: string, apps: string, min: number, fare: string, to: To, extra?: Step): ArrivalOption {
  return {
    id, name: `Táxi oficial / ${apps}`, min, fare, to,
    note: { pt: "Use só a praça de táxis oficial ou a app — recuse ofertas dentro do terminal.", en: "Use only the official taxi rank or the app — decline offers inside the terminal." },
    steps: [
      s(`Ligue os dados ou o Wi-Fi do aeroporto e peça na app (${apps}), ou siga as placas Taxi até à praça oficial.`, `Turn on data or airport Wi-Fi and book in the app (${apps}), or follow the Taxi signs to the official rank.`, "Taxi", 5),
      ...(extra ? [extra] : []),
      s("Antes de entrar, confirme o preço (ou o taxímetro) e mostre a morada do destino no ecrã.", "Before getting in, confirm the fare (or meter) and show your destination address on screen.", undefined),
      s(`Viagem até ao centro (${to.name}).`, `Ride to the centre (${to.name}).`, to.name, min)
    ]
  };
}
const card = (pt: string, en: string, sign: string) => s(pt, en, sign);
const tap = s("Pague com cartão contactless ou telemóvel ao entrar (ou compre bilhete na máquina).", "Pay with a contactless card or phone when boarding (or buy a ticket at the machine).", "Contactless");

export const ARRIVALS_WORLD: Record<string, ArrivalPoint[]> = {
  fra: [ap("fra-ap", "Frankfurt Airport", "FRA", 50.0379, 8.5622, [
    { id: "fra-s", name: "S-Bahn S8 / S9", min: 15, fare: "≈ €6", to: { name: "Hauptwache", lat: 50.1142, lng: 8.6788 }, steps: [
      s("No Terminal 1, siga as placas «Regionalbahnhof» (comboios regionais, piso subterrâneo).", "In Terminal 1, follow the “Regionalbahnhof” signs (regional trains, underground level).", "Regionalbahnhof · S", 8),
      card("Compre bilhete RMV para Frankfurt na máquina ou na app.", "Buy an RMV ticket to Frankfurt at the machine or in the app.", "RMV"),
      s("S8 ou S9 para Hauptbahnhof, Hauptwache ou Konstablerwache.", "S8 or S9 to Hauptbahnhof, Hauptwache or Konstablerwache.", "S8 · S9 → Hanau / Offenbach", 15)
    ] }
  ])],
  ber: [ap("ber-ap", "Berlin Brandenburg", "BER", 52.3667, 13.5033, [
    { id: "ber-fex", name: "FEX (Airport Express)", min: 35, fare: "≈ €4.70", to: { name: "Hauptbahnhof", lat: 52.5251, lng: 13.3694 }, steps: [
      s("Desça ao piso -2 do Terminal 1: estação de comboios.", "Go down to level -2 of Terminal 1: train station.", "Bahnhof · FEX", 6),
      card("Compre bilhete ABC na máquina/app (o aeroporto fica na zona C).", "Buy an ABC ticket at the machine/app (the airport is in zone C).", "Tarif ABC"),
      s("FEX ou RE para Berlin Hauptbahnhof (também Ostkreuz, Gesundbrunnen).", "FEX or RE to Berlin Hauptbahnhof (also Ostkreuz, Gesundbrunnen).", "FEX → Berlin Hbf", 30)
    ] }
  ])],
  muc: [ap("muc-ap", "Munich Airport", "MUC", 48.3538, 11.7861, [
    { id: "muc-s", name: "S-Bahn S1 / S8", min: 40, fare: "≈ €14", to: { name: "Marienplatz", lat: 48.1374, lng: 11.5755 },
      note: { pt: "O bilhete diário Airport-City-Day sai quase ao mesmo preço que o simples.", en: "The Airport-City-Day ticket costs about the same as a single." }, steps: [
      s("Siga o «S» verde até à estação (entre os terminais, no Munich Airport Center).", "Follow the green “S” to the station (between terminals, in the Munich Airport Center).", "S-Bahn", 6),
      card("Compre na máquina MVV ou na app MVV/DB e valide se for de papel.", "Buy at the MVV machine or in the MVV/DB app, and validate paper tickets.", "MVV"),
      s("S8 (mais rápido) ou S1 até Marienplatz ou Hauptbahnhof.", "S8 (faster) or S1 to Marienplatz or Hauptbahnhof.", "S8 → Herrsching · S1 → Ostbahnhof", 40)
    ] }
  ])],
  vie: [ap("vie-ap", "Vienna International", "VIE", 48.1103, 16.5697, [
    { id: "vie-s7", name: "S-Bahn S7 / Railjet", min: 25, fare: "≈ €4.40", to: { name: "Wien Mitte", lat: 48.2063, lng: 16.3846 },
      note: { pt: "O CAT é mais rápido (16 min) mas custa ~€15.", en: "The CAT is faster (16 min) but costs ~€15." }, steps: [
      s("Siga as placas «Trains» até à estação por baixo do terminal.", "Follow the “Trains” signs to the station below the terminal.", "Trains · S7", 5),
      card("Compre bilhete ÖBB «Flughafen–Wien» na máquina ou app.", "Buy an ÖBB “Airport–Vienna” ticket at the machine or app.", "ÖBB"),
      s("S7 para Wien Mitte (metro U3/U4), ou Railjet para Hauptbahnhof.", "S7 to Wien Mitte (metro U3/U4), or Railjet to Hauptbahnhof.", "S7 → Wien Floridsdorf", 25)
    ] }
  ])],
  prg: [ap("prg-ap", "Václav Havel Airport Prague", "PRG", 50.1008, 14.26, [
    { id: "prg-59", name: "Autocarro 59 + Metro A", min: 40, fare: "≈ 40 CZK", to: { name: "Můstek", lat: 50.0834, lng: 14.4240 }, steps: [
      s("À saída das chegadas, paragem do autocarro 59 (ou 100) para Nádraží Veleslavín.", "Outside arrivals, stop for bus 59 (or 100) to Nádraží Veleslavín.", "Bus 59 · Nádraží Veleslavín", 3),
      card("Bilhete de 90 min na máquina (aceita cartão), app PID Lítačka ou contactless a bordo; valide.", "90-min ticket at the machine (cards accepted), PID Lítačka app or contactless on board; validate.", "PID 90 min"),
      s("Em Nádraží Veleslavín, metro A (verde) até Malostranská (Castelo) ou Můstek (centro).", "At Nádraží Veleslavín, metro A (green) to Malostranská (Castle) or Můstek (centre).", "Metro A → Depo Hostivař", 30)
    ] },
    { id: "prg-ae", name: "Airport Express (AE)", min: 35, fare: "≈ 100 CZK", to: { name: "Praha hlavní nádraží", lat: 50.0831, lng: 14.4353 }, steps: [
      s("Paragem AE à saída das chegadas dos terminais 1 e 2.", "AE stop outside arrivals at terminals 1 and 2.", "Airport Express AE", 3),
      s("Compre o bilhete ao motorista.", "Buy the ticket from the driver.", "AE"),
      s("Até à estação central (Hlavní nádraží).", "To the main station (Hlavní nádraží).", "Hlavní nádraží", 35)
    ] }
  ])],
  sin: [ap("sin-ap", "Singapore Changi", "SIN", 1.3644, 103.9915, [
    { id: "sin-mrt", name: "MRT (East-West line)", min: 40, fare: "≈ S$2.20", to: { name: "City Hall", lat: 1.2931, lng: 103.852 }, steps: [
      s("Siga as placas «Train to City» (estação entre os terminais 2 e 3).", "Follow the “Train to City” signs (station between terminals 2 and 3).", "Train to City · MRT", 6),
      s("Passe o cartão contactless (Visa/Mastercard) nas barreiras — não precisa de bilhete.", "Tap a contactless card (Visa/Mastercard) at the gates — no ticket needed.", "SimplyGo"),
      s("Comboio até Tanah Merah; troque na mesma plataforma para City Hall / Raffles Place.", "Train to Tanah Merah; change across the platform for City Hall / Raffles Place.", "EW → Tuas Link", 35)
    ] }
  ])],
  dxb: [ap("dxb-ap", "Dubai International", "DXB", 25.2532, 55.3657, [
    { id: "dxb-metro", name: "Metro (linha Vermelha)", min: 30, fare: "≈ AED 6", to: { name: "BurJuman", lat: 25.2549, lng: 55.3042 }, steps: [
      s("Nos terminais 1 e 3 siga as placas Metro (passagem coberta).", "At terminals 1 and 3 follow the Metro signs (covered walkway).", "Metro · Red Line", 8),
      card("Compre um cartão Nol (Red ou Silver) na máquina ou balcão.", "Buy a Nol card (Red or Silver) at the machine or counter.", "Nol"),
      s("Linha Vermelha até BurJuman; troque para a Verde para Al Fahidi / Al Ghubaiba.", "Red line to BurJuman; change to the Green line for Al Fahidi / Al Ghubaiba.", "Red Line → Centrepoint/Expo", 25)
    ] }
  ])],
  auh: [ap("auh-ap", "Zayed International (Abu Dhabi)", "AUH", 24.433, 54.6511, [
    { id: "auh-a1", name: "Autocarro A1", min: 50, fare: "≈ AED 4", to: { name: "Abu Dhabi Bus Station", lat: 24.4586, lng: 54.3828 }, steps: [
      s("Paragem do autocarro A1 à saída das chegadas.", "A1 bus stop outside arrivals.", "Bus A1", 4),
      s("Pague com cartão Hafilat (máquina no terminal).", "Pay with a Hafilat card (machine in the terminal).", "Hafilat"),
      s("Até à estação central de autocarros; para a Mesquita Sheikh Zayed, táxi ou app.", "To the main bus station; for Sheikh Zayed Mosque, take a taxi or app.", "Bus Station", 45)
    ] },
    taxi("auh-taxi", "Uber · Careem", 25, "≈ AED 80", { name: "Sheikh Zayed Mosque", lat: 24.4128, lng: 54.475 })
  ])],
  doh: [ap("doh-ap", "Hamad International", "DOH", 25.2731, 51.6081, [
    { id: "doh-metro", name: "Metro (linha Vermelha)", min: 20, fare: "≈ QAR 2", to: { name: "Msheireb", lat: 25.2865, lng: 51.526 }, steps: [
      s("Siga as placas Doha Metro a partir das chegadas.", "Follow the Doha Metro signs from arrivals.", "Doha Metro · Red Line", 6),
      card("Compre um Travel Card na máquina (aceita cartão).", "Buy a Travel Card at the machine (cards accepted).", "Travel Card"),
      s("Linha Vermelha até Msheireb (centro); a Gold Line para o Souq Waqif.", "Red line to Msheireb (centre); the Gold line for Souq Waqif.", "Red Line → Lusail", 20)
    ] }
  ])],
  ruh: [ap("ruh-ap", "King Khalid International", "RUH", 24.9576, 46.6988, [
    { id: "ruh-metro", name: "Riyadh Metro (linha Amarela)", min: 30, fare: "≈ SAR 4", to: { name: "KAFD", lat: 24.7633, lng: 46.6417 }, steps: [
      s("Siga as placas Riyadh Metro nos terminais.", "Follow the Riyadh Metro signs in the terminals.", "Riyadh Metro · Line 4", 6),
      s("Pague com cartão contactless nas barreiras ou compre cartão Darb.", "Pay contactless at the gates or buy a Darb card.", "Darb"),
      s("Linha Amarela (4) até KAFD; daí, outras linhas para o centro.", "Yellow line (4) to KAFD; from there, other lines to the centre.", "Line 4 → KAFD", 30)
    ] },
    taxi("ruh-taxi", "Uber · Careem", 35, "", { name: "Al Masmak", lat: 24.6312, lng: 46.7134 })
  ])],
  jed: [ap("jed-ap", "King Abdulaziz International", "JED", 21.6796, 39.1565, [
    taxi("jed-taxi", "Uber · Careem", 35, "", { name: "Al-Balad", lat: 21.4826, lng: 39.1867 })
  ])],
  cai: [ap("cai-ap", "Cairo International", "CAI", 30.1219, 31.4056, [
    taxi("cai-taxi", "Uber · Careem", 60, "", { name: "Downtown / Tahrir", lat: 30.0444, lng: 31.2357 },
      s("Os motoristas de app esperam no parque indicado na app (siga as placas «Ride-hailing»).", "App drivers wait at the car park shown in the app (follow the “Ride-hailing” signs).", "Ride-hailing pickup"))
  ])],
  amm: [ap("amm-ap", "Queen Alia International", "AMM", 31.7226, 35.9932, [
    { id: "amm-bus", name: "Sariyah Airport Express", min: 50, fare: "≈ JOD 3.30", to: { name: "7th Circle", lat: 31.9605, lng: 35.8622 }, steps: [
      s("Paragem do Airport Express em frente às chegadas (a cada 30–60 min).", "Airport Express stop opposite arrivals (every 30–60 min).", "Airport Express", 3),
      s("Pague ao motorista (dinares).", "Pay the driver (dinars).", "JOD"),
      s("Saia no 7.º Círculo; para a Cidadela, táxi amarelo ou app (Careem/Uber).", "Get off at 7th Circle; for the Citadel, a yellow taxi or app (Careem/Uber).", "7th Circle", 45)
    ] },
    taxi("amm-taxi", "Careem · Uber", 40, "≈ JOD 25", { name: "Downtown (Balad)", lat: 31.9516, lng: 35.9239 })
  ])],
  mct: [ap("mct-ap", "Muscat International", "MCT", 23.5933, 58.2844, [
    taxi("mct-taxi", "Otaxi · Careem", 20, "", { name: "Muttrah Corniche", lat: 23.6197, lng: 58.5653 })
  ])],
  nyc: [ap("nyc-jfk", "New York JFK", "JFK", 40.6413, -73.7781, [
    { id: "nyc-airtrain", name: "AirTrain + metro E", min: 70, fare: "≈ $11.40", to: { name: "World Trade Center", lat: 40.7127, lng: -74.0099 }, steps: [
      s("Siga as placas AirTrain e apanhe-o para Jamaica Station.", "Follow the AirTrain signs and ride to Jamaica Station.", "AirTrain → Jamaica", 10),
      s("Na saída do AirTrain paga $8,50; depois passe o cartão contactless (OMNY) no metro.", "Pay $8.50 at the AirTrain exit; then tap a contactless card (OMNY) at the subway.", "OMNY"),
      s("Metro E para Manhattan (Midtown, World Trade Center).", "E train to Manhattan (Midtown, World Trade Center).", "E → World Trade Center", 55)
    ] },
    { id: "nyc-lirr", name: "AirTrain + LIRR", min: 45, fare: "≈ $16", to: { name: "Penn Station", lat: 40.7506, lng: -73.9935 },
      note: { pt: "Mais rápido para Midtown.", en: "Faster to Midtown." }, steps: [
      s("AirTrain até Jamaica Station.", "AirTrain to Jamaica Station.", "AirTrain → Jamaica", 10),
      s("Compre bilhete LIRR (app TrainTime ou máquina) para Penn Station ou Grand Central.", "Buy an LIRR ticket (TrainTime app or machine) to Penn Station or Grand Central.", "LIRR"),
      s("Comboio LIRR para Manhattan.", "LIRR train to Manhattan.", "Penn Station · Grand Central", 25)
    ] }
  ])],
  was: [ap("was-iad", "Washington Dulles", "IAD", 38.9531, -77.4565, [
    { id: "was-silver", name: "Metro (linha Prata)", min: 65, fare: "≈ $6", to: { name: "Metro Center", lat: 38.8983, lng: -77.0281 }, steps: [
      s("Siga as placas Metrorail (passagem do terminal principal).", "Follow the Metrorail signs (walkway from the main terminal).", "Metrorail · Silver Line", 8),
      s("Passe o cartão contactless ou SmarTrip nas barreiras.", "Tap a contactless card or SmarTrip at the gates.", "SmarTrip · Contactless"),
      s("Linha Prata para Downtown Largo; saia em Metro Center ou Capitol South.", "Silver line towards Downtown Largo; get off at Metro Center or Capitol South.", "Silver → Downtown Largo", 55)
    ] }
  ])],
  sfo: [ap("sfo-ap", "San Francisco International", "SFO", 37.6213, -122.379, [
    { id: "sfo-bart", name: "BART", min: 35, fare: "≈ $10", to: { name: "Powell St", lat: 37.7844, lng: -122.4079 }, steps: [
      s("Apanhe o AirTrain (grátis) até à estação BART no terminal internacional.", "Take the free AirTrain to the BART station at the International Terminal.", "AirTrain · BART", 8),
      s("Passe o cartão contactless ou Clipper nas barreiras.", "Tap a contactless card or Clipper at the gates.", "Clipper"),
      s("BART para Antioch/Richmond; saia em Powell St ou Embarcadero.", "BART towards Antioch/Richmond; get off at Powell St or Embarcadero.", "BART → Antioch", 30)
    ] }
  ])],
  chi: [ap("chi-ord", "Chicago O'Hare", "ORD", 41.9742, -87.9073, [
    { id: "chi-blue", name: "CTA Linha Azul", min: 45, fare: "≈ $5", to: { name: "Washington (Loop)", lat: 41.8831, lng: -87.6293 }, steps: [
      s("Siga as placas «Trains to City» (estação por baixo do Terminal 2).", "Follow the “Trains to City” signs (station under Terminal 2).", "CTA Blue Line", 8),
      s("Passe o cartão contactless ou Ventra.", "Tap a contactless card or Ventra.", "Ventra"),
      s("Linha Azul para Forest Park; saia em Washington, Monroe ou Jackson (Loop).", "Blue line towards Forest Park; get off at Washington, Monroe or Jackson (Loop).", "Blue → Forest Park", 40)
    ] }
  ])],
  bos: [ap("bos-ap", "Boston Logan", "BOS", 42.3656, -71.0096, [
    { id: "bos-sl1", name: "Silver Line SL1 (grátis)", min: 35, fare: "grátis", to: { name: "Park Street", lat: 42.3564, lng: -71.0624 }, steps: [
      s("À saída das chegadas, paragem Silver Line SL1.", "Outside arrivals, Silver Line SL1 stop.", "SL1 → South Station", 3),
      s("Desde o aeroporto é grátis, incluindo a troca em South Station.", "From the airport it's free, including the change at South Station.", "Free"),
      s("Em South Station, linha Vermelha até Park Street (Boston Common).", "At South Station, Red line to Park Street (Boston Common).", "Red Line → Alewife", 30)
    ] }
  ])],
  mia: [ap("mia-ap", "Miami International", "MIA", 25.7959, -80.287, [
    { id: "mia-150", name: "Autocarro 150 (Miami Beach Airport Express)", min: 50, fare: "≈ $2.25", to: { name: "Lincoln Road", lat: 25.7907, lng: -80.1394 }, steps: [
      s("Apanhe o MIA Mover para o Miami Intermodal Center (MIC).", "Take the MIA Mover to the Miami Intermodal Center (MIC).", "MIA Mover · MIC", 8),
      tap,
      s("Autocarro 150 para Miami Beach (Lincoln Road); ou Metrorail Orange para Downtown.", "Bus 150 to Miami Beach (Lincoln Road); or Metrorail Orange line to Downtown.", "150 Miami Beach Airport Express", 40)
    ] }
  ])],
  lax: [ap("lax-ap", "Los Angeles International", "LAX", 33.9416, -118.4085, [
    { id: "lax-flyaway", name: "FlyAway", min: 50, fare: "≈ $9.75", to: { name: "Union Station", lat: 34.0562, lng: -118.2365 }, steps: [
      s("No piso das chegadas, procure as paragens verdes «FlyAway».", "On the arrivals level, look for the green “FlyAway” stops.", "FlyAway", 5),
      s("Pague com cartão ao embarcar.", "Pay by card when boarding.", "FlyAway"),
      s("Direto a Union Station (depende do trânsito).", "Direct to Union Station (traffic-dependent).", "Union Station", 45)
    ] }
  ])],
  las: [ap("las-ap", "Harry Reid International", "LAS", 36.084, -115.1537, [
    taxi("las-taxi", "Uber · Lyft", 15, "", { name: "The Strip", lat: 36.1147, lng: -115.1728 }),
    { id: "las-cx", name: "Autocarro RTC (CX / 109)", min: 40, fare: "≈ $2", to: { name: "Downtown Las Vegas", lat: 36.1699, lng: -115.1398 }, steps: [
      s("Siga as placas «Public Transit» (piso inferior).", "Follow the “Public Transit” signs (lower level).", "RTC", 4),
      s("Compre na app rideRTC ou na máquina.", "Buy in the rideRTC app or at the machine.", "rideRTC"),
      s("Autocarro para o Strip ou Downtown.", "Bus to the Strip or Downtown.", "Strip · Downtown", 35)
    ] }
  ])],
  msy: [ap("msy-ap", "Louis Armstrong New Orleans", "MSY", 29.9934, -90.258, [
    { id: "msy-202", name: "Autocarro 202 Airport Express", min: 45, fare: "≈ $1.50", to: { name: "Elk Place (Downtown)", lat: 29.9554, lng: -90.0751 }, steps: [
      s("Paragem do 202 no piso das chegadas (porta 7, transporte terrestre).", "Bus 202 stop at arrivals (door 7, ground transport).", "RTA 202", 4),
      s("Pague com a app Le Pass ou em dinheiro exato.", "Pay with the Le Pass app or exact cash.", "Le Pass"),
      s("Até Elk Place; o French Quarter fica a 10 min a pé.", "To Elk Place; the French Quarter is a 10-min walk.", "Downtown", 40)
    ] }
  ])],
  mco: [ap("mco-ap", "Orlando International", "MCO", 28.4312, -81.3081, [
    { id: "mco-lynx", name: "Autocarro LYNX 11", min: 45, fare: "≈ $2", to: { name: "LYNX Central Station", lat: 28.5495, lng: -81.3807 }, steps: [
      s("Siga as placas «Public Transportation» (lado A, piso 1).", "Follow the “Public Transportation” signs (side A, level 1).", "LYNX", 5),
      s("Pague ao motorista ou com a app LYNX PawPass.", "Pay the driver or use the LYNX PawPass app.", "PawPass"),
      s("Linha 11 até LYNX Central Station (Downtown).", "Route 11 to LYNX Central Station (Downtown).", "LYNX 11", 40)
    ] }
  ])],
  yyz: [ap("yyz-ap", "Toronto Pearson", "YYZ", 43.6777, -79.6248, [
    { id: "yyz-up", name: "UP Express", min: 25, fare: "≈ C$12", to: { name: "Union Station", lat: 43.6453, lng: -79.3806 }, steps: [
      s("No Terminal 1 siga as placas UP Express (do Terminal 3, Terminal Link grátis).", "At Terminal 1 follow the UP Express signs (from Terminal 3, the free Terminal Link).", "UP Express", 8),
      s("Passe o cartão contactless ou PRESTO antes de embarcar.", "Tap a contactless card or PRESTO before boarding.", "PRESTO"),
      s("Direto a Union Station (CN Tower a 10 min a pé).", "Direct to Union Station (CN Tower a 10-min walk).", "Union Station", 25)
    ] }
  ])],
  mex: [ap("mex-ap", "Mexico City International", "MEX", 19.4361, -99.0719, [
    { id: "mex-mb4", name: "Metrobús Linha 4", min: 45, fare: "≈ MXN 30", to: { name: "República de Chile (Centro)", lat: 19.4351, lng: -99.1355 }, steps: [
      s("Paragem Metrobús junto à porta 7 (T1) ou porta 3 (T2).", "Metrobús stop near door 7 (T1) or door 3 (T2).", "Metrobús 4", 5),
      s("Compre um cartão Movilidad Integrada na máquina e carregue a tarifa de aeroporto.", "Buy a Movilidad Integrada card at the machine and load the airport fare.", "Tarjeta MI"),
      s("Linha 4 até ao Centro Histórico (República de Chile, perto do Zócalo).", "Line 4 to the Historic Centre (República de Chile, near the Zócalo).", "Línea 4 → Buenavista", 40)
    ] },
    taxi("mex-taxi", "táxi autorizado (balcão pré-pago) · Uber", 35, "", { name: "Zócalo", lat: 19.4326, lng: -99.1332 })
  ])],
  rio: [ap("rio-ap", "Rio de Janeiro Galeão", "GIG", -22.809, -43.2506, [
    taxi("rio-taxi", "táxi do balcão · Uber · 99", 40, "", { name: "Lapa / Centro", lat: -22.9153, lng: -43.1791 }),
    { id: "rio-brt", name: "BRT TransCarioca + Metro", min: 75, fare: "≈ R$ 10", to: { name: "Centro", lat: -22.9068, lng: -43.1729 }, steps: [
      s("Siga as placas BRT até à estação do aeroporto.", "Follow the BRT signs to the airport station.", "BRT TransCarioca", 5),
      s("Pague com cartão contactless ou Jaé.", "Pay with a contactless card or Jaé.", "Jaé"),
      s("BRT até Vicente de Carvalho e troque para o Metro linha 2 para o Centro.", "BRT to Vicente de Carvalho, then Metro line 2 to the Centre.", "Metrô Linha 2", 70)
    ] }
  ])],
  bue: [ap("bue-eze", "Buenos Aires Ezeiza", "EZE", -34.8222, -58.5358, [
    { id: "bue-tl", name: "Tienda León (autocarro)", min: 60, fare: "", to: { name: "Puerto Madero", lat: -34.6037, lng: -58.3632 }, steps: [
      s("Balcão Tienda León nas chegadas.", "Tienda León counter in arrivals.", "Tienda León", 4),
      s("Pague no balcão (cartão).", "Pay at the counter (card).", "Tienda León"),
      s("Até ao terminal de Puerto Madero; daí, táxi curto para o centro.", "To the Puerto Madero terminal; from there, a short taxi to the centre.", "Puerto Madero", 55)
    ] },
    taxi("bue-taxi", "táxi oficial (balcão) · Uber · Cabify", 45, "", { name: "Plaza de Mayo", lat: -34.6083, lng: -58.3712 })
  ])],
  rak: [ap("rak-ap", "Marrakech Menara", "RAK", 31.6069, -8.0363, [
    { id: "rak-19", name: "Autocarro 19", min: 25, fare: "≈ 30 MAD", to: { name: "Koutoubia", lat: 31.6237, lng: -7.9936 }, steps: [
      s("Paragem do autocarro 19 em frente às chegadas.", "Bus 19 stop opposite arrivals.", "Bus 19", 3),
      s("Pague ao motorista (dirhams).", "Pay the driver (dirhams).", "MAD"),
      s("Saia na Koutoubia, junto à praça Jemaa el-Fna.", "Get off at the Koutoubia, by Jemaa el-Fna square.", "Koutoubia", 20)
    ] },
    taxi("rak-taxi", "táxi oficial", 20, "", { name: "Jemaa el-Fna", lat: 31.6258, lng: -7.9891 })
  ])],
  cas: [ap("cas-ap", "Casablanca Mohammed V", "CMN", 33.3675, -7.5898, [
    { id: "cas-oncf", name: "Comboio ONCF Al Bidaoui", min: 40, fare: "≈ 50 MAD", to: { name: "Casa Port", lat: 33.6006, lng: -7.6158 }, steps: [
      s("A estação fica por baixo do Terminal 1: siga as placas «Gare ONCF».", "The station is under Terminal 1: follow the “Gare ONCF” signs.", "Gare ONCF", 5),
      s("Bilhete na bilheteira, máquina ou app ONCF.", "Ticket at the counter, machine or ONCF app.", "ONCF"),
      s("Comboio para Casa Voyageurs ou Casa Port (centro).", "Train to Casa Voyageurs or Casa Port (centre).", "Casa Port", 40)
    ] }
  ])],
  cpt: [ap("cpt-ap", "Cape Town International", "CPT", -33.9715, 18.6021, [
    { id: "cpt-a01", name: "MyCiTi A01", min: 35, fare: "≈ R100", to: { name: "Civic Centre", lat: -33.9208, lng: 18.4271 }, steps: [
      s("Paragem MyCiTi junto às chegadas domésticas.", "MyCiTi stop by domestic arrivals.", "MyCiTi A01", 5),
      s("Compre um cartão myconnect no quiosque e carregue saldo.", "Buy a myconnect card at the kiosk and top up.", "myconnect"),
      s("A01 até Civic Centre (centro).", "A01 to Civic Centre (city centre).", "Civic Centre", 30)
    ] },
    taxi("cpt-taxi", "Uber · Bolt", 25, "", { name: "City Bowl", lat: -33.9275, lng: 18.417 })
  ])],
  zan: [ap("zan-ap", "Abeid Amani Karume (Zanzibar)", "ZNZ", -6.222, 39.2249, [
    taxi("zan-taxi", "táxi oficial · transfer do hotel", 20, "≈ $15", { name: "Stone Town", lat: -6.1617, lng: 39.188 })
  ])],
  tun: [ap("tun-ap", "Tunis-Carthage", "TUN", 36.851, 10.2272, [
    taxi("tun-taxi", "táxi amarelo · Bolt", 20, "", { name: "Avenida Habib Bourguiba", lat: 36.7998, lng: 10.1806 },
      s("Nos táxis amarelos, peça para ligar o taxímetro (compteur).", "In yellow taxis, ask for the meter to be switched on (compteur).", "Compteur"))
  ])],
  add: [ap("add-ap", "Addis Ababa Bole", "ADD", 8.9779, 38.7993, [
    taxi("add-taxi", "Ride · Feres · táxi do aeroporto", 25, "", { name: "Piassa / Unity Park", lat: 9.02, lng: 38.7636 })
  ])],
  nbo: [ap("nbo-ap", "Nairobi Jomo Kenyatta", "NBO", -1.3192, 36.9278, [
    taxi("nbo-taxi", "Uber · Bolt", 40, "", { name: "CBD · National Museum", lat: -1.2742, lng: 36.8146 })
  ])],
  lad: [ap("lad-ap", "Aeroporto Internacional Dr. António Agostinho Neto", "NBJ", -9.05, 13.49, [
    taxi("lad-taxi", "Yango · Heetch · transfer", 60, "", { name: "Marginal de Luanda", lat: -8.8137, lng: 13.2311 },
      s("O novo aeroporto fica longe do centro: conte com 45–90 min conforme o trânsito.", "The new airport is far from the centre: allow 45–90 min depending on traffic.", undefined))
  ])],
  acc: [ap("acc-ap", "Accra Kotoka", "ACC", 5.6052, -0.1668, [
    taxi("acc-taxi", "Uber · Bolt", 25, "", { name: "Kwame Nkrumah Park", lat: 5.5446, lng: -0.2023 })
  ])],
  kgl: [ap("kgl-ap", "Kigali International", "KGL", -1.9686, 30.1395, [
    taxi("kgl-taxi", "táxi do aeroporto · Move", 25, "", { name: "Kigali CBD", lat: -1.9441, lng: 30.0619 })
  ])],
  dkr: [ap("dkr-ap", "Blaise Diagne (Dakar)", "DSS", 14.67, -17.0733, [
    { id: "dkr-aibd", name: "Navette AIBD (autocarro)", min: 60, fare: "≈ 4 000 XOF", to: { name: "Plateau", lat: 14.668, lng: -17.4321 }, steps: [
      s("Siga as placas «Navette / Bus» à saída das chegadas.", "Follow the “Navette / Bus” signs outside arrivals.", "Navette AIBD", 4),
      s("Pague ao balcão ou ao motorista.", "Pay at the counter or the driver.", "XOF"),
      s("Até ao Plateau (centro de Dacar); conte com trânsito.", "To the Plateau (central Dakar); expect traffic.", "Plateau", 60)
    ] },
    taxi("dkr-taxi", "táxi oficial · Yango · Heetch", 50, "", { name: "Plateau", lat: 14.668, lng: -17.4321 })
  ])]
};
