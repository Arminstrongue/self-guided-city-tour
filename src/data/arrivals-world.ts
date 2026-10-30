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
      card("Compre na máquina MVV ou na app MVV/DB; o bilhete Airport-City-Day já vem validado.", "Buy at the MVV machine or in the MVV/DB app; the Airport-City-Day ticket needs no validation.", "MVV"),
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
      s("Compre o bilhete AE ao motorista — os bilhetes normais de Praga não valem neste autocarro.", "Buy an AE ticket from the driver — regular Prague transport tickets are not valid on this bus.", "AE"),
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
  zrh: [ap("zrh-ap", "Zurich Airport", "ZRH", 47.4647, 8.5492, [
    { id: "zrh-train", name: "Comboio (S-Bahn / IC)", min: 12, fare: "≈ CHF 7.20", to: { name: "Zürich HB", lat: 47.3779, lng: 8.5403 },
      note: { pt: "A Zürich Card inclui o trajeto aeroporto ↔ cidade.", en: "The Zürich Card includes the airport ↔ city trip." }, steps: [
      s("Siga as placas dos comboios até à estação subterrânea, por baixo do Airport Centre.", "Follow the train signs to the underground station beneath the Airport Centre.", "Bahnhof · Train", 5),
      card("Compre na máquina um bilhete ZVV de 3 zonas (aeroporto 121 + cidade 110), válido 1 hora.", "Buy a 3-zone ZVV ticket at the machine (airport 121 + city 110), valid for 1 hour.", "ZVV"),
      s("Todos os comboios para sul param em Zürich HB (cerca de 13 por hora, 9–13 min).", "Every southbound train stops at Zürich HB (about 13 an hour, 9–13 min).", "Zürich HB", 12)
    ] }
  ])],
  brn: [
    { id: "brn-hb", kind: "station", name: "Bern (estação central)", lat: 46.9490, lng: 7.4391, options: [
      { id: "brn-hb-walk", name: "A pé", min: 5, fare: "", to: { name: "Bundesplatz", lat: 46.9466, lng: 7.4441 },
        note: { pt: "Do aeroporto de Zurique há comboios diretos para Berna de 30 em 30 min (cerca de 1h15).", en: "From Zurich Airport, direct trains to Bern run every 30 min (about 1 h 15)." }, steps: [
        s("Saia para a Bahnhofplatz; a Informação Turística fica no n.º 10a e vende bilhetes de transporte.", "Exit onto Bahnhofplatz; Tourist Information is at no. 10a and sells transport tickets.", "Bahnhofplatz", 2),
        s("Siga para a Bundesplatz, ou pelas arcadas da Spitalgasse e Marktgasse até ao Zytglogge.", "Walk to Bundesplatz, or along the arcades of Spitalgasse and Marktgasse to the Zytglogge.", "Bundesplatz · Spitalgasse", 5)
      ] }
    ] },
    ap("brn-ap", "Bern Airport", "BRN", 46.9141, 7.4997, [
      { id: "brn-ap-bus", name: "Autocarro 160 + S-Bahn", min: 35, fare: "Libero", to: { name: "Bern Bahnhof", lat: 46.9490, lng: 7.4391 },
        note: { pt: "Quem dorme em Berna tem o Bern-Ticket: inclui este trajeto no dia de chegada e de partida.", en: "Overnight guests in Bern get the Bern-Ticket: it covers this trip on arrival and departure days." }, steps: [
        s("No aeroporto, apanhe o autocarro 160 da BERNMOBIL até à estação de Belp.", "At the airport, take BERNMOBIL bus 160 to Belp station.", "Bus 160 → Belp", 5),
        card("Compre um bilhete Libero até Berna na máquina ou online.", "Buy a Libero ticket to Bern at the machine or online.", "Libero"),
        s("Em Belp, apanhe o S-Bahn S3, S4, S31 ou S44 até Bern.", "At Belp, take S-Bahn S3, S4, S31 or S44 to Bern.", "S3 · S4 · S31 · S44 → Bern", 30)
      ] }
    ])
  ],
  ath: [ap("ath-ap", "Athens International Airport", "ATH", 37.9364, 23.9445, [
    { id: "ath-metro", name: "Metro (linha 3)", min: 40, fare: "≈ €9", to: { name: "Syntagma", lat: 37.9755, lng: 23.7348 },
      note: { pt: "O bilhete de aeroporto vale 90 min e inclui mudanças para outras linhas; ida e volta custa €16.", en: "The airport ticket is valid for 90 minutes, including changes to other lines; a return costs €16." }, steps: [
      s("Siga as placas «Metro» até à estação do aeroporto.", "Follow the “Metro” signs to the airport station.", "Metro · Line 3", 7),
      card("Compre o bilhete de aeroporto (€9) na máquina ou na bilheteira, ou passe o cartão contactless no torniquete; valide à entrada e à saída.", "Buy an airport ticket (€9) at the machine or ticket office, or tap a contactless card at the gate; validate when you enter and when you exit.", "OASA · ATH.ENA"),
      s("Linha 3 (azul) até Syntagma, no centro; os comboios do aeroporto passam de 36 em 36 minutos.", "Line 3 (blue) to Syntagma, in the centre; airport trains run every 36 minutes.", "Line 3 → Dimotiko Theatro", 40)
    ] },
    { id: "ath-x95", name: "Autocarro X95", min: 60, fare: "≈ €5.50", to: { name: "Syntagma", lat: 37.9755, lng: 23.7348 },
      note: { pt: "Funciona 24 horas por dia; mais barato, mas o trânsito pode atrasar.", en: "Runs 24 hours a day; cheaper, but traffic can make it slow." }, steps: [
      s("À saída das chegadas, siga as placas «Bus» até à paragem do X95.", "Outside arrivals, follow the “Bus” signs to the X95 stop.", "Bus X95 · Syntagma", 3),
      card("Compre o bilhete de autocarro expresso (€5.50) ou pague com cartão contactless; valide na máquina azul ao entrar.", "Buy an express bus ticket (€5.50) or pay with a contactless card; validate at the blue machine when you board.", "OASA"),
      s("Até à Praça Syntagma (metro linhas 2 e 3), fim da linha.", "To Syntagma Square (metro lines 2 and 3), the end of the line.", "Syntagma", 60)
    ] },
    taxi("ath-taxi", "FREENOW · Uber", 40, "", { name: "Syntagma", lat: 37.9755, lng: 23.7348 })
  ])],
  fnc: [ap("fnc-ap", "Madeira Airport Cristiano Ronaldo", "FNC", 32.6979, -16.7745, [
    { id: "fnc-aerobus", name: "Aerobus", min: 45, fare: "≈ €5.55", to: { name: "Avenida do Mar", lat: 32.6468, lng: -16.908 },
      note: { pt: "Não circula a 25 de dezembro; horários em siga.madeira.gov.pt.", en: "Does not run on 25 December; timetables at siga.madeira.gov.pt." }, steps: [
      s("À saída das chegadas, siga as placas «Bus» até à paragem do Aerobus.", "Outside arrivals, follow the “Bus” signs to the Aerobus stop.", "Bus · Aerobus", 3),
      card("Compre o bilhete Aerobus (cerca de €5.55).", "Buy the Aerobus ticket (about €5.55).", "Aerobus"),
      s("Saia na Avenida do Mar, no centro do Funchal, junto à marina.", "Get off at Avenida do Mar, in central Funchal, by the marina.", "Avenida do Mar", 45)
    ] },
    taxi("fnc-taxi", "Bolt · Uber", 25, "", { name: "Avenida do Mar", lat: 32.6468, lng: -16.908 })
  ])],
  dub: [ap("dub-ap", "Dublin Airport", "DUB", 53.4213, -6.2701, [
    { id: "dub-16", name: "Dublin Bus 16 / 41", min: 40, fare: "≈ €2.60", to: { name: "O'Connell Street", lat: 53.3493, lng: -6.2611 },
      note: { pt: "O 41 circula 24 horas por dia.", en: "Route 41 runs around the clock." }, steps: [
      s("Siga as placas «Transport Zones»: os autocarros 16 e 41 saem da Zona 15, à porta do Terminal 1.", "Follow the “Transport Zones” signs: buses 16 and 41 leave from Zone 15 outside Terminal 1.", "Zone 15 · 16 · 41", 5),
      card("Pague ao motorista €2,60 só em moedas (sem notas nem cartões) ou passe um cartão TFI Leap (€2). O Leap Visitor Card vende-se nas chegadas do T1 e do T2.", "Pay the driver €2.60 in coins only (no notes or cards) or tap a TFI Leap card (€2). Leap Visitor Cards are sold in T1 and T2 arrivals.", "TFI Leap"),
      s("O 16 passa pela O'Connell Street (cerca de 40 min); o 41 termina na Lower Abbey Street, mesmo ao lado.", "Route 16 runs via O'Connell Street (about 40 min); route 41 ends at Lower Abbey Street, right next to it.", "O'Connell St", 40)
    ] },
    { id: "dub-express", name: "Dublin Express 782 / 784", min: 30, fare: "≈ €8", to: { name: "O'Connell Street", lat: 53.3493, lng: -6.2611 }, steps: [
      s("Siga as placas até à Zona 1 (Terminal 1) ou à Zona 21 (Terminal 2).", "Follow the signs to Zone 1 (Terminal 1) or Zone 21 (Terminal 2).", "Dublin Express · Zone 1 / 21", 5),
      card("Compre online por €8 (no aeroporto ou a bordo custa €10 e só com cartão).", "Buy online for €8 (at the airport or on board it's €10, card only).", "782 · 784"),
      s("Saia na paragem do centro mais perto: O'Connell Street, Temple Bar e Trinity College estão entre elas.", "Get off at the nearest city stop: O'Connell Street, Temple Bar and Trinity College are among them.", "City Centre", 25)
    ] },
    { id: "dub-aircoach", name: "Aircoach 700", min: 35, fare: "≈ €8", to: { name: "O'Connell Street", lat: 53.3493, lng: -6.2611 }, steps: [
      s("Siga as placas até à Zona 2 (Terminal 1) ou à Zona 20 (Terminal 2).", "Follow the signs to Zone 2 (Terminal 1) or Zone 20 (Terminal 2).", "Aircoach 700 · Zone 2 / 20", 5),
      card("Bilhete de €8 até ao centro, online ou a bordo com contactless, Apple Pay ou Google Pay.", "€8 ticket to the city centre, online or on board with contactless, Apple Pay or Google Pay.", "Aircoach"),
      s("Saia em O'Connell Street, O'Connell Bridge/Westmoreland Street ou St Stephen's Green.", "Get off at O'Connell Street, O'Connell Bridge/Westmoreland Street or St Stephen's Green.", "O'Connell St", 35)
    ] },
    taxi("dub-taxi", "FreeNow · Uber", 30, "≈ €30–45", { name: "O'Connell Street", lat: 53.3493, lng: -6.2611 },
      s("O táxi usa taxímetro: cerca de €1,32/km de segunda a sábado das 8h às 20h; mais caro à noite e ao domingo.", "Taxis are metered: about €1.32/km Monday to Saturday 8 am–8 pm; more at night and on Sundays."))
  ])],
  dar: [ap("dar-ap", "Julius Nyerere International (Dar es Salaam)", "DAR", -6.8781, 39.2026, [
    taxi("dar-taxi", "Bolt · inDrive · táxi do aeroporto", 40, "", { name: "City Centre · Askari Monument", lat: -6.8166, lng: 39.2896 },
      s("A paragem de autocarro pública fica fora do portão principal, a 9 minutos a pé do Terminal 3; com bagagem, o táxi é mais simples.", "The public bus stop is outside the main gate, a 9-minute walk from Terminal 3; with luggage, a taxi is easier."))
  ])],
  hkg: [ap("hkg-ap", "Hong Kong International", "HKG", 22.308, 113.9185, [
    { id: "hkg-ael", name: "Airport Express", min: 24, fare: "≈ HK$120", to: { name: "Hong Kong (Central)", lat: 22.285, lng: 114.1583 },
      note: { pt: "O mais rápido para o centro; o regresso ao aeroporto sai da mesma estação.", en: "The fastest way into town; the trip back to the airport leaves from the same station." }, steps: [
      s("Depois da alfândega, siga as placas do Airport Express: a estação fica junto aos halls de chegada, sem mudar de piso.", "After customs, follow the Airport Express signs: the station is beside the arrivals halls, with no change of level.", "Airport Express", 3),
      s("Passe nas barreiras um cartão Octopus ou um cartão contactless Visa, Mastercard ou UnionPay (HK$120); o bilhete simples custa HK$130.", "Tap an Octopus card or a contactless Visa, Mastercard or UnionPay card at the gates (HK$120); a single ticket costs HK$130.", "Octopus · Contactless"),
      s("Comboios a cada 10 minutos até à estação Hong Kong, em Central, das 5h54 às 0h48.", "Trains every 10 minutes to Hong Kong station in Central, from 05:54 to 00:48.", "Hong Kong", 24)
    ] },
    taxi("hkg-taxi", "Uber", 40, "≈ HK$350", { name: "Central", lat: 22.2808, lng: 114.1597 },
      s("Na praça de táxis, use a fila dos táxis vermelhos (urbanos), que servem a Ilha de Hong Kong e Kowloon. Cada mala na bagageira paga HK$6.", "At the taxi rank, use the queue for red (urban) taxis, which serve Hong Kong Island and Kowloon. Each bag in the boot costs HK$6.", "Urban Taxi"))
  ])],
  bkk: [ap("bkk-ap", "Suvarnabhumi", "BKK", 13.69, 100.7501, [
    { id: "bkk-arl", name: "Airport Rail Link + MRT", min: 60, fare: "≈ THB 35 + MRT", to: { name: "MRT Sanam Chai", lat: 13.744, lng: 100.4942 },
      note: { pt: "Sem trânsito: o caminho mais previsível até à cidade velha, das 5h30 à meia-noite.", en: "Traffic-free: the most predictable way to the old town, from 05:30 to midnight." }, steps: [
      s("A estação do Airport Rail Link fica no piso B1 do terminal principal.", "The Airport Rail Link station is on Level B1 of the main terminal.", "Airport Rail Link · B1", 5),
      s("Compre o bilhete na máquina ou na bilheteira: até Makkasan custa 35 THB (15–45 THB conforme a distância).", "Buy a ticket at the machine or ticket office: Makkasan costs THB 35 (THB 15–45 by distance).", "Makkasan"),
      s("Saia em Makkasan e siga a ligação para a estação Phetchaburi do MRT (linha Azul).", "Get off at Makkasan and follow the link to MRT Phetchaburi station (Blue Line).", "MRT Phetchaburi", 20),
      s("Apanhe a linha Azul sentido Lak Song e saia em Sanam Chai, junto a Wat Pho e ao Grande Palácio.", "Take the Blue Line towards Lak Song and get off at Sanam Chai, next to Wat Pho and the Grand Palace.", "MRT Blue Line → Lak Song", 30)
    ] },
    taxi("bkk-taxi", "Grab · Bolt", 50, "", { name: "Grand Palace", lat: 13.75, lng: 100.4913 },
      s("A praça de táxis públicos fica no piso 1, entre as portas 4 e 7; ao taxímetro soma-se uma taxa de aeroporto de 50 THB, paga ao motorista.", "The public taxi rank is on Level 1 between Gates 4 and 7; a THB 50 airport surcharge is added to the meter, paid to the driver.", "Public Taxi · Level 1"))
  ])],
  dps: [ap("dps-ap", "Bali I Gusti Ngurah Rai", "DPS", -8.7482, 115.1672, [
    taxi("dps-taxi", "Grab · táxi do aeroporto", 90, "", { name: "Ubud (Puri Saren Agung)", lat: -8.5067, lng: 115.2626 },
      s("Para a Grab, siga as indicações da app até ao GrabCar Lounge, nas chegadas internacionais. Até Ubud conte com cerca de 1h30, conforme o trânsito.", "For Grab, follow the in-app directions to the GrabCar Lounge in international arrivals. Allow about 1.5 hours to Ubud, depending on traffic.", "GrabCar Lounge"))
  ])],
  dxb: [ap("dxb-ap", "Dubai International", "DXB", 25.2532, 55.3657, [
    { id: "dxb-metro", name: "Metro (linha Vermelha)", min: 30, fare: "≈ AED 6", to: { name: "BurJuman", lat: 25.2549, lng: 55.3042 }, steps: [
      s("Nos terminais 1 e 3 siga as placas Metro (passagem coberta).", "At terminals 1 and 3 follow the Metro signs (covered walkway).", "Metro · Red Line", 8),
      card("Compre um cartão Nol (Red ou Silver) na máquina ou balcão.", "Buy a Nol card (Red or Silver) at the machine or counter.", "Nol"),
      s("Linha Vermelha até BurJuman; troque para a Verde para Al Fahidi / Al Ghubaiba.", "Red line to BurJuman; change to the Green line for Al Fahidi / Al Ghubaiba.", "Red Line → Centrepoint/Expo", 25)
    ] }
  ])],
  auh: [ap("auh-ap", "Zayed International (Abu Dhabi)", "AUH", 24.433, 54.6511, [
    { id: "auh-a1", name: "Autocarro A1", min: 50, fare: "≈ AED 4", to: { name: "Al Zahiyah (City Centre)", lat: 24.4586, lng: 54.3828 }, steps: [
      s("Paragem do autocarro A1 à saída das chegadas.", "A1 bus stop outside arrivals.", "Bus A1", 4),
      s("Pague com cartão Hafilat (máquina no terminal).", "Pay with a Hafilat card (machine in the terminal).", "Hafilat"),
      s("Até Al Zahiyah (centro da cidade); para a Mesquita Sheikh Zayed, táxi ou app.", "To Al Zahiyah (City Centre); for Sheikh Zayed Mosque, take a taxi or app.", "Al Zahiyah · City Centre", 45)
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
    { id: "nyc-airtrain", name: "AirTrain + metro E", min: 70, fare: "≈ $11.65", to: { name: "World Trade Center", lat: 40.7127, lng: -74.0099 }, steps: [
      s("Siga as placas AirTrain e apanhe-o para Jamaica Station.", "Follow the AirTrain signs and ride to Jamaica Station.", "AirTrain → Jamaica", 10),
      s("Na saída do AirTrain paga a tarifa do AirTrain; depois passe o cartão contactless (OMNY) no metro.", "Pay the AirTrain fare at the AirTrain exit; then tap a contactless card (OMNY) at the subway.", "OMNY"),
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
      s("Linha Prata para Largo / New Carrollton; saia em Metro Center ou Capitol South.", "Silver line towards Largo / New Carrollton; get off at Metro Center or Capitol South.", "Silver → Largo / New Carrollton", 55)
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
      s("No piso das chegadas, procure as placas e paragens azuis «FlyAway».", "On the arrivals level, look for the blue “FlyAway” signs and stops.", "FlyAway", 5),
      s("Pague ao embarcar com cartão contactless (Visa/Mastercard), Apple Pay ou Google Pay — não aceita dinheiro.", "Pay when boarding with a contactless card (Visa/Mastercard), Apple Pay or Google Pay — no cash.", "FlyAway · Contactless"),
      s("Direto a Union Station (depende do trânsito).", "Direct to Union Station (traffic-dependent).", "Union Station", 45)
    ] }
  ])],
  las: [ap("las-ap", "Harry Reid International", "LAS", 36.084, -115.1537, [
    taxi("las-taxi", "Uber · Lyft", 15, "", { name: "The Strip", lat: 36.1147, lng: -115.1728 }),
    { id: "las-cx", name: "Autocarro RTC (108 / Red Line)", min: 40, fare: "≈ $2", to: { name: "Downtown Las Vegas", lat: 36.1699, lng: -115.1398 }, steps: [
      s("Siga as placas «Public Transit» até ao Terminal 1, piso Zero (Level Zero).", "Follow the “Public Transit” signs to Terminal 1, Level Zero.", "RTC · Level Zero", 4),
      s("Compre na app rideRTC ou na máquina.", "Buy in the rideRTC app or at the machine.", "rideRTC"),
      s("Autocarro 108 ou Red Line para o Strip ou Downtown (o CX já não passa no aeroporto).", "Bus 108 or the Red Line to the Strip or Downtown (the CX no longer serves the airport).", "108 · Red Line", 35)
    ] }
  ])],
  msy: [ap("msy-ap", "Louis Armstrong New Orleans", "MSY", 29.9934, -90.258, [
    { id: "msy-202", name: "Autocarro 202 Airport Express", min: 45, fare: "≈ $1.50", to: { name: "Elk Place (Downtown)", lat: 29.9554, lng: -90.0751 }, steps: [
      s("Paragem do 202 no piso 1, à saída da porta 2 (zonas B4/B5).", "Bus 202 stop on Level 1, outside Door 2 (zones B4/B5).", "RTA 202 · Door 2", 4),
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
      s("Paragem Metrobús junto à porta 7 (T1) ou porta 2 (T2).", "Metrobús stop near door 7 (T1) or gate 2 (T2).", "Metrobús 4", 5),
      s("Compre um cartão Movilidad Integrada na máquina e carregue a tarifa de aeroporto.", "Buy a Movilidad Integrada card at the machine and load the airport fare.", "Tarjeta MI"),
      s("Linha 4 até ao Centro Histórico (República de Chile, perto do Zócalo).", "Line 4 to the Historic Centre (República de Chile, near the Zócalo).", "Línea 4 → Buenavista", 40)
    ] },
    taxi("mex-taxi", "táxi autorizado (balcão pré-pago) · Uber", 35, "", { name: "Zócalo", lat: 19.4326, lng: -99.1332 })
  ])],
  rio: [ap("rio-ap", "Rio de Janeiro Galeão", "GIG", -22.809, -43.2506, [
    taxi("rio-taxi", "táxi do balcão · Uber · 99", 40, "", { name: "Lapa / Centro", lat: -22.9153, lng: -43.1791 }),
    { id: "rio-brt", name: "BRT TransCarioca + Metro", min: 75, fare: "≈ R$ 10", to: { name: "Centro", lat: -22.9068, lng: -43.1729 }, steps: [
      s("Siga as placas BRT até à estação do aeroporto.", "Follow the BRT signs to the airport station.", "BRT TransCarioca", 5),
      s("Pague com o cartão Jaé ou o código QR da app Jaé (sem dinheiro).", "Pay with the Jaé card or the Jaé app QR code (no cash).", "Jaé"),
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
      s("Na estação Airport, compre um cartão de viagem única (ou um cartão myconnect).", "At Airport station, buy a single-trip card (or a myconnect card).", "MyCiTi"),
      s("A01 até Civic Centre (centro).", "A01 to Civic Centre (city centre).", "Civic Centre", 30)
    ] },
    taxi("cpt-taxi", "Uber · Bolt", 25, "", { name: "City Bowl", lat: -33.9275, lng: 18.417 })
  ])],
  zan: [ap("zan-ap", "Abeid Amani Karume (Zanzibar)", "ZNZ", -6.222, 39.2249, [
    taxi("zan-taxi", "táxi oficial · transfer do hotel", 20, "≈ $15", { name: "Stone Town", lat: -6.1617, lng: 39.188 })
  ])],
  tun: [ap("tun-ap", "Tunis-Carthage", "TUN", 36.851, 10.2272, [
    taxi("tun-taxi", "táxi amarelo", 20, "", { name: "Avenida Habib Bourguiba", lat: 36.7998, lng: 10.1806 },
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
    { id: "dkr-ter", name: "TER (comboio)", min: 55, fare: "", note: { pt: "Novo desde 28 set 2026: comboio do aeroporto até Dakar, sem trânsito.", en: "New since 28 Sep 2026: airport-to-Dakar train, no traffic." }, to: { name: "Gare de Dakar", lat: 14.672, lng: -17.4301 }, steps: [
      s("Siga as placas para a estação do TER, no aeroporto.", "Follow the signs to the airport's TER train station.", "TER", 5),
      s("Apanhe o TER para Dakar; se o comboio terminar em Diamniadio, mude aí para um TER para Dakar (passa a cada 8 min).", "Take the TER towards Dakar; if your train ends at Diamniadio, change there to a Dakar TER (every 8 min).", "TER · Dakar"),
      s("Saia na estação de Dakar (o terminal, junto ao Plateau).", "Get off at Dakar station (the terminus, next to the Plateau).", "Gare de Dakar", 55)
    ] },
    { id: "dkr-aibd", name: "AIBD Express (autocarro Dakar Dem Dikk)", min: 60, fare: "", to: { name: "HLM Grand-Yoff", lat: 14.7468, lng: -17.452 }, steps: [
      s("À saída das chegadas, procure o autocarro AIBD Express da Dakar Dem Dikk (reserva na app ou em booking.demdikk.sn).", "Outside arrivals, look for the Dakar Dem Dikk AIBD Express bus (book in the app or at booking.demdikk.sn).", "AIBD Express", 4),
      s("Os autocarros partem cerca de uma hora depois da aterragem dos voos.", "Buses leave about one hour after flights land."),
      s("Saia no terminal HLM Grand-Yoff, em frente ao estádio Léopold Sédar Senghor; para o Plateau, apanhe um táxi ou Yango.", "Get off at the HLM Grand-Yoff terminus, opposite Léopold Sédar Senghor stadium; for the Plateau, take a taxi or Yango.", "HLM Grand-Yoff", 60)
    ] },
    taxi("dkr-taxi", "táxi oficial · Yango · Heetch", 50, "", { name: "Plateau", lat: 14.668, lng: -17.4321 })
  ])]
};
