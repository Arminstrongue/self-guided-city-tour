/**
 * Mais cidades das Américas: Los Angeles, Las Vegas, Nova Orleães, Orlando, Toronto, Cidade do México, Rio de Janeiro e Buenos Aires.
 * Tarifas de referência de outubro de 2026 (LA Metro, RTC, RTA, LYNX/SunRail, TTC/UP Express, Metro/Metrobús CDMX, MetrôRio/VLT, SUBE):
 * mudam sem aviso e a app mostra sempre "confirme no local". Em Buenos Aires os preços em pesos mudam muito depressa.
 */
import type { City, Leg } from "./cities";

const W = (min: number, line = ""): Leg => ({ m: "walk", min, line });
const names = (pt: string, en: string, es: string, fr: string, de: string) => ({ pt, en, es, fr, de });

export const AMERICAS_CITIES: City[] = [
  {
    id: "lax", n: names("Los Angeles", "Los Angeles", "Los Ángeles", "Los Angeles", "Los Angeles"), cur: "USD",
    ap: { iata: "LAX", name: "Los Angeles (LAX)", lat: 33.9416, lng: -118.4085 }, tz: "America/Los_Angeles",
    single: 1.75, card: 0, cardName: "", alt: { type: "cap", price: 5, name: "Teto diário TAP (5 USD)" },
    air: { m: "bus", min: 50, line: "FlyAway LAX → Union Station", f: 9.75 },
    ret: { core: { m: "bus", min: 80, line: "Linha B Hollywood/Highland → Union Station → FlyAway LAX", r: 1, f: 9.75 }, extra: { m: "train", min: 60, line: "Linha E Downtown Santa Monica → Linha K → LAX/Metro Transit Center", r: 1 } },
    stops: [
      { id: "la-olvera", n: "Olvera Street e Union Station", a: "El Pueblo", lat: 34.0574, lng: -118.2378, v: 25, leg: W(3, "Union Station"), pt: "A rua onde Los Angeles nasceu em 1781, com bancas mexicanas e a casa de adobe mais antiga; ao lado, a estação Art Déco e missão de 1939.", en: "The street where Los Angeles was born in 1781, with Mexican stalls and the oldest adobe house; next door, the 1939 Mission Revival station." },
      { id: "la-gcm", n: "Grand Central Market e Angels Flight", a: "Downtown", lat: 34.0508, lng: -118.2489, v: 30, leg: W(15), pt: "O mercado coberto de 1917 com tacos, ramen e café; em frente, o funicular mais curto do mundo sobe a Bunker Hill.", en: "The 1917 food hall with tacos, ramen and coffee; opposite, the world's shortest railway climbs Bunker Hill." },
      { id: "la-disney", n: "Walt Disney Concert Hall e The Broad", a: "Bunker Hill", lat: 34.0553, lng: -118.2498, v: 40, top: true, leg: W(8, "A subir pela Grand Ave"), pt: "As velas de aço de Frank Gehry, com jardim no terraço; ao lado, o museu The Broad, de entrada gratuita com reserva.", en: "Frank Gehry's steel sails, with a rooftop garden; next door, The Broad museum, free with a timed reservation." },
      { id: "la-hollywood", n: "Passeio da Fama de Hollywood", a: "Hollywood", lat: 34.1016, lng: -118.3409, v: 35, top: true, leg: { m: "metro", min: 25, line: "Linha B Civic Center → Hollywood/Highland", r: 1 }, pt: "As estrelas no passeio, o TCL Chinese Theatre com as mãos dos atores no cimento e a vista para o letreiro de Hollywood.", en: "The stars on the sidewalk, the TCL Chinese Theatre with actors' handprints in cement and views of the Hollywood sign." },
      { id: "la-griffith", n: "Observatório Griffith", a: "Griffith Park", lat: 34.1184, lng: -118.3004, v: 45, top: true, leg: { m: "bus", min: 35, line: "Linha B → Vermont/Sunset → autocarro DASH Observatory", r: 1 }, pt: "O observatório de 1935 sobre a cidade, com entrada gratuita, telescópios públicos à noite e a melhor vista do letreiro.", en: "The 1935 observatory above the city, free to enter, with public telescopes at night and the best view of the sign." },
      { id: "la-santamonica", n: "Santa Monica Pier e Venice", a: "Santa Monica", lat: 34.0094, lng: -118.4973, v: 50, x: true, top: true, leg: { m: "train", min: 80, line: "DASH → Linha B → Linha E → Downtown Santa Monica", r: 2 }, pt: "O cais de 1909 com a roda gigante, o fim da Route 66 e, a sul pela praia, o passeio boémio de Venice.", en: "The 1909 pier with its Ferris wheel, the end of Route 66 and, south along the beach, the bohemian Venice boardwalk." }
    ]
  },
  {
    id: "las", n: names("Las Vegas", "Las Vegas", "Las Vegas", "Las Vegas", "Las Vegas"), cur: "USD",
    ap: { iata: "LAS", name: "Harry Reid (LAS)", lat: 36.084, lng: -115.1537 }, tz: "America/Los_Angeles",
    single: 6, card: 0, cardName: "", alt: { type: "pass", price: 8, name: "Passe 24 h RTC (Deuce)" },
    air: { m: "car", min: 15, line: "Táxi/Uber LAS → Welcome Sign", f: 20 },
    ret: { core: { m: "car", min: 20, line: "Táxi/Uber Strip → Aeroporto", f: 25 }, extra: { m: "car", min: 25, line: "Táxi/Uber Fremont Street → Aeroporto", f: 35 } },
    stops: [
      { id: "lv-sign", n: "Letreiro Welcome to Las Vegas", a: "South Strip", lat: 36.082, lng: -115.1728, v: 15, leg: W(0), pt: "O letreiro de 1959 no início da Strip. Há um pequeno parque de estacionamento e fila para a fotografia, que é gratuita.", en: "The 1959 sign at the start of the Strip. There's a small car park and a queue for the photo, which is free." },
      { id: "lv-bellagio", n: "Fontes do Bellagio", a: "Center Strip", lat: 36.1126, lng: -115.1767, v: 25, top: true, leg: { m: "bus", min: 20, line: "Autocarro Deuce → Bellagio", r: 1 }, pt: "O lago das fontes que dançam ao som de música a cada 15–30 minutos, gratuito; dentro, o jardim botânico do átrio.", en: "The lake of fountains dancing to music every 15–30 minutes, free; inside, the lobby's botanical garden." },
      { id: "lv-paris", n: "Paris Las Vegas", a: "Center Strip", lat: 36.1125, lng: -115.1707, v: 20, o: true, leg: W(6, "Pela ponte pedonal"), pt: "A torre Eiffel a meia escala em frente às fontes. O miradouro no topo é pago e tem a melhor vista do espetáculo das águas.", en: "The half-scale Eiffel Tower facing the fountains. The observation deck is paid and has the best view of the water show." },
      { id: "lv-caesars", n: "Caesars Palace e Forum Shops", a: "Center Strip", lat: 36.1162, lng: -115.1745, v: 25, leg: W(10), pt: "O casino de 1966 de inspiração romana, com estátuas, fontes e o centro comercial do céu pintado que muda do dia para a noite.", en: "The Roman-themed 1966 casino, with statues, fountains and the mall under a painted sky that changes from day to night." },
      { id: "lv-venetian", n: "The Venetian e Sphere", a: "Center Strip", lat: 36.1212, lng: -115.1697, v: 30, top: true, leg: W(12), pt: "Os canais e gôndolas de Veneza dentro do casino e, atrás, a Sphere, a esfera de LED gigante que se acende à noite.", en: "Venice's canals and gondolas inside the casino and, behind it, the Sphere, the giant LED globe that lights up at night." },
      { id: "lv-fremont", n: "Fremont Street Experience", a: "Downtown", lat: 36.1707, lng: -115.144, v: 40, x: true, top: true, leg: { m: "bus", min: 30, line: "Autocarro Deuce → Fremont Street", r: 1 }, pt: "A Las Vegas antiga: casinos dos anos 50, néones históricos e o teto de ecrãs com espetáculos de luz gratuitos à noite.", en: "Old Las Vegas: 1950s casinos, vintage neon and the canopy of screens with free light shows at night." }
    ]
  },
  {
    id: "msy", n: names("Nova Orleães", "New Orleans", "Nueva Orleans", "La Nouvelle-Orléans", "New Orleans"), cur: "USD",
    ap: { iata: "MSY", name: "Louis Armstrong New Orleans (MSY)", lat: 29.9934, lng: -90.258 }, tz: "America/Chicago",
    single: 1.25, card: 0, cardName: "", alt: { type: "pass", price: 3, name: "Jazzy Pass 1 dia (RTA)" },
    air: { m: "bus", min: 45, line: "Autocarro 202 Airport Express → Downtown (Elk Place)", f: 1.5 },
    ret: { core: { m: "bus", min: 65, line: "A pé até Canal St → Autocarro 202 → Aeroporto", f: 1.5 }, extra: { m: "bus", min: 80, line: "Elétrico St. Charles → Canal St → Autocarro 202", r: 1, f: 1.5 } },
    stops: [
      { id: "nola-jackson", n: "Jackson Square e Catedral de São Luís", a: "French Quarter", lat: 29.9574, lng: -90.0629, v: 25, top: true, leg: W(15, "Desde Canal St"), pt: "A praça de armas de 1721, com pintores e músicos à volta e a catedral branca de três torres ao fundo.", en: "The 1721 parade ground, ringed by painters and musicians, with the white three-spired cathedral behind." },
      { id: "nola-cafe", n: "Café du Monde e French Market", a: "French Quarter", lat: 29.9575, lng: -90.0618, v: 30, leg: W(3), pt: "Beignets com açúcar em pó e café com chicória desde 1862; ao lado, o mercado coberto junto ao Mississippi.", en: "Powdered-sugar beignets and chicory coffee since 1862; next door, the covered market by the Mississippi." },
      { id: "nola-royal", n: "Royal Street", a: "French Quarter", lat: 29.9584, lng: -90.065, v: 20, leg: W(6), pt: "Varandas de ferro forjado, galerias e antiquários; à tarde, parte da rua fecha aos carros e enche-se de músicos de rua.", en: "Wrought-iron balconies, galleries and antique shops; in the afternoon part of the street closes to cars and fills with buskers." },
      { id: "nola-bourbon", n: "Bourbon Street e Preservation Hall", a: "French Quarter", lat: 29.9581, lng: -90.0656, v: 25, top: true, o: true, leg: W(3), pt: "A rua mais ruidosa da cidade e, a um passo, a sala de 1961 onde o jazz tradicional se toca ao vivo todas as noites (bilhete pago).", en: "The city's loudest street and, a step away, the 1961 hall where traditional jazz plays live every night (paid ticket)." },
      { id: "nola-frenchmen", n: "Frenchmen Street", a: "Marigny", lat: 29.964, lng: -90.0577, v: 30, leg: W(12), pt: "Onde os locais ouvem música: clubes de jazz e blues porta sim, porta não e um mercado de artistas à noite.", en: "Where locals go for music: jazz and blues clubs door after door and an art market at night." },
      { id: "nola-garden", n: "Elétrico St. Charles e Garden District", a: "Garden District", lat: 29.9285, lng: -90.0848, v: 45, x: true, top: true, leg: { m: "tram", min: 35, line: "Elétrico St. Charles → Washington Ave", r: 1 }, pt: "O elétrico mais antigo em serviço do mundo leva às mansões do século XIX entre carvalhos e ao cemitério Lafayette n.º 1.", en: "The world's oldest operating streetcar takes you to 19th-century mansions under oaks and Lafayette Cemetery No. 1." }
    ]
  },
  {
    id: "mco", n: names("Orlando", "Orlando", "Orlando", "Orlando", "Orlando"), cur: "USD",
    ap: { iata: "MCO", name: "Orlando (MCO)", lat: 28.4312, lng: -81.3081 }, tz: "America/New_York",
    single: 2, card: 0, cardName: "", alt: { type: "pass", price: 4.5, name: "Passe 1 dia LYNX" },
    air: { m: "bus", min: 45, line: "Autocarro LYNX 11 → LYNX Central Station", f: 2 },
    ret: { core: { m: "bus", min: 60, line: "Autocarro LYNX 42 → Aeroporto", f: 2 }, extra: { m: "car", min: 30, line: "Táxi/Uber Disney Springs → Aeroporto", f: 45 } },
    stops: [
      { id: "orl-eola", n: "Lago Eola", a: "Downtown", lat: 28.5434, lng: -81.3727, v: 25, top: true, leg: W(10, "Desde LYNX Central"), pt: "O lago do centro com a fonte de 1957, cisnes, barcos-cisne e um mercado de produtores ao domingo de manhã.", en: "The downtown lake with its 1957 fountain, swans, swan boats and a Sunday morning farmers' market." },
      { id: "orl-church", n: "Church Street", a: "Downtown", lat: 28.5404, lng: -81.3797, v: 15, leg: W(10), pt: "A rua de tijolo da antiga estação de 1889, com bares, restaurantes e o centro de espetáculos Dr. Phillips perto.", en: "The brick street by the old 1889 station, with bars, restaurants and the Dr. Phillips performing arts centre nearby." },
      { id: "orl-winterpark", n: "Park Avenue, Winter Park", a: "Winter Park", lat: 28.5975, lng: -81.3511, v: 40, top: true, leg: { m: "train", min: 25, line: "SunRail Church Street → Winter Park", r: 1 }, pt: "A avenida das lojas e esplanadas em frente ao parque central; o Museu Morse guarda a maior coleção de vitrais Tiffany.", en: "The avenue of shops and cafés facing Central Park; the Morse Museum holds the largest collection of Tiffany glass." },
      { id: "orl-boat", n: "Scenic Boat Tour", a: "Winter Park", lat: 28.5996, lng: -81.3433, v: 60, o: true, leg: W(12), pt: "Uma hora de barco pelos lagos e canais estreitos entre mansões e ciprestes, com o barqueiro a contar a história (pago).", en: "An hour by boat through the lakes and narrow canals among mansions and cypress trees, with the skipper narrating (paid)." },
      { id: "orl-idrive", n: "ICON Park e International Drive", a: "International Drive", lat: 28.4433, lng: -81.4686, v: 40, top: true, leg: { m: "car", min: 30, line: "Táxi/Uber Winter Park → I-Drive", f: 30 }, pt: "A avenida dos parques e restaurantes, com a roda gigante The Wheel de 120 metros, que roda ao pôr do sol (paga).", en: "The avenue of attractions and restaurants, with the 400-foot Wheel turning at sunset (paid)." },
      { id: "orl-disneysprings", n: "Disney Springs", a: "Lake Buena Vista", lat: 28.37, lng: -81.5194, v: 60, x: true, leg: { m: "car", min: 25, line: "Táxi/Uber I-Drive → Disney Springs", f: 30 }, pt: "A zona de lojas, restaurantes e música da Disney à beira do lago, com entrada e estacionamento gratuitos.", en: "Disney's lakeside district of shops, restaurants and live music, free to enter and park." }
    ]
  },
  {
    id: "yyz", n: names("Toronto", "Toronto", "Toronto", "Toronto", "Toronto"), cur: "CAD",
    ap: { iata: "YYZ", name: "Toronto Pearson (YYZ)", lat: 43.6777, lng: -79.6248 }, tz: "America/Toronto",
    single: 3.3, card: 0, cardName: "", alt: { type: "pass", price: 13.5, name: "Passe de 1 dia TTC" },
    air: { m: "train", min: 25, line: "UP Express Pearson → Union Station", f: 12.35 },
    ret: { core: { m: "train", min: 45, line: "Elétrico 510 Spadina → Union → UP Express", r: 1, f: 12.35 }, extra: { m: "train", min: 40, line: "Linha 1 Museum → Union → UP Express", r: 1, f: 12.35 } },
    stops: [
      { id: "to-cn", n: "CN Tower", a: "Entertainment District", lat: 43.6426, lng: -79.3871, v: 40, top: true, o: true, leg: W(10, "Union Station"), pt: "A torre de 553 metros de 1976. O miradouro e o chão de vidro são pagos; vê-se o lago Ontário e, em dias claros, o vapor das cataratas.", en: "The 1,815-foot tower of 1976. The lookout and glass floor are paid; you see Lake Ontario and, on clear days, the mist from the falls." },
      { id: "to-stlawrence", n: "St. Lawrence Market", a: "Old Town", lat: 43.6487, lng: -79.3716, v: 30, top: true, cl: [0, 1], leg: W(18, "Pela Front Street"), pt: "O mercado de 1803 com a sanduíche de peameal bacon; fecha ao domingo e à segunda.", en: "The 1803 market and its peameal bacon sandwich; closed Sundays and Mondays." },
      { id: "to-distillery", n: "Distillery District", a: "Distillery District", lat: 43.6503, lng: -79.3596, v: 30, leg: W(15), pt: "A destilaria vitoriana de tijolo, hoje ruas pedonais com galerias, cafés e, no inverno, o mercado de Natal.", en: "The Victorian brick distillery, now pedestrian lanes with galleries, cafés and, in winter, the Christmas market." },
      { id: "to-nathan", n: "Nathan Phillips Square e City Hall", a: "Downtown", lat: 43.6525, lng: -79.3835, v: 15, leg: { m: "tram", min: 15, line: "Elétrico 504 King → Bay St", r: 1 }, pt: "As duas torres curvas da câmara de 1965, o letreiro TORONTO e o lago que no inverno vira pista de gelo gratuita.", en: "The two curved towers of the 1965 city hall, the TORONTO sign and the pool that becomes a free skating rink in winter." },
      { id: "to-kensington", n: "Kensington Market e Chinatown", a: "Kensington", lat: 43.6545, lng: -79.4005, v: 30, leg: W(18, "Pela Dundas Street"), pt: "Lojas vintage, cafés, empanadas e murais num bairro de imigrantes; ao lado, a Chinatown da Spadina Avenue.", en: "Vintage shops, cafés, empanadas and murals in an immigrant neighbourhood; next door, the Spadina Avenue Chinatown." },
      { id: "to-rom", n: "Royal Ontario Museum e Yorkville", a: "Yorkville", lat: 43.6677, lng: -79.3948, v: 45, x: true, o: true, leg: W(20), pt: "O museu do cristal de vidro, com dinossauros e arte do mundo; à volta, as ruas elegantes de Yorkville.", en: "The museum with the glass crystal, dinosaurs and world art; around it, the elegant streets of Yorkville." }
    ]
  },
  {
    id: "mex", n: names("Cidade do México", "Mexico City", "Ciudad de México", "Mexico", "Mexiko-Stadt"), cur: "MXN",
    ap: { iata: "MEX", name: "Benito Juárez (MEX)", lat: 19.4361, lng: -99.0719 }, tz: "America/Mexico_City",
    single: 5, card: 0, cardName: "", alt: null,
    air: { m: "bus", min: 45, line: "Metrobús Linha 4 Aeroporto → República de Chile", f: 30 },
    ret: { core: { m: "car", min: 45, line: "Táxi autorizado/Uber → Aeroporto", f: 300 }, extra: { m: "car", min: 45, line: "Táxi autorizado/Uber Condesa → Aeroporto", f: 280 } },
    stops: [
      { id: "mx-zocalo", n: "Zócalo e Catedral Metropolitana", a: "Centro Histórico", lat: 19.4326, lng: -99.1332, v: 30, top: true, leg: W(8, "Metrobús República de Chile"), pt: "Uma das maiores praças do mundo, com a bandeira gigante, o Palácio Nacional e a catedral construída durante 250 anos.", en: "One of the world's largest squares, with the giant flag, the National Palace and the cathedral built over 250 years." },
      { id: "mx-templo", n: "Templo Mayor", a: "Centro Histórico", lat: 19.4351, lng: -99.1314, v: 45, o: true, cl: [1], leg: W(4), pt: "As ruínas do grande templo asteca de Tenochtitlan, descobertas em 1978, com museu. Pago; fecha à segunda.", en: "The ruins of Tenochtitlan's great Aztec temple, found in 1978, with a museum. Paid; closed Mondays." },
      { id: "mx-madero", n: "Calle Madero e Casa de los Azulejos", a: "Centro Histórico", lat: 19.4338, lng: -99.1399, v: 20, leg: W(12), pt: "A rua pedonal do centro, com o palácio do século XVIII forrado a azulejos de Puebla e a Torre Latinoamericana.", en: "The pedestrian street of the centre, with the 18th-century palace covered in Puebla tiles and the Torre Latinoamericana." },
      { id: "mx-bellas", n: "Palácio de Bellas Artes e Alameda", a: "Centro", lat: 19.4352, lng: -99.1412, v: 30, top: true, o: true, leg: W(4), pt: "O palácio de mármore Art Nouveau com murais de Rivera e a cúpula laranja; à frente, o parque Alameda Central.", en: "The Art Nouveau marble palace with Rivera murals and an orange dome; in front, the Alameda Central park." },
      { id: "mx-antropologia", n: "Museu Nacional de Antropologia", a: "Chapultepec", lat: 19.426, lng: -99.1863, v: 75, top: true, o: true, cl: [1], leg: { m: "bus", min: 25, line: "Metrobús Linha 7 Hidalgo → Antropología", r: 1 }, pt: "A Pedra do Sol asteca e as salas maia e olmeca num dos grandes museus do mundo, no bosque de Chapultepec. Fecha à segunda.", en: "The Aztec Sun Stone and the Maya and Olmec halls in one of the world's great museums, in Chapultepec forest. Closed Mondays." },
      { id: "mx-condesa", n: "Condesa e Roma", a: "Condesa", lat: 19.4119, lng: -99.17, v: 45, x: true, leg: { m: "car", min: 15, line: "Uber Chapultepec → Parque México", f: 80 }, pt: "Avenidas de jacarandás, prédios Art Déco à volta do Parque México e os cafés, taquerias e mercados de Roma.", en: "Jacaranda-lined avenues, Art Deco buildings around Parque México and the cafés, taquerías and markets of Roma." }
    ]
  },
  {
    id: "rio", n: names("Rio de Janeiro", "Rio de Janeiro", "Río de Janeiro", "Rio de Janeiro", "Rio de Janeiro"), cur: "BRL",
    ap: { iata: "GIG", name: "Galeão (GIG)", lat: -22.809, lng: -43.2506 }, tz: "America/Sao_Paulo",
    single: 7.9, card: 0, cardName: "", alt: null,
    air: { m: "car", min: 40, line: "Táxi/Uber Galeão → Lapa", f: 70 },
    ret: { core: { m: "car", min: 50, line: "Táxi/Uber Copacabana → Galeão", f: 90 }, extra: { m: "car", min: 45, line: "Táxi/Uber Urca → Galeão", f: 90 } },
    stops: [
      { id: "rio-selaron", n: "Escadaria Selarón", a: "Lapa", lat: -22.9153, lng: -43.1791, v: 20, top: true, leg: W(0), pt: "Os 215 degraus cobertos de azulejos de mais de 60 países, obra de 20 anos do artista chileno Jorge Selarón.", en: "The 215 steps covered in tiles from over 60 countries, a 20-year work by Chilean artist Jorge Selarón." },
      { id: "rio-arcos", n: "Arcos da Lapa", a: "Lapa", lat: -22.9132, lng: -43.18, v: 10, leg: W(5), pt: "O aqueduto de 1750 que hoje leva o bondinho de Santa Teresa; à noite, o bairro da Lapa é o centro do samba.", en: "The 1750 aqueduct that now carries the Santa Teresa tram; at night, Lapa is the heart of samba." },
      { id: "rio-theatro", n: "Theatro Municipal e Cinelândia", a: "Centro", lat: -22.909, lng: -43.1765, v: 20, leg: W(10), pt: "O teatro de 1909 inspirado na Ópera de Paris, a Biblioteca Nacional e a praça Floriano com os seus cafés.", en: "The 1909 theatre modelled on the Paris Opera, the National Library and Floriano square with its cafés." },
      { id: "rio-amanha", n: "Museu do Amanhã e Praça Mauá", a: "Porto Maravilha", lat: -22.8944, lng: -43.1794, v: 40, o: true, leg: { m: "tram", min: 15, line: "VLT Cinelândia → Parada dos Museus", r: 1 }, pt: "O museu de ciência de Santiago Calatrava sobre a baía e, ao lado, o mural gigante Etnias de Kobra no Boulevard Olímpico.", en: "Santiago Calatrava's science museum on the bay and, nearby, Kobra's giant Etnias mural on the Olympic Boulevard." },
      { id: "rio-cristo", n: "Cristo Redentor", a: "Corcovado", lat: -22.9519, lng: -43.2105, v: 60, top: true, o: true, leg: { m: "car", min: 30, line: "Táxi/Uber → Trem do Corcovado (Cosme Velho)", f: 35 }, pt: "A estátua de 1931 a 700 metros de altura. Suba no comboio de cremalheira pela floresta da Tijuca (pago) e vá cedo, antes das nuvens.", en: "The 1931 statue 700 metres up. Ride the rack railway through Tijuca forest (paid) and go early, before the clouds." },
      { id: "rio-copa", n: "Copacabana", a: "Copacabana", lat: -22.9711, lng: -43.1822, v: 45, top: true, leg: { m: "car", min: 25, line: "Táxi/Uber Cosme Velho → Copacabana", f: 30 }, pt: "Quatro quilómetros de areia e o calçadão de ondas pretas e brancas de Burle Marx, com quiosques de água de coco.", en: "Four kilometres of sand and Burle Marx's black-and-white wave promenade, with coconut-water kiosks." },
      { id: "rio-pao", n: "Pão de Açúcar", a: "Urca", lat: -22.9493, lng: -43.1546, v: 75, x: true, top: true, o: true, leg: { m: "bus", min: 25, line: "Autocarro → Praia Vermelha (Urca)", r: 1 }, pt: "O teleférico de 1912 em duas etapas até ao topo: a baía, as praias e o Cristo ao pôr do sol (pago).", en: "The 1912 cable car in two stages to the summit: the bay, the beaches and Christ the Redeemer at sunset (paid)." }
    ]
  },
  {
    id: "bue", n: names("Buenos Aires", "Buenos Aires", "Buenos Aires", "Buenos Aires", "Buenos Aires"), cur: "ARS",
    ap: { iata: "EZE", name: "Ezeiza (EZE)", lat: -34.8222, lng: -58.5358 }, tz: "America/Argentina/Buenos_Aires",
    single: 1400, card: 0, cardName: "", alt: null,
    air: { m: "bus", min: 60, line: "Autocarro Tienda León Ezeiza → Puerto Madero", f: 20000 },
    ret: { core: { m: "car", min: 50, line: "Táxi/remis La Boca → Ezeiza", f: 45000 }, extra: { m: "car", min: 55, line: "Táxi/remis Recoleta → Ezeiza", f: 50000 } },
    stops: [
      { id: "ba-mayo", n: "Plaza de Mayo e Casa Rosada", a: "Monserrat", lat: -34.6083, lng: -58.3712, v: 25, top: true, leg: W(15, "Subte A Plaza de Mayo"), pt: "A praça das revoluções e das Mães da Plaza de Mayo, com o palácio presidencial cor-de-rosa e a catedral onde o papa Francisco foi arcebispo.", en: "The square of revolutions and of the Mothers of the Plaza de Mayo, with the pink presidential palace and the cathedral where Pope Francis was archbishop." },
      { id: "ba-tortoni", n: "Avenida de Mayo e Café Tortoni", a: "Monserrat", lat: -34.6088, lng: -58.3786, v: 25, leg: W(10), pt: "A avenida de inspiração parisiense e o café de 1858 onde se sentaram Borges e Gardel; à noite há tango.", en: "The Parisian-style avenue and the 1858 café where Borges and Gardel sat; tango shows at night." },
      { id: "ba-obelisco", n: "Obelisco e Teatro Colón", a: "San Nicolás", lat: -34.6037, lng: -58.3816, v: 30, top: true, o: true, leg: W(10, "Pela Avenida 9 de Julio"), pt: "O obelisco de 1936 na avenida mais larga do mundo e, a dois quarteirões, o teatro de ópera com a melhor acústica (visita paga).", en: "The 1936 obelisk on the world's widest avenue and, two blocks away, the opera house with the finest acoustics (paid tour)." },
      { id: "ba-santelmo", n: "San Telmo e Plaza Dorrego", a: "San Telmo", lat: -34.6205, lng: -58.3717, v: 40, leg: { m: "bus", min: 20, line: "Autocarro 29 → San Telmo", r: 1 }, pt: "Casarões coloniais, antiquários e o mercado de 1897; ao domingo, a feira de rua e o tango na praça.", en: "Colonial mansions, antique shops and the 1897 market; on Sundays, the street fair and tango on the square." },
      { id: "ba-boca", n: "La Boca e Caminito", a: "La Boca", lat: -34.6393, lng: -58.3629, v: 40, top: true, leg: { m: "bus", min: 20, line: "Autocarro 29 → La Boca", r: 1 }, pt: "As casas de chapa pintadas com as sobras de tinta dos barcos e o estádio La Bombonera. Fique na zona turística e saia antes do anoitecer.", en: "Tin houses painted with leftover ship paint and La Bombonera stadium. Stay in the tourist area and leave before dark." },
      { id: "ba-recoleta", n: "Cemitério da Recoleta", a: "Recoleta", lat: -34.5875, lng: -58.3934, v: 45, x: true, top: true, o: true, leg: { m: "car", min: 25, line: "Táxi/Uber La Boca → Recoleta", f: 9000 }, pt: "Uma cidade de mausoléus de mármore, onde está Eva Perón; à volta, cafés, jardins e a flor de aço Floralis Genérica.", en: "A city of marble mausoleums where Eva Perón lies; around it, cafés, gardens and the steel Floralis Genérica flower." }
    ]
  }
];

