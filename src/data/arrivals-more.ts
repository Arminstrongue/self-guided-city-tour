/**
 * "Acabei de chegar" para as outras cidades (Londres está em arrivals.ts). Escrito pela VOYBU a partir da
 * informação pública dos operadores; preços aproximados e sem dados ao vivo — confirmar no local.
 */
import type { ArrivalPoint, Step } from "./arrivals";

const s = (pt: string, en: string, sign?: string, min?: number): Step => ({ pt, en, ...(sign ? { sign } : {}), ...(min ? { min } : {}) });
const pay = (ptCard: string, enCard: string, sign: string) => s(`Compre o bilhete na máquina (aceita cartão): ${ptCard}`, `Buy a ticket at the machine (cards accepted): ${enCard}`, sign);
const ukPay = s("Pague com cartão contactless ou telemóvel (ou compre na máquina/app).", "Pay with a contactless card or phone (or buy at the machine/app).", "Contactless");

export const ARRIVALS_MORE: Record<string, ArrivalPoint[]> = {
  lis: [
    { id: "lis-ap", kind: "airport", name: "Aeroporto de Lisboa", code: "LIS", lat: 38.7742, lng: -9.1342, options: [
      { id: "lis-metro", name: "Metro (linha Vermelha)", min: 30, fare: "≈ €2.35", to: { name: "Saldanha / Alameda", lat: 38.7347, lng: -9.1453 },
        note: { pt: "Barato e sem trânsito; com malas grandes há escadas em algumas trocas.", en: "Cheap and traffic-free; some interchanges have stairs if you have big bags." },
        steps: [
          s("Saia das chegadas (Terminal 1) e siga o símbolo vermelho do metro.", "Leave arrivals (Terminal 1) and follow the red metro sign.", "Metro", 5),
          pay("cartão Navegante ocasional (€0,50) + viagem.", "a Navegante occasional card (€0.50) plus a trip.", "Navegante · Zapping"),
          s("Apanhe a linha Vermelha. Para a Baixa, troque em Alameda para a Verde; para as Avenidas, saia em Saldanha.", "Take the Red line. For Baixa, change at Alameda to the Green line; for the Avenidas, get off at Saldanha.", "Linha Vermelha → São Sebastião", 20)
        ] },
      { id: "lis-aerobus", name: "Aerobus", min: 35, fare: "≈ €4", to: { name: "Cais do Sodré", lat: 38.7058, lng: -9.1449 },
        note: { pt: "Direto à Baixa sem trocas, com espaço para malas.", en: "Straight to Baixa with no changes, with room for bags." },
        steps: [
          s("À saída das chegadas, siga as placas Aerobus até à paragem.", "Outside arrivals, follow the Aerobus signs to the stop.", "Aerobus", 3),
          s("Compre o bilhete online, na paragem ou ao motorista.", "Buy the ticket online, at the stop or from the driver.", "Aerobus tickets"),
          s("Saia em Restauradores, Rossio, Praça do Comércio ou Cais do Sodré.", "Get off at Restauradores, Rossio, Praça do Comércio or Cais do Sodré.", "Rossio · Cais do Sodré", 30)
        ] }
    ] },
    { id: "lis-ori", kind: "station", name: "Estação do Oriente", lat: 38.7679, lng: -9.0991, options: [
      { id: "lis-ori-metro", name: "Metro (linha Vermelha)", min: 20, fare: "≈ €2.35", to: { name: "Alameda", lat: 38.737, lng: -9.1335 },
        steps: [
          s("Desça do comboio e siga as placas do metro (piso inferior).", "Leave the train and follow the metro signs (lower level).", "Metro · Oriente", 4),
          pay("cartão Navegante ocasional + viagem.", "a Navegante occasional card plus a trip.", "Navegante"),
          s("Linha Vermelha até Alameda; troque para a Verde para a Baixa.", "Red line to Alameda; change to the Green line for Baixa.", "Linha Vermelha → São Sebastião", 15)
        ] }
    ] }
  ],
  opo: [
    { id: "opo-ap", kind: "airport", name: "Aeroporto do Porto", code: "OPO", lat: 41.2481, lng: -8.6814, options: [
      { id: "opo-metro", name: "Metro (linha E, violeta)", min: 30, fare: "≈ €2.60", to: { name: "Trindade", lat: 41.1522, lng: -8.6092 },
        steps: [
          s("A estação de metro fica em frente às chegadas: siga o «M».", "The metro station is opposite arrivals: follow the “M”.", "Metro", 3),
          pay("cartão Andante (€0,60) carregado com título Z4; valide antes de entrar.", "an Andante card (€0.60) loaded with a Z4 ticket; validate before boarding.", "Andante Z4"),
          s("Linha E (violeta) até Trindade; troque para a D (amarela) para os Aliados/São Bento.", "Line E (violet) to Trindade; change to line D (yellow) for Aliados/São Bento.", "Linha E → Trindade", 27)
        ] }
    ] },
    { id: "opo-cmp", kind: "station", name: "Estação de Campanhã", lat: 41.1486, lng: -8.5855, options: [
      { id: "opo-cmp-train", name: "Comboio urbano para São Bento", min: 5, fare: "≈ €1.50", to: { name: "São Bento", lat: 41.1456, lng: -8.6106 },
        note: { pt: "Com bilhete de longo curso da CP este troço costuma estar incluído.", en: "With a CP long-distance ticket this hop is usually included." },
        steps: [
          s("Veja no painel o próximo comboio para Porto-São Bento (saem a cada poucos minutos).", "Check the board for the next train to Porto-São Bento (every few minutes).", "Porto - São Bento", 2),
          s("Saia em São Bento, no centro histórico.", "Get off at São Bento, in the historic centre.", "São Bento", 5)
        ] }
    ] }
  ],
  mad: [
    { id: "mad-ap", kind: "airport", name: "Madrid-Barajas", code: "MAD", lat: 40.4936, lng: -3.5668, options: [
      { id: "mad-metro", name: "Metro (linha 8)", min: 30, fare: "≈ €5", to: { name: "Nuevos Ministerios", lat: 40.4464, lng: -3.6919 },
        note: { pt: "O preço inclui o suplemento de aeroporto (€3).", en: "The fare includes the €3 airport supplement." },
        steps: [
          s("Siga as placas do Metro (T1-T2-T3 ou T4).", "Follow the Metro signs (T1-T2-T3 or T4).", "Metro · Línea 8", 6),
          pay("cartão Multi + bilhete com suplemento de aeroporto.", "a Multi card plus a ticket with the airport supplement.", "Tarjeta Multi"),
          s("Linha 8 até Nuevos Ministerios; daí, linhas 6 e 10 ou Cercanías para o centro.", "Line 8 to Nuevos Ministerios; from there, lines 6 and 10 or Cercanías to the centre.", "Línea 8 → Nuevos Ministerios", 20)
        ] },
      { id: "mad-bus", name: "Exprés Aeropuerto (24 h)", min: 40, fare: "≈ €5", to: { name: "Atocha", lat: 40.4066, lng: -3.6892 },
        note: { pt: "Funciona toda a noite (à noite termina em Cibeles).", en: "Runs all night (at night it ends at Cibeles)." },
        steps: [
          s("À saída das chegadas, siga as placas Bus / Exprés Aeropuerto.", "Outside arrivals, follow the Bus / Exprés Aeropuerto signs.", "Exprés Aeropuerto", 4),
          s("Pague ao motorista com cartão.", "Pay the driver by card.", "Exprés Aeropuerto"),
          s("Saia em O'Donnell, Cibeles ou Atocha (fim, durante o dia).", "Get off at O'Donnell, Cibeles or Atocha (end, during the day).", "Cibeles · Atocha", 40)
        ] }
    ] },
    { id: "mad-atocha", kind: "station", name: "Madrid Puerta de Atocha", lat: 40.4066, lng: -3.6892, options: [
      { id: "mad-atocha-metro", name: "Metro (linha 1)", min: 10, fare: "≈ €1.50", to: { name: "Sol", lat: 40.4169, lng: -3.7035 },
        steps: [
          s("Siga as placas do Metro «Estación del Arte» (linha 1).", "Follow the Metro signs for “Estación del Arte” (line 1).", "Metro · Línea 1", 6),
          pay("cartão Multi + viagem.", "a Multi card plus a trip.", "Tarjeta Multi"),
          s("Linha 1 até Sol, o centro.", "Line 1 to Sol, the centre.", "Línea 1 → Pinar de Chamartín", 5)
        ] }
    ] }
  ],
  bcn: [
    { id: "bcn-ap", kind: "airport", name: "Barcelona-El Prat", code: "BCN", lat: 41.2974, lng: 2.0833, options: [
      { id: "bcn-aerobus", name: "Aerobús", min: 35, fare: "≈ €7.50", to: { name: "Plaça de Catalunya", lat: 41.387, lng: 2.17 },
        note: { pt: "O mais simples, a cada 5–10 min, de ambos os terminais.", en: "The simplest, every 5–10 min, from both terminals." },
        steps: [
          s("À saída das chegadas, siga as placas Aerobús (A1 no T1, A2 no T2).", "Outside arrivals, follow the Aerobús signs (A1 at T1, A2 at T2).", "Aerobús", 3),
          s("Pague com cartão na máquina ou a bordo.", "Pay by card at the machine or on board.", "Aerobús"),
          s("Saia em Plaça d'Espanya, Universitat ou Plaça de Catalunya (fim).", "Get off at Plaça d'Espanya, Universitat or Plaça de Catalunya (end).", "Plaça Catalunya", 35)
        ] },
      { id: "bcn-r2", name: "Comboio R2 Nord (só T2)", min: 25, fare: "≈ €2.90", to: { name: "Passeig de Gràcia", lat: 41.3917, lng: 2.165 },
        note: { pt: "Barato; do T1 apanhe primeiro o autocarro gratuito para o T2.", en: "Cheap; from T1 take the free shuttle bus to T2 first." },
        steps: [
          s("No Terminal 2 siga as placas Rodalies / Renfe (do T1, shuttle gratuito).", "At Terminal 2 follow the Rodalies / Renfe signs (from T1, free shuttle).", "Rodalies R2 Nord", 8),
          pay("bilhete simples ou T-casual.", "a single ticket or a T-casual.", "T-casual"),
          s("Saia em Sants ou Passeig de Gràcia.", "Get off at Sants or Passeig de Gràcia.", "Passeig de Gràcia", 25)
        ] }
    ] },
    { id: "bcn-sants", kind: "station", name: "Barcelona Sants", lat: 41.3792, lng: 2.1404, options: [
      { id: "bcn-sants-metro", name: "Metro (L3)", min: 10, fare: "≈ €2.90", to: { name: "Liceu (Rambla)", lat: 41.3807, lng: 2.1734 },
        steps: [
          s("Siga as placas do Metro (L3 verde ou L5 azul).", "Follow the Metro signs (L3 green or L5 blue).", "Metro L3 · L5", 4),
          pay("bilhete simples ou T-casual.", "a single ticket or a T-casual.", "T-casual"),
          s("L3 até Liceu (Rambla) ou Passeig de Gràcia.", "L3 to Liceu (Rambla) or Passeig de Gràcia.", "L3 → Trinitat Nova", 8)
        ] }
    ] }
  ],
  par: [
    { id: "par-cdg", kind: "airport", name: "Paris-Charles de Gaulle", code: "CDG", lat: 49.0097, lng: 2.5479, options: [
      { id: "par-rerb", name: "RER B", min: 35, fare: "≈ €13", to: { name: "Châtelet-Les Halles", lat: 48.8619, lng: 2.3469 },
        steps: [
          s("Siga as placas «Paris par train» / RER (CDG 1: CDGVAL até à estação; CDG 2: estação no meio do terminal).", "Follow the “Paris by train” / RER signs (CDG 1: CDGVAL to the station; CDG 2: station in the middle of the terminal).", "Paris par train · RER B", 10),
          pay("bilhete Aéroport (ou passe Navigo / app).", "an Airport ticket (or Navigo pass / app).", "Billet Aéroport"),
          s("RER B para Paris; saia em Gare du Nord, Châtelet-Les Halles ou Saint-Michel.", "RER B to Paris; get off at Gare du Nord, Châtelet-Les Halles or Saint-Michel.", "RER B → Paris", 35)
        ] },
      { id: "par-roissybus", name: "Roissybus", min: 60, fare: "≈ €16", to: { name: "Opéra", lat: 48.871, lng: 2.3317 },
        note: { pt: "Sem trocas nem escadas, mas depende do trânsito.", en: "No changes or stairs, but traffic-dependent." },
        steps: [
          s("Siga as placas Roissybus à saída das chegadas.", "Follow the Roissybus signs outside arrivals.", "Roissybus", 5),
          s("Pague na máquina ou com contactless a bordo.", "Pay at the machine or contactless on board.", "Roissybus"),
          s("Saia em Opéra (fim).", "Get off at Opéra (end).", "Opéra", 60)
        ] }
    ] },
    { id: "par-ory", kind: "airport", name: "Paris-Orly", code: "ORY", lat: 48.7262, lng: 2.3652, options: [
      { id: "par-m14", name: "Metro linha 14", min: 25, fare: "≈ €13", to: { name: "Châtelet", lat: 48.8584, lng: 2.3474 },
        steps: [
          s("Siga as placas da linha 14 (entre os terminais 1-2-3 e 4).", "Follow the line 14 signs (between terminals 1-2-3 and 4).", "Métro 14", 6),
          pay("bilhete Aéroport (ou passe Navigo / app).", "an Airport ticket (or Navigo pass / app).", "Billet Aéroport"),
          s("Linha 14 até Gare de Lyon, Châtelet ou Madeleine.", "Line 14 to Gare de Lyon, Châtelet or Madeleine.", "Ligne 14 → Saint-Denis Pleyel", 25)
        ] }
    ] },
    { id: "par-gdn", kind: "station", name: "Gare du Nord (Eurostar)", lat: 48.8809, lng: 2.3553, options: [
      { id: "par-gdn-metro", name: "Metro / RER", min: 10, fare: "≈ €2.50", to: { name: "Châtelet", lat: 48.8584, lng: 2.3474 },
        steps: [
          s("Saia das chegadas e siga as placas Métro / RER (piso inferior).", "Leave arrivals and follow the Métro / RER signs (lower level).", "Métro · RER", 5),
          pay("bilhete t+ (ou app / Navigo).", "a t+ ticket (or app / Navigo).", "Ticket t+"),
          s("RER B ou D até Châtelet; metro 4 para a margem esquerda, 5 para Bastille.", "RER B or D to Châtelet; metro 4 for the Left Bank, 5 for Bastille.", "RER B · D → Châtelet", 5)
        ] }
    ] }
  ],
  rom: [
    { id: "rom-fco", kind: "airport", name: "Roma Fiumicino", code: "FCO", lat: 41.8003, lng: 12.2389, options: [
      { id: "rom-lex", name: "Leonardo Express", min: 32, fare: "≈ €14", to: { name: "Roma Termini", lat: 41.9009, lng: 12.5016 },
        steps: [
          s("Siga as placas «Treni» até à estação do aeroporto.", "Follow the “Treni” signs to the airport station.", "Treni · Leonardo Express", 8),
          s("Compre o bilhete na máquina/app ou use contactless nas barreiras.", "Buy a ticket at the machine/app or use contactless at the gates.", "Leonardo Express"),
          s("Direto a Termini (fim), sem paragens.", "Non-stop to Termini (end).", "Roma Termini", 32)
        ] },
      { id: "rom-fl1", name: "Comboio regional FL1", min: 30, fare: "≈ €8", to: { name: "Trastevere", lat: 41.8737, lng: 12.4693 },
        note: { pt: "Mais barato; serve Trastevere e Ostiense (não vai a Termini).", en: "Cheaper; serves Trastevere and Ostiense (not Termini)." },
        steps: [
          s("Na estação do aeroporto, procure o comboio FL1 para Fara Sabina / Orte.", "At the airport station, look for the FL1 train to Fara Sabina / Orte.", "FL1", 8),
          s("Bilhete na máquina/app; valide antes de embarcar.", "Ticket at the machine/app; validate before boarding.", "Trenitalia"),
          s("Saia em Trastevere ou Ostiense (metro B).", "Get off at Trastevere or Ostiense (metro B).", "Roma Trastevere", 30)
        ] }
    ] },
    { id: "rom-ter", kind: "station", name: "Roma Termini", lat: 41.9009, lng: 12.5016, options: [
      { id: "rom-ter-metro", name: "Metro (A ou B)", min: 10, fare: "≈ €1.50", to: { name: "Spagna", lat: 41.9064, lng: 12.4823 },
        steps: [
          s("Siga o «M» vermelho: linha A (laranja) ou B (azul).", "Follow the red “M”: line A (orange) or B (blue).", "Metro A · B", 5),
          s("Pague com contactless nas barreiras ou bilhete BIT.", "Pay contactless at the gates or buy a BIT ticket.", "BIT · Contactless"),
          s("Linha A para Spagna/Vaticano (Ottaviano); B para o Coliseu (Colosseo).", "Line A for Spagna/Vatican (Ottaviano); line B for the Colosseum (Colosseo).", "A → Battistini · B → Laurentina", 5)
        ] }
    ] }
  ],
  ams: [
    { id: "ams-ap", kind: "airport", name: "Amsterdam Schiphol", code: "AMS", lat: 52.3105, lng: 4.7683, options: [
      { id: "ams-ns", name: "Comboio NS", min: 17, fare: "≈ €6", to: { name: "Amsterdam Centraal", lat: 52.3791, lng: 4.9003 },
        steps: [
          s("A estação fica por baixo da praça Schiphol Plaza: siga as placas «Trains».", "The station is under Schiphol Plaza: follow the “Trains” signs.", "Trains · Schiphol Plaza", 5),
          s("Passe o cartão contactless ou telemóvel nas barreiras (OVpay) à entrada e à saída.", "Tap a contactless card or phone at the gates (OVpay) on entry and exit.", "OVpay"),
          s("Comboio para Amsterdam Centraal (a cada poucos minutos).", "Train to Amsterdam Centraal (every few minutes).", "Amsterdam Centraal", 17)
        ] }
    ] },
    { id: "ams-cs", kind: "station", name: "Amsterdam Centraal", lat: 52.3791, lng: 4.9003, options: [
      { id: "ams-cs-tram", name: "Elétrico / metro (GVB)", min: 10, fare: "≈ €3.40", to: { name: "Dam", lat: 52.3731, lng: 4.8926 },
        steps: [
          s("Saia pelo lado da cidade (Centrumzijde): elétricos à frente, metro por baixo.", "Exit on the city side (Centrumzijde): trams in front, metro below.", "Centrumzijde", 4),
          s("Passe o cartão contactless ao entrar e ao sair.", "Tap your contactless card on entry and exit.", "OVpay"),
          s("O Dam fica a 10 min a pé; elétricos 2 e 12 para os museus.", "Dam is a 10-min walk; trams 2 and 12 for the museums.", "Tram 2 · 12", 10)
        ] }
    ] }
  ],
  edi: [
    { id: "edi-ap", kind: "airport", name: "Edinburgh Airport", code: "EDI", lat: 55.95, lng: -3.3725, options: [
      { id: "edi-tram", name: "Elétrico (Tram)", min: 35, fare: "≈ £7.50", to: { name: "Princes Street", lat: 55.9521, lng: -3.1965 },
        steps: [
          s("À saída das chegadas, siga as placas Trams (paragem em frente ao terminal).", "Outside arrivals, follow the Trams signs (stop opposite the terminal).", "Edinburgh Trams", 4),
          s("Compre na máquina da paragem ou na app antes de entrar.", "Buy at the stop machine or in the app before boarding.", "Tram tickets"),
          s("Saia em Princes Street, St Andrew Square ou York Place.", "Get off at Princes Street, St Andrew Square or York Place.", "Princes Street", 35)
        ] },
      { id: "edi-airlink", name: "Airlink 100", min: 30, fare: "≈ £5.50", to: { name: "Waverley Bridge", lat: 55.9517, lng: -3.1912 },
        steps: [
          s("Siga as placas Buses até à paragem do Airlink 100.", "Follow the Buses signs to the Airlink 100 stop.", "Airlink 100", 3),
          ukPay,
          s("Saia em Waverley Bridge (fim), junto à estação.", "Get off at Waverley Bridge (end), by the station.", "Waverley Bridge", 30)
        ] }
    ] },
    { id: "edi-wav", kind: "station", name: "Edinburgh Waverley", lat: 55.952, lng: -3.1884, options: [
      { id: "edi-wav-walk", name: "A pé", min: 5, fare: "", to: { name: "Princes Street", lat: 55.9521, lng: -3.1965 },
        steps: [
          s("Saia pelas escadas/rampa para Princes Street (Cidade Nova) ou pela Market Street para a Royal Mile.", "Take the steps/ramp up to Princes Street (New Town) or exit via Market Street for the Royal Mile.", "Princes Street · Market Street", 5)
        ] }
    ] }
  ],
  man: [
    { id: "man-ap", kind: "airport", name: "Manchester Airport", code: "MAN", lat: 53.3537, lng: -2.275, options: [
      { id: "man-train", name: "Comboio para Piccadilly", min: 20, fare: "≈ £5", to: { name: "Manchester Piccadilly", lat: 53.4774, lng: -2.2309 },
        steps: [
          s("Siga as placas Trains / The Station (entre os terminais 1, 2 e 3).", "Follow the Trains / The Station signs (between terminals 1, 2 and 3).", "The Station", 8),
          ukPay,
          s("Qualquer comboio para Manchester Piccadilly (a cada poucos minutos).", "Any train to Manchester Piccadilly (every few minutes).", "Manchester Piccadilly", 20)
        ] },
      { id: "man-metrolink", name: "Metrolink (elétrico)", min: 50, fare: "≈ £3", to: { name: "St Peter's Square", lat: 53.4781, lng: -2.2433 },
        note: { pt: "Mais barato e lento; útil para o sul da cidade.", en: "Cheaper and slower; handy for the south of the city." },
        steps: [
          s("Siga as placas Metrolink na zona The Station.", "Follow the Metrolink signs at The Station.", "Metrolink", 8),
          s("Passe o cartão contactless no leitor da plataforma antes de entrar.", "Tap your contactless card on the platform reader before boarding.", "Touch in"),
          s("Linha do aeroporto para Victoria; troque em Cornbrook ou siga até St Peter's Square.", "Airport line towards Victoria; change at Cornbrook or ride on to St Peter's Square.", "Metrolink → Victoria", 45)
        ] }
    ] },
    { id: "man-pic", kind: "station", name: "Manchester Piccadilly", lat: 53.4774, lng: -2.2309, options: [
      { id: "man-pic-walk", name: "A pé ou Metrolink", min: 10, fare: "", to: { name: "Piccadilly Gardens", lat: 53.4808, lng: -2.2367 },
        steps: [
          s("Saia pela entrada principal (London Road) e desça a rampa.", "Leave by the main entrance (London Road) and walk down the approach.", "Way out · City Centre", 3),
          s("Piccadilly Gardens fica a 8 min a pé; o Metrolink passa por baixo da estação.", "Piccadilly Gardens is an 8-min walk; Metrolink runs under the station.", "Piccadilly Gardens", 8)
        ] }
    ] }
  ],
  gla: [
    { id: "gla-ap", kind: "airport", name: "Glasgow Airport", code: "GLA", lat: 55.8719, lng: -4.4331, options: [
      { id: "gla-500", name: "Glasgow Airport Express 500", min: 25, fare: "≈ £10", to: { name: "Buchanan Bus Station", lat: 55.8655, lng: -4.2509 },
        steps: [
          s("À saída das chegadas, paragem 1: autocarro 500.", "Outside arrivals, stop 1: bus 500.", "Airport Express 500", 3),
          ukPay,
          s("Saia em Central Station, Queen Street ou Buchanan Bus Station.", "Get off at Central Station, Queen Street or Buchanan Bus Station.", "Glasgow City Centre", 25)
        ] }
    ] },
    { id: "gla-cen", kind: "station", name: "Glasgow Central", lat: 55.8591, lng: -4.2581, options: [
      { id: "gla-cen-walk", name: "A pé", min: 8, fare: "", to: { name: "George Square", lat: 55.8612, lng: -4.2502 },
        steps: [
          s("Saia para Gordon Street e siga para leste; George Square fica a 8 min.", "Exit onto Gordon Street and head east; George Square is 8 min away.", "Gordon Street", 8)
        ] }
    ] }
  ],
  liv: [
    { id: "liv-ap", kind: "airport", name: "Liverpool John Lennon", code: "LPL", lat: 53.3336, lng: -2.8497, options: [
      { id: "liv-bus", name: "Autocarro 86 / 500", min: 35, fare: "≈ £3", to: { name: "Liverpool ONE", lat: 53.4029, lng: -2.9862 },
        steps: [
          s("Paragens em frente ao terminal: autocarros 86 ou 500 para o centro.", "Stops outside the terminal: buses 86 or 500 to the city centre.", "City Centre", 3),
          ukPay,
          s("Saia em Liverpool ONE bus station ou Lime Street.", "Get off at Liverpool ONE bus station or Lime Street.", "Liverpool ONE", 35)
        ] }
    ] },
    { id: "liv-lime", kind: "station", name: "Liverpool Lime Street", lat: 53.4076, lng: -2.9779, options: [
      { id: "liv-lime-walk", name: "A pé", min: 15, fare: "", to: { name: "Albert Dock", lat: 53.4001, lng: -2.9923 },
        steps: [
          s("Saia para a praça de St George's Hall.", "Exit onto the St George's Hall plaza.", "Way out", 2),
          s("Desça pela Church Street até Liverpool ONE e ao Albert Dock (15 min).", "Walk down Church Street to Liverpool ONE and the Albert Dock (15 min).", "Albert Dock", 15)
        ] }
    ] }
  ],
  bir: [
    { id: "bir-ap", kind: "airport", name: "Birmingham Airport", code: "BHX", lat: 52.4539, lng: -1.748, options: [
      { id: "bir-train", name: "Air-Rail Link + comboio", min: 20, fare: "≈ £5", to: { name: "Birmingham New Street", lat: 52.4778, lng: -1.8983 },
        steps: [
          s("Apanhe o Air-Rail Link gratuito para a estação Birmingham International (2 min).", "Take the free Air-Rail Link to Birmingham International station (2 min).", "Air-Rail Link", 5),
          ukPay,
          s("Comboio para Birmingham New Street (a cada poucos minutos).", "Train to Birmingham New Street (every few minutes).", "Birmingham New Street", 12)
        ] }
    ] },
    { id: "bir-ns", kind: "station", name: "Birmingham New Street", lat: 52.4778, lng: -1.8983, options: [
      { id: "bir-ns-walk", name: "A pé", min: 5, fare: "", to: { name: "Victoria Square", lat: 52.4797, lng: -1.903 },
        steps: [
          s("Saia pelo Grand Central para Stephenson Street; Victoria Square fica a 5 min.", "Exit through Grand Central onto Stephenson Street; Victoria Square is 5 min away.", "Grand Central · Stephenson Street", 5)
        ] }
    ] }
  ],
  ist: [
    { id: "ist-ap", kind: "airport", name: "İstanbul Havalimanı", code: "IST", lat: 41.2753, lng: 28.7519, options: [
      { id: "ist-m11", name: "Metro M11 + M2", min: 60, fare: "Istanbulkart", to: { name: "Taksim", lat: 41.0369, lng: 28.985 },
        note: { pt: "Os preços em liras mudam muitas vezes; confirme na máquina.", en: "Lira fares change often; check at the machine." },
        steps: [
          s("Siga as placas Metro (piso -2).", "Follow the Metro signs (level -2).", "Metro M11", 8),
          s("Compre um Istanbulkart na máquina (aceita cartão) e carregue saldo.", "Buy an Istanbulkart at the machine (cards accepted) and top it up.", "İstanbulkart"),
          s("M11 até Gayrettepe; troque para a M2 até Taksim.", "M11 to Gayrettepe; change to M2 for Taksim.", "M11 → Gayrettepe · M2 → Yenikapı", 50)
        ] },
      { id: "ist-havaist", name: "Havaist (autocarro)", min: 75, fare: "Istanbulkart / cartão", to: { name: "Taksim", lat: 41.0369, lng: 28.985 },
        note: { pt: "Sem trocas e com espaço para malas; depende do trânsito.", en: "No changes and room for bags; traffic-dependent." },
        steps: [
          s("Siga as placas Havaist no piso das chegadas (-2).", "Follow the Havaist signs on the arrivals level (-2).", "Havaist", 5),
          s("Linha IST-19 para Taksim ou IST-1 para Sultanahmet (verifique no painel).", "Line IST-19 for Taksim or IST-1 for Sultanahmet (check the board).", "Havaist IST-19 · IST-1"),
          s("Pague com Istanbulkart ou cartão bancário a bordo.", "Pay with Istanbulkart or a bank card on board.", "İstanbulkart", 70)
        ] }
    ] },
    { id: "ist-saw", kind: "airport", name: "Sabiha Gökçen", code: "SAW", lat: 40.8986, lng: 29.3092, options: [
      { id: "ist-saw-m4", name: "Metro M4", min: 55, fare: "Istanbulkart", to: { name: "Kadıköy", lat: 40.9903, lng: 29.0236 },
        steps: [
          s("Siga as placas Metro à saída das chegadas.", "Follow the Metro signs outside arrivals.", "Metro M4", 6),
          s("Compre/carregue um Istanbulkart na máquina.", "Buy/top up an Istanbulkart at the machine.", "İstanbulkart"),
          s("M4 até Kadıköy; daí, ferry para Eminönü/Karaköy (lado europeu).", "M4 to Kadıköy; from there, the ferry to Eminönü/Karaköy (European side).", "M4 → Kadıköy", 50)
        ] }
    ] }
  ]
};
