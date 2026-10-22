/**
 * Conteúdo das cidades da versão 1.
 * Tarifas de referência de 2026 — rever todos os anos em janeiro.
 * leg: ligação desde a paragem anterior (a primeira paragem liga ao aeroporto via `air`).
 *   r = viagens pagas com a tarifa da cidade · f = bilhete fixo (ligação ao aeroporto, não coberto por passes)
 */
export type Mode = "walk" | "metro" | "tram" | "bus" | "train" | "ferry" | "car";
export type Leg = { m: Mode; min: number; line?: string; r?: number; f?: number };
export type Alt =
  | { type: "pass"; price: number; name: string; includesAirport?: boolean }
  | { type: "pack"; price: number; n: number; name: string }
  | { type: "cap"; price: number; name: string };
export type Stop = {
  id: string; n: string; a: string; lat: number; lng: number;
  v: number;          // minutos de visita
  top?: boolean;      // ponto mais famoso
  x?: boolean;        // pertence à extensão opcional
  c?: number;         // custo aproximado incluído no roteiro
  o?: boolean;        // interior pago opcional
  leg: Leg;
  pt: string; en: string;
  cl?: number[];      // dias da semana em que o interior está fechado (0 = domingo)
};
export type City = {
  id: string; n: Record<string, string>; cur: CityCur;
  single: number; card: number; cardName: string; alt: Alt | null;
  air: Leg; ret: { core: Leg; extra: Leg }; stops: Stop[];
  ap?: Airport;       // aeroporto principal
  tz?: string;        // fuso horário (IANA)
};
export type CityCur = "EUR" | "GBP" | "TRY" | "AED" | "QAR" | "SAR" | "EGP" | "JOD" | "OMR" | "CZK" | "SGD"
  | "USD" | "CAD" | "MXN" | "BRL" | "ARS" | "MAD" | "ZAR" | "TZS" | "TND" | "ETB" | "KES" | "AOA" | "GHS" | "RWF" | "XOF";
export type Airport = { iata: string; name: string; lat: number; lng: number };
/** Zona de fronteira: Reino Unido, Turquia e cada país do Médio Oriente têm regras de entrada próprias; o resto é espaço Schengen. */
export { zoneOf, COUNTRY, type Zone } from "./city-meta";

import { ME_CITIES, ME_NAMES } from "./cities-me";
import { MORE_CITIES, MORE_CITY_NAMES } from "./cities-more";
import { US_CITIES, US_NAMES } from "./cities-world";

const W = (min: number, line = ""): Leg => ({ m: "walk", min, line });
const names = (pt: string, en: string, es: string, fr: string, de: string) => ({ pt, en, es, fr, de });