export const AMERICAS_NAMES: Record<string, Record<string, string>> = {
  lax: { it: "Los Angeles", zh: "洛杉矶", ar: "لوس أنجلوس", ja: "ロサンゼルス", tr: "Los Angeles", ru: "Лос-Анджелес", ko: "로스앤젤레스" },
  las: { it: "Las Vegas", zh: "拉斯维加斯", ar: "لاس فيغاس", ja: "ラスベガス", tr: "Las Vegas", ru: "Лас-Вегас", ko: "라스베이거스" },
  msy: { it: "New Orleans", zh: "新奥尔良", ar: "نيو أورلينز", ja: "ニューオーリンズ", tr: "New Orleans", ru: "Новый Орлеан", ko: "뉴올리언스" },
  mco: { it: "Orlando", zh: "奥兰多", ar: "أورلاندو", ja: "オーランド", tr: "Orlando", ru: "Орландо", ko: "올랜도" },
  yyz: { it: "Toronto", zh: "多伦多", ar: "تورونتو", ja: "トロント", tr: "Toronto", ru: "Торонто", ko: "토론토" },
  mex: { it: "Città del Messico", zh: "墨西哥城", ar: "مكسيكو سيتي", ja: "メキシコシティ", tr: "Mexico City", ru: "Мехико", ko: "멕시코시티" },
  rio: { it: "Rio de Janeiro", zh: "里约热内卢", ar: "ريو دي جانيرو", ja: "リオデジャネイロ", tr: "Rio de Janeiro", ru: "Рио-де-Жанейро", ko: "리우데자네이루" },
  bue: { it: "Buenos Aires", zh: "布宜诺斯艾利斯", ar: "بوينس آيرس", ja: "ブエノスアイレス", tr: "Buenos Aires", ru: "Буэнос-Айрес", ko: "부에노스아이레스" }
};
