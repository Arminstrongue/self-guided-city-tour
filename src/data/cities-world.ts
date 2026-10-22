/**
 * Cidades das Américas e de África (outubro de 2026).
 * Tarifas de referência de outubro de 2026 (MTA, WMATA, BART/Muni, CTA, MBTA, Miami-Dade e restantes): mudam sem aviso,
 * a app mostra sempre "confirme no local". Nos EUA, os preços de museus e restaurantes não incluem imposto nem gorjeta.
 */
import type { City, Leg } from "./cities";

const W = (min: number, line = ""): Leg => ({ m: "walk", min, line });
const names = (pt: string, en: string, es: string, fr: string, de: string) => ({ pt, en, es, fr, de });

/* ---------- Estados Unidos: as seis cidades onde se anda melhor a pé e de transportes ---------- */
export const US_CITIES: City[] = [
  {
    id: "nyc", n: names("Nova Iorque", "New York", "Nueva York", "New York", "New York"), cur: "USD",
    ap: { iata: "JFK", name: "John F. Kennedy (JFK)", lat: 40.6413, lng: -73.7781 }, tz: "America/New_York",
    single: 3.0, card: 0, cardName: "", alt: null,
    air: { m: "train", min: 70, line: "AirTrain JFK → Jamaica → Metro E → World Trade Center", r: 1, f: 8.5 },
    ret: { core: { m: "train", min: 75, line: "Metro E 5 Av/53 St → Jamaica → AirTrain JFK", r: 1, f: 8.5 }, extra: { m: "train", min: 75, line: "Metro A/C/E 14 St → Jamaica → AirTrain JFK", r: 1, f: 8.5 } },
    stops: [
      { id: "ny-911", n: "Memorial do 11 de Setembro e One World Trade", a: "Lower Manhattan", lat: 40.7115, lng: -74.0134, v: 30, top: true, o: true, leg: W(0, "Metro E World Trade Center"), pt: "As duas piscinas no lugar das Torres Gémeas, com os nomes das vítimas. O memorial é gratuito; o museu e o miradouro One World Observatory são pagos.", en: "The two pools where the Twin Towers stood, edged with the victims' names. The memorial is free; the museum and One World Observatory are paid." },
      { id: "ny-wall", n: "Wall Street e Charging Bull", a: "Financial District", lat: 40.7069, lng: -74.0113, v: 15, leg: W(8), pt: "A bolsa de Nova Iorque, o Federal Hall onde George Washington tomou posse e o touro de bronze de Bowling Green.", en: "The New York Stock Exchange, Federal Hall where George Washington took office, and the bronze bull at Bowling Green." },
      { id: "ny-brooklyn", n: "Ponte de Brooklyn", a: "City Hall", lat: 40.7061, lng: -73.9969, v: 40, top: true, leg: W(12), pt: "A ponte suspensa de 1883 com passadiço pedonal em madeira. Vá até ao primeiro pilar e volte: a melhor vista de Manhattan.", en: "The 1883 suspension bridge with its wooden walkway. Walk to the first tower and back for the best view of Manhattan." },
      { id: "ny-chinatown", n: "Chinatown e Little Italy", a: "Lower Manhattan", lat: 40.7158, lng: -73.997, v: 25, leg: W(15), pt: "Mercados, casas de dumplings e templos em Mott Street; ao lado, as esplanadas italianas de Mulberry Street.", en: "Markets, dumpling houses and temples on Mott Street; next door, the Italian cafés of Mulberry Street." },
      { id: "ny-times", n: "Times Square", a: "Midtown", lat: 40.758, lng: -73.9855, v: 20, top: true, leg: { m: "metro", min: 15, line: "Metro N/Q/R/W Canal St → Times Sq-42 St", r: 1 }, pt: "O cruzamento dos ecrãs gigantes e dos teatros da Broadway. Os bilhetes com desconto do dia vendem-se na escadaria vermelha TKTS.", en: "The crossroads of giant screens and Broadway theatres. Same-day discount tickets are sold at the red TKTS steps." },
      { id: "ny-rock", n: "Rockefeller Center e Catedral de São Patrício", a: "Midtown", lat: 40.7587, lng: -73.9787, v: 25, o: true, leg: W(8), pt: "A praça Art Déco da árvore de Natal e da pista de gelo, em frente à catedral neogótica. O miradouro Top of the Rock é pago.", en: "The Art Deco plaza of the Christmas tree and ice rink, opposite the neo-Gothic cathedral. Top of the Rock is paid." },
      { id: "ny-central", n: "Central Park", a: "Upper Manhattan", lat: 40.774, lng: -73.9712, v: 40, top: true, leg: W(20, "Pela 5.ª Avenida"), pt: "Do The Mall à fonte de Bethesda e ao lago: o grande parque desenhado em 1858, com músicos de rua e barcos a remos.", en: "From The Mall to Bethesda Fountain and the lake: the great park designed in 1858, with buskers and rowing boats." },
      { id: "ny-highline", n: "High Line e Chelsea Market", a: "Chelsea", lat: 40.742, lng: -74.0048, v: 40, x: true, top: true, leg: { m: "metro", min: 20, line: "Metro C/E 50 St → 14 St", r: 1 }, pt: "Um parque suspenso numa antiga linha de comboio, com jardins e arte; por baixo, o mercado coberto de Chelsea.", en: "A park on an old elevated railway, with gardens and art; below, the Chelsea Market food hall." }
    ]
  },
  {
    id: "was", n: names("Washington", "Washington, D.C.", "Washington D. C.", "Washington", "Washington, D.C."), cur: "USD",
    ap: { iata: "IAD", name: "Washington Dulles (IAD)", lat: 38.9531, lng: -77.4565 }, tz: "America/New_York",
    single: 2.25, card: 0, cardName: "", alt: { type: "pass", price: 13.5, name: "Passe de 1 dia Metrorail" },
    air: { m: "train", min: 65, line: "Metro Linha Prata Washington Dulles → Capitol South", f: 6.75 },
    ret: { core: { m: "train", min: 60, line: "Metro Linha Prata McPherson Sq → Washington Dulles", f: 6.75 }, extra: { m: "train", min: 75, line: "A pé até Foggy Bottom → Linha Prata → Washington Dulles", f: 6.75 } },
    stops: [
      { id: "dc-capitol", n: "Capitólio", a: "Capitol Hill", lat: 38.8899, lng: -77.0091, v: 30, top: true, leg: W(8, "Capitol South"), pt: "O congresso dos EUA com a cúpula branca. A visita guiada é gratuita, mas convém reservar online; o centro de visitantes tem a entrada por baixo do relvado.", en: "The US Congress under its white dome. Guided tours are free but best booked online; the visitor centre is entered beneath the lawn." },
      { id: "dc-library", n: "Biblioteca do Congresso", a: "Capitol Hill", lat: 38.8887, lng: -77.0047, v: 25, leg: W(6), pt: "A maior biblioteca do mundo, com o salão de leitura mais bonito da cidade. Entrada gratuita; ao lado fica o Supremo Tribunal.", en: "The world's largest library, with the city's most beautiful reading room. Free to enter; the Supreme Court is next door." },
      { id: "dc-mall", n: "National Mall e museus Smithsonian", a: "National Mall", lat: 38.8913, lng: -77.0261, v: 45, top: true, leg: W(20), pt: "Três quilómetros de relvado entre o Capitólio e o Lincoln, ladeados por museus Smithsonian gratuitos: Ar e Espaço, História Natural, Arte.", en: "Two miles of lawn from the Capitol to the Lincoln, lined with free Smithsonian museums: Air and Space, Natural History, Art." },
      { id: "dc-monument", n: "Monumento a Washington", a: "National Mall", lat: 38.8895, lng: -77.0353, v: 15, top: true, leg: W(12), pt: "O obelisco de 169 metros ao centro do Mall. Subir é gratuito com bilhete reservado (taxa de reserva online).", en: "The 555-foot obelisk at the heart of the Mall. Going up is free with a timed ticket (small online booking fee)." },
      { id: "dc-lincoln", n: "Memorial da Guerra e Lincoln Memorial", a: "West Potomac Park", lat: 38.8893, lng: -77.0502, v: 30, top: true, leg: W(20, "Pelo Reflecting Pool"), pt: "O memorial da Segunda Guerra Mundial e, ao fundo do espelho de água, o templo de Lincoln, onde Martin Luther King discursou em 1963.", en: "The World War II memorial and, beyond the Reflecting Pool, Lincoln's temple, where Martin Luther King spoke in 1963." },
      { id: "dc-whitehouse", n: "Casa Branca e Lafayette Square", a: "Downtown", lat: 38.8995, lng: -77.0366, v: 20, leg: W(20), pt: "A residência do presidente vista da praça Lafayette, a norte. As visitas ao interior só se pedem com meses de antecedência.", en: "The president's residence seen from Lafayette Square to the north. Interior tours must be requested months ahead." },
      { id: "dc-georgetown", n: "Georgetown", a: "Georgetown", lat: 38.9055, lng: -77.0638, v: 40, x: true, leg: W(25, "Pela Pennsylvania Avenue"), pt: "O bairro mais antigo: casas de tijolo, o canal C&O e o passeio à beira do Potomac, com cafés e lojas na M Street.", en: "The oldest neighbourhood: brick houses, the C&O Canal and the Potomac waterfront, with cafés and shops on M Street." }
    ]
  },
  {
    id: "sfo", n: names("São Francisco", "San Francisco", "San Francisco", "San Francisco", "San Francisco"), cur: "USD",
    ap: { iata: "SFO", name: "San Francisco (SFO)", lat: 37.6213, lng: -122.379 }, tz: "America/Los_Angeles",
    single: 3.0, card: 0, cardName: "", alt: { type: "pass", price: 13, name: "Visitor Passport Muni 1 dia (inclui cable car)" },
    air: { m: "train", min: 35, line: "BART SFO → Powell St", f: 11.0 },
    ret: { core: { m: "train", min: 40, line: "BART Embarcadero → SFO", f: 11.0 }, extra: { m: "bus", min: 75, line: "Autocarro 28 → Daly City → BART SFO", r: 1, f: 6.0 } },
    stops: [
      { id: "sf-union", n: "Union Square e cable car", a: "Union Square", lat: 37.788, lng: -122.4075, v: 15, leg: W(5, "BART Powell St"), pt: "A praça das lojas e, na esquina de Powell com Market, a plataforma giratória onde os cable cars mudam de sentido à mão.", en: "The shopping square and, at Powell and Market, the turntable where cable cars are spun around by hand." },
      { id: "sf-chinatown", n: "Chinatown", a: "Chinatown", lat: 37.7907, lng: -122.4058, v: 25, top: true, leg: W(5, "Porta do Dragão, Grant Ave"), pt: "A Chinatown mais antiga da América do Norte: lanternas, ervanários, a fábrica de bolachas da sorte e templos em cima das lojas.", en: "North America's oldest Chinatown: lanterns, herbalists, the fortune cookie factory and temples above the shops." },
      { id: "sf-northbeach", n: "North Beach e Washington Square", a: "North Beach", lat: 37.8005, lng: -122.4101, v: 25, leg: W(12), pt: "O bairro italiano dos poetas Beat: a livraria City Lights, cafés de expresso e a igreja de São Pedro e São Paulo.", en: "The Italian quarter of the Beat poets: City Lights bookstore, espresso bars and Saints Peter and Paul Church." },
      { id: "sf-lombard", n: "Lombard Street", a: "Russian Hill", lat: 37.8021, lng: -122.4187, v: 15, leg: W(12, "A subir pela Columbus Ave"), pt: "O troço com oito curvas apertadas entre hortênsias. Desça pelas escadas laterais; do topo vê-se a Coit Tower e a baía.", en: "The block with eight tight hairpins among hydrangeas. Walk down the side steps; from the top you see Coit Tower and the bay." },
      { id: "sf-wharf", n: "Fisherman's Wharf e Pier 39", a: "Fisherman's Wharf", lat: 37.8087, lng: -122.4098, v: 30, top: true, leg: W(12), pt: "Leões-marinhos no Pier 39, sopa de amêijoa em pão de massa-mãe e a vista para Alcatraz (o barco para a ilha reserva-se com semanas).", en: "Sea lions at Pier 39, clam chowder in a sourdough bowl and views of Alcatraz (the island ferry books up weeks ahead)." },
      { id: "sf-ferry", n: "Ferry Building", a: "Embarcadero", lat: 37.7955, lng: -122.3937, v: 25, leg: { m: "tram", min: 20, line: "Elétrico F (elétricos históricos) → Ferry Building", r: 1 }, pt: "O antigo terminal dos ferries com a torre do relógio, hoje um mercado de produtores locais, ostras e café.", en: "The old ferry terminal with its clock tower, now a market of local producers, oysters and coffee." },
      { id: "sf-goldengate", n: "Ponte Golden Gate", a: "Presidio", lat: 37.8078, lng: -122.475, v: 45, x: true, top: true, leg: { m: "bus", min: 55, line: "Autocarro 30 → 28 → Golden Gate Bridge Welcome Center", r: 1 }, pt: "A ponte cor de laranja de 1937. Atravesse a pé até ao primeiro pilar; leve casaco, o vento e o nevoeiro são frequentes.", en: "The 1937 orange bridge. Walk out to the first tower; bring a jacket, wind and fog are frequent." }
    ]
  },
  {
    id: "chi", n: names("Chicago", "Chicago", "Chicago", "Chicago", "Chicago"), cur: "USD",
    ap: { iata: "ORD", name: "Chicago O'Hare (ORD)", lat: 41.9742, lng: -87.9073 }, tz: "America/Chicago",
    single: 2.5, card: 0, cardName: "", alt: { type: "pass", price: 5, name: "Passe 1 dia Ventra" },
    air: { m: "train", min: 45, line: "Linha Azul O'Hare → Washington", f: 5.0 },
    ret: { core: { m: "train", min: 70, line: "Autocarro 29 → Linha Azul Clark/Lake → O'Hare", r: 1 }, extra: { m: "train", min: 55, line: "Linha Azul Clinton → O'Hare", r: 1 } },
    stops: [
      { id: "chi-bean", n: "Millennium Park e Cloud Gate", a: "The Loop", lat: 41.8827, lng: -87.6233, v: 30, top: true, leg: W(8, "Washington → Randolph St"), pt: "O «Feijão» de aço espelhado de Anish Kapoor, a fonte de rostos Crown e o auditório de Frank Gehry, tudo gratuito.", en: "Anish Kapoor's mirrored «Bean», the Crown Fountain of faces and Frank Gehry's bandshell, all free." },
      { id: "chi-art", n: "Art Institute of Chicago", a: "The Loop", lat: 41.8796, lng: -87.6237, v: 45, o: true, leg: W(4), pt: "Um dos grandes museus do mundo: «American Gothic», «Nighthawks» e a sala dos impressionistas. Pago; os leões de bronze à porta são de todos.", en: "One of the world's great museums: «American Gothic», «Nighthawks» and the Impressionist rooms. Paid; the bronze lions outside are for everyone." },
      { id: "chi-river", n: "Chicago Riverwalk", a: "Downtown", lat: 41.8881, lng: -87.6237, v: 25, top: true, leg: W(10), pt: "O passeio à beira do rio entre arranha-céus históricos. Os barcos de arquitetura saem daqui e são a melhor forma de perceber a cidade.", en: "The riverside promenade among historic skyscrapers. Architecture boat tours leave from here and are the best way to understand the city." },
      { id: "chi-mile", n: "Magnificent Mile e Water Tower", a: "Near North Side", lat: 41.8972, lng: -87.6244, v: 20, leg: W(15), pt: "A avenida das lojas e a torre de água de 1869, das poucas construções que sobreviveram ao Grande Incêndio de 1871.", en: "The shopping avenue and the 1869 Water Tower, one of the few buildings to survive the Great Fire of 1871." },
      { id: "chi-navy", n: "Navy Pier", a: "Streeterville", lat: 41.8917, lng: -87.6086, v: 30, leg: W(20), pt: "O cais de 1916 sobre o lago Michigan, com a roda gigante e a melhor vista do horizonte da cidade.", en: "The 1916 pier on Lake Michigan, with the Ferris wheel and the best view of the skyline." },
      { id: "chi-willis", n: "Willis Tower Skydeck", a: "The Loop", lat: 41.8789, lng: -87.6359, v: 45, x: true, top: true, o: true, leg: { m: "bus", min: 25, line: "Autocarro 124 → Wacker Dr", r: 1 }, pt: "O 103.º andar e as varandas de vidro suspensas a 412 metros. Pago; ao fim da tarde há fila.", en: "The 103rd floor and the glass ledges suspended 1,353 feet up. Paid; queues build in the late afternoon." }
    ]
  },
  {
    id: "bos", n: names("Boston", "Boston", "Boston", "Boston", "Boston"), cur: "USD",
    ap: { iata: "BOS", name: "Boston Logan (BOS)", lat: 42.3656, lng: -71.0096 }, tz: "America/New_York",
    single: 2.4, card: 0, cardName: "", alt: { type: "pass", price: 11, name: "Passe 1 dia MBTA" },
    air: { m: "bus", min: 35, line: "SL1 (grátis desde o aeroporto) → South Station → Linha Vermelha Park Street" },
    ret: { core: { m: "train", min: 40, line: "Linha Laranja → State → Linha Azul Airport → autocarro do terminal", r: 1 }, extra: { m: "train", min: 55, line: "Linha Vermelha Harvard → South Station → SL1", r: 1 } },
    stops: [
      { id: "bos-common", n: "Boston Common e Public Garden", a: "Beacon Hill", lat: 42.355, lng: -71.0656, v: 20, top: true, leg: W(2, "Park Street"), pt: "O parque público mais antigo dos EUA (1634) e o jardim dos barcos-cisne. É aqui que começa a linha vermelha do Freedom Trail.", en: "America's oldest public park (1634) and the swan-boat garden. The red line of the Freedom Trail starts here." },
      { id: "bos-statehouse", n: "Massachusetts State House", a: "Beacon Hill", lat: 42.3588, lng: -71.0638, v: 10, leg: W(4), pt: "A cúpula dourada do parlamento estadual; atrás, as ruas de tijolo e lampiões a gás de Beacon Hill.", en: "The gold dome of the state house; behind it, the brick lanes and gas lamps of Beacon Hill." },
      { id: "bos-granary", n: "Granary Burying Ground", a: "Downtown", lat: 42.3575, lng: -71.0618, v: 15, leg: W(4), pt: "O cemitério onde estão Samuel Adams, John Hancock e Paul Revere, entre lápides de 1660.", en: "The burial ground of Samuel Adams, John Hancock and Paul Revere, among headstones from the 1660s." },
      { id: "bos-faneuil", n: "Faneuil Hall e Quincy Market", a: "Downtown", lat: 42.36, lng: -71.0548, v: 30, top: true, leg: W(10, "Pela Old State House"), pt: "O mercado e sala de reuniões onde se discutiu a independência. Prove a sopa de amêijoa e o «lobster roll».", en: "The market and meeting hall where independence was debated. Try the clam chowder and a lobster roll." },
      { id: "bos-northend", n: "North End e Paul Revere House", a: "North End", lat: 42.3637, lng: -71.0537, v: 25, leg: W(8), pt: "O bairro italiano, com cannoli de Hanover Street, e a casa de madeira de 1680 de onde Paul Revere partiu a cavalo em 1775.", en: "The Italian quarter, with Hanover Street cannoli, and the 1680 wooden house from which Paul Revere rode out in 1775." },
      { id: "bos-oldnorth", n: "Old North Church", a: "North End", lat: 42.3663, lng: -71.0544, v: 15, leg: W(5), pt: "As duas lanternas no campanário avisaram que os ingleses vinham por mar. A igreja mais antiga de Boston ainda em uso.", en: "Two lanterns in its steeple warned that the British were coming by sea. Boston's oldest church still in use." },
      { id: "bos-harvard", n: "Harvard Yard", a: "Cambridge", lat: 42.3744, lng: -71.1169, v: 40, x: true, top: true, leg: { m: "metro", min: 30, line: "A pé até Charles/MGH → Linha Vermelha → Harvard", r: 1 }, pt: "O pátio da universidade mais antiga dos EUA, com a estátua de John Harvard e as livrarias da Harvard Square.", en: "The yard of America's oldest university, with the John Harvard statue and the bookshops of Harvard Square." }
    ]
  },
  {
    id: "mia", n: names("Miami", "Miami", "Miami", "Miami", "Miami"), cur: "USD",
    ap: { iata: "MIA", name: "Miami (MIA)", lat: 25.7959, lng: -80.287 }, tz: "America/New_York",
    single: 2.25, card: 0, cardName: "", alt: { type: "pass", price: 5.65, name: "Passe 1 dia EASY Card" },
    air: { m: "bus", min: 50, line: "Autocarro 150 Miami Beach Airport Express → Lincoln Road", r: 1 },
    ret: { core: { m: "bus", min: 65, line: "South Beach Local → Autocarro 150 → Aeroporto", r: 1 }, extra: { m: "car", min: 20, line: "Táxi/Uber Wynwood → Aeroporto", f: 25 } },
    stops: [
      { id: "mia-lincoln", n: "Lincoln Road", a: "South Beach", lat: 25.7907, lng: -80.1394, v: 25, leg: W(3, "Autocarro 150"), pt: "O passeio pedonal desenhado por Morris Lapidus, com esplanadas, lojas e o New World Center de Frank Gehry.", en: "The pedestrian mall designed by Morris Lapidus, with cafés, shops and Frank Gehry's New World Center." },
      { id: "mia-espanola", n: "Española Way", a: "South Beach", lat: 25.7866, lng: -80.1323, v: 15, leg: W(10), pt: "A ruela de estilo mediterrâneo dos anos 1920, cor-de-rosa e cheia de restaurantes.", en: "The 1920s Mediterranean-style lane, painted pink and lined with restaurants." },
      { id: "mia-artdeco", n: "Art Deco Welcome Center", a: "South Beach", lat: 25.7813, lng: -80.1303, v: 15, leg: W(8), pt: "O ponto de partida do maior conjunto de edifícios Art Déco do mundo, com mapas e visitas guiadas pagas.", en: "The starting point for the world's largest collection of Art Deco buildings, with maps and paid guided walks." },
      { id: "mia-ocean", n: "Ocean Drive e Lummus Park", a: "South Beach", lat: 25.7802, lng: -80.1306, v: 30, top: true, leg: W(3), pt: "Hotéis Art Déco em tons pastel virados para a praia, as torres dos nadadores-salvadores coloridas e o mar azul-turquesa.", en: "Pastel Art Deco hotels facing the beach, colourful lifeguard towers and the turquoise sea." },
      { id: "mia-southpointe", n: "South Pointe Park", a: "South of Fifth", lat: 25.7686, lng: -80.1334, v: 25, top: true, leg: W(20, "Pelo passeio marítimo"), pt: "O fim da ilha: o cais de pesca, os navios de cruzeiro a passar no canal e o pôr do sol sobre a baía.", en: "The tip of the island: the fishing pier, cruise ships gliding through the channel and sunset over the bay." },
      { id: "mia-wynwood", n: "Wynwood Walls", a: "Wynwood", lat: 25.8011, lng: -80.1994, v: 40, x: true, top: true, leg: { m: "car", min: 25, line: "Táxi/Uber South Beach → Wynwood", f: 25 }, pt: "Antigos armazéns cobertos de murais de artistas de todo o mundo. O recinto Wynwood Walls é pago; as ruas à volta são livres.", en: "Old warehouses covered in murals by artists from around the world. The Wynwood Walls enclosure is paid; the surrounding streets are free." }
    ]
  }
];

export const US_NAMES: Record<string, Record<string, string>> = {
  nyc: { it: "New York", zh: "纽约", ar: "نيويورك", ja: "ニューヨーク", tr: "New York", ru: "Нью-Йорк", ko: "뉴욕" },
  was: { it: "Washington", zh: "华盛顿", ar: "واشنطن", ja: "ワシントンD.C.", tr: "Washington", ru: "Вашингтон", ko: "워싱턴 D.C." },
  sfo: { it: "San Francisco", zh: "旧金山", ar: "سان فرانسيسكو", ja: "サンフランシスコ", tr: "San Francisco", ru: "Сан-Франциско", ko: "샌프란시스코" },
  chi: { it: "Chicago", zh: "芝加哥", ar: "شيكاغو", ja: "シカゴ", tr: "Chicago", ru: "Чикаго", ko: "시카고" },
  bos: { it: "Boston", zh: "波士顿", ar: "بوسطن", ja: "ボストン", tr: "Boston", ru: "Бостон", ko: "보스턴" },
  mia: { it: "Miami", zh: "迈阿密", ar: "ميامي", ja: "マイアミ", tr: "Miami", ru: "Майами", ko: "마이애미" }
};