export const CITIES: City[] = [
  {
    id: "lis", n: names("Lisboa", "Lisbon", "Lisboa", "Lisbonne", "Lissabon"), cur: "EUR",
    ap: { iata: "LIS", name: "Aeroporto Humberto Delgado", lat: 38.7742, lng: -9.1342 }, tz: "Europe/Lisbon",
    single: 1.9, card: 0.5, cardName: "cartão Navegante",
    alt: { type: "pass", price: 7.25, name: "Passe 24h Carris/Metro" },
    air: { m: "metro", min: 30, line: "Metro Vermelha → Alameda → Verde", r: 1 },
    ret: { core: { m: "metro", min: 30, line: "Restauradores: Azul → Vermelha", r: 1 }, extra: { m: "tram", min: 60, line: "15E + Metro Verde → Vermelha", r: 2 } },
    stops: [
      { id: "rossio", n: "Rossio", a: "Baixa", lat: 38.7139, lng: -9.1394, v: 15, top: true, leg: W(0, "Metro Rossio"), pt: "Praça central da Baixa pombalina, com a calçada em ondas e a fachada manuelina da estação.", en: "The Baixa's central square, with wave-patterned cobbles and the station's Manueline façade." },
      { id: "comercio", n: "Praça do Comércio", a: "Baixa", lat: 38.7075, lng: -9.1364, v: 25, top: true, leg: W(8, "Rua Augusta"), pt: "A Rua Augusta acaba no arco e abre para a grande praça sobre o Tejo, refeita depois do terramoto de 1755.", en: "Rua Augusta ends at the arch and opens onto the great riverside square rebuilt after the 1755 earthquake." },
      { id: "se", n: "Sé de Lisboa", a: "Alfama", lat: 38.7098, lng: -9.133, v: 15, o: true, leg: W(7), pt: "A catedral mais antiga da cidade, com ar de fortaleza. O claustro é pago e opcional.", en: "The city's oldest cathedral, built like a fortress. The cloister is paid and optional." },
      { id: "santa-luzia", n: "Miradouro de Santa Luzia", a: "Alfama", lat: 38.7116, lng: -9.1301, v: 20, top: true, leg: W(8), pt: "Terraços com azulejos sobre os telhados de Alfama e o rio.", en: "Tiled terraces above Alfama's rooftops and the river." },
      { id: "graca", n: "Miradouro da Graça", a: "Graça", lat: 38.7163, lng: -9.1316, v: 20, leg: W(12), pt: "Vista larga sobre o Castelo e a Baixa, à sombra de pinheiros e com menos gente.", en: "A wide view of the castle and Baixa under pine trees, with fewer crowds." },
      { id: "carmo", n: "Largo do Carmo e Chiado", a: "Chiado", lat: 38.712, lng: -9.1405, v: 20, top: true, leg: { m: "tram", min: 20, line: "Elétrico 28", r: 1 }, pt: "Depois do mítico elétrico 28, as ruínas do convento sem tecto e as livrarias da Rua Garrett.", en: "After the famous tram 28, the roofless convent ruins and the old bookshops of Rua Garrett." },
      { id: "sao-pedro", n: "São Pedro de Alcântara", a: "Bairro Alto", lat: 38.7155, lng: -9.1446, v: 15, leg: W(8), pt: "Jardim-miradouro com vista frontal para o Castelo e a Graça.", en: "A garden viewpoint facing the castle and Graça head-on." },
      { id: "jeronimos", n: "Jerónimos e Pastéis de Belém", a: "Belém", lat: 38.6979, lng: -9.2068, v: 35, top: true, x: true, c: 1.5, o: true, cl: [1], leg: { m: "tram", min: 35, line: "Cais do Sodré → 15E", r: 1 }, pt: "Fachada manuelina do mosteiro e os pastéis de nata mais famosos, ao lado. Custo aproximado de um pastel.", en: "The monastery's Manueline façade and the most famous custard tarts next door. Price is roughly one tart." },
      { id: "torre-belem", n: "Torre de Belém", a: "Belém", lat: 38.6916, lng: -9.216, v: 30, x: true, o: true, cl: [1], leg: W(15, "Beira-rio"), pt: "Passeio plano pelo Padrão dos Descobrimentos até à torre do século XVI.", en: "A flat riverside walk past the Discoveries monument to the 16th-century tower." }
    ]
  },
  {
    id: "opo", n: names("Porto", "Porto", "Oporto", "Porto", "Porto"), cur: "EUR",
    ap: { iata: "OPO", name: "Aeroporto Francisco Sá Carneiro", lat: 41.2481, lng: -8.6814 }, tz: "Europe/Lisbon",
    single: 1.4, card: 0.6, cardName: "cartão Andante", alt: null,
    air: { m: "metro", min: 35, line: "Metro E → Trindade (Z4)", f: 2.3 },
    ret: { core: { m: "metro", min: 40, line: "São Bento → Metro D/E (Z4)", f: 2.3 }, extra: { m: "bus", min: 60, line: "Autocarro 500 + Metro E", r: 1, f: 2.3 } },
    stops: [
      { id: "aliados", n: "Avenida dos Aliados", a: "Baixa", lat: 41.1484, lng: -8.611, v: 15, leg: W(5, "Trindade"), pt: "A avenida monumental da Câmara Municipal, coração do Porto.", en: "The grand avenue of the City Hall, the heart of Porto." },
      { id: "clerigos", n: "Torre dos Clérigos e Livraria Lello", a: "Vitória", lat: 41.1457, lng: -8.6146, v: 25, top: true, o: true, leg: W(8), pt: "A torre barroca que domina a cidade e a livraria neogótica mais fotografada. Ambas com entrada paga, opcional.", en: "The baroque tower above the city and the most photographed neo-Gothic bookshop. Both paid, optional." },
      { id: "sao-bento", n: "Estação de São Bento", a: "Baixa", lat: 41.1456, lng: -8.6106, v: 15, top: true, leg: W(7), pt: "Átrio com 20 mil azulejos que contam a história de Portugal. Entrada livre.", en: "A hall lined with 20,000 tiles telling Portugal's story. Free entry." },
      { id: "se-porto", n: "Sé do Porto", a: "Sé", lat: 41.1428, lng: -8.6112, v: 15, o: true, leg: W(6), pt: "Catedral-fortaleza no ponto mais alto do centro histórico.", en: "A fortress cathedral on the highest point of the old town." },
      { id: "ponte-luis", n: "Ponte Luís I e Serra do Pilar", a: "Gaia", lat: 41.1376, lng: -8.6087, v: 20, top: true, leg: W(10, "Tabuleiro superior"), pt: "Atravesse o tabuleiro de cima da ponte de ferro até ao miradouro com a melhor vista da Ribeira.", en: "Cross the iron bridge's upper deck to the viewpoint with the best view of Ribeira." },
      { id: "ribeira", n: "Ribeira", a: "Ribeira", lat: 41.1405, lng: -8.6134, v: 30, top: true, leg: W(20, "Tabuleiro inferior"), pt: "Desça a Gaia, passe as caves de vinho do Porto e volte pela ponte de baixo até ao cais colorido.", en: "Walk down past the port wine cellars and back over the lower deck to the colourful quay." },
      { id: "foz", n: "Foz do Douro", a: "Foz", lat: 41.1497, lng: -8.6766, v: 40, x: true, leg: { m: "bus", min: 25, line: "Autocarro 500", r: 1 }, pt: "O rio encontra o mar: passeio marítimo, farol e pôr do sol.", en: "Where the river meets the sea: promenade, lighthouse and sunset." }
    ]
  },
  {
    id: "mad", n: names("Madrid", "Madrid", "Madrid", "Madrid", "Madrid"), cur: "EUR",
    ap: { iata: "MAD", name: "Adolfo Suárez Madrid-Barajas", lat: 40.4936, lng: -3.5668 }, tz: "Europe/Madrid",
    single: 2.0, card: 2.5, cardName: "tarjeta Multi",
    alt: { type: "pack", price: 7.3, n: 10, name: "Metro 10 viajes" },
    air: { m: "metro", min: 40, line: "L8 → Nuevos Ministerios → L10/L1 Sol", r: 1, f: 3.0 },
    ret: { core: { m: "metro", min: 40, line: "Gran Vía L1 → L8", r: 1, f: 3.0 }, extra: { m: "metro", min: 45, line: "Retiro L2 → L8", r: 1, f: 3.0 } },
    stops: [
      { id: "sol", n: "Puerta del Sol", a: "Centro", lat: 40.4169, lng: -3.7035, v: 15, top: true, leg: W(0, "Sol"), pt: "O quilómetro zero de Espanha, com o urso e o medronheiro.", en: "Spain's kilometre zero, with the bear and strawberry-tree statue." },
      { id: "plaza-mayor", n: "Plaza Mayor", a: "Centro", lat: 40.4155, lng: -3.7074, v: 15, top: true, leg: W(5), pt: "Praça porticada do século XVII, rodeada de arcadas.", en: "A 17th-century arcaded square." },
      { id: "san-miguel", n: "Mercado de San Miguel", a: "Centro", lat: 40.4154, lng: -3.709, v: 20, leg: W(2), pt: "Mercado de ferro e vidro com tapas ao balcão.", en: "An iron-and-glass market with tapas at the counter." },
      { id: "palacio-real", n: "Palacio Real e Almudena", a: "Ópera", lat: 40.418, lng: -3.7143, v: 25, top: true, o: true, leg: W(10), pt: "O maior palácio real da Europa ocidental e a catedral em frente. Exteriores gratuitos.", en: "Western Europe's largest royal palace and the cathedral opposite. Exteriors are free." },
      { id: "debod", n: "Templo de Debod", a: "Moncloa", lat: 40.424, lng: -3.7177, v: 15, leg: W(12), pt: "Templo egípcio verdadeiro num jardim alto, famoso ao pôr do sol.", en: "A genuine Egyptian temple in a hilltop park, famous at sunset." },
      { id: "gran-via", n: "Gran Vía", a: "Centro", lat: 40.42, lng: -3.7016, v: 20, top: true, leg: W(15), pt: "A avenida dos teatros e dos edifícios do início do século XX.", en: "The avenue of theatres and early 20th-century buildings." },
      { id: "prado", n: "Museo del Prado", a: "Paseo del Prado", lat: 40.4138, lng: -3.6921, v: 45, x: true, top: true, leg: W(15, "Cibeles"), pt: "Entrada gratuita nas duas últimas horas de cada dia. Velázquez, Goya, Bosch.", en: "Free entry in the last two hours each day. Velázquez, Goya, Bosch." },
      { id: "retiro", n: "Parque del Retiro", a: "Retiro", lat: 40.4153, lng: -3.6845, v: 30, x: true, leg: W(8, "Puerta de Alcalá"), pt: "O grande parque da cidade: lago dos barcos e Palácio de Cristal.", en: "The city's great park: boating lake and Crystal Palace." }
    ]
  },
  {
    id: "bcn", n: names("Barcelona", "Barcelona", "Barcelona", "Barcelone", "Barcelona"), cur: "EUR",
    ap: { iata: "BCN", name: "Josep Tarradellas Barcelona-El Prat", lat: 41.2974, lng: 2.0833 }, tz: "Europe/Madrid",
    single: 2.9, card: 0, cardName: "",
    alt: { type: "pack", price: 13.0, n: 10, name: "T-casual 10 viagens" },
    air: { m: "metro", min: 50, line: "L9 Sud → L1 Catalunya", f: 5.9 },
    ret: { core: { m: "metro", min: 50, line: "Passeig de Gràcia → L9 Sud", f: 5.9 }, extra: { m: "metro", min: 55, line: "Barceloneta L4 → L9 Sud", f: 5.9 } },
    stops: [
      { id: "catalunya", n: "Plaça de Catalunya", a: "Centre", lat: 41.387, lng: 2.17, v: 10, leg: W(0, "Catalunya"), pt: "A praça que liga a cidade antiga ao Eixample.", en: "The square linking the old city to the Eixample." },
      { id: "rambla", n: "La Rambla e Boqueria", a: "Ciutat Vella", lat: 41.3817, lng: 2.1716, v: 25, top: true, leg: W(5), pt: "O passeio mais famoso e o mercado de fruta, presunto e sumos.", en: "The famous promenade and the market of fruit, ham and juices." },
      { id: "gotic", n: "Bairro Gótico e Catedral", a: "Gòtic", lat: 41.384, lng: 2.1762, v: 25, top: true, o: true, leg: W(8), pt: "Ruelas medievais, a Plaça Sant Jaume e a fachada da catedral.", en: "Medieval lanes, Plaça Sant Jaume and the cathedral façade." },
      { id: "santa-maria", n: "Santa Maria del Mar", a: "El Born", lat: 41.3838, lng: 2.182, v: 15, leg: W(10), pt: "O gótico catalão mais puro, no bairro boémio do Born.", en: "Pure Catalan Gothic in the bohemian Born district." },
      { id: "sagrada", n: "Sagrada Família", a: "Eixample", lat: 41.4036, lng: 2.1744, v: 25, top: true, o: true, leg: { m: "metro", min: 20, line: "Jaume I L4 → L5", r: 1 }, pt: "A basílica de Gaudí. Vale a pena dar a volta completa ao exterior.", en: "Gaudí's basilica. Walk all the way around the outside." },
      { id: "batllo", n: "Casa Batlló e La Pedrera", a: "Passeig de Gràcia", lat: 41.3916, lng: 2.1649, v: 25, top: true, o: true, leg: { m: "metro", min: 12, line: "L5 → Diagonal", r: 1 }, pt: "Duas casas de Gaudí no mesmo passeio. Fachadas gratuitas.", en: "Two Gaudí houses on one avenue. The façades are free." },
      { id: "barceloneta", n: "Barceloneta", a: "Barceloneta", lat: 41.3784, lng: 2.1925, v: 40, x: true, leg: { m: "metro", min: 15, line: "L4 Barceloneta", r: 1 }, pt: "Praia urbana e passeio marítimo até ao porto olímpico.", en: "City beach and promenade towards the Olympic port." }
    ]
  },
  {
    id: "par", n: names("Paris", "Paris", "París", "Paris", "Paris"), cur: "EUR",
    ap: { iata: "CDG", name: "Paris-Charles de Gaulle", lat: 49.0097, lng: 2.5479 }, tz: "Europe/Paris",
    single: 2.55, card: 2.0, cardName: "Navigo Easy",
    alt: { type: "pass", price: 30.6, name: "Paris Visite 1 jour", includesAirport: true },
    air: { m: "train", min: 35, line: "RER B CDG → Saint-Michel", f: 14.0 },
    ret: { core: { m: "train", min: 55, line: "Métro → Châtelet → RER B", f: 14.0 }, extra: { m: "train", min: 45, line: "Gare du Nord → RER B", f: 14.0 } },
    stops: [
      { id: "notre-dame", n: "Notre-Dame", a: "Île de la Cité", lat: 48.853, lng: 2.3499, v: 25, top: true, leg: W(5, "Saint-Michel"), pt: "A catedral reaberta depois do incêndio. Entrada gratuita.", en: "The cathedral reopened after the fire. Free entry." },
      { id: "pont-neuf", n: "Pont Neuf e Sainte-Chapelle", a: "Île de la Cité", lat: 48.8554, lng: 2.345, v: 15, o: true, leg: W(6), pt: "A ponte mais antiga de Paris e a capela de vitrais. Interior pago, opcional.", en: "Paris's oldest bridge and the stained-glass chapel. Paid interior, optional." },
      { id: "louvre", n: "Louvre", a: "1er", lat: 48.8606, lng: 2.3376, v: 20, top: true, o: true, leg: W(12), pt: "A pirâmide e os pátios do palácio são de acesso livre.", en: "The pyramid and palace courtyards are free to walk." },
      { id: "tuileries", n: "Jardin des Tuileries", a: "1er", lat: 48.8635, lng: 2.3275, v: 15, leg: W(5), pt: "Jardim à francesa entre o Louvre e a Concorde.", en: "Formal French garden between the Louvre and Concorde." },
      { id: "concorde", n: "Concorde e Champs-Élysées", a: "8e", lat: 48.8656, lng: 2.3212, v: 15, leg: W(8), pt: "O obelisco e o início da avenida mais famosa.", en: "The obelisk and the start of the famous avenue." },
      { id: "arc", n: "Arc de Triomphe", a: "8e", lat: 48.8738, lng: 2.295, v: 15, top: true, leg: { m: "metro", min: 10, line: "Métro 1", r: 1 }, pt: "O arco no topo dos Champs-Élysées.", en: "The arch at the top of the Champs-Élysées." },
      { id: "eiffel", n: "Trocadéro e Torre Eiffel", a: "16e", lat: 48.8616, lng: 2.2893, v: 30, top: true, leg: { m: "metro", min: 10, line: "Métro 6", r: 1 }, pt: "A melhor vista da torre fica no Trocadéro. Depois atravesse até ao Campo de Marte.", en: "The best tower view is from Trocadéro. Then cross to the Champ de Mars." },
      { id: "montmartre", n: "Montmartre e Sacré-Cœur", a: "18e", lat: 48.8867, lng: 2.3431, v: 40, x: true, top: true, leg: { m: "metro", min: 30, line: "Métro 6 → 2 Anvers", r: 1 }, pt: "A basílica branca no alto da colina e as ruelas dos pintores.", en: "The white basilica on the hill and the painters' lanes." }
    ]
  },
  {
    id: "lon", n: names("Londres", "London", "Londres", "Londres", "London"), cur: "GBP",
    ap: { iata: "LHR", name: "London Heathrow", lat: 51.47, lng: -0.4543 }, tz: "Europe/London",
    single: 3.0, card: 0, cardName: "",
    alt: { type: "cap", price: 8.9, name: "Teto zonas 1–2" },
    air: { m: "metro", min: 55, line: "Piccadilly → Green Park → Jubilee", f: 5.9 },
    ret: { core: { m: "metro", min: 55, line: "Covent Garden → Piccadilly", f: 5.9 }, extra: { m: "metro", min: 65, line: "Tower Hill → District → Piccadilly", f: 5.9 } },
    stops: [
      { id: "westminster", n: "Westminster e Big Ben", a: "Westminster", lat: 51.5007, lng: -0.1246, v: 20, top: true, leg: W(0, "Westminster"), pt: "O Parlamento, a torre do relógio e a vista da ponte.", en: "Parliament, the clock tower and the view from the bridge." },
      { id: "abbey", n: "Westminster Abbey", a: "Westminster", lat: 51.4993, lng: -0.1273, v: 10, o: true, cl: [0], leg: W(3), pt: "Onde são coroados os reis. Exterior gratuito.", en: "Where monarchs are crowned. Exterior is free." },
      { id: "buckingham", n: "Buckingham Palace", a: "St James's", lat: 51.5014, lng: -0.1419, v: 25, top: true, leg: W(15, "St James's Park"), pt: "Pelo parque de St James's até ao palácio e à troca da guarda, em dias selecionados.", en: "Through St James's Park to the palace and the Changing of the Guard on selected days." },
      { id: "trafalgar", n: "Trafalgar Square e National Gallery", a: "West End", lat: 51.508, lng: -0.1281, v: 30, top: true, leg: W(15, "The Mall"), pt: "A praça da coluna de Nelson e um museu de pintura gratuito.", en: "Nelson's Column square and a free painting museum." },
      { id: "covent", n: "Covent Garden", a: "West End", lat: 51.5117, lng: -0.124, v: 20, leg: W(8), pt: "Mercado coberto, artistas de rua e lojas.", en: "Covered market, street performers and shops." },
      { id: "st-pauls", n: "St Paul's e Tate Modern", a: "City / Bankside", lat: 51.5076, lng: -0.0994, v: 35, x: true, top: true, cl: [0], leg: { m: "metro", min: 15, line: "Central → St Paul's", r: 1 }, pt: "A cúpula de St Paul's, a ponte Millennium e o museu de arte moderna gratuito.", en: "St Paul's dome, the Millennium Bridge and the free modern art museum." },
      { id: "tower-bridge", n: "Tower Bridge", a: "Tower Hill", lat: 51.5055, lng: -0.0754, v: 20, x: true, top: true, leg: W(25, "South Bank"), pt: "Pela margem sul até à ponte mais fotografada de Londres.", en: "Along the South Bank to London's most photographed bridge." }
    ]
  },
  {
    id: "rom", n: names("Roma", "Rome", "Roma", "Rome", "Rom"), cur: "EUR",
    ap: { iata: "FCO", name: "Roma Fiumicino", lat: 41.8003, lng: 12.2389 }, tz: "Europe/Rome",
    single: 1.5, card: 0, cardName: "",
    alt: { type: "pass", price: 8.5, name: "Passe 24h ATAC" },
    air: { m: "train", min: 32, line: "Leonardo Express → Termini", f: 14.0 },
    ret: { core: { m: "train", min: 50, line: "Spagna Metro A → Termini → Leonardo", r: 1, f: 14.0 }, extra: { m: "train", min: 55, line: "Ottaviano Metro A → Termini → Leonardo", r: 1, f: 14.0 } },
    stops: [
      { id: "coliseu", n: "Coliseu", a: "Monti", lat: 41.8902, lng: 12.4922, v: 20, top: true, o: true, leg: { m: "metro", min: 10, line: "Metro B → Colosseo", r: 1 }, pt: "O anfiteatro de Roma. O exterior e a Via Sacra veem-se de graça.", en: "Rome's amphitheatre. The exterior and Via Sacra are free to see." },
      { id: "foruns", n: "Fóruns Imperiais", a: "Monti", lat: 41.8925, lng: 12.4853, v: 15, leg: W(5, "Via dei Fori Imperiali"), pt: "A avenida ladeada pelas ruínas dos fóruns.", en: "The avenue lined with forum ruins." },
      { id: "vittoriano", n: "Vittoriano", a: "Piazza Venezia", lat: 41.8946, lng: 12.4831, v: 15, leg: W(8), pt: "O monumento branco com terraços sobre a cidade antiga.", en: "The white monument with terraces over the ancient city." },
      { id: "panteao", n: "Panteão", a: "Centro storico", lat: 41.8986, lng: 12.4769, v: 20, top: true, c: 5.0, leg: W(12), pt: "O templo romano mais bem conservado e a sua cúpula aberta. Entrada paga.", en: "The best-preserved Roman temple and its open dome. Paid entry." },
      { id: "navona", n: "Piazza Navona", a: "Centro storico", lat: 41.8992, lng: 12.4731, v: 15, top: true, leg: W(5), pt: "Praça barroca com a Fonte dos Quatro Rios de Bernini.", en: "Baroque square with Bernini's Four Rivers Fountain." },
      { id: "trevi", n: "Fontana di Trevi", a: "Trevi", lat: 41.9009, lng: 12.4833, v: 15, top: true, leg: W(12), pt: "A fonte mais famosa do mundo. Confirme as regras de acesso junto à fonte.", en: "The world's most famous fountain. Check the access rules by the basin." },
      { id: "spagna", n: "Piazza di Spagna", a: "Tridente", lat: 41.9058, lng: 12.4823, v: 15, leg: W(10), pt: "A escadaria e a Via Condotti.", en: "The Spanish Steps and Via Condotti." },
      { id: "sao-pedro-vat", n: "Praça de São Pedro", a: "Vaticano", lat: 41.9022, lng: 12.4539, v: 35, x: true, top: true, leg: { m: "metro", min: 25, line: "Metro A → Ottaviano", r: 1 }, pt: "A colunata de Bernini e a basílica. Entrada na basílica gratuita.", en: "Bernini's colonnade and the basilica. Basilica entry is free." }
    ]
  },
  {
    id: "ams", n: names("Amesterdão", "Amsterdam", "Ámsterdam", "Amsterdam", "Amsterdam"), cur: "EUR",
    ap: { iata: "AMS", name: "Amsterdam Schiphol", lat: 52.3105, lng: 4.7683 }, tz: "Europe/Amsterdam",
    single: 3.4, card: 0, cardName: "",
    alt: { type: "pass", price: 10.0, name: "GVB 24h" },
    air: { m: "train", min: 15, line: "NS Schiphol → Centraal (OVpay)", f: 5.5 },
    ret: { core: { m: "train", min: 30, line: "Centraal → NS Schiphol", f: 5.5 }, extra: { m: "tram", min: 40, line: "Tram 2 → Centraal → NS", r: 1, f: 5.5 } },
    stops: [
      { id: "centraal", n: "Centraal e Damrak", a: "Centrum", lat: 52.3791, lng: 4.9003, v: 10, leg: W(0, "Centraal"), pt: "A estação neogótica e as casas inclinadas do Damrak.", en: "The neo-Gothic station and the leaning houses of Damrak." },
      { id: "dam", n: "Praça Dam", a: "Centrum", lat: 52.3731, lng: 4.8926, v: 15, top: true, o: true, leg: W(10), pt: "O Palácio Real e o Monumento Nacional.", en: "The Royal Palace and the National Monument." },
      { id: "begijnhof", n: "Begijnhof", a: "Centrum", lat: 52.3693, lng: 4.8899, v: 15, leg: W(8), pt: "Um pátio escondido com a casa de madeira mais antiga da cidade.", en: "A hidden courtyard with the city's oldest wooden house." },
      { id: "bloemenmarkt", n: "Bloemenmarkt", a: "Singel", lat: 52.3667, lng: 4.8918, v: 10, leg: W(7), pt: "O mercado das flores flutuante no canal Singel.", en: "The floating flower market on the Singel canal." },
      { id: "nove-ruas", n: "Nove Ruas", a: "Grachtengordel", lat: 52.37, lng: 4.885, v: 20, top: true, leg: W(8), pt: "Lojas pequenas entre os canais mais bonitos.", en: "Small shops between the prettiest canals." },
      { id: "anne-frank", n: "Casa de Anne Frank e Westerkerk", a: "Jordaan", lat: 52.3752, lng: 4.884, v: 20, top: true, o: true, leg: W(8), pt: "O canal Prinsengracht e a torre da igreja. Visita à casa com reserva prévia.", en: "The Prinsengracht canal and the church tower. House visits need advance booking." },
      { id: "rijksmuseum", n: "Rijksmuseum e Museumplein", a: "Museumkwartier", lat: 52.36, lng: 4.8852, v: 25, x: true, top: true, o: true, leg: { m: "tram", min: 15, line: "Tram 2", r: 1 }, pt: "Passe pelo túnel de bicicletas do museu e pelo relvado do Museumplein.", en: "Pass through the museum's cycle tunnel and the Museumplein lawn." },
      { id: "vondelpark", n: "Vondelpark", a: "Oud-Zuid", lat: 52.358, lng: 4.8686, v: 25, x: true, leg: W(8), pt: "O parque mais popular da cidade.", en: "The city's most popular park." }
    ]
  },
  // ——— Reino Unido (tarifas confirmadas em outubro de 2026; ver README) ———
  {
    id: "edi", n: names("Edimburgo", "Edinburgh", "Edimburgo", "Édimbourg", "Edinburgh"), cur: "GBP",
    ap: { iata: "EDI", name: "Edinburgh Airport", lat: 55.95, lng: -3.3725 }, tz: "Europe/London",
    single: 2.4, card: 0, cardName: "",
    alt: null,
    air: { m: "bus", min: 30, line: "Airlink 100 → Waverley Bridge", f: 6.0 },
    ret: { core: { m: "bus", min: 40, line: "A pé até Waverley Bridge → Airlink 100", f: 6.0 }, extra: { m: "bus", min: 55, line: "Royal Mile a pé até Waverley Bridge → Airlink 100", f: 6.0 } },
    stops: [
      { id: "scott", n: "Princes Street Gardens e Scott Monument", a: "New Town", lat: 55.952, lng: -3.1932, v: 20, top: true, leg: W(3, "Waverley Bridge"), pt: "Os jardins aos pés do castelo e o monumento gótico a Walter Scott, o maior do mundo dedicado a um escritor.", en: "The gardens below the castle and the Gothic monument to Walter Scott, the largest to any writer." },
      { id: "calton", n: "Calton Hill", a: "New Town", lat: 55.9554, lng: -3.1826, v: 25, top: true, leg: W(12), pt: "Subida curta até aos monumentos neoclássicos, com a melhor vista sobre o castelo, a Royal Mile e o mar.", en: "A short climb to the neoclassical monuments, with the best view of the castle, the Royal Mile and the sea." },
      { id: "st-giles", n: "Royal Mile e St Giles' Cathedral", a: "Old Town", lat: 55.9495, lng: -3.1908, v: 20, top: true, leg: W(15), pt: "A rua principal da cidade velha e a catedral da coroa. Entrada livre, com donativo sugerido.", en: "The Old Town's main street and the crown-spired cathedral. Free entry, donation suggested." },
      { id: "castle", n: "Castelo de Edimburgo", a: "Old Town", lat: 55.9486, lng: -3.1999, v: 25, top: true, o: true, leg: W(8), pt: "A esplanada em frente ao castelo é gratuita e tem vista sobre a cidade. O interior é pago e opcional.", en: "The esplanade in front of the castle is free, with city views. The interior is paid and optional." },
      { id: "victoria-st", n: "Victoria Street e Grassmarket", a: "Old Town", lat: 55.9478, lng: -3.194, v: 20, top: true, leg: W(6), pt: "A rua curva de fachadas coloridas que desce até à antiga praça do mercado.", en: "The curving street of colourful shopfronts leading down to the old market square." },
      { id: "nms", n: "National Museum of Scotland", a: "Old Town", lat: 55.9469, lng: -3.1892, v: 30, leg: W(6), pt: "Museu gratuito com a ovelha Dolly e um terraço no telhado com vista para o castelo.", en: "Free museum with Dolly the sheep and a rooftop terrace facing the castle." },
      { id: "holyrood", n: "Holyrood e Arthur's Seat", a: "Holyrood", lat: 55.9527, lng: -3.1722, v: 60, x: true, top: true, leg: W(20, "Royal Mile"), pt: "O palácio real, o Parlamento escocês e a subida aos Salisbury Crags, o miradouro do vulcão extinto.", en: "The royal palace, the Scottish Parliament and the climb to Salisbury Crags on the extinct volcano." }
    ]
  },
  {
    id: "man", n: names("Manchester", "Manchester", "Mánchester", "Manchester", "Manchester"), cur: "GBP",
    ap: { iata: "MAN", name: "Manchester Airport", lat: 53.3537, lng: -2.275 }, tz: "Europe/London",
    single: 2.8, card: 0, cardName: "",
    alt: null,
    air: { m: "train", min: 20, line: "Comboio Manchester Airport → Piccadilly", f: 5.6 },
    ret: { core: { m: "train", min: 35, line: "Deansgate → Manchester Airport", f: 5.6 }, extra: { m: "tram", min: 55, line: "Metrolink Old Trafford → Cornbrook → Airport", f: 4.6 } },
    stops: [
      { id: "piccadilly-g", n: "Piccadilly Gardens", a: "City Centre", lat: 53.481, lng: -2.237, v: 10, leg: W(8, "Piccadilly"), pt: "A praça central, ponto de partida dos autocarros gratuitos do centro (Free Bus).", en: "The central square, where the free city-centre buses (Free Bus) start." },
      { id: "nq", n: "Northern Quarter", a: "Northern Quarter", lat: 53.484, lng: -2.234, v: 25, top: true, leg: W(5), pt: "Arte de rua, lojas vintage, o Afflecks e cafés independentes.", en: "Street art, vintage shops, Afflecks and independent cafés." },
      { id: "cathedral-m", n: "Catedral e National Football Museum", a: "Cathedral Quarter", lat: 53.4855, lng: -2.2433, v: 30, top: true, o: true, leg: W(12), pt: "A catedral medieval e, ao lado, o museu do futebol no edifício de vidro Urbis (entrada paga, opcional).", en: "The medieval cathedral and, next door, the football museum in the glass Urbis building (paid, optional)." },
      { id: "rylands", n: "John Rylands Library", a: "Deansgate", lat: 53.4804, lng: -2.2484, v: 25, top: true, leg: W(10), pt: "Biblioteca neogótica que parece uma catedral. Entrada gratuita.", en: "A neo-Gothic library that looks like a cathedral. Free entry." },
      { id: "albert-sq", n: "Albert Square e Central Library", a: "City Centre", lat: 53.4794, lng: -2.2446, v: 15, leg: W(6), pt: "A Câmara vitoriana e a biblioteca circular de St Peter's Square.", en: "The Victorian Town Hall and the round library on St Peter's Square." },
      { id: "castlefield", n: "Castlefield", a: "Castlefield", lat: 53.4752, lng: -2.255, v: 25, top: true, leg: W(15), pt: "Canais, pontes de ferro, as ruínas do forte romano e o museu da ciência e da indústria.", en: "Canals, iron bridges, the Roman fort ruins and the science and industry museum." },
      { id: "old-trafford", n: "Old Trafford", a: "Trafford", lat: 53.4631, lng: -2.2913, v: 30, x: true, top: true, o: true, leg: { m: "tram", min: 15, line: "Metrolink Deansgate-Castlefield → Old Trafford", r: 1 }, pt: "O estádio do Manchester United, o \"Teatro dos Sonhos\". Exterior livre; visita guiada paga.", en: "Manchester United's stadium, the \"Theatre of Dreams\". Outside is free; stadium tour is paid." }
    ]
  },
  {
    id: "gla", n: names("Glasgow", "Glasgow", "Glasgow", "Glasgow", "Glasgow"), cur: "GBP",
    ap: { iata: "GLA", name: "Glasgow Airport", lat: 55.8719, lng: -4.4331 }, tz: "Europe/London",
    single: 1.85, card: 0, cardName: "",
    alt: { type: "pass", price: 4.45, name: "Subway Daily" },
    air: { m: "bus", min: 25, line: "Glasgow Airport Express 500 → Queen Street", f: 11.0 },
    ret: { core: { m: "bus", min: 50, line: "Subway Hillhead → Buchanan Street → Airport Express 500", r: 1, f: 11.0 }, extra: { m: "bus", min: 60, line: "A pé até Partick → Subway → Airport Express 500", r: 1, f: 11.0 } },
    stops: [
      { id: "george-sq", n: "George Square", a: "City Centre", lat: 55.8612, lng: -4.2502, v: 15, top: true, leg: W(3, "Queen Street"), pt: "A praça principal, com a imponente City Chambers vitoriana.", en: "The main square, with the grand Victorian City Chambers." },
      { id: "necropolis", n: "Catedral e Necropolis", a: "Townhead", lat: 55.8628, lng: -4.2343, v: 35, top: true, leg: W(20), pt: "A única catedral medieval intacta da Escócia continental e o cemitério vitoriano na colina, com vista sobre a cidade.", en: "Mainland Scotland's only intact medieval cathedral and the Victorian hilltop cemetery with city views." },
      { id: "merchant", n: "Merchant City e murais", a: "Merchant City", lat: 55.859, lng: -4.246, v: 20, leg: W(15), pt: "Ruas de antigos armazéns de comerciantes e os murais gigantes do City Centre Mural Trail.", en: "Old merchants' warehouse streets and the giant murals of the City Centre Mural Trail." },
      { id: "buchanan", n: "Buchanan Street e The Lighthouse", a: "City Centre", lat: 55.86, lng: -4.2557, v: 20, leg: W(10), pt: "A rua comercial e o edifício de Mackintosh com miradouro gratuito no topo.", en: "The shopping street and the Mackintosh building with a free rooftop viewpoint." },
      { id: "kelvingrove", n: "Kelvingrove Art Gallery and Museum", a: "West End", lat: 55.8686, lng: -4.2906, v: 40, top: true, leg: { m: "metro", min: 12, line: "Subway Buchanan Street → Kelvinhall", r: 1 }, pt: "Museu gratuito num palácio de arenito vermelho, com Dalí, Rennie Mackintosh e um órgão tocado ao meio-dia.", en: "Free museum in a red sandstone palace, with Dalí, Rennie Mackintosh and a lunchtime organ recital." },
      { id: "uni-gla", n: "Universidade de Glasgow", a: "West End", lat: 55.8721, lng: -4.2882, v: 20, top: true, leg: W(10, "Kelvingrove Park"), pt: "Os claustros góticos (Cloisters) parecem saídos de um filme. Acesso livre.", en: "The Gothic Cloisters look straight out of a film. Free to walk in." },
      { id: "riverside", n: "Riverside Museum", a: "Partick", lat: 55.865, lng: -4.306, v: 40, x: true, top: true, leg: W(25), pt: "Museu gratuito dos transportes, em edifício de Zaha Hadid, com o veleiro Glenlee à porta.", en: "Free transport museum in a Zaha Hadid building, with the Glenlee tall ship outside." }
    ]
  },
  {
    id: "liv", n: names("Liverpool", "Liverpool", "Liverpool", "Liverpool", "Liverpool"), cur: "GBP",
    ap: { iata: "LPL", name: "Liverpool John Lennon Airport", lat: 53.3336, lng: -2.8497 }, tz: "Europe/London",
    single: 2.0, card: 0, cardName: "",
    alt: null,
    air: { m: "bus", min: 35, line: "Autocarro 500 → Liverpool ONE", r: 1 },
    ret: { core: { m: "bus", min: 45, line: "A pé até Liverpool ONE → autocarro 500", r: 1 }, extra: { m: "bus", min: 50, line: "A pé até Liverpool ONE → autocarro 500", r: 1 } },
    stops: [
      { id: "albert-dock", n: "Royal Albert Dock", a: "Waterfront", lat: 53.4004, lng: -2.992, v: 25, top: true, leg: W(8, "Liverpool ONE"), pt: "As docas vitorianas de tijolo e ferro, hoje com museus, lojas e restaurantes.", en: "The Victorian brick-and-iron docks, now home to museums, shops and restaurants." },
      { id: "beatles-story", n: "The Beatles Story", a: "Waterfront", lat: 53.3993, lng: -2.9922, v: 20, top: true, o: true, leg: W(2), pt: "O museu dos Beatles nas docas. Entrada paga, opcional.", en: "The Beatles museum at the docks. Paid, optional." },
      { id: "pier-head", n: "Pier Head e Three Graces", a: "Waterfront", lat: 53.4058, lng: -2.9958, v: 15, top: true, leg: W(8), pt: "O Royal Liver Building e os outros dois edifícios históricos do porto, com a estátua dos Beatles.", en: "The Royal Liver Building and its two historic neighbours, plus the Beatles statue." },
      { id: "museum-liv", n: "Museum of Liverpool", a: "Waterfront", lat: 53.404, lng: -2.995, v: 25, leg: W(3), pt: "Museu gratuito sobre a cidade, o porto, o futebol e a música.", en: "Free museum about the city, its port, football and music." },
      { id: "cavern", n: "Mathew Street e Cavern Club", a: "Cavern Quarter", lat: 53.4064, lng: -2.9878, v: 20, top: true, leg: W(10), pt: "A rua onde os Beatles começaram. O Cavern Club tem música ao vivo quase todo o dia.", en: "The street where the Beatles started. The Cavern Club has live music most of the day." },
      { id: "st-georges", n: "St George's Hall", a: "City Centre", lat: 53.4084, lng: -2.9799, v: 15, leg: W(10), pt: "Um dos maiores edifícios neoclássicos da Europa, em frente à estação de Lime Street.", en: "One of Europe's finest neoclassical buildings, opposite Lime Street station." },
      { id: "met-cathedral", n: "Metropolitan Cathedral", a: "Knowledge Quarter", lat: 53.4045, lng: -2.9686, v: 15, x: true, leg: W(15), pt: "A catedral católica em forma de tenda, com um lanternim de vitrais coloridos.", en: "The tent-shaped Catholic cathedral with its crown of coloured glass." },
      { id: "liv-cathedral", n: "Liverpool Cathedral", a: "Hope Street", lat: 53.3974, lng: -2.9733, v: 25, x: true, top: true, o: true, leg: W(12, "Hope Street"), pt: "A maior catedral do Reino Unido, no fim de Hope Street. Entrada livre; torre paga.", en: "Britain's largest cathedral, at the end of Hope Street. Free entry; the tower is paid." }
    ]
  },
  {
    id: "bir", n: names("Birmingham", "Birmingham", "Birmingham", "Birmingham", "Birmingham"), cur: "GBP",
    ap: { iata: "BHX", name: "Birmingham Airport", lat: 52.4539, lng: -1.748 }, tz: "Europe/London",
    single: 2.0, card: 0, cardName: "",
    alt: null,
    air: { m: "train", min: 15, line: "Birmingham International → New Street", f: 5.0 },
    ret: { core: { m: "train", min: 40, line: "A pé até New Street → Birmingham International", f: 5.0 }, extra: { m: "train", min: 45, line: "Bournville → New Street → Birmingham International", f: 6.5 } },
    stops: [
      { id: "bullring", n: "Bullring e St Martin's", a: "City Centre", lat: 52.4774, lng: -1.8937, v: 20, top: true, leg: W(5, "New Street"), pt: "O centro comercial de curvas metálicas e a igreja vitoriana mesmo ao lado.", en: "The curvy metal-clad shopping centre and the Victorian church right beside it." },
      { id: "victoria-sq", n: "Victoria Square", a: "City Centre", lat: 52.4795, lng: -1.903, v: 10, leg: W(10), pt: "A Câmara Municipal, o Council House e a fonte \"Floozie in the Jacuzzi\".", en: "The Town Hall, the Council House and the \"Floozie in the Jacuzzi\" fountain." },
      { id: "library-b", n: "Library of Birmingham", a: "Centenary Square", lat: 52.4797, lng: -1.9083, v: 25, top: true, leg: W(8), pt: "A biblioteca de fachada rendada, com jardins e miradouro gratuitos nos terraços.", en: "The lace-fronted library with free terrace gardens and viewpoints." },
      { id: "gas-street", n: "Brindleyplace e Gas Street Basin", a: "Canals", lat: 52.476, lng: -1.9105, v: 25, top: true, leg: W(8), pt: "Os canais: Birmingham tem mais quilómetros de canal do que Veneza.", en: "The canals: Birmingham has more miles of canal than Venice." },
      { id: "jq", n: "Jewellery Quarter", a: "Jewellery Quarter", lat: 52.489, lng: -1.912, v: 30, top: true, leg: W(20), pt: "Bairro de oficinas de joalharia em funcionamento, com o relógio Chamberlain e lojas independentes.", en: "A working jewellery district with the Chamberlain Clock and independent shops." },
      { id: "cadbury", n: "Cadbury World e Bournville", a: "Bournville", lat: 52.4285, lng: -1.9314, v: 60, x: true, top: true, o: true, leg: { m: "train", min: 30, line: "Jewellery Quarter → New Street → Bournville", f: 4.0 }, pt: "A aldeia-modelo da fábrica de chocolate. Cadbury World é pago e convém reservar.", en: "The chocolate factory's model village. Cadbury World is paid and best booked ahead." }
    ]
  },
  // ——— Turquia (tarifas Istanbulkart desde fevereiro de 2026; ver README) ———
  {
    id: "ist", n: names("Istambul", "Istanbul", "Estambul", "Istanbul", "Istanbul"), cur: "TRY",
    ap: { iata: "IST", name: "İstanbul Havalimanı", lat: 41.2753, lng: 28.7519 }, tz: "Europe/Istanbul",
    single: 42, card: 165, cardName: "Istanbulkart",
    alt: null,
    air: { m: "metro", min: 55, line: "M11 → Gayrettepe → M2 até Taksim", f: 73.6 },
    ret: { core: { m: "metro", min: 75, line: "M2 Vezneciler → Gayrettepe → M11", f: 73.6 }, extra: { m: "train", min: 95, line: "Marmaray Üsküdar → Yenikapı → M2 Gayrettepe → M11", r: 1, f: 73.6 } },
    stops: [
      { id: "taksim", n: "Praça Taksim", a: "Beyoğlu", lat: 41.037, lng: 28.9858, v: 10, leg: W(0, "Taksim"), pt: "A praça central da Istambul moderna, com o Monumento da República.", en: "The heart of modern Istanbul, with the Republic Monument." },
      { id: "istiklal", n: "Avenida İstiklal", a: "Beyoğlu", lat: 41.0336, lng: 28.9778, v: 25, top: true, leg: W(15), pt: "A grande avenida pedonal com o elétrico vermelho histórico, passagens antigas e livrarias.", en: "The great pedestrian avenue with the historic red tram, old arcades and bookshops." },
      { id: "galata", n: "Torre de Gálata", a: "Karaköy", lat: 41.0256, lng: 28.9742, v: 20, top: true, o: true, leg: W(12, "Galip Dede"), pt: "A torre genovesa domina o bairro; subir ao miradouro é pago e opcional.", en: "The Genoese tower rules the district; the viewing deck is paid and optional." },
      { id: "galata-bridge", n: "Ponte de Gálata", a: "Karaköy / Eminönü", lat: 41.02, lng: 28.9733, v: 15, leg: W(10), pt: "Pescadores no tabuleiro de cima e vista para as mesquitas da cidade velha.", en: "Anglers on the upper deck and views of the old city's mosques." },
      { id: "spice", n: "Bazar das Especiarias", a: "Eminönü", lat: 41.0166, lng: 28.9707, v: 25, top: true, leg: W(8), pt: "O mercado coberto de especiarias, chás e delícias turcas, ao lado da Mesquita Nova.", en: "The covered market of spices, teas and Turkish delight, next to the New Mosque." },
      { id: "hagia-sophia", n: "Santa Sofia", a: "Sultanahmet", lat: 41.0086, lng: 28.9802, v: 30, top: true, o: true, leg: { m: "tram", min: 12, line: "T1 Eminönü → Sultanahmet", r: 1 }, pt: "Basílica bizantina e mesquita. Os estrangeiros visitam a galeria superior com bilhete; as mulheres cobrem o cabelo.", en: "Byzantine basilica and mosque. Foreign visitors use the paid upper gallery; women cover their hair." },
      { id: "blue-mosque", n: "Mesquita Azul e Hipódromo", a: "Sultanahmet", lat: 41.0054, lng: 28.9768, v: 25, top: true, leg: W(5, "Hipódromo"), pt: "Entrada gratuita fora das horas de oração; ombros e joelhos cobertos. No Hipódromo ficam o obelisco egípcio e a coluna serpentina.", en: "Free outside prayer times; cover shoulders and knees. The Hippodrome holds the Egyptian obelisk and the Serpent Column." },
      { id: "cistern", n: "Cisterna da Basílica", a: "Sultanahmet", lat: 41.0084, lng: 28.9779, v: 25, top: true, o: true, leg: W(6), pt: "O reservatório subterrâneo de colunas e as cabeças de Medusa. Entrada paga, opcional.", en: "The underground forest of columns and the Medusa heads. Paid, optional." },
      { id: "grand-bazaar", n: "Grande Bazar", a: "Beyazıt", lat: 41.0107, lng: 28.9681, v: 40, top: true, cl: [0], leg: W(12, "Divanyolu"), pt: "Um dos maiores mercados cobertos do mundo. Negocie o preço com calma. Fechado ao domingo.", en: "One of the world's largest covered markets. Haggle calmly. Closed on Sundays." },
      { id: "topkapi", n: "Palácio de Topkapı", a: "Sultanahmet", lat: 41.0115, lng: 28.9834, v: 60, x: true, top: true, o: true, cl: [2], leg: { m: "tram", min: 12, line: "T1 Beyazıt → Gülhane", r: 1 }, pt: "O palácio dos sultões otomanos, com pátios sobre o Bósforo. Pago; fechado à terça.", en: "The Ottoman sultans' palace, with courtyards over the Bosphorus. Paid; closed Tuesdays." },
      { id: "uskudar", n: "Ferry no Bósforo e Üsküdar", a: "Üsküdar (Ásia)", lat: 41.027, lng: 29.0135, v: 40, x: true, top: true, leg: { m: "ferry", min: 35, line: "A pé até Eminönü → ferry para Üsküdar", r: 1 }, pt: "A travessia mais barata do Bósforo, da Europa para a Ásia, com vista para a cidade e a Torre da Donzela.", en: "The cheapest Bosphorus crossing, Europe to Asia, with city views and the Maiden's Tower." }
    ]
  },
  ...MORE_CITIES,
  ...ME_CITIES,
  ...US_CITIES
];

