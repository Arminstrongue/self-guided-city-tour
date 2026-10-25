import type { StationGuide } from "./arrival-guides";
// Gerado a partir da pesquisa em fontes oficiais (ver `sources` em cada entrada). Não editar à mão sem verificar a fonte.
export const GUIDES_DATA: Record<string, StationGuide> = {
 "lhr-eliz": {
  "sources": [
   "https://www.heathrow.com/transport-and-directions/by-rail-or-train/tfl-rail",
   "https://www.heathrow.com/at-the-airport/assistance-and-accessibility/accessible-travel",
   "https://tfl.gov.uk/elizabeth-line/stop/910GHTRWAPT/heathrow-terminals-2-3-rail-station",
   "https://blog.tfl.gov.uk/2022/12/22/digital-colour-standard/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "T2/T3: a estação fica entre os dois terminais, a poucos minutos a pé por uma passagem subterrânea. T4: fica por baixo das Chegadas. T5: fica na cave do terminal.",
   "en": "T2/T3: the station is between the two terminals, a few minutes' walk via a pedestrian subway. T4: it is below Arrivals. T5: it is in the terminal basement."
  },
  "follow": {
   "pt": "A Elizabeth line aparece a roxo nas placas e nos mapas.",
   "en": "The Elizabeth line is shown in purple on signs and maps.",
   "label": "Elizabeth line",
   "color": "#60399e"
  },
  "lift": {
   "pt": "T2/T3: o pessoal da estação leva-o a um elevador até ao piso da bilheteira; outros elevadores sobem ao rés-do-chão. T5: chega-se à estação de elevador a partir das Chegadas.",
   "en": "T2/T3: station staff can take you to a lift up to the ticket office level; more lifts go up to ground level. T5: the station is reached by lift from Arrivals."
  },
  "luggage": {
   "pt": "O átrio da estação não tem degraus, há barreiras acessíveis e as portas do comboio ficam ao nível da plataforma: pode entrar com a mala de rodas.",
   "en": "The station concourse is step-free, the gates include accessible barriers and train doors are level with the platform, so you can roll your case on."
  },
  "tickets": {
   "pt": "Passe o cartão contactless ou Oyster nas barreiras, ou compre um bilhete simples ou Travelcard Zonas 1-6 nas máquinas da estação. Heathrow fica na Zona 6.",
   "en": "Tap a contactless card or Oyster at the gates, or buy a single ticket or Zones 1-6 Travelcard at the station machines. Heathrow is in Zone 6."
  },
  "platforms": {
   "pt": "Nos Terminais 2 e 3, os comboios para o centro de Londres (sentido Abbey Wood / Shenfield) usam a plataforma 2. Confirme sempre nos ecrãs.",
   "en": "At Terminals 2 & 3, trains to central London (towards Abbey Wood / Shenfield) use platform 2. Always check the screens."
  }
 },
 "lhr-picc": {
  "sources": [
   "https://www.heathrow.com/transport-and-directions/by-rail-or-train/london-underground",
   "https://www.heathrow.com/at-the-airport/assistance-and-accessibility/accessible-travel",
   "https://blog.tfl.gov.uk/2022/12/22/digital-colour-standard/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "T2/T3: a estação fica entre os terminais, ligada por uma passagem subterrânea. T4: fica por baixo das Chegadas do T4. T5: fica na cave do terminal.",
   "en": "T2/T3: the station is between the terminals, linked by a pedestrian subway. T4: it is below T4 Arrivals. T5: it is in the basement of the terminal."
  },
  "follow": {
   "pt": "A linha Piccadilly aparece a azul-escuro nas placas e nos mapas.",
   "en": "The Piccadilly line is shown in dark blue on signs and maps.",
   "label": "Piccadilly line (Underground)",
   "color": "#0019a8"
  },
  "lift": {
   "pt": "As estações de metro de Heathrow têm acesso sem degraus às plataformas. No T5 chega-se à estação de elevador a partir das Chegadas.",
   "en": "Heathrow's Underground stations have step-free access to the platforms. At T5 the station is reached by lift from Arrivals."
  },
  "tickets": {
   "pt": "Passe o cartão contactless ou Oyster nas barreiras, ou compre bilhetes simples e Travelcards nas máquinas da estação. Todas as estações de Heathrow ficam na Zona 6.",
   "en": "Tap a contactless card or Oyster at the gates, or buy single tickets and Travelcards at the station machines. All Heathrow stations are in Zone 6."
  }
 },
 "lhr-hex": {
  "sources": [
   "https://www.heathrow.com/transport-and-directions/by-rail-or-train/heathrow-express",
   "https://www.heathrowexpress.com/onboard/accessibility",
   "https://www.heathrow.com/at-the-airport/assistance-and-accessibility/accessible-travel"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "O Heathrow Express para nos Terminais 2 e 3 (estação entre os terminais) e no Terminal 5 (por baixo do terminal). No T4, apanhe o comboio de ligação gratuito até aos T2 e 3.",
   "en": "Heathrow Express stops at Terminals 2 & 3 (station between the terminals) and Terminal 5 (below the terminal). From T4, take the free transfer train to T2 & 3."
  },
  "lift": {
   "pt": "T2/T3: o pessoal da estação leva-o a um elevador até ao piso da bilheteira; outros elevadores sobem ao rés-do-chão. T5: chega-se à estação de elevador a partir das Chegadas.",
   "en": "T2/T3: station staff can take you to a lift up to the ticket office level; more lifts go up to ground level. T5: the station is reached by lift from Arrivals."
  },
  "luggage": {
   "pt": "A entrada no comboio é ao nível da plataforma e há grandes porta-bagagens junto às portas: entre com a mala de rodas.",
   "en": "Boarding is level with the platform and there are large luggage racks by the doors: roll your case straight on."
  },
  "tickets": {
   "pt": "Compre antes de embarcar: app Heathrow Express, online ou nas chegadas de qualquer terminal, ou passe contactless ou Oyster à entrada e à saída. Menores de 16 anos viajam grátis em Standard.",
   "en": "Buy before boarding: Heathrow Express app, online or in arrivals at any terminal, or tap in and out with contactless or Oyster. Under-16s travel free in Standard."
  }
 },
 "lgw-thl": {
  "sources": [
   "https://www.gatwickairport.com/to-and-from/rail/",
   "https://www.gwr.com/stations-and-destinations/stations/gatwick-airport",
   "https://www.gatwickexpress.com/travel-information/gatwick-airport"
  ],
  "checked": "2026-10",
  "walkMin": 5,
  "fromBaggage": {
   "pt": "A estação fica no Terminal Sul, a cerca de 5 minutos a pé das chegadas. No Terminal Norte, siga as indicações do shuttle gratuito para o Terminal Sul (cerca de 2 min).",
   "en": "The station is at the South Terminal, about 5 minutes' walk from arrivals. At the North Terminal, follow the signs for the free shuttle to the South Terminal (about 2 min)."
  },
  "lift": {
   "pt": "A estação tem acesso sem degraus a todas as plataformas. O percurso a partir do terminal tem elevadores e escadas rolantes.",
   "en": "The station has step-free access to all platforms. The route from the terminal has lifts and escalators."
  },
  "luggage": {
   "pt": "Os carrinhos do aeroporto não são permitidos nas plataformas da estação: deixe-o no terminal antes de descer.",
   "en": "Airport trolleys are not allowed on the station platforms: leave yours in the terminal before going down."
  },
  "tickets": {
   "pt": "Passe o cartão contactless ou Oyster nas barreiras (válido só para Londres). Há máquinas na estação e a bilheteira no átrio está aberta 24 horas.",
   "en": "Tap a contactless card or Oyster at the barriers (valid to London only). Machines are in the station and the ticket office on the concourse is open 24 hours."
  }
 },
 "lgw-gex": {
  "sources": [
   "https://www.gatwickairport.com/to-and-from/rail/",
   "https://www.gwr.com/stations-and-destinations/stations/gatwick-airport",
   "https://www.gatwickexpress.com/travel-information/gatwick-airport"
  ],
  "checked": "2026-10",
  "walkMin": 5,
  "fromBaggage": {
   "pt": "A estação fica no Terminal Sul, a cerca de 5 minutos a pé das chegadas. No Terminal Norte, siga as indicações do shuttle gratuito para o Terminal Sul (cerca de 2 min).",
   "en": "The station is at the South Terminal, about 5 minutes' walk from arrivals. At the North Terminal, follow the signs for the free shuttle to the South Terminal (about 2 min)."
  },
  "lift": {
   "pt": "A estação tem acesso sem degraus a todas as plataformas. O percurso a partir do terminal tem elevadores e escadas rolantes.",
   "en": "The station has step-free access to all platforms. The route from the terminal has lifts and escalators."
  },
  "luggage": {
   "pt": "Deixe o carrinho do aeroporto no terminal: não é permitido nas plataformas. Os comboios Gatwick Express têm porta-bagagens.",
   "en": "Leave airport trolleys in the terminal: they are not allowed on the platforms. Gatwick Express trains have luggage racks."
  },
  "tickets": {
   "pt": "Passe o cartão contactless ou Oyster nas barreiras (válido só para Londres). Há máquinas na estação e a bilheteira no átrio está aberta 24 horas.",
   "en": "Tap a contactless card or Oyster at the barriers (valid to London only). Machines are in the station and the ticket office on the concourse is open 24 hours."
  }
 },
 "stn-sx": {
  "sources": [
   "https://stanstedairport.com/getting-to-and-from/stansted-airport-train-station",
   "https://www.stanstedexpress.com/travel-information/station-information/stansted-airport",
   "https://www.stanstedexpress.com/tickets-fares/pay-as-you-go-contactless"
  ],
  "checked": "2026-10",
  "walkMin": 2,
  "fromBaggage": {
   "pt": "A estação fica mesmo por baixo do terminal, a cerca de 2 minutos a pé da sala de chegadas. Siga as placas suspensas.",
   "en": "The station is directly beneath the terminal, about 2 minutes' walk from the arrivals hall. Follow the overhead signs."
  },
  "lift": {
   "pt": "Elevadores, escadas rolantes e rampas ligam todas as plataformas ao terminal: a estação não tem degraus.",
   "en": "Lifts, escalators and ramps link all platforms to the terminal: the station is step-free throughout."
  },
  "tickets": {
   "pt": "Passe o cartão contactless ou telemóvel à entrada e o mesmo à saída (Oyster não é válido). Ou compre online, nas máquinas ou no balcão de informação ferroviária.",
   "en": "Tap in at the gates with a contactless card or phone and tap out with the same one (Oyster not valid). Or buy online, at the machines or the staffed rail desk."
  },
  "platforms": {
   "pt": "A estação tem três plataformas. Confirme nos ecrãs de partidas qual é a do seu Stansted Express.",
   "en": "The station has three platforms. Check the departure screens for your Stansted Express."
  }
 },
 "ltn-lae": {
  "sources": [
   "https://www.london-luton.co.uk/to-and-from-lla/luton-airport-express",
   "https://www.lutondart.com/llms.txt",
   "https://lutondart.com/dart-to-departure"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "O vaivém DART para mesmo à frente do terminal e demora cerca de 4 minutos até Luton Airport Parkway. Funciona 24 h. Não vá a pé: são cerca de 30 min com subida íngreme.",
   "en": "The DART shuttle stops right at the front of the terminal and takes about 4 minutes to Luton Airport Parkway. It runs 24/7. Don't walk: it's about 30 min uphill."
  },
  "luggage": {
   "pt": "No Luton Airport Express: até três volumes (dois grandes e um pequeno). As malas ficam nos vestíbulos e as malas pequenas nas prateleiras de cima.",
   "en": "On the Luton Airport Express: up to three items (two large, one small). Suitcases go in the vestibule areas, small bags in the overhead racks."
  },
  "tickets": {
   "pt": "Compre o bilhete de comboio para 'Luton Airport' (não Parkway): o DART está incluído. As barreiras do DART aceitam contactless; Oyster não é aceite.",
   "en": "Buy your train ticket to 'Luton Airport' (not Parkway): the DART is included. DART barriers also accept contactless; Oyster is not accepted."
  }
 },
 "lcy-dlr": {
  "sources": [
   "https://www.accessable.co.uk/london-borough-of-newham/london-borough-of-newham/access-guides/london-city-airport-dlr-station",
   "https://tfl.gov.uk/dlr/stop/940GZZDLLCA/london-city-airport-dlr-station?lineId=dlr",
   "https://blog.tfl.gov.uk/2022/12/22/digital-colour-standard/"
  ],
  "checked": "2026-10",
  "walkMin": 1,
  "fromBaggage": {
   "pt": "A entrada do DLR fica logo em frente quando sai pela entrada do aeroporto; a bilheteira fica a cerca de 25 m. Acesso plano, sem portas.",
   "en": "The DLR entrance is straight ahead as you leave the airport entrance; the ticket office is about 25 m away. Level access, no doors."
  },
  "follow": {
   "pt": "O DLR aparece a azul-turquesa nas placas e nos mapas.",
   "en": "The DLR is shown in turquoise on signs and maps.",
   "label": "DLR",
   "color": "#00afad"
  },
  "lift": {
   "pt": "Um elevador no centro do átrio da bilheteira vai às duas plataformas. As escadas rolantes ficam em frente ao elevador.",
   "en": "A lift in the centre of the ticket concourse goes to both platforms. The escalators are opposite the lift."
  },
  "tickets": {
   "pt": "Não há barreiras: passe o cartão contactless ou Oyster no leitor antes de embarcar. Há máquinas de bilhetes e uma bilheteira com pessoal no átrio.",
   "en": "There are no ticket barriers: touch your contactless card or Oyster on the reader before boarding. Ticket machines and a staffed ticket office are on the concourse."
  },
  "platforms": {
   "pt": "Duas plataformas: os comboios para Bank partem da plataforma 2. A plataforma 1 vai para Woolwich Arsenal.",
   "en": "Two platforms: trains to Bank leave from platform 2. Platform 1 goes to Woolwich Arsenal."
  }
 },
 "stp-tube": {
  "sources": [
   "https://tfl.gov.uk/info-for/media/press-releases/2010/september/kings-cross-st-pancras-tube-station-is-stepfree-with-10-new-lifts",
   "https://www.gwr.com/stations-and-destinations/stations/london-st-pancras-international"
  ],
  "checked": "2026-10",
  "lift": {
   "pt": "O metro de King's Cross St Pancras tem acesso sem degraus às seis linhas, com elevadores até às plataformas. A estação de St Pancras também tem elevadores no átrio principal.",
   "en": "King's Cross St Pancras Underground is step-free to all six lines, with lifts down to the platforms. St Pancras station also has lifts on its main concourse."
  },
  "tickets": {
   "pt": "Passe o cartão contactless ou Oyster nas barreiras do metro. Também há máquinas de bilhetes e uma bilheteira no átrio de St Pancras.",
   "en": "Tap a contactless card or Oyster at the Underground gates. Ticket machines and a ticket office are also on the St Pancras concourse."
  }
 },
 "rio-taxi": {
  "sources": [
   "https://tribunadosertao.com.br/rj-em-foco/2026/10/09/994303-guia-do-transporte-seguro-como-evitar-golpes-ao-sair-do-aeroporto-do-galeao-veja-oito-dicas"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Os balcões oficiais das cooperativas de táxi ficam nas áreas de desembarque doméstico e internacional. Nas saídas do terminal, siga as placas até aos pontos dos táxis credenciados.",
   "en": "Official taxi cooperative desks are in the domestic and international arrival areas. At the terminal exits, follow the signs to the accredited taxis' pick-up points."
  },
  "tickets": {
   "pt": "No balcão da cooperativa pode pagar antecipadamente uma tarifa fixa definida pela cidade (SMTR) e entregar o talão ao motorista. O taxímetro deve estar sempre ligado.",
   "en": "At the cooperative desk you can prepay a fixed fare set by the city (SMTR) and give the voucher to the driver. The meter must stay on anyway."
  }
 },
 "rio-brt": {
  "sources": [
   "https://www.fuiserviajante.com/rio-de-janeiro/brt-terminal-gentileza/index.html",
   "https://diariodorio.com/rio-de-janeiro/2026/09/14/rio-regulamenta-uso-de-cartoes-de-credito-e-debito-nos-transportes.html"
  ],
  "checked": "2026-10",
  "tickets": {
   "pt": "Pague na catraca com o cartão Jaé ou um código QR da app Jaé. Não aceita dinheiro. Em set. 2026 os cartões bancários contactless ainda estavam em teste (Terminal Gentileza).",
   "en": "Pay at the turnstile with a Jaé card or a QR code from the Jaé app. No cash. Contactless bank cards were only being trialled (at Terminal Gentileza) in Sept 2026."
  }
 },
 "ber-fex": {
  "sources": [
   "https://ber.berlin-airport.de/de/orientierung/anreiseundabreise/oeffentlicheverkehrsmittel.html",
   "https://ber.berlin-airport.de/de/ausgewaehlt/barrierefreies-reisen.html"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A estação fica no piso U2, mesmo por baixo do Terminal 1. No Terminal 2, vá ao piso de chegadas E0 e siga as placas para o Terminal 1.",
   "en": "The station is on level U2, directly under Terminal 1. From Terminal 2, go to arrivals level E0 and follow the signs to Terminal 1."
  },
  "lift": {
   "pt": "Os elevadores vão diretamente das plataformas às chegadas (piso E0) e partidas (piso E1) do Terminal 1. A estação não tem degraus.",
   "en": "Lifts go straight from the platforms to Terminal 1 arrivals (level E0) and departures (level E1). The station is step-free."
  },
  "tickets": {
   "pt": "Precisa de um bilhete ABC (o aeroporto fica na zona C). Compre nas máquinas dos terminais e da estação ou nas apps VBB, BVG ou S-Bahn. Valide o bilhete de papel antes de embarcar.",
   "en": "You need an ABC ticket (the airport is in zone C). Buy at the machines in the terminals and station or in the VBB, BVG or S-Bahn app. Validate paper tickets before boarding."
  }
 },
 "sin-mrt": {
  "sources": [
   "https://www.changiairport.com/en/airport-guide/transport/leaving-the-airport.html",
   "https://landtransportguru.net/changi-airport-station/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A estação de MRT de Changi fica entre os Terminais 2 e 3, com uma saída para cada um. No T1 apanhe o Skytrain até ao T3; no T4 apanhe o autocarro de ligação até ao T2.",
   "en": "Changi Airport MRT station lies between Terminals 2 and 3, with an exit into each. From T1 take the Skytrain to T3; from T4 take the shuttle bus to T2."
  },
  "lift": {
   "pt": "As duas saídas da estação (para o T2 e para o T3) têm percursos sem barreiras com elevadores.",
   "en": "Both station exits (towards T2 and towards T3) have barrier-free routes with lifts."
  },
  "tickets": {
   "pt": "Passe um cartão contactless Visa, Mastercard ou NETS ou a carteira do telemóvel nas barreiras (cartões estrangeiros pagam uma taxa). Os cartões EZ-Link vendem-se na bilheteira da estação.",
   "en": "Tap a contactless Visa, Mastercard or NETS card or phone wallet at the gates (foreign cards pay an admin fee). EZ-Link cards are sold at the station ticket office."
  },
  "platforms": {
   "pt": "As barreiras ficam ao nível da plataforma. As duas plataformas vão para Tanah Merah: aí mude para a linha East-West sentido Tuas Link para o centro.",
   "en": "Fare gates are on the platform level. Both platforms run to Tanah Merah: change there to the East-West line towards Tuas Link for the city."
  }
 },
 "was-silver": {
  "sources": [
   "https://www.flydulles.com/metro",
   "https://www.wmata.com/rider-guide/silver-line-extension/Washington-Dulles-International-Airport.cfm"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Um túnel pedonal coberto com tapetes rolantes liga o piso de recolha de bagagem à estação de Metrorail. Siga as placas para o túnel.",
   "en": "An indoor pedestrian tunnel with moving walkways links the baggage claim level to the Metrorail station. Follow the signs to the tunnel."
  },
  "tickets": {
   "pt": "Passe nas barreiras um cartão de crédito ou débito contactless, ou um cartão SmarTrip ou o SmarTrip no telemóvel.",
   "en": "Tap a contactless credit or debit card, or a SmarTrip card or SmarTrip on your phone, at the faregate."
  },
  "platforms": {
   "pt": "Para DC, apanhe a linha Silver sentido Largo / New Carrollton. O outro sentido vai para Ashburn.",
   "en": "For DC, take Silver line trains towards Largo / New Carrollton. The other direction goes to Ashburn."
  }
 },
 "msy-202": {
  "sources": [
   "https://flymsy.com/public-transportation",
   "https://www.norta.com/Ride-With-Us/How-to-Pay"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Os autocarros partem do Piso 1 (Recolha de Bagagem), junto à Porta 2, Zonas B4 e B5.",
   "en": "Buses leave from Level 1 (Baggage Claim), outside Door 2, Zones B4 and B5."
  },
  "tickets": {
   "pt": "Pague com a app Le Pass (ou as apps Transit ou Token Transit), ou em dinheiro com o valor exato ao entrar.",
   "en": "Pay with the Le Pass app (or the Transit or Token Transit apps), or with exact cash when you board."
  }
 },
 "add-taxi": {
  "sources": [
   "https://www.ethiopianairlines.com/za/services/services-at-the-airport/arrival-services-at-addis-ababa"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Há Wi-Fi gratuito no terminal e um balcão da Ethio Telecom vende cartões SIM locais, para reservar na app. Os táxis oficiais são amarelo-creme; a Uber não opera na Etiópia.",
   "en": "Free Wi-Fi covers the terminal and an Ethio Telecom counter sells local SIMs, so you can book a ride app. Official taxis are yellow-cream; Uber doesn't operate here."
  },
  "tickets": {
   "pt": "Os balcões de câmbio e as caixas multibanco na zona de chegadas / recolha de bagagem permitem obter birr etíope antes da viagem.",
   "en": "Bank exchange counters and ATMs in the arrivals / baggage claim area let you get Ethiopian birr before your ride."
  }
 },
 "par-rerb": {
  "sources": [
   "https://www.bonjour-ratp.fr/en/aeroports/roissy-charles-de-gaulle/acces/rer/",
   "https://www.bonjour-ratp.fr/en/aeroports/roissy-charles-de-gaulle/acces/cdgval/",
   "https://www.iledefrance-mobilites.fr/en/acceder-aux-aeroports-franciliens-",
   "https://www.ratp.fr/en/titres-et-tarifs/paris-aeroport",
   "https://www.iledefrance-mobilites.fr/en/actualites/fin-roissy-bus"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "T2C–2F: cerca de 10 min a pé até à estação RER (2A/2B: 15 min; 2G: apanhe primeiro o vaivém gratuito N2 até ao 2F). T1: vaivém gratuito CDGVAL até à estação RER (cerca de 10 min).",
   "en": "T2C–2F: about 10 min on foot to the RER station (2A/2B: 15 min; 2G: free N2 shuttle to 2F first). T1: free CDGVAL shuttle to the RER station (about 10 min)."
  },
  "follow": {
   "pt": "No terminal, a sinalética indica o caminho para a paragem CDGVAL mais próxima e para as plataformas do RER B.",
   "en": "Inside the terminal, signs show the way to the nearest CDGVAL stop and to the RER B platforms.",
   "label": "RER B"
  },
  "tickets": {
   "pt": "Compre o bilhete digital 'Paris Région <> Aéroports' na máquina ou bilheteira da estação, ou na app IDF Mobilités (num cartão Navigo Easy ou no telemóvel). Navigo Semaine/Liberté+ ou Paris Visite: basta validar.",
   "en": "Buy the digital 'Paris Région <> Aéroports' ticket at a station machine or desk, or in the IDF Mobilités app (on a Navigo Easy card or phone). Navigo Week/Liberté+ or Paris Visite: just validate."
  },
  "platforms": {
   "pt": "Todos os comboios RER B que saem das estações do aeroporto vão para Paris (Gare du Nord, Châtelet-Les Halles, Saint-Michel). CDG 2 é o fim da linha.",
   "en": "Every RER B train leaving the airport stations goes to Paris (Gare du Nord, Châtelet-Les Halles, Saint-Michel). CDG 2 is the end of the line."
  }
 },
 "par-m14": {
  "sources": [
   "https://www.iledefrance-mobilites.fr/en/acceder-aux-aeroports-franciliens-",
   "https://www.ratp.fr/en/titres-et-tarifs/paris-aeroport",
   "https://www.bonjour-ratp.fr/en/aeroports/orly/acces/metro/",
   "https://www.ratp.fr/en/services/etat-equipement/metro/14",
   "https://en.wikipedia.org/wiki/A%C3%A9roport_d%27Orly_station"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A estação da linha 14 fica em frente ao edifício Orly 3, entre Orly 1-2 e Orly 4. Tem uma saída junto a Orly 1-2-3 e outra junto a Orly 4.",
   "en": "The line 14 station is in front of the Orly 3 building, between Orly 1-2 and Orly 4. It has one exit near Orly 1-2-3 and another near Orly 4."
  },
  "lift": {
   "pt": "A estação é acessível sem degraus, com elevadores. A RATP mostra o estado dos elevadores da linha 14 em ratp.fr.",
   "en": "The station is step-free with lifts. RATP shows live lift status for line 14 on ratp.fr."
  },
  "tickets": {
   "pt": "Compre o bilhete digital 'Paris Région <> Aéroports' na máquina ou bilheteira da estação, ou na app IDF Mobilités (no Navigo Easy ou telemóvel). Inclui ligações metro/RER, não autocarro nem elétrico.",
   "en": "Buy the digital 'Paris Région <> Aéroports' ticket at a station machine or desk, or in the IDF Mobilités app (on Navigo Easy or phone). It covers metro/RER changes, not buses or trams."
  },
  "platforms": {
   "pt": "Orly é o fim da linha 14, por isso todos os comboios seguem para Paris (Gare de Lyon, Châtelet, Madeleine).",
   "en": "Orly is the end of line 14, so every train goes towards Paris (Gare de Lyon, Châtelet, Madeleine)."
  }
 },
 "par-gdn-metro": {
  "sources": [
   "https://eurostar.com/uk-en/travel-info/stations/paris-gare-du-nord",
   "https://www.iledefrance-mobilites.fr/en/actualites/simplification-tarifs-transports-ile-de-france"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Saia da plataforma do Eurostar e siga até ao átrio principal, à frente do comboio; depois siga as indicações 'Métro' e desça pelas escadas rolantes.",
   "en": "Leave the Eurostar platform and walk to the main concourse at the front of the train, then follow the Métro signs down the escalators."
  },
  "tickets": {
   "pt": "O bilhete Eurostar não inclui o metro. Compre um bilhete 'Métro-Train-RER' na bilheteira, na máquina ou na app IDF Mobilités, e guarde-o até ao fim da viagem.",
   "en": "Your Eurostar ticket doesn't cover the Métro. Buy a 'Métro-Train-RER' ticket at a desk, machine or in the IDF Mobilités app, and keep it until the end of your trip."
  },
  "platforms": {
   "pt": "A Gare du Nord é servida pelas linhas de metro 4 e 5 e pelas linhas RER B, D e E.",
   "en": "Gare du Nord is served by Métro lines 4 and 5 and RER lines B, D and E."
  }
 },
 "ams-ns": {
  "sources": [
   "https://www.schiphol.nl/en/from-to-schiphol/by-public-transport/train/",
   "https://www.schiphol.nl/en/blog/can-i-quickly-get-from-schiphol-to-amsterdam-by-train/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Depois da recolha de bagagem, siga as indicações para a estação de comboios. Fica mesmo por baixo da Schiphol Plaza: desça de escadas, escada rolante ou elevador até à plataforma.",
   "en": "After the baggage hall, follow the signs to the train station. It's directly below Schiphol Plaza: take the stairs, escalator or lift down to the platform."
  },
  "lift": {
   "pt": "Há elevadores da Schiphol Plaza para as plataformas, e os comboios têm entrada ao nível, por isso entra com a bagagem sem degraus.",
   "en": "Lifts go down from Schiphol Plaza to the platforms, and trains have a level entrance, so you can board with luggage without steps."
  },
  "tickets": {
   "pt": "Passe o cartão contactless ou o telemóvel nos leitores amarelos no topo das escadas rolantes e elevadores da Schiphol Plaza; volte a passar à saída em Amesterdão. Máquinas de bilhetes junto à plataforma 1.",
   "en": "Tap a contactless card or phone on the yellow card readers at the top of the escalators and lifts in Schiphol Plaza; tap out in Amsterdam. Ticket machines are near platform 1."
  },
  "platforms": {
   "pt": "Os comboios para Amsterdam Centraal (via Sloterdijk) partem da plataforma 3; confirme nos ecrãs da Schiphol Plaza.",
   "en": "Trains to Amsterdam Centraal (via Sloterdijk) leave from platform 3; check the monitors in Schiphol Plaza to confirm."
  }
 },
 "ams-cs-tram": {
  "sources": [
   "https://www.iamsterdam.com/en/travel-stay/getting-around/tram",
   "https://www.iamsterdam.com/en/travel-stay/getting-around/public-transport/pay-for-public-transport"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Os elétricos partem de duas paragens em frente à Centraal, uma do lado nascente e outra do lado poente, a poucos passos uma da outra.",
   "en": "Trams leave from two tram stops in front of Centraal, one on the east side and one on the west side, a short walk apart."
  },
  "tickets": {
   "pt": "Passe o cartão contactless ou o telemóvel (OVpay) ao entrar e volte a passar ao sair. A GVB aplica um limite diário ao que paga com cartão.",
   "en": "Tap a contactless debit/credit card or phone (OVpay) when you board and tap out when you get off. GVB caps card fares per day."
  }
 },
 "liv-bus": {
  "sources": [
   "https://www.arrivabus.co.uk/airport-services/liverpool-john-lennon",
   "https://prod.liverpoolairport.com/transport/bus/",
   "https://www.merseytravel.gov.uk/customer-information/liverpool-john-lennon-airport/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "As paragens de autocarro ficam mesmo à saída do terminal, junto à entrada e saída principal.",
   "en": "Bus stops are right outside the terminal building, close to the main entrance and exit."
  },
  "follow": {
   "pt": "Para o centro: autocarro 500 (Liverpool ONE e Great Charlotte St, para Lime Street) ou 86A (via South Parkway até Liverpool ONE). A linha é a 86A, não a 86.",
   "en": "To the centre: bus 500 (Liverpool ONE, then Great Charlotte St for Lime Street) or 86A (via South Parkway to Liverpool ONE). The route is 86A, not 86.",
   "label": "Autocarro 86 / 500"
  },
  "tickets": {
   "pt": "Ao entrar, passe o cartão contactless, Apple Pay ou Google Pay (Tap & Go), ou compre o bilhete na app ou no site da Arriva.",
   "en": "Tap on as you board with a contactless card, Apple Pay or Google Pay (Tap & Go), or buy a ticket in the Arriva app or website."
  }
 },
 "liv-lime-walk": {
  "sources": [
   "https://albertdock.com/how-to-find-us/"
  ],
  "checked": "2026-10",
  "walkMin": 20,
  "follow": {
   "pt": "Atravesse o centro pela Church Street e pelo Liverpool ONE até ao Royal Albert Dock (cerca de 15–20 min).",
   "en": "Walk through the city centre via Church Street and Liverpool ONE to the Royal Albert Dock (about 15–20 min).",
   "label": "A pé"
  }
 },
 "dxb-metro": {
  "sources": [
   "https://dubaiairports.ae/transport/metro"
  ],
  "checked": "2026-10",
  "luggage": {
   "pt": "Pode levar no metro até duas peças de bagagem, incluindo a bagagem de mão.",
   "en": "You may take up to two pieces of luggage on the Metro, including hand luggage."
  },
  "tickets": {
   "pt": "Compre um cartão Nol ou passe da linha Vermelha nas bilheteiras ou máquinas automáticas dos Terminais 1 e 3.",
   "en": "Buy a Nol card or Red Line pass at the ticket offices or vending machines in Terminals 1 and 3."
  },
  "platforms": {
   "pt": "A linha Vermelha serve os Terminais 1 e 3 do DXB.",
   "en": "The Red Line serves DXB Terminals 1 and 3."
  }
 },
 "sfo-bart": {
  "sources": [
   "https://www.bart.gov/guide/airport/sfo",
   "https://en.wikipedia.org/wiki/San_Francisco_International_Airport_station"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Chegadas internacionais: após a alfândega, suba de escada rolante às Partidas, siga em frente e vire à esquerda na exposição de arte até ao BART. Outros terminais: AirTrain gratuito.",
   "en": "International arrivals: after customs, take the escalator up to Departures, walk straight and turn left at the art exhibit to the BART entrance. Other terminals: free AirTrain."
  },
  "lift": {
   "pt": "Todas as estações BART têm elevadores e portões extra largos para bagagem grande.",
   "en": "All BART stations have lifts and extra-wide fare gates for large luggage."
  },
  "luggage": {
   "pt": "Leve a bagagem debaixo do banco ou ao colo. Os espaços junto às portas são prioritários para cadeiras de rodas e a mala tem de ficar consigo.",
   "en": "Keep luggage under your seat or on your lap. The spaces by the doors are for wheelchairs first, and your bag must stay with you."
  },
  "tickets": {
   "pt": "Passe o cartão contactless, Apple Pay ou Google Pay (ou Clipper na carteira do telemóvel) nos portões e use o mesmo à saída. Um cartão ou dispositivo por pessoa a partir dos 5 anos. Sem bilhetes de papel.",
   "en": "Tap a contactless card, Apple Pay or Google Pay (or Clipper in your phone wallet) at the gates, and use the same one to exit. One card or device per rider aged 5+. No paper tickets."
  },
  "platforms": {
   "pt": "SFO é o fim da linha. Apanhe um comboio da linha Amarela (San Francisco/Antioch) ou Vermelha (San Francisco/Richmond); a Vermelha só circula até cerca das 21h.",
   "en": "SFO is the end of the line. Take a Yellow Line (San Francisco/Antioch) or Red Line (San Francisco/Richmond) train; the Red Line runs only until about 9 pm."
  }
 },
 "mco-lynx": {
  "sources": [
   "https://flymco.com/ground-transportation/local-bus/",
   "https://www.golynx.com/core/fileparse.php/97362/urlt/WEB_OIA_JAN_2026.pdf"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Os autocarros LYNX param no lado A do terminal, no piso de Transportes Terrestres (Piso 1), nos lugares A38–A41 da Commercial Lane.",
   "en": "LYNX buses stop on the A side of the terminal, on the Ground Transportation Level (Level 1), at Commercial Lane spaces A38–A41."
  },
  "tickets": {
   "pt": "Pague ao entrar: só o valor exato, não há troco. Também pode pagar com a app LYNX PawPass.",
   "en": "Pay as you board: exact fare only, no change given. You can also pay with the LYNX PawPass app."
  }
 },
 "nbo-taxi": {
  "sources": [
   "https://www.kaa.go.ke/getting-here/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Os motoristas com reserva não podem entrar no terminal; esperam no exterior do átrio das chegadas.",
   "en": "Pre-booked drivers aren't allowed inside the terminal; they wait outside the arrivals hall."
  },
  "follow": {
   "pt": "Use táxis licenciados pela KAA nas praças designadas ou nos balcões das chegadas. Nem todos são amarelos. Ignore ofertas de transporte dentro do terminal: é ilegal angariar passageiros.",
   "en": "Use KAA-licensed taxis at the designated ranks or their desks in arrivals. Not all licensed taxis are yellow. Ignore ride offers inside the terminal: touting is illegal.",
   "label": "Táxi oficial / Uber · Bolt"
  },
  "tickets": {
   "pt": "Combine o preço antes de partir e peça recibo. O preço é por viatura, não por pessoa.",
   "en": "Agree the fare before you leave and ask for a receipt. Fares are per vehicle, not per person."
  }
 },
 "lis-metro": {
  "sources": [
   "https://www.metrolisboa.pt/viajar/aeroporto/",
   "https://www.metrolisboa.pt/comprar/viajar-no-metro-com-cartao-bancario-contactless/",
   "https://www.metrolisboa.pt/en/buy/viva-viagem-card/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A estação de metro Aeroporto fica junto ao edifício do aeroporto, na zona das Chegadas. É o fim da linha Vermelha: todos os comboios seguem para a cidade.",
   "en": "The Aeroporto metro station is right next to the airport building, in the Arrivals area. It is the end of the Red line, so every train goes towards the city."
  },
  "lift": {
   "pt": "A estação tem elevadores da rua para o átrio e do átrio para o cais, além de escadas rolantes. Procure o pictograma do elevador se levar malas pesadas.",
   "en": "The station has lifts from street to concourse and from concourse to platform, plus escalators. Look for the lift pictogram if you have heavy bags."
  },
  "tickets": {
   "pt": "Há máquinas de bilhetes na estação. Mais simples: encoste um cartão contactless Visa ou Mastercard à entrada E à saída, sempre o mesmo cartão. Ou compre o cartão navegante ocasional e carregue uma viagem.",
   "en": "Ticket machines are in the station. Easiest: tap a contactless Visa or Mastercard on the gate when you enter AND when you exit, using the same card. Or buy a navegante occasional card and load a trip."
  }
 },
 "lis-aerobus": {
  "sources": [
   "https://www.metrolisboa.pt/viajar/aeroporto/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "As linhas 1 e 2 do Aerobus param junto à estação de metro Aeroporto, ao lado da zona das Chegadas.",
   "en": "Aerobus lines 1 and 2 stop by the Aeroporto metro station, next to the Arrivals area."
  }
 },
 "lis-ori-metro": {
  "sources": [
   "https://www.metrolisboa.pt/viajar/oriente/",
   "https://www.metrolisboa.pt/comprar/viajar-no-metro-com-cartao-bancario-contactless/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A estação de metro Oriente fica na Avenida de Berlim, junto à Gare do Oriente. Siga as indicações do metro.",
   "en": "The Oriente metro station is on Avenida de Berlim, beside the Gare do Oriente train station. Follow the metro signs."
  },
  "lift": {
   "pt": "A estação tem elevadores da rua para o átrio e do átrio para o cais, além de escadas rolantes.",
   "en": "The station has lifts from street to concourse and from concourse to platform, plus escalators."
  },
  "tickets": {
   "pt": "Use as máquinas de bilhetes ou a bilheteira. Ou encoste um cartão contactless Visa ou Mastercard à entrada E à saída, sempre o mesmo cartão.",
   "en": "Use the ticket machines or ticket office. Or tap a contactless Visa or Mastercard on the gate when you enter AND when you exit, using the same card."
  }
 },
 "edi-tram": {
  "sources": [
   "https://www.edinburghairport.com/transport-links/trams",
   "https://edinburghtrams.com/stop/edinburgh-airport",
   "https://edinburghtrams.com/tickets/",
   "https://edinburghtrams.com/news/take-tram-edinburgh-airport"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A paragem do elétrico fica mesmo à saída do terminal, na praça junto ao grande letreiro Edinburgh. Um passadiço coberto liga o terminal à praça do elétrico.",
   "en": "The tram stop is right outside the terminal, on the plaza by the big Edinburgh sign. A covered walkway links the terminal to the tram plaza."
  },
  "luggage": {
   "pt": "Os elétricos têm piso rebaixado, entrada ao nível do cais e muito espaço para malas: entra com a mala de rodinhas sem degraus.",
   "en": "Trams are low-floor with level boarding and plenty of room for bags, so you can roll your suitcase straight on."
  },
  "tickets": {
   "pt": "Compre antes de entrar: as máquinas no cais aceitam cartão ou moedas, ou compre na app e ative o bilhete. Precisa de bilhete Airport; os bilhetes City não servem. Sem bilhete paga multa a bordo.",
   "en": "Buy before boarding: platform machines take card or coins, or buy in the app and activate it. You need an Airport ticket; City tickets are not valid. No ticket on board means a penalty fare."
  },
  "platforms": {
   "pt": "O aeroporto é o fim da linha: todos os elétricos vão para o centro (Haymarket, Princes Street, St Andrew Square), cerca de 30 minutos.",
   "en": "The airport is the end of the line: every tram goes to the city centre (Haymarket, Princes Street, St Andrew Square), about 30 minutes."
  }
 },
 "edi-airlink": {
  "sources": [
   "https://edinburghairport.com/transport-links/buses-and-coaches/edinburgh-city-bus-links",
   "https://www.lothianbuses.com/news/2024/06/airlink-100-moving-to-waverley-bridge/",
   "https://www.lothianbuses.com/?p=4069"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "O Airlink 100 parte da paragem A (Stop A), junto à praça à saída do terminal.",
   "en": "Airlink 100 leaves from Stop A, next to the plaza outside the terminal."
  },
  "tickets": {
   "pt": "Ao entrar, encoste um cartão bancário contactless ou o telemóvel (Apple Pay / Google Pay).",
   "en": "Tap a contactless bank card or your phone (Apple Pay / Google Pay) when you board."
  },
  "platforms": {
   "pt": "Os autocarros passam pelo menos a cada 10 minutos durante quase todo o dia e demoram cerca de 30 minutos até Waverley Bridge, junto à estação.",
   "en": "Buses run at least every 10 minutes for most of the day and take about 30 minutes to Waverley Bridge, by the main station."
  }
 },
 "edi-wav-walk": {
  "sources": [
   "https://www.accessable.co.uk/network-rail-scotland/edinburgh-waverley/access-guides/edinburgh-waverley-station-entrances",
   "https://www.networkrailmediacentre.co.uk/news/new-princes-street-access-gives-waverley-a-lift"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Da ponte pedonal sobre as linhas, saia por Princes Street (Waverley Steps, com escadas rolantes) para a New Town, ou por Market Street para a Old Town e a Royal Mile.",
   "en": "From the overbridge above the platforms, take the Princes Street exit (Waverley Steps with escalators) for the New Town, or the Market Street exit for the Old Town and Royal Mile."
  },
  "lift": {
   "pt": "Princes Street: dois elevadores à direita da entrada dos Waverley Steps. Market Street: elevador público entre a ponte pedonal e a rua.",
   "en": "Princes Street: two lifts to the right of the Waverley Steps entrance. Market Street: a public lift between the footbridge and street level."
  },
  "luggage": {
   "pt": "Evite a rampa de Waverley Bridge: tem cerca de 100 m, é íngreme e serve apenas para entrar.",
   "en": "Avoid the Waverley Bridge ramp: it is about 100 m long, steep and entry-only."
  },
  "escalator": {
   "pt": "As escadas rolantes sobem e descem entre Princes Street e a ponte pedonal. Com malas pesadas, use os elevadores ao lado.",
   "en": "Escalators run both up and down between Princes Street and the overbridge. With heavy bags, use the lifts beside them."
  }
 },
 "bir-train": {
  "sources": [
   "https://www.birminghamairport.co.uk/transport-links/by-train/",
   "https://www.birminghamairport.co.uk/customer-support/directions-and-transport-faqs/",
   "https://www.westmidlandsrailway.co.uk/travel-information/station-information/bhi"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "O Air-Rail Link gratuito chega ao primeiro andar do aeroporto e liga ao primeiro andar da estação Birmingham International (cerca de 2 min). Funciona diariamente das 03:30 às 00:30.",
   "en": "The free Air-Rail Link arrives on the first floor of the airport and runs to the first floor of Birmingham International station (about 2 min). It runs daily 03:30 to 00:30."
  },
  "lift": {
   "pt": "A estação Birmingham International tem acesso sem degraus a todos os cais.",
   "en": "Birmingham International has step-free access to all platforms."
  },
  "tickets": {
   "pt": "As máquinas de bilhetes ficam no átrio principal; a bilheteira abre de manhã cedo até às 21:00. Compre antes de entrar no comboio.",
   "en": "Ticket machines are in the main booking hall; the ticket office opens early morning to 21:00. Buy before you board."
  },
  "platforms": {
   "pt": "Há 2 a 4 comboios diretos por hora para Birmingham New Street; a viagem demora cerca de 10 minutos.",
   "en": "Direct trains to Birmingham New Street run 2 to 4 times an hour and take about 10 minutes."
  }
 },
 "bir-ns-walk": {
  "sources": [
   "https://www.networkrail.co.uk/communities/passengers/our-stations/birmingham-new-street/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A estação fica por baixo do centro comercial Grand Central. Saia pelo lado de Stephenson Street, onde há um posto de informação junto à entrada.",
   "en": "The station sits under the Grand Central shopping centre. Exit on the Stephenson Street side, where the travel information office is by the entrance."
  },
  "lift": {
   "pt": "A estação tem 18 elevadores, incluindo elevadores para os cais e um para o Grand Central.",
   "en": "The station has 18 lifts, including platform lifts and a lift up to Grand Central."
  },
  "luggage": {
   "pt": "Nas barreiras de bilhetes, use as portas largas para passageiros com bagagem.",
   "en": "At the ticket barriers, use the wide gates for passengers with luggage."
  }
 },
 "nyc-airtrain": {
  "sources": [
   "https://www.jfkairport.com/transportation/airtrain",
   "https://www.mta.info/guides/airports/jfk/jfk-airport-to-nyc"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Apanhe o AirTrain no seu terminal em direção a Jamaica. Passa a cada 5 a 15 minutos; veja os monitores da estação.",
   "en": "Take the AirTrain from your terminal towards Jamaica. Trains run about every 5 to 15 minutes; check the station monitors."
  },
  "follow": {
   "pt": "Em Jamaica, siga as indicações do AirTrain para o metro (subway) e desça um piso por elevador, escada rolante ou escadas até ao comboio para Manhattan.",
   "en": "At Jamaica, follow the signs from the AirTrain to the subway, then go down one level by lift, escalator or stairs to the Manhattan-bound train.",
   "label": "AirTrain + metro E"
  },
  "lift": {
   "pt": "Todas as estações e comboios do AirTrain têm elevadores e acesso sem degraus, tal como a ligação ao metro em Jamaica.",
   "en": "All AirTrain stations and trains have lifts and are step-free, and so is the subway connection at Jamaica."
  },
  "luggage": {
   "pt": "Malas, carrinhos de bagagem e carrinhos de bebé são permitidos no AirTrain.",
   "en": "Luggage, luggage carts and strollers are allowed on the AirTrain."
  },
  "tickets": {
   "pt": "Paga o AirTrain à saída em Jamaica: encoste um cartão contactless, o telemóvel ou um cartão OMNY. Depois volte a encostar no metro. As máquinas em Jamaica vendem cartões OMNY (dinheiro ou cartão).",
   "en": "You pay the AirTrain fare when you exit at Jamaica: tap a contactless card, phone or OMNY card. Then tap again at the subway. Machines at Jamaica sell OMNY cards for cash or card."
  },
  "platforms": {
   "pt": "Para Manhattan: World Trade Center (Downtown), 34 St-Penn Station (Midtown) ou 42 St-Port Authority (Times Square).",
   "en": "For Manhattan: World Trade Center (Downtown), 34 St-Penn Station (Midtown) or 42 St-Port Authority (Times Square)."
  }
 },
 "nyc-lirr": {
  "sources": [
   "https://www.mta.info/guides/airports/jfk/jfk-airport-to-nyc",
   "https://www.mta.info/fares/buy-railroad-tickets",
   "https://mta.info/fares/cityticket"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Apanhe o AirTrain até Jamaica, pague à saída (cartão contactless, telemóvel ou cartão OMNY) e siga as indicações para o LIRR.",
   "en": "Take the AirTrain to Jamaica, pay as you exit (contactless card, phone or OMNY card), then follow the signs to the LIRR."
  },
  "lift": {
   "pt": "A estação Jamaica e as estações ligadas a ela são todas acessíveis, com elevadores.",
   "en": "Jamaica Station and the stations it connects to are all accessible, with lifts."
  },
  "tickets": {
   "pt": "Compre antes de entrar: na app TrainTime, numa máquina (cartão; a maioria aceita dinheiro) ou na bilheteira. O CityTicket serve de Jamaica a Penn ou Grand Central. A bordo custa bem mais.",
   "en": "Buy before boarding: the TrainTime app, a station machine (card; most also take cash) or a ticket office. A CityTicket covers Jamaica to Penn or Grand Central. Buying on board costs much more."
  },
  "platforms": {
   "pt": "Apanhe um comboio para oeste (westbound): Penn Station (Midtown West), Grand Central (Midtown East) ou Atlantic Terminal (Brooklyn).",
   "en": "Take a westbound train: Penn Station (Midtown West), Grand Central (Midtown East) or Atlantic Terminal (Brooklyn)."
  }
 },
 "cpt-a01": {
  "sources": [
   "https://www.myciti.org.za/en/contact/media-releases/myciti-connects-you-to-the-airport/",
   "https://www.myciti.org.za/en/myconnect-fares/get-your-myconnect-card/",
   "https://www.myciti.org.za/en/discover-myciti/the-a-z-of-using-myciti/"
  ],
  "checked": "2026-10",
  "luggage": {
   "pt": "A entrada ao nível do cais facilita subir e descer com as malas.",
   "en": "Level boarding makes it easy to roll suitcases on and off the bus."
  },
  "tickets": {
   "pt": "Não precisa do cartão myconnect: compre um cartão de viagem única no quiosque da estação do aeroporto. Não se paga em dinheiro no autocarro. Valide à entrada e à saída.",
   "en": "You don't need a myconnect card: buy a single-trip card at the Airport station kiosk. No cash on the bus. Tap in when you board and tap out when you get off."
  },
  "platforms": {
   "pt": "O serviço do aeroporto passa cerca de 30 em 30 minutos, de e para a estação Civic Centre.",
   "en": "The airport service runs about every 30 minutes, to and from Civic Centre station."
  }
 },
 "cpt-taxi": {
  "sources": [
   "https://www.airports.co.za/airports/cape-town-international-airport/transport/public-transport",
   "https://www.uber.com/global/en/r/airports/cpt/pickup/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Uber/Bolt: siga as placas 'Parkade P1 Exit' passando o balcão de informações, entre no Parkade P1, vire na primeira à direita depois da escada rolante: E-hailing Pick Up Area (pilares C e D).",
   "en": "Uber/Bolt: follow the 'Parkade P1 Exit' signs past the Information Desk, enter Parkade P1, take the first right past the escalator to the E-hailing Pick Up Area (pillars C and D)."
  },
  "follow": {
   "pt": "Siga as placas 'Parkade P1 Exit' e depois a placa 'Parkade P1' à sua esquerda.",
   "en": "Follow the 'Parkade P1 Exit' signs, then the 'Parkade P1' sign on your left.",
   "label": "Parkade P1 Exit"
  },
  "tickets": {
   "pt": "Táxi: use só os táxis autorizados (Authorised Airport Taxis), nos quiosques de transporte ou no balcão das chegadas domésticas. Nunca aceite boleias de quem o aborda; Uber/Bolt só pela app.",
   "en": "Taxi: use only Authorised Airport Taxis, booked at the transport kiosks or the domestic arrivals desk. Never accept rides from drivers who approach you; book Uber/Bolt only in the app."
  }
 },
 "doh-metro": {
  "sources": [
   "https://dohahamadairport.com/airport-guide/to-from-the-airport/metro",
   "https://corp.qr.com.qa/English/Projects/Pages/RedLine.aspx"
  ],
  "checked": "2026-10",
  "lift": {
   "pt": "As estações de metro são acessíveis e climatizadas; os ecrãs mostram o serviço em tempo real e a hora do último comboio.",
   "en": "The metro stations are accessible and air-conditioned; screens show live service and last-train times."
  },
  "platforms": {
   "pt": "A estação do aeroporto (HIA T1) fica na linha Vermelha. Msheireb é a estação onde se cruzam as três linhas do metro.",
   "en": "The airport station (HIA T1) is on the Red Line. Msheireb is the interchange where all three metro lines meet."
  }
 },
 "chi-blue": {
  "sources": [
   "https://www.transitchicago.com/airports/",
   "https://www.flychicago.com/ohare/tofrom/publictransit/Pages/default.aspx",
   "https://www.transitchicago.com/-cta-chicago-department-of-aviation-partner-on-enhanced-signage-at-ohare/",
   "https://www.transitchicago.com/howto/pay-for-your-fare/",
   "https://www.transitchicago.com/station/ord/"
  ],
  "checked": "2026-10",
  "walkMin": 10,
  "fromBaggage": {
   "pt": "Da recolha de bagagem nos Terminais 1, 2 ou 3, siga pelos túneis pedonais no piso -1 até à estação (menos de 10 min). Do Terminal 5, apanhe primeiro o comboio ATS até ao Terminal 2.",
   "en": "From baggage claim in Terminals 1, 2 or 3, take the pedestrian tunnels on the basement level to the station (under 10 min). From Terminal 5, ride the ATS train to Terminal 2 first."
  },
  "follow": {
   "pt": "Siga as placas azuis suspensas 'Trains to City' / 'CTA Trains' com o ícone do comboio 'L'.",
   "en": "Follow the blue overhead 'Trains to City' / 'CTA Trains' signs with the 'L' train icon.",
   "label": "Trains to City",
   "color": "#00a1de"
  },
  "tickets": {
   "pt": "Encoste um cartão bancário contactless ou o telemóvel no torniquete, ou compre um cartão Ventra nas máquinas (dinheiro ou cartão).",
   "en": "Tap a contactless bank card or phone at the turnstile, or buy a Ventra card at the machines (cash or card)."
  },
  "platforms": {
   "pt": "O'Hare é o fim da linha: todos os comboios passam pelo centro em direção a Forest Park (ou UIC-Halsted a certas horas), cerca de 40-45 min até ao Loop.",
   "en": "O'Hare is the end of the line: every train goes through downtown towards Forest Park (or UIC-Halsted at some hours), about 40-45 min to the Loop."
  }
 },
 "yyz-up": {
  "sources": [
   "https://www.upexpress.com/en/discover-toronto-blog/guide-to-navigating-through-toronto-pearson-airport-arrivals",
   "https://www.upexpress.com/en/up-express-stations/pearson-station"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Terminal 1: suba ao piso 2 das chegadas, atravesse a rampa e as portas, e suba mais um piso. Atravesse o cais do Terminal Link até ao UP Express. Terminal 3: apanhe o Terminal Link (2 min) até ao T1.",
   "en": "Terminal 1: go up to level 2 of arrivals, cross the ramp, go through the doors, then up one more level. Walk across the Terminal Link platform to UP Express. Terminal 3: take the 2-min Terminal Link train to T1."
  },
  "follow": {
   "pt": "Siga as placas com o ícone de comboio e o texto 'Train to City'.",
   "en": "Follow the signs with a train icon reading 'Train to City'.",
   "label": "Train to City"
  },
  "lift": {
   "pt": "Há elevadores junto às escadas rolantes em cada mudança de piso. No Terminal 3, com muita bagagem, use os elevadores mais à frente no corredor das chegadas.",
   "en": "Lifts run next to the escalators at every level change. At Terminal 3, with lots of luggage, use the lifts further down the arrivals hall."
  },
  "luggage": {
   "pt": "Entrada ao nível do cais, com prateleiras e porta-bagagens a bordo.",
   "en": "Level boarding, with luggage racks and overhead storage on board."
  },
  "tickets": {
   "pt": "No cais, antes de entrar: use a máquina UP Express, ou encoste PRESTO, cartão de crédito/débito ou telemóvel nas máquinas azuis. Se encostar, valide também à saída. Menores de 12 não pagam.",
   "en": "On the platform, before boarding: use the UP Express machine, or tap PRESTO, a credit/debit card or phone on the blue machines. If you tap, tap off at the end. Under-12s ride free."
  },
  "platforms": {
   "pt": "O primeiro cais que encontra é o do Terminal Link; continue até ao cais do UP Express. O comboio chega a Union Station em cerca de 25 minutos.",
   "en": "The first platform you reach is the Terminal Link; keep walking to the UP Express platform. Trains reach Union Station in about 25 minutes."
  }
 },
 "mad-metro": {
  "sources": [
   "https://www.esmadrid.com/avion-madrid",
   "https://www.timeout.es/madrid/es/noticias/el-pago-con-tarjeta-de-credito-y-movil-llega-a-los-tornos-inteligentes-del-metro-esto-es-todo-lo-que-tienes-que-saber-050126",
   "https://en.wikipedia.org/wiki/Aeropuerto_T1-T2-T3_(Madrid_Metro)",
   "https://www.aena.es/doc/detalleprensa/medios-transporte-acceso-mad.pdf"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A linha 8 tem duas estações no aeroporto: 'Aeropuerto T1-T2-T3' (junto ao Terminal 2) e 'Aeropuerto T4'. Do T1 ou T3, caminhe até ao T2.",
   "en": "Line 8 has two airport stations: 'Aeropuerto T1-T2-T3' (next to Terminal 2) and 'Aeropuerto T4'. From T1 or T3, walk through to T2."
  },
  "tickets": {
   "pt": "Desde junho de 2026 pode passar um cartão bancário contactless, telemóvel ou relógio nos torniquetes. Ou compre na máquina: há um suplemento de aeroporto além do bilhete simples ou de 10 viagens.",
   "en": "Since June 2026 you can tap a contactless bank card, phone or watch at the turnstiles. Or buy at the machines: an airport supplement applies on top of a single or 10-trip ticket."
  },
  "platforms": {
   "pt": "A linha 8 vai só até Nuevos Ministerios (cerca de 12 min desde T1-T2-T3, menos de 20 min desde T4); qualquer metro que saia do aeroporto segue no sentido certo.",
   "en": "Line 8 runs only to Nuevos Ministerios (about 12 min from T1-T2-T3, under 20 min from T4), so any train leaving the airport goes the right way."
  }
 },
 "mad-bus": {
  "sources": [
   "https://diario.madrid.es/blog/notas-de-prensa/emt-madrid-pone-en-marcha-nuevos-totems-de-venta-de-billetes-en-la-linea-expres-aeropuerto/",
   "https://www.esmadrid.com/avion-madrid"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "As paragens do Exprés Aeropuerto ficam logo à saída dos terminais T1, T2 e T4. Funciona 24 horas.",
   "en": "The Exprés Aeropuerto stops are just outside the terminal exits at T1, T2 and T4. It runs 24 hours."
  },
  "tickets": {
   "pt": "Pague com cartão bancário a bordo, ou compre na máquina da EMT à saída do terminal (cartão ou moedas, não dá troco) e valide o QR a bordo.",
   "en": "Pay by bank card on board, or buy at the EMT ticket machine at the terminal exit (card or coins, no change given), then scan the QR on board."
  },
  "platforms": {
   "pt": "Paragens na cidade: O'Donnell, Cibeles e Atocha. Atocha é o fim entre cerca das 6h00 e as 23h30; à noite o autocarro termina em Cibeles.",
   "en": "City stops: O'Donnell, Cibeles and Atocha. Atocha is the end from about 6:00 to 23:30; at night the bus ends at Cibeles."
  }
 },
 "mad-atocha-metro": {
  "sources": [
   "https://www.crtm.es/comunicacion/sala-de-prensa/noticias/archivo/19122021-la-comunidad-de-madrid-cambiara-el-nombre-de-la-estacion-de-metro-de-atocha-renfe-por-el-de-atocha/",
   "https://www.esmadrid.com/avion-madrid"
  ],
  "checked": "2026-10",
  "follow": {
   "pt": "A estação de metro ligada à estação ferroviária chama-se 'Atocha' (linha 1), antiga 'Atocha Renfe'. 'Estación del Arte' é a paragem seguinte, não a que fica na estação.",
   "en": "The metro station linked to the rail station is called 'Atocha' (line 1), formerly 'Atocha Renfe'. 'Estación del Arte' is the next stop, not the one inside the station.",
   "label": "Metro · Atocha (L1)"
  },
  "tickets": {
   "pt": "Desde junho de 2026 pode passar um cartão bancário contactless, telemóvel ou relógio nos torniquetes; ou compre o bilhete na máquina.",
   "en": "Since June 2026 you can tap a contactless bank card, phone or watch at the turnstiles; or buy a ticket at the machine."
  },
  "platforms": {
   "pt": "Apanhe a linha 1 no sentido Pinar de Chamartín; Sol fica a 4 paragens.",
   "en": "Take line 1 towards Pinar de Chamartín; Sol is 4 stops away."
  }
 },
 "man-train": {
  "sources": [
   "https://www.accessable.co.uk/manchester-airport/access-guides/manchester-airport-station",
   "https://crosscountrytrains.co.uk/routes-destinations/stations/manchester-airport",
   "https://railadvent.co.uk/?p=6919",
   "https://en.wikipedia.org/wiki/Manchester_Airport_station",
   "https://tfgm.com/plan-a-journey/visitor-guide"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Chega-se à estação pelo Skylink, passadiço coberto com tapetes rolantes: cerca de 190 m do elevador de chegadas do T1 e 400 m do T2. Do T3, um passadiço coberto leva ao T1 e depois ao Skylink.",
   "en": "The station is reached by the covered Skylink walkway with moving walkways: about 190 m from the T1 arrivals lift, about 400 m from T2. From T3, a covered walkway leads to T1, then the Skylink."
  },
  "lift": {
   "pt": "Sem degraus: há elevadores de cada lado da rampa para as plataformas; outro elevador junto à entrada da estação liga o piso térreo ao superior.",
   "en": "Step-free: lifts sit on either side of the ramp down to the platforms; another lift inside the station entrance links ground and upper levels."
  },
  "luggage": {
   "pt": "Há carrinhos de bagagem na estação e portas de validação largas para malas grandes e carrinhos de bebé.",
   "en": "Luggage trolleys are available at the station, and there are wide ticket gates for big luggage and buggies."
  },
  "tickets": {
   "pt": "A bilheteira fica no átrio da estação, com máquinas de bilhetes ao lado. Guarde o bilhete: há portas de validação.",
   "en": "The ticket office is on the station concourse, with ticket machines beside it. Keep your ticket: there are ticket gates."
  },
  "platforms": {
   "pt": "A estação tem 4 plataformas. Veja os ecrãs: cerca de 8 comboios por hora vão para Manchester Piccadilly (cerca de 20 min).",
   "en": "The station has 4 platforms. Check the screens: about 8 trains an hour go to Manchester Piccadilly (around 20 min)."
  }
 },
 "man-metrolink": {
  "sources": [
   "https://www.manchesterairport.co.uk/getting-to-manchester/metrolink/",
   "https://tfgm.com/plan-a-journey/visitor-guide",
   "https://www.accessable.co.uk/manchester-airport/access-guides/manchester-airport-station"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A paragem do elétrico faz parte da estação ferroviária, a 5–15 min a pé dos terminais pelo Skylink. Um elevador em frente à entrada do T2 desce à plataforma do Metrolink.",
   "en": "The tram stop is part of the railway station, a 5–15 min walk from the terminals via the Skylink. A lift opposite the T2 entrance goes down to the Metrolink platform."
  },
  "lift": {
   "pt": "Use o elevador em frente à entrada do Terminal 2, dentro da estação; serve a plataforma do Metrolink. Entrada no elétrico ao mesmo nível.",
   "en": "Use the lift opposite the Terminal 2 entrance inside the station; it serves the Metrolink platform. Level boarding onto the trams."
  },
  "tickets": {
   "pt": "Valide à entrada no leitor da plataforma com cartão contactless, telemóvel ou relógio, e valide outra vez à saída. Ou compre na máquina da plataforma ou na app Bee Network; não há venda a bordo.",
   "en": "Tap in on the platform reader with a contactless card, phone or watch, and tap out when you arrive. Or buy at the platform machine or Bee Network app; no tickets on board."
  },
  "platforms": {
   "pt": "Os elétricos vão direto do aeroporto até Victoria, passando pelo centro; não precisa de mudar. Verifique se há obras antes de viajar.",
   "en": "Trams run direct from the airport to Victoria through the city centre; no change needed. Check for planned works before you travel."
  }
 },
 "man-pic-walk": {
  "sources": [
   "https://networkrail.co.uk/wp-content/uploads/2022/08/Manchester-Piccadilly-Station-Guide-Accessible.pdf",
   "https://en.wikipedia.org/wiki/Manchester_Piccadilly_station"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Do átrio principal, saia pela entrada principal para a Approach Road, o percurso sem degraus até London Road. Piccadilly Gardens fica a cerca de 800 m.",
   "en": "From the main concourse, leave by the main entrance onto Approach Road, the step-free route to London Road. Piccadilly Gardens is about half a mile away."
  },
  "lift": {
   "pt": "Há elevadores no átrio principal em frente às plataformas 1 e 12; a entrada de Fairfield Street tem dois elevadores para o piso do Metrolink.",
   "en": "Lifts are on the main concourse opposite platforms 1 and 12; the Fairfield Street entrance has two lifts to the Metrolink level."
  },
  "platforms": {
   "pt": "A paragem do Metrolink fica por baixo da estação (piso de Fairfield Street), com acesso do átrio por elevadores e escadas rolantes. Piccadilly Gardens é a paragem seguinte nalgumas linhas.",
   "en": "The Metrolink stop is under the station (Fairfield Street level), reached from the concourse by lifts and escalators. Piccadilly Gardens is the next stop on some routes."
  }
 },
 "prg-59": {
  "sources": [
   "https://prg.aero/en/public-transport-buses",
   "https://pid.cz/en/travel-information/how-do-i-get-from/",
   "https://pid.cz/en/tickets-and-fare/how-to-buy-ticket/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "As paragens ficam mesmo em frente aos átrios de chegadas: Terminal 1 (fora de Schengen) e Terminal 2 (Schengen). A linha 59 é um trólei até Nádraží Veleslavín (cerca de 15 min).",
   "en": "The stops are right in front of the arrival halls: Terminal 1 (non-Schengen) and Terminal 2 (Schengen). Line 59 is a trolleybus to Nádraží Veleslavín (about 15 min)."
  },
  "luggage": {
   "pt": "Uma mala até 25×45×70 cm viaja grátis; uma mala maior precisa de bilhete próprio de bagagem.",
   "en": "One piece up to 25×45×70 cm travels free; a bigger suitcase needs its own luggage ticket."
  },
  "tickets": {
   "pt": "Compre um bilhete de 90 min antes de entrar: máquinas nos átrios de chegadas e nas paragens (a maioria aceita contactless), balcões PID ou app PID Lítačka. Ou pague com cartão no terminal junto à 2.ª porta.",
   "en": "Buy a 90-min ticket before boarding: machines in both arrival halls and at the stops (most take contactless), PID counters, or the PID Lítačka app. Or tap a card at the on-board terminal by the 2nd door."
  },
  "platforms": {
   "pt": "Valide o bilhete de papel uma vez, no validador da paragem ou ao entrar. Ative o bilhete da app um minuto antes. Em Veleslavín, apanhe o metro A no sentido Depo Hostivař.",
   "en": "Validate a paper ticket once at the airport stop validator or on boarding. Activate an app ticket a minute before. At Veleslavín, take metro A towards Depo Hostivař."
  }
 },
 "prg-ae": {
  "sources": [
   "https://www.prg.aero/en/airport-express-ae",
   "https://www.cd.cz/airport",
   "https://pid.cz/en/travel-information/how-do-i-get-from/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A paragem do Airport Express (AE) fica à saída dos terminais; serve os Terminais 1 e 2. Passa de 30 em 30 minutos.",
   "en": "The Airport Express (AE) boarding stop is outside the terminals; it serves Terminals 1 and 2. It runs every 30 minutes."
  },
  "luggage": {
   "pt": "Os autocarros AE são quase todos de piso rebaixado, com espaço extra para malas grandes.",
   "en": "AE buses are mostly low-floor with extra space for large luggage."
  },
  "tickets": {
   "pt": "Compre ao motorista ou no Visitor Centre das chegadas. Os bilhetes normais de transporte de Praga (PID) não são válidos no AE.",
   "en": "Buy from the driver or at the Visitor Centre in arrivals. Normal Prague public transport (PID) tickets are not valid on the AE."
  },
  "platforms": {
   "pt": "Saia em Praha hlavní nádraží: o autocarro para mesmo em frente ao edifício da estação (metro C e comboios).",
   "en": "Get off at Praha hlavní nádraží: the bus stops right in front of the station building (metro C and trains)."
  }
 },
 "las-taxi": {
  "sources": [
   "https://harryreidairport.com/taxi-and-ride-share",
   "https://www.uber.com/global/en/r/airports/las/terminals/terminal-1/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Os táxis esperam logo à saída da recolha de bagagem: no T1 do lado leste, junto às portas 1–4; no T3 no exterior, no Level Zero, junto à porta 52.",
   "en": "Taxis wait right outside baggage claim: in T1 on the east side near doors 1–4; in T3 outside on Level Zero near door 52."
  },
  "follow": {
   "pt": "Para Uber/Lyft siga as placas de ride-share: no T1 a recolha é no piso 2 do parque (saia pela porta 33 e atravesse a ponte); no T3 é no piso Valet do parque.",
   "en": "For Uber/Lyft follow the ride-share signs: T1 pick-up is on Level 2 of the parking garage (exit door 33, cross the bridge); T3 pick-up is on the garage Valet Level.",
   "label": "Ride App Pickup"
  },
  "lift": {
   "pt": "No T1, apanhe o elevador ou a escada rolante da recolha de bagagem até ao piso 2, para a ponte do parque até à zona de recolha das apps.",
   "en": "In T1, take the lift or escalator from baggage claim up to Level 2 for the garage bridge to the app pick-up area."
  }
 },
 "las-cx": {
  "sources": [
   "https://www.harryreidairport.com/busses-shuttles/public-bus",
   "https://www.fox5vegas.com/2026/08/11/rtc-set-launch-systemwide-transit-changes-august-23-across-southern-nevada-routes/",
   "https://www.ktnv.com/news/rtc-launching-new-tap-go-feature-for-single-ride-fares"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A paragem fica no Terminal 1, Level Zero: da recolha de bagagem desça de elevador ou escada rolante, saia, atravesse na passadeira e siga à direita até à paragem coberta.",
   "en": "The bus stop is at Terminal 1, Level Zero: from baggage claim take the lift or escalator down, exit, cross at the crosswalk and bear right to the covered stop."
  },
  "lift": {
   "pt": "Há um elevador da recolha de bagagem do T1 até ao Level Zero. Do T3, apanhe primeiro o shuttle entre terminais até ao T1.",
   "en": "A lift goes down from T1 baggage claim to Level Zero. From T3, take the inter-terminal shuttle to T1 first."
  },
  "tickets": {
   "pt": "Compre uma viagem simples na app rideRTC antes de entrar e passe o código de barras ao entrar.",
   "en": "Buy a single ride in the rideRTC app before boarding and scan its barcode when you get on."
  },
  "platforms": {
   "pt": "Param aqui a linha 108 (Paradise) e a Red Line (antiga 109, Maryland Parkway). A CX deixou de servir diretamente o aeroporto desde agosto de 2026.",
   "en": "Routes 108 (Paradise) and the Red Line (formerly 109, Maryland Parkway) stop here. The CX no longer serves the airport directly since August 2026."
  }
 },
 "jed-taxi": {
  "sources": [
   "https://www.kaia.sa/en/Parking-and-Transport?tab=1",
   "https://gulfnews.com/living-in-uae/transport/visiting-saudi-arabia-make-sure-the-taxi-you-take-from-the-airport-is-licensed-1.1729003258414"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "As zonas de recolha e largada ficam junto ao Terminal 1 e perto da entrada do Terminal Norte.",
   "en": "Designated pick-up and drop-off zones are next to Terminal 1 and near the North Terminal entrance."
  },
  "follow": {
   "pt": "Siga as placas de recolha Uber ou Careem, ou apanhe um táxi público verde. Recuse condutores que se aproximem a oferecer viagem: não são licenciados.",
   "en": "Follow the Uber or Careem pick-up signs, or take a green public taxi. Refuse drivers who approach you offering rides: they are unlicensed.",
   "label": "Uber · Careem"
  },
  "tickets": {
   "pt": "Pague na app. Entre as apps licenciadas estão Uber, Careem, Bolt, Jeeny e a app oficial 'Taxi' (bandeirada fixa, sem tarifa de pico).",
   "en": "Pay in the app. Licensed apps include Uber, Careem, Bolt, Jeeny and the official 'Taxi' app (fixed flag fall, no peak surcharge)."
  }
 },
 "bos-sl1": {
  "sources": [
   "https://mbta.getanchor.io/destinations/logan-airport.html",
   "https://wheelchairtravel.org/boston-silver-line-logan-airport-winning-accessible-transit-model/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "O SL1 para em todos os terminais (A, B, C, E) no piso das chegadas, no passeio à saída da recolha de bagagem, sob grandes placas Silver Line.",
   "en": "SL1 stops at every terminal (A, B, C, E) on the arrivals level, at the curb outside baggage claim, under large Silver Line signs."
  },
  "follow": {
   "pt": "Procure a paragem coberta com a grande placa Silver Line à saída da recolha de bagagem.",
   "en": "Look for the covered stop with the large Silver Line sign outside baggage claim.",
   "label": "Silver Line"
  },
  "lift": {
   "pt": "As plataformas subterrâneas da Silver Line e da linha vermelha em South Station têm acesso por elevador.",
   "en": "South Station's underground Silver Line and Red Line platforms are reached by lift."
  },
  "luggage": {
   "pt": "Os autocarros têm prateleiras para malas, rampa na porta da frente e piso que baixa; todas as paragens do aeroporto são sem degraus.",
   "en": "Buses have racks for checked bags, a front ramp and kneeling floor; every airport stop is step-free."
  },
  "tickets": {
   "pt": "Não se paga nas paragens do aeroporto: a viagem desde Logan é grátis. O SL1 chega ao subsolo de South Station, dentro da zona paga, para a linha vermelha.",
   "en": "No fare is collected at the airport stops: the ride from Logan is free. The SL1 arrives underground at South Station, inside the paid area, for the Red Line."
  }
 },
 "cas-oncf": {
  "sources": [
   "https://onda.ma/en/Our-Airports/Casablanca-Mohammed-V-Airport/Access-Facilitations/By-train"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A estação de comboios fica na cave do Terminal 1, com acesso direto a partir do átrio do aeroporto.",
   "en": "The train station is in the basement of Terminal 1, with direct access from the airport concourse."
  },
  "tickets": {
   "pt": "Compre em 1.ª ou 2.ª classe; consulte horários e compre online em oncf.ma. Os comboios circulam em geral das 6h50 às 22h50.",
   "en": "Buy in 1st or 2nd class; check times and buy online at oncf.ma. Trains generally run from about 06:50 to 22:50."
  },
  "platforms": {
   "pt": "Há comboios diretos para Casa-Voyageurs (cerca de 30 min) e Casa-Port. Veja no ecrã qual é o destino final do seu comboio.",
   "en": "Direct trains go to Casa-Voyageurs (about 30 min) and Casa-Port. Check the screen for which one your train ends at."
  }
 },
 "bcn-aerobus": {
  "sources": [
   "https://www.aena.es/en/josep-tarradellas-barcelona-el-prat/getting-there/bus.html",
   "https://aerobusbarcelona.es/en/faqs/",
   "https://www.atm.cat/en/com-arribar-a-barcelona-des-de-l-aeroport"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "T1: a paragem do Aerobús A1 fica no Piso 0, Chegadas. T2: a paragem do A2 fica no T2B (Chegadas). A venda de bilhetes é no mesmo piso de chegadas.",
   "en": "T1: the Aerobús A1 stop is on Level 0, Arrivals. T2: the A2 stop is at T2B (Arrivals). Ticket sales are at the same arrivals level."
  },
  "luggage": {
   "pt": "Os autocarros têm uma zona reservada para bagagem grande, cadeiras de rodas e carrinhos de bebé. Todos têm rampa. Mantenha a bagagem de mão consigo.",
   "en": "Buses have a reserved area inside for large luggage, wheelchairs and pushchairs. All buses have a ramp. Keep hand luggage with you."
  },
  "tickets": {
   "pt": "O Aerobús tem bilhete próprio (o T-casual não é válido). Compre nas máquinas do terminal (dinheiro ou cartão), ao pessoal na paragem, a bordo ou online/app.",
   "en": "Aerobús needs its own ticket (not valid with T-casual). Buy at the machines in the terminal (cash or card), from staff at the stop, on board, or online/app."
  },
  "platforms": {
   "pt": "Para o centro para em Plaça d'Espanya, Gran Via–Borrell e Plaça Universitat, e termina em Plaça de Catalunya.",
   "en": "Into the city it stops at Plaça d'Espanya, Gran Via–Borrell and Plaça Universitat, ending at Plaça de Catalunya."
  }
 },
 "bcn-r2": {
  "sources": [
   "https://www.aena.es/en/josep-tarradellas-barcelona-el-prat/getting-there/trains.html",
   "https://www.aena.es/en/josep-tarradellas-barcelona-el-prat/airport-services/free-transport-between-terminals.html",
   "https://www.atm.cat/en/com-arribar-a-barcelona-des-de-l-aeroport"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A paragem do comboio fica no Terminal 2, piso 0. Chegou ao T1? Apanhe o autocarro gratuito (24 h) no Piso 0 do T1 (Chegadas) até ao T2B.",
   "en": "The train stop is at Terminal 2, floor 0. Landed at T1? Take the free 24-hour shuttle bus from T1 Level 0 (Arrivals) to T2B."
  },
  "tickets": {
   "pt": "Os passes integrados como o T-casual são válidos nos comboios Rodalies de e para o aeroporto. Atenção: o T-casual NÃO vale nas estações do metro L9 Sud no aeroporto.",
   "en": "Integrated passes such as the T-casual are valid on Rodalies trains to and from the airport. Note: T-casual is NOT valid at the L9 Sud metro airport stations."
  },
  "platforms": {
   "pt": "Os comboios da linha R2 Nord passam cerca de 30 em 30 min (aprox. 6:00 à meia-noite) para Barcelona Sants, Passeig de Gràcia e El Clot-Aragó.",
   "en": "Line R2 Nord trains run about every 30 min (about 6:00 to midnight) to Barcelona Sants, Passeig de Gràcia and El Clot-Aragó."
  }
 },
 "bcn-sants-metro": {
  "sources": [
   "https://www.tmb.cat/en/visit-barcelona/public-transport/from-railway-stations",
   "https://www.tmb.cat/en/barcelona-fares-metro-bus/bank-card-validation",
   "https://www.tmb.cat/en/barcelona-fares-metro-bus/transport-ticket-fares"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "O metro (L3 e L5) acede-se por dentro da estação de Sants: siga as indicações para o metro.",
   "en": "The metro (L3 and L5) is reached from inside Sants station: just follow the signs to the metro."
  },
  "tickets": {
   "pt": "Algumas entradas do metro têm uma máquina onde encosta um cartão contactless Visa, Mastercard ou Amex para comprar e validar um bilhete simples. Um cartão por pessoa.",
   "en": "Some metro entrances have a special machine where you tap a contactless Visa, Mastercard or Amex to buy and validate a single ticket. One card per person."
  }
 },
 "ist-m11": {
  "sources": [
   "https://www.istairport.com/en/contact-us/faq?locale=en",
   "https://www.istairport.com/en/airport/airport-transportation/urban-transportation/public-transportation?locale=en",
   "https://en.wikipedia.org/wiki/%C4%B0stanbul_Havaliman%C4%B1_(Istanbul_Metro)"
  ],
  "checked": "2026-10",
  "luggage": {
   "pt": "Os carrinhos do aeroporto funcionam com caução: pague em dinheiro, débito ou contactless no posto, guarde o recibo com QR e leia-o ao devolver o carrinho.",
   "en": "Airport trolleys work with a deposit: pay by cash, debit or contactless card at a trolley station, keep the QR receipt and scan it when you return the trolley."
  },
  "platforms": {
   "pt": "Uma plataforma central com duas vias. A linha continua para além do aeroporto: confirme que o comboio vai para Gayrettepe.",
   "en": "One island platform with two tracks. The line continues past the airport, so check the train is heading to Gayrettepe."
  }
 },
 "ist-havaist": {
  "sources": [
   "https://www.istairport.com/en/contact-us/faq?locale=en",
   "https://www.istairport.com/en/airport/airport-transportation/urban-transportation/public-transportation?locale=en",
   "https://www.hava.ist/sss.php"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Os autocarros Havaist partem do Piso de Transportes (piso -2). Apanhe os elevadores em frente às portas de chegada e siga as placas 'Transport Floor'.",
   "en": "Havaist buses leave from the Transportation Floor (floor -2). Take the lifts in front of the arrival gates and follow the 'Transport Floor' signs."
  },
  "follow": {
   "pt": "Siga as placas 'Transport Floor' até ao piso -2.",
   "en": "Follow the 'Transport Floor' signs down to floor -2.",
   "label": "Transport Floor"
  },
  "lift": {
   "pt": "Há elevadores em frente às portas de chegada que descem ao Piso de Transportes (-2).",
   "en": "Lifts are in front of the arrival gates and go down to the Transportation Floor (-2)."
  },
  "luggage": {
   "pt": "Os autocarros Havaist estão preparados para passageiros com bagagem. Em cadeira de rodas: peça um midiautocarro adaptado nos balcões Havaist do piso -2, com 1 h de antecedência.",
   "en": "Havaist buses are designed for passengers with baggage. Wheelchair users: ask at the Havaist counters on floor -2 at least 1 hour before for an accessible midibus."
  },
  "tickets": {
   "pt": "Pague em dinheiro nos balcões Havaist ou paragens indicadas, com cartão de débito/crédito no autocarro, ou compre um bilhete QR na app/site Havaist e mostre-o ao embarcar.",
   "en": "Pay cash at Havaist ticket counters or designated stops, by debit/credit card on the bus, or buy a QR ticket in the Havaist app/website and show it when boarding."
  }
 },
 "auh-a1": {
  "sources": [
   "https://www.zayedinternationalairport.ae/en/parking-and-transport/transport/city-bus-routes-and-timetables"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "As paragens de autocarro ficam logo à saída da zona de Chegadas.",
   "en": "The bus stops are just outside the Arrivals area."
  },
  "tickets": {
   "pt": "Precisa de um cartão Hafilat: compre-o e carregue-o nas máquinas junto às paragens do aeroporto. Não se aceita dinheiro no autocarro.",
   "en": "You need a Hafilat card: buy and top it up at the ticket machines near the airport bus stops. Cash is not accepted on the bus."
  },
  "platforms": {
   "pt": "Os autocarros da série A funcionam 24 h por dia. A principal ligação vai para Al Zahiyah (centro da cidade).",
   "en": "A-series airport buses run 24/7. The main city route goes to Al Zahiyah (City Centre)."
  }
 },
 "auh-taxi": {
  "sources": [
   "https://www.zayedinternationalairport.ae/en/parking-and-transport/taxis-car-rental/taxis-limousines",
   "https://www.zayedinternationalairport.ae/en/parking-and-transport/taxis-car-rental/ride-hailing",
   "https://www.zayedinternationalairport.ae/en/plan-and-prepare/at-the-airport/terminal-guides"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Táxi: vá às baías de táxis e limusinas à saída das Chegadas. Uber/Careem: siga as placas 'Ride Hailing' até à zona de recolha no parque de Chegadas.",
   "en": "Taxi: go to the taxis and limousines bays outside Arrivals. Uber/Careem: follow the 'Ride Hailing' signs to the pick-up zone in the Arrivals Car Park."
  },
  "follow": {
   "pt": "Para Uber ou Careem, siga as placas 'Ride Hailing' e as instruções da app.",
   "en": "For Uber or Careem, follow the 'Ride Hailing' signs and the in-app instructions.",
   "label": "Ride Hailing"
  },
  "luggage": {
   "pt": "Há táxis maiores e táxis adaptados a cadeiras de rodas.",
   "en": "Larger vehicles and wheelchair-accessible taxis are available."
  },
  "tickets": {
   "pt": "Os táxis oficiais do aeroporto funcionam 24 h e usam taxímetro. Pague em dinheiro ou cartão no destino.",
   "en": "Official airport taxis run 24/7 and use the meter. Pay by cash or card at your destination."
  }
 },
 "mex-mb4": {
  "sources": [
   "https://www.aicm.com.mx/passengers/services/service-providers/transportation/metrobus"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Apanhe o Metrobús no Terminal 1, porta 7, ou no Terminal 2, porta 2.",
   "en": "Board Metrobús at Terminal 1, gate 7, or Terminal 2, gate 2."
  },
  "tickets": {
   "pt": "Pague com o cartão Metrobús. Compre-o e carregue-o nas máquinas das zonas de embarque ou de saída dos dois terminais.",
   "en": "Pay with the Metrobús smart card. Buy and top it up at the machines in the boarding or exit areas of both terminals."
  },
  "platforms": {
   "pt": "Serviço diário: seg–sáb 04:30–24:00, domingos e feriados 05:00–24:00.",
   "en": "Service daily: Mon–Sat 04:30–24:00, Sundays and holidays 05:00–24:00."
  }
 },
 "mex-taxi": {
  "sources": [
   "https://www.aicm.com.mx/passengers/services/service-providers/transportation/taxis",
   "https://www.aicm.com.mx/taxis-autorizados-aicm-por-tu-seguridad-recuerda-utilizar-solo-taxis-autorizados-ubicados-en-salidas-internacionales-y-nacionales-de-ambas-terminales-aicm/30-03-2021"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Por segurança use só táxis autorizados do aeroporto, nas saídas internacionais e nacionais dos dois terminais. Ignore ofertas de motoristas.",
   "en": "For your safety use only authorised airport taxis, found at the international and domestic exits of both terminals. Ignore offers from drivers."
  },
  "tickets": {
   "pt": "As empresas autorizadas incluem Yellow Cab, Sitio 300, Nueva Imagen, Confort Unlimited, Porto Taxi, Aerotaxi e outras indicadas pelo aeroporto.",
   "en": "Authorised companies include Yellow Cab, Sitio 300, Nueva Imagen, Confort Unlimited, Porto Taxi, Aerotaxi and others listed by the airport."
  }
 },
 "fra-s": {
  "sources": [
   "https://www.frankfurt-airport.com/en/locations/r/regionalrailwaystation.html",
   "https://www.frankfurt-airport.com/en/transport-and-parking/to-from-the-airport/travel-by-train.html",
   "https://www.frankfurt-airport.com/en/transport-and-parking/archive-parking/by-train/local-public-transportation.html",
   "https://www.rmv.de/c/de/ueber-uns/presse/aktuelle-pressemitteilungen/07052026-airport-to-city-ticket-rmv-fahrkarten-ohne-app-und-via-google-maps-kaufen"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A estação regional fica no Piso 0, por baixo do Terminal 1 (Área B), com acesso das áreas A, B e C. Desça pelas escadas rolantes ou elevadores.",
   "en": "The Regional Train Station is on Level 0 below Terminal 1 (Area B), reachable from areas A, B and C. Take the escalators or lifts down."
  },
  "follow": {
   "pt": "Siga as placas do aeroporto para as estações de comboio e depois para a estação regional (S-Bahn).",
   "en": "Follow the airport signs for the train stations, then for the regional station (S-Bahn).",
   "label": "S-Bahn S8 / S9"
  },
  "lift": {
   "pt": "Via 1: elevador no Hall B junto ao DB Service Point (sem reserva). Vias 2–3: siga o símbolo azul de cadeira de rodas até aos elevadores junto ao DB Service Point e ao McDonald's.",
   "en": "Track 1: lift in Hall B by the DB Service Point (no booking needed). Tracks 2–3: follow the blue wheelchair sign to lifts near the DB Service Point and McDonald's."
  },
  "tickets": {
   "pt": "Pode comprar o bilhete diário RMV Airport-to-City online, sem app (códigos QR no aeroporto), com Apple Pay, Google Pay ou PayPal.",
   "en": "You can buy the RMV Airport-to-City day ticket online without an app (QR codes at the airport), paying with Apple Pay, Google Pay or PayPal."
  },
  "platforms": {
   "pt": "O S-Bahn e os comboios regionais usam as vias 1 a 3. Veja nos ecrãs o S8/S9 para Frankfurt (Main) Hauptbahnhof.",
   "en": "S-Bahn and regional trains use tracks 1 to 3. Check the screens for the S8/S9 towards Frankfurt (Main) Hauptbahnhof."
  }
 },
 "muc-s": {
  "sources": [
   "https://www.munich-airport.com/frequently-asked-questions-376207",
   "https://www.munich-airport.com/accessible-travel-260945",
   "https://www.s-bahn-muenchen.de/en/travel/airport",
   "https://www.mvv-muenchen.de/en/tickets-abos-preise/single-ticket-1-2-3/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A estação do S-Bahn fica por baixo do Munich Airport Center (MAC, piso 02). Do T1 siga as placas MAC ou o 'S' verde; do T2 atravesse o fórum do MAC.",
   "en": "The S-Bahn station is below the Munich Airport Center (MAC, level 02). From T1 follow the MAC signs or the green 'S'; from T2 walk through the MAC forum."
  },
  "follow": {
   "pt": "Siga o logótipo verde 'S' ou as placas MAC.",
   "en": "Follow the green 'S' logo or the MAC signs.",
   "label": "S"
  },
  "lift": {
   "pt": "Elevadores totalmente acessíveis e escadas rolantes ligam a plataforma do S-Bahn ao rés-do-chão do MAC (piso 03).",
   "en": "Fully accessible lifts and escalators link the S-Bahn platform with the MAC ground floor (level 03)."
  },
  "luggage": {
   "pt": "Os carrinhos de bagagem são gratuitos para quem chega a Munique.",
   "en": "Luggage trolleys are free for passengers arriving in Munich."
  },
  "tickets": {
   "pt": "As máquinas junto ao acesso do S-Bahn aceitam moedas, notas, cartões EC e de crédito (Mastercard, Visa, Diners). O Airport-City-Day-Ticket cobre aeroporto–cidade (zonas M–5).",
   "en": "Machines near the S-Bahn access take coins, notes, EC and credit cards (Mastercard, Visa, Diners). The Airport-City-Day-Ticket covers airport–city (zones M–5)."
  },
  "platforms": {
   "pt": "O S1 e o S8 alternam e ambos chegam a Hauptbahnhof: o S1 pelo oeste de Munique, o S8 pelo leste.",
   "en": "S1 and S8 alternate and both reach Hauptbahnhof: S1 via the west of Munich, S8 via the east."
  }
 },
 "cai-taxi": {
  "sources": [
   "https://www.cairo-airport.com/en-us/Services/Passenger-Guide/Move-From-To-Airport"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Ignore motoristas que oferecem transporte no átrio de chegadas. As limusinas do aeroporto recolhem em frente aos terminais (junto ao passeio).",
   "en": "Ignore drivers offering rides in the arrivals hall. Airport limousine services pick up in front of the terminals (curb side)."
  },
  "tickets": {
   "pt": "Limusinas: preço fixo por destino e categoria. Os táxis brancos usam taxímetro. Os antigos táxis pretos e brancos não costumam ter: combine o preço antes.",
   "en": "Limousines: fixed price by destination and car category. White taxis use the meter. Old black-and-white taxis usually have no meter: agree the fare first."
  }
 },
 "mia-150": {
  "sources": [
   "https://www.miami-airport.com/public-transportation.asp",
   "https://www.miamidade.gov/global/transportation/mia-metrobus-service.page",
   "https://www.miamidade.gov/global/transportation/contactless-payment-faqs.page"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Suba ao 3.º piso: a entrada do MIA Mover (gratuito) fica entre os parques Dolphin e Flamingo. Siga até ao Miami Intermodal Center / estação Metrorail MIA.",
   "en": "Go up to the 3rd level: the free MIA Mover entrance is between the Dolphin and Flamingo garages. Ride it to the Miami Intermodal Center / MIA Metrorail station."
  },
  "tickets": {
   "pt": "Encoste um cartão contactless Visa, Mastercard, Amex ou o telemóvel no validador do autocarro (um por pessoa), ou use um EASY Card das máquinas do MIC.",
   "en": "Tap a contactless Visa, Mastercard, Amex or phone wallet on the bus fare box (one per rider), or use an EASY Card from the machines at the MIC."
  },
  "platforms": {
   "pt": "As paragens na estação Metrorail MIA ficam no rés-do-chão; os autocarros recolhem no lado oeste. A linha 150 para em Lincoln Rd.",
   "en": "Bus stops at the MIA Metrorail station are on the ground level; buses pick up on the west side. Route 150 stops at Lincoln Rd."
  }
 },
 "kgl-taxi": {
  "sources": [
   "https://rac.co.rw/stores-and-duty-free-shops"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Os táxis esperam 24 h nas praças indicadas: procure os motoristas à saída da porta de chegadas.",
   "en": "Taxis wait 24/7 at the designated ranks: look for the taxi drivers outside the arrival gate."
  },
  "tickets": {
   "pt": "Os operadores do aeroporto são a ATAK Taxis (táxis azul-celeste) e a Volkswagen Mobility Solutions (MOVE).",
   "en": "Airport providers are ATAK Taxis (sky-blue taxis) and Volkswagen Mobility Solutions (MOVE)."
  }
 },
 "rom-lex": {
  "sources": [
   "https://www.adr.it/pax-fco-treno",
   "https://www.trenitalia.com/it/regionale/collegamenti-regionale/leonardo-express.html",
   "https://www.trenitalia.com/en/information/tap-and-tap.html",
   "https://en.wikipedia.org/wiki/Fiumicino_Aeroporto_railway_station"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A estação fica dentro da área do aeroporto, perto dos terminais de chegadas e partidas. Siga a sinalização do aeroporto para os comboios ('Treni').",
   "en": "The airport station is inside the airport area, close to the arrivals and departures terminals. Follow the airport's signs for rail connections ('Treni')."
  },
  "tickets": {
   "pt": "Compre nas máquinas ou na bilheteira da estação, ou na app Trenitalia. Ou passe um cartão contactless num validador com o símbolo TAP&TAP antes de embarcar; em Termini não precisa de validar à saída.",
   "en": "Buy at the self-service machines or ticket office in the station, or in the Trenitalia app. Or tap a contactless card on a validator with the TAP&TAP symbol before boarding; no tap-out needed at Termini."
  },
  "platforms": {
   "pt": "A estação tem três plataformas. O Leonardo Express vai sem paragens até Roma Termini cerca de 15 em 15 minutos (cerca de 32 min). Veja a plataforma nos painéis de partidas.",
   "en": "The station has three platforms. Leonardo Express trains run non-stop to Roma Termini about every 15 minutes (about 32 min). Check the departure boards for the platform."
  }
 },
 "rom-fl1": {
  "sources": [
   "https://www.adr.it/pax-fco-treno",
   "https://en.wikipedia.org/wiki/FL1_(Lazio_regional_railways)",
   "https://blog.italotreno.com/en/travel-ideas/you-need-validate-train-tickets-italy-definitive-explanation/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A estação fica dentro da área do aeroporto, perto dos terminais de chegadas e partidas. Siga a sinalização do aeroporto para os comboios ('Treni').",
   "en": "The airport station is inside the airport area, close to the arrivals and departures terminals. Follow the airport's signs for rail connections ('Treni')."
  },
  "tickets": {
   "pt": "Compre nas máquinas ou na bilheteira da estação, ou na app Trenitalia. O bilhete em papel tem de ser validado numa máquina antes de embarcar; o bilhete digital tem de estar ativo (check-in).",
   "en": "Buy at the station machines or ticket office, or in the Trenitalia app. A paper ticket must be stamped in a validating machine before you board; a digital ticket must be checked in/active."
  },
  "platforms": {
   "pt": "Apanhe o FL1 para Fara Sabina ou Orte (veja a plataforma nos painéis). Trastevere é a 8.ª paragem e Ostiense a 9.ª. Há comboios cerca de 15 em 15 min nos dias úteis e 30 em 30 nos feriados.",
   "en": "Take an FL1 train towards Fara Sabina or Orte (check the boards for the platform). Trastevere is the 8th stop and Ostiense the 9th. Trains run about every 15 min on weekdays, 30 min on holidays."
  }
 },
 "rom-ter-metro": {
  "sources": [
   "https://www.rfi.it/en/stations/station-page/roma-termini---information-totem/mobility/bus--metro-and-tram.html",
   "https://atac.roma.it/en/tickets-and-passes/tap-go",
   "https://en.wikipedia.org/wiki/Line_A_(Rome_Metro)",
   "https://en.wikipedia.org/wiki/Termini_(Rome_Metro)"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "O acesso às linhas A (laranja) e B (azul) do metro fica no piso -1 de Termini, junto à entrada da Via Giolitti. Siga pelos tapetes rolantes até um átrio grande; os torniquetes estão à direita.",
   "en": "The entrance to metro lines A (orange) and B (blue) is on floor -1 of Termini, near the Via Giolitti entrance. Keep going past the moving walkways to a large hall; the turnstiles are on the right."
  },
  "follow": {
   "pt": "O percurso subterrâneo até ao metro está sinalizado e tem pisos táteis. Siga em direção à zona ATAC. Se tiver dúvidas, pergunte ao pessoal da estação.",
   "en": "The underground route to the metro is signposted and has tactile paths. Head towards the ATAC area. If lost, ask station staff.",
   "label": "Metro (A ou B)"
  },
  "tickets": {
   "pt": "Passe o cartão contactless ou o telemóvel no leitor do torniquete e espere pela luz verde. Um cartão por pessoa; afaste os outros cartões, senão o torniquete não abre. Ou compre um bilhete BIT.",
   "en": "Tap a contactless card or phone on the turnstile reader and wait for green. Use one card per person, and keep other cards away from the reader or the gate won't open. Or buy a BIT ticket."
  },
  "platforms": {
   "pt": "Linha A sentido Battistini: Spagna é a 4.ª paragem, Ottaviano a 7.ª. Linha B sentido Laurentina para o Colosseo. Pode mudar entre A e B sem voltar a passar os torniquetes.",
   "en": "Line A towards Battistini: Spagna is the 4th stop, Ottaviano the 7th. Line B towards Laurentina for Colosseo. You can switch between A and B without passing the turnstiles again."
  }
 },
 "opo-metro": {
  "sources": [
   "https://andante.pt/en/?p=4168",
   "https://andante.pt/en/comprar/andante-azul/",
   "https://en.wikipedia.org/wiki/Aeroporto_station_(Porto_Metro)"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A estação de metro fica mesmo à saída do terminal principal, com acesso por um piso inferior ligado ao edifício do terminal. É o fim da linha E (violeta).",
   "en": "The metro station is right outside the main terminal, reached from a lower-level concourse connected to the terminal building. It is the end of line E (violet)."
  },
  "tickets": {
   "pt": "Carregue viagens num cartão Andante Azul nas máquinas. Valide no início de cada viagem e em cada mudança de linha; luz verde e som = OK. Ou, em fase piloto, passe um cartão contactless nos validadores com esse símbolo.",
   "en": "Load trips on a Blue Andante card at the machines. Validate at the start of every trip and each change of line; green light and beep = OK. Or, in a pilot, tap a contactless card on validators with the contactless symbol."
  },
  "platforms": {
   "pt": "Os metros para a cidade partem da plataforma central (os que chegam usam a plataforma lateral). A paragem seguinte ao aeroporto é Botica.",
   "en": "Trains to the city leave from the island platform (arriving trains use the other side platform). Next stop after the airport is Botica."
  }
 },
 "opo-cmp-train": {
  "sources": [
   "https://cp.pt/info/w/occasional-journeys",
   "https://www.cp.pt/info/w/cartao-ocasional",
   "https://www.cp.pt/info/pt/comboios-urbanos-do-porto"
  ],
  "checked": "2026-10",
  "tickets": {
   "pt": "Compre na bilheteira ou nas máquinas: uma viagem carregada num cartão Andante ou Siga, ou use a app CP. Valide antes de embarcar, no máximo 10 minutos antes da partida; sem validação há multa.",
   "en": "Buy at the ticket office or vending machines: a trip loaded on an Andante or Siga card, or use the CP app. Validate before boarding, at most 10 minutes before departure; fines apply if you don't."
  }
 },
 "gla-500": {
  "sources": [
   "https://www.glasgowairport.com/to-and-from/glasgow-airport-express-service-500/",
   "https://www.firstbus.co.uk/greater-glasgow/glasgow-airport-express"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "O 500 parte da paragem (stance) 1 do aeroporto de Glasgow, cerca de 10 em 10 minutos, 24 horas por dia.",
   "en": "The 500 leaves from stance 1 at Glasgow Airport, every 10 minutes or so, 24 hours a day."
  },
  "luggage": {
   "pt": "O autocarro tem bastante espaço para bagagem, desde malas de cabine a malas grandes.",
   "en": "The bus has plenty of luggage space, from carry-ons to suitcases."
  },
  "tickets": {
   "pt": "Compre na app First Bus e mostre ao motorista, ou pague ao motorista a bordo com contactless, cartão ou dinheiro.",
   "en": "Buy in the First Bus app and show it to the driver, or pay the driver on board by contactless, card or cash."
  },
  "platforms": {
   "pt": "Em direção à cidade para em Bothwell Street, Bothwell St/Hope St (perto de Central Station), Queen Street Station, North Hanover Street e Buchanan Bus Station. Atenção a desvios por obras.",
   "en": "Towards the city it stops at Bothwell Street, Bothwell St at Hope St (near Central Station), Queen Street Station, North Hanover Street, then Buchanan Bus Station. Watch for roadwork diversions."
  }
 },
 "gla-cen-walk": {
  "sources": [
   "https://showmethejourney.com/train-station-guide/station/381-glasgowcentral"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Use a saída principal para Gordon Street, em frente quando sai do comboio. O percurso dos comboios até Gordon Street não tem degraus.",
   "en": "Use the main exit onto Gordon Street, straight ahead as you step off the train. The route from the trains to Gordon Street is step-free."
  },
  "follow": {
   "pt": "Vire à direita em Gordon Street até Buchanan Street e depois vire à esquerda.",
   "en": "Turn right along Gordon Street to Buchanan Street, then turn left.",
   "label": "A pé"
  }
 },
 "ruh-metro": {
  "sources": [
   "https://www.kkia.sa/en/Parking-And-Transport/Metro",
   "https://en.wikipedia.org/wiki/Riyadh_Metro"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "O aeroporto tem estações de metro perto das chegadas: T1-T2 Metro Link (terminais 1 e 2), T3-T4 Metro Link (terminais 3 e 4) e a estação do Terminal 5, à entrada principal. Abertas das 6h à meia-noite.",
   "en": "The airport has metro stations near arrivals: T1-T2 Metro Link (Terminals 1 and 2), T3-T4 Metro Link (Terminals 3 and 4), and Terminal 5 station at T5's main entrance. Open 6:00 to midnight."
  },
  "follow": {
   "pt": "As estações têm sinalização em várias línguas (no T3-T4: árabe, inglês e chinês).",
   "en": "Stations have multilingual signs (at T3-T4: Arabic, English and Chinese).",
   "label": "Riyadh Metro (linha Amarela)"
  },
  "lift": {
   "pt": "Todas as estações de metro do aeroporto têm elevadores e escadas rolantes.",
   "en": "Every airport metro station has lifts and escalators."
  },
  "tickets": {
   "pt": "Passe um cartão contactless ou o telemóvel (Apple Pay em modo Express) no torniquete, ou compre um cartão darb na máquina ou na bilheteira, ou use a app darb. Escolha classe Regular ou Primeira.",
   "en": "Tap a contactless card or phone (Apple Pay Express Mode) at the gate, or buy a darb card at a ticket machine or station ticket office, or use the darb app. Choose Regular or First Class."
  },
  "platforms": {
   "pt": "A linha Amarela (4) liga Airport T1-2 ao KAFD, onde há ligação às linhas 1 e 6. Os comboios têm classes separadas por divisórias de vidro.",
   "en": "The Yellow line (4) runs between Airport T1-2 and KAFD, where it connects to lines 1 and 6. Trains have separate classes divided by glass partitions."
  }
 },
 "bue-tl": {
  "sources": [
   "https://www.argentina.travel/en/news/how-to-get-from-ezeiza-international-airport-to-downtown-buenos-aires"
  ],
  "checked": "2026-10",
  "tickets": {
   "pt": "A Tienda León cobra uma tarifa fixa. Vai diretamente ao centro ou ao seu terminal em Puerto Madero.",
   "en": "Tienda León charges a fixed fare. It goes directly downtown or to its own terminal in Puerto Madero."
  }
 },
 "bue-taxi": {
  "sources": [
   "https://www.argentina.travel/en/news/how-to-get-from-ezeiza-international-airport-to-downtown-buenos-aires"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Táxi oficial: reserve no balcão Taxi Ezeiza Oficial à saída da zona de chegadas (aberto 24 h). Uber/Cabify: encontre o motorista nos pontos de encontro sinalizados à saída das chegadas.",
   "en": "Official taxis: book at the Taxi Ezeiza Oficial counter as you leave the arrivals area (open 24 h). Uber/Cabify: meet the driver at the signposted meeting points at the arrivals exit."
  },
  "tickets": {
   "pt": "O preço do táxi oficial depende do destino; confirme-o no balcão. Na Uber/Cabify o preço aparece na app e é cobrado no cartão associado.",
   "en": "The official taxi fare depends on your destination; check it at the counter. With Uber/Cabify the fare shows in the app and is charged to your linked card."
  }
 },
 "vie-s7": {
  "sources": [
   "https://viennaairport.com/en/passengers/arrival__parking/s-bahn__suburban_railway"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "As plataformas ficam a pouca distância do átrio de chegadas, num percurso sem degraus e coberto.",
   "en": "The platforms are a short, step-free, weather-protected walk from the Arrivals Hall."
  },
  "tickets": {
   "pt": "A bilheteira da ÖBB fica no átrio de chegadas. Há máquinas no átrio de chegadas, nas passagens para as plataformas e nas plataformas. O bilhete até Wien Mitte ou Hauptbahnhof inclui toda a rede de Viena.",
   "en": "The ÖBB ticket counter is in the arrivals hall. Machines are in the arrivals hall, the passages to the platforms and on the platforms. The ticket to Wien Mitte or Hauptbahnhof includes all Vienna public transport."
  },
  "platforms": {
   "pt": "S7 para Wien Mitte: cerca de 25 min, de 30 em 30 min (mais na hora de ponta). Railjet para Wien Hauptbahnhof: cerca de 15 min, de 30 em 30 min. Veja a plataforma nos painéis.",
   "en": "S7 to Wien Mitte: about 25 min, every 30 min (more at rush hour). Railjet to Wien Hauptbahnhof: about 15 min, every 30 min. Check the boards for the platform."
  }
 },
 "mct-taxi": {
  "sources": [
   "https://muscatairport.co.om/content/to-from"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Reserve um táxi no balcão Oman Airport taxi, no átrio público de chegadas. Os táxis esperam na zona de táxis mesmo à saída do edifício principal do terminal.",
   "en": "Book a taxi at the Oman Airport taxi office in the public arrivals hall. Taxis wait in the taxi area just outside the main terminal building."
  },
  "tickets": {
   "pt": "Os taxistas são obrigados a usar o taxímetro.",
   "en": "Taxi drivers are required to use the taximeter."
  }
 },
 "lax-flyaway": {
  "sources": [
   "https://www.flylax.com/flyaway-bus/faqs",
   "https://lawa.org/flyaway",
   "https://www.flylax.com/en/lax-traffic-and-ground-transportation"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "Vá ao piso inferior (Lower/Arrivals Level) e espere em frente ao seu terminal, junto à coluna azul FlyAway. Cada autocarro indica o destino; apanhe o de Union Station.",
   "en": "Go to the Lower/Arrivals Level and wait in front of your terminal at the blue FlyAway sign/column. Each bus shows its destination; take the one for Union Station."
  },
  "follow": {
   "pt": "Procure as colunas azuis FlyAway à frente de cada terminal, no piso das chegadas.",
   "en": "Look for the blue FlyAway columns outside each terminal on the arrivals level.",
   "label": "FlyAway"
  },
  "luggage": {
   "pt": "Até três malas no porão e um volume de mão por bilhete. Não são aceites malas com mais de 50 lb (23 kg) ou mais de 62 pol. (158 cm) somando as três medidas.",
   "en": "Up to three stored bags plus one carry-on per ticket. Bags over 50 lb or over 62 in (length + width + height) are not accepted."
  },
  "tickets": {
   "pt": "Pague a bordo com cartão Visa/Mastercard contactless, Apple Pay ou Google Pay, ou compre online. No autocarro não se aceita dinheiro nem cartões sem contactless.",
   "en": "Pay on board with a Visa/Mastercard contactless card, Apple Pay or Google Pay, or buy online. Cash and non-contactless cards are not accepted on the bus."
  },
  "platforms": {
   "pt": "A viagem até Union Station (Patsaouras Bus Plaza) demora cerca de 30-60 min. O embarque fecha 2 min antes da partida; esteja na paragem 10 min antes.",
   "en": "Journey to Union Station (Patsaouras Bus Plaza) takes about 30-60 min. Boarding closes 2 min before departure; be at the stop 10 min early."
  }
 },
 "tun-taxi": {
  "sources": [
   "https://businessnews.com.tn/2026/02/09/taxis-et-applications-de-transport-a-laeroport-de-tunis-carthage-larbitraire-tarifaire-comme-mode-de-fonctionnement/1387416/"
  ],
  "checked": "2026-10",
  "fromBaggage": {
   "pt": "A praça de táxis principal fica logo à saída do aeroporto. Os motoristas de apps não podem entrar no aeroporto e esperam na via pública, do lado de fora.",
   "en": "The main taxi rank is right at the airport exit. App drivers are not allowed inside the airport and wait on the public road outside."
  }
 }
};