/** Próximas cidades (nome por idioma; outros idiomas usam o inglês). */
export const SOON: Record<string, string>[] = [
  { pt: "Atenas", en: "Athens", es: "Atenas", fr: "Athènes", de: "Athen", it: "Atene", zh: "雅典", ar: "أثينا", ja: "アテネ", tr: "Atina", ru: "Афины", ko: "아테네" },
  { pt: "Dublin", en: "Dublin", es: "Dublín", fr: "Dublin", de: "Dublin", it: "Dublino", zh: "都柏林", ar: "دبلن", ja: "ダブリン", tr: "Dublin", ru: "Дублин", ko: "더블린" },
  { pt: "Zurique", en: "Zurich", es: "Zúrich", fr: "Zurich", de: "Zürich", it: "Zurigo", zh: "苏黎世", ar: "زيورخ", ja: "チューリッヒ", tr: "Zürih", ru: "Цюрих", ko: "취리히" },
  { pt: "Hong Kong", en: "Hong Kong", es: "Hong Kong", fr: "Hong Kong", de: "Hongkong", it: "Hong Kong", zh: "香港", ar: "هونغ كونغ", ja: "香港", tr: "Hong Kong", ru: "Гонконг", ko: "홍콩" },
  { pt: "Banguecoque", en: "Bangkok", es: "Bangkok", fr: "Bangkok", de: "Bangkok", it: "Bangkok", zh: "曼谷", ar: "بانكوك", ja: "バンコク", tr: "Bangkok", ru: "Бангкок", ko: "방콕" }
];

export function getCity(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}
/** País de cada cidade (código ISO), para agrupar na escolha da cidade. */

/** Nomes nos idiomas acrescentados depois (IT, ZH, AR, JA). */
const MORE_NAMES: Record<string, Record<string, string>> = {
  lis: { it: "Lisbona", zh: "里斯本", ar: "لشبونة", ja: "リスボン" },
  opo: { it: "Porto", zh: "波尔图", ar: "بورتو", ja: "ポルト" },
  mad: { it: "Madrid", zh: "马德里", ar: "مدريد", ja: "マドリード" },
  bcn: { it: "Barcellona", zh: "巴塞罗那", ar: "برشلونة", ja: "バルセロナ" },
  par: { it: "Parigi", zh: "巴黎", ar: "باريس", ja: "パリ" },
  lon: { it: "Londra", zh: "伦敦", ar: "لندن", ja: "ロンドン" },
  rom: { it: "Roma", zh: "罗马", ar: "روما", ja: "ローマ" },
  ams: { it: "Amsterdam", zh: "阿姆斯特丹", ar: "أمستردام", ja: "アムステルダム" },
  edi: { it: "Edimburgo", zh: "爱丁堡", ar: "إدنبرة", ja: "エディンバラ" },
  man: { it: "Manchester", zh: "曼彻斯特", ar: "مانشستر", ja: "マンチェスター" },
  gla: { it: "Glasgow", zh: "格拉斯哥", ar: "غلاسكو", ja: "グラスゴー" },
  liv: { it: "Liverpool", zh: "利物浦", ar: "ليفربول", ja: "リバプール" },
  bir: { it: "Birmingham", zh: "伯明翰", ar: "برمنغهام", ja: "バーミンガム" },
  ist: { it: "Istanbul", zh: "伊斯坦布尔", ar: "إسطنبول", ja: "イスタンブール" },
  ...ME_NAMES,
  ...MORE_CITY_NAMES,
  ...US_NAMES
};
/* Turco, russo e coreano. */
for (const [id, [tr, ru, ko]] of Object.entries({
  lis: ["Lizbon", "Лиссабон", "리스본"],
  opo: ["Porto", "Порту", "포르투"],
  mad: ["Madrid", "Мадрид", "마드리드"],
  bcn: ["Barselona", "Барселона", "바르셀로나"],
  par: ["Paris", "Париж", "파리"],
  lon: ["Londra", "Лондон", "런던"],
  rom: ["Roma", "Рим", "로마"],
  ams: ["Amsterdam", "Амстердам", "암스테르담"],
  edi: ["Edinburgh", "Эдинбург", "에든버러"],
  man: ["Manchester", "Манчестер", "맨체스터"],
  gla: ["Glasgow", "Глазго", "글래스고"],
  liv: ["Liverpool", "Ливерпуль", "리버풀"],
  bir: ["Birmingham", "Бирмингем", "버밍엄"],
  ist: ["İstanbul", "Стамбул", "이스탄불"],
  dxb: ["Dubai", "Дубай", "두바이"],
  auh: ["Abu Dabi", "Абу-Даби", "아부다비"],
  doh: ["Doha", "Доха", "도하"],
  ruh: ["Riyad", "Эр-Рияд", "리야드"],
  jed: ["Cidde", "Джидда", "제다"],
  cai: ["Kahire", "Каир", "카이로"],
  amm: ["Amman", "Амман", "암만"],
  mct: ["Maskat", "Маскат", "무스카트"]
} as Record<string, [string, string, string]>)) MORE_NAMES[id] = { ...MORE_NAMES[id], tr, ru, ko };


export function cityName(c: City, locale: string): string {
  return c.n[locale] ?? MORE_NAMES[c.id]?.[locale] ?? c.n.en;
}
