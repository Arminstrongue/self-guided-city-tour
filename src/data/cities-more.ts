/**
 * Cidades acrescentadas em outubro de 2026: Frankfurt, Berlim, Munique, Viena, Praga e Singapura —
 * grandes aeroportos de escala com o centro a menos de 45 minutos.
 * Tarifas de referência de outubro de 2026 (RMV, VBB, MVV, Wiener Linien/ÖBB, PID, LTA/SMRT): mudam sem aviso,
 * a app mostra sempre "confirme no local".
 */
import type { City, Leg } from "./cities";

const W = (min: number, line = ""): Leg => ({ m: "walk", min, line });
const names = (pt: string, en: string, es: string, fr: string, de: string) => ({ pt, en, es, fr, de });

export const MORE_CITIES: City[] = [
  {
    id: "fra", n: names("Frankfurt", "Frankfurt", "Fráncfort", "Francfort", "Frankfurt am Main"), cur: "EUR",
    ap: { iata: "FRA", name: "Frankfurt am Main (FRA)", lat: 50.0379, lng: 8.5622 }, tz: "Europe/Berlin",
    single: 3.8, card: 0, cardName: "",
    alt: { type: "pass", price: 12.0, name: "Tageskarte Frankfurt (com aeroporto)", includesAirport: true },
    air: { m: "train", min: 15, line: "S8/S9 Flughafen → Hauptwache", f: 6.3 },
    ret: { core: { m: "train", min: 35, line: "S-Bahn Lokalbahnhof → Hauptbahnhof → S8/S9 Flughafen", f: 6.3 }, extra: { m: "train", min: 20, line: "Taunusanlage → S8/S9 Flughafen", f: 6.3 } },
    stops: [
      { id: "hauptwache", n: "Hauptwache e Zeil", a: "Innenstadt", lat: 50.1142, lng: 8.6788, v: 15, leg: W(0, "S-Bahn Hauptwache"), pt: "O antigo posto da guarda barroco no início da Zeil, a rua comercial mais movimentada da cidade.", en: "The baroque former guardhouse at the start of the Zeil, the city's busiest shopping street." },
      { id: "paulskirche", n: "Paulskirche", a: "Altstadt", lat: 50.1113, lng: 8.6806, v: 15, leg: W(6), pt: "A igreja redonda onde se reuniu o primeiro parlamento eleito da Alemanha, em 1848. Entrada gratuita.", en: "The round church where Germany's first elected parliament met in 1848. Free to enter." },
      { id: "roemer", n: "Römerberg", a: "Altstadt", lat: 50.1106, lng: 8.6821, v: 25, top: true, leg: W(3), pt: "A praça do município, com as casas de enxaimel e a fonte da Justiça. No Advento enche-se com o mercado de Natal.", en: "The town-hall square with its half-timbered houses and Justice fountain. In Advent it fills with the Christmas market." },
      { id: "dom-fra", n: "Catedral e Nova Cidade Velha", a: "Altstadt", lat: 50.1106, lng: 8.6853, v: 25, top: true, o: true, leg: W(4, "Rua Markt"), pt: "A catedral onde se coroavam os imperadores e as ruelas do bairro DomRömer, reconstruído em 2018. Subir à torre é pago.", en: "The cathedral where emperors were crowned and the DomRömer lanes rebuilt in 2018. The tower climb is paid." },
      { id: "eiserner-steg", n: "Eiserner Steg", a: "Meno", lat: 50.1087, lng: 8.6834, v: 15, top: true, leg: W(5), pt: "A ponte pedonal de ferro sobre o rio Meno, com a melhor vista dos arranha-céus de «Mainhattan».", en: "The iron footbridge over the river Main, with the best view of the «Mainhattan» skyline." },
      { id: "museumsufer", n: "Museumsufer e Städel", a: "Sachsenhausen", lat: 50.1032, lng: 8.6743, v: 40, o: true, leg: W(12, "Schaumainkai"), pt: "A margem dos museus. O Städel guarda sete séculos de pintura europeia; o passeio à beira-rio é gratuito.", en: "The museum embankment. The Städel holds seven centuries of European painting; the riverside walk is free." },
      { id: "sachsenhausen", n: "Alt-Sachsenhausen", a: "Sachsenhausen", lat: 50.1037, lng: 8.6878, v: 30, leg: W(12), pt: "As tabernas de sidra (Apfelwein) servida no jarro azul «Bembel», com o molho verde de Frankfurt.", en: "Cider taverns pouring Apfelwein from the blue «Bembel» jug, with Frankfurt's green sauce." },
      { id: "main-tower", n: "Main Tower", a: "Bankenviertel", lat: 50.1124, lng: 8.672, v: 30, x: true, top: true, o: true, leg: { m: "metro", min: 15, line: "U-Bahn Südbahnhof → Willy-Brandt-Platz", r: 1 }, pt: "O único arranha-céus com miradouro aberto ao público, a 200 metros, sobre o bairro dos bancos. Pago.", en: "The only skyscraper with a public viewing deck, 200 metres above the banking district. Paid." }
    ]
  },
  {
    id: "ber", n: names("Berlim", "Berlin", "Berlín", "Berlin", "Berlin"), cur: "EUR",
    ap: { iata: "BER", name: "Berlin Brandenburg (BER)", lat: 52.3667, lng: 13.5033 }, tz: "Europe/Berlin",
    single: 3.8, card: 0, cardName: "",
    alt: { type: "pass", price: 12.9, name: "24-Stunden-Karte ABC", includesAirport: true },
    air: { m: "train", min: 35, line: "FEX → Hauptbahnhof", f: 4.7 },
    ret: { core: { m: "train", min: 35, line: "Alexanderplatz → RE7/RB14 → Aeroporto BER", f: 4.7 }, extra: { m: "train", min: 35, line: "S-Bahn Warschauer Straße → Ostkreuz → FEX → BER", f: 4.7 } },
    stops: [
      { id: "reichstag", n: "Reichstag", a: "Tiergarten", lat: 52.5186, lng: 13.3762, v: 20, top: true, leg: W(12, "Hauptbahnhof → a pé"), pt: "O parlamento alemão com a cúpula de vidro de Norman Foster. Subir é gratuito, mas exige reserva online.", en: "Germany's parliament with Norman Foster's glass dome. The visit is free but needs an online booking." },
      { id: "brandenburger", n: "Porta de Brandemburgo", a: "Mitte", lat: 52.5163, lng: 13.3777, v: 15, top: true, leg: W(5), pt: "O símbolo da divisão e da reunificação, aberto ao povo na noite em que caiu o Muro, em 1989.", en: "The symbol of division and reunification, opened to the people the night the Wall fell in 1989." },
      { id: "holocaust", n: "Memorial do Holocausto", a: "Mitte", lat: 52.5139, lng: 13.3787, v: 20, leg: W(4), pt: "2711 blocos de betão para os judeus assassinados da Europa. O centro de informação subterrâneo é gratuito.", en: "2,711 concrete slabs for the murdered Jews of Europe. The underground information centre is free." },
      { id: "gendarmenmarkt", n: "Gendarmenmarkt", a: "Mitte", lat: 52.5137, lng: 13.3925, v: 15, leg: W(15, "Pela Unter den Linden"), pt: "Considerada a praça mais bonita de Berlim: a sala de concertos entre as catedrais Alemã e Francesa.", en: "Often called Berlin's finest square: the concert hall between the German and French cathedrals." },
      { id: "museumsinsel", n: "Ilha dos Museus e Catedral", a: "Mitte", lat: 52.5192, lng: 13.401, v: 35, top: true, o: true, leg: W(12), pt: "Cinco museus de referência mundial numa ilha do rio Spree, Património da UNESCO, ao lado da Catedral de Berlim.", en: "Five world-class museums on an island in the Spree, a UNESCO site, beside Berlin Cathedral." },
      { id: "alexanderplatz", n: "Alexanderplatz e Torre de TV", a: "Mitte", lat: 52.5208, lng: 13.4094, v: 20, o: true, leg: W(10), pt: "A grande praça de Berlim Leste, com o relógio mundial e a torre de 368 metros. Subir à torre é pago.", en: "East Berlin's great square, with the World Clock and the 368-metre tower. The tower is paid." },
      { id: "east-side", n: "East Side Gallery", a: "Friedrichshain", lat: 52.505, lng: 13.4397, v: 30, x: true, top: true, leg: { m: "train", min: 10, line: "S-Bahn Alexanderplatz → Warschauer Straße", r: 1 }, pt: "O maior troço do Muro ainda de pé, pintado por artistas de todo o mundo, junto à ponte Oberbaum.", en: "The longest surviving stretch of the Wall, painted by artists from around the world, by the Oberbaum Bridge." }
    ]
  },
  {
    id: "muc", n: names("Munique", "Munich", "Múnich", "Munich", "München"), cur: "EUR",
    ap: { iata: "MUC", name: "Munich (MUC)", lat: 48.3538, lng: 11.7861 }, tz: "Europe/Berlin",
    single: 4.1, card: 0, cardName: "",
    alt: { type: "pass", price: 16.0, name: "Airport-City-Day-Ticket", includesAirport: true },
    air: { m: "train", min: 40, line: "S1/S8 Flughafen → Marienplatz", f: 13.0 },
    ret: { core: { m: "train", min: 45, line: "Marienplatz → S1/S8 Flughafen", f: 13.0 }, extra: { m: "train", min: 60, line: "U3 Olympiazentrum → Marienplatz → S8", r: 1, f: 13.0 } },
    stops: [
      { id: "marienplatz", n: "Marienplatz e Glockenspiel", a: "Altstadt", lat: 48.1374, lng: 11.5755, v: 20, top: true, leg: W(0, "S-Bahn Marienplatz"), pt: "A praça central com a Câmara Nova neogótica. O carrilhão dança às 11h e às 12h (e às 17h de março a outubro).", en: "The central square with the neo-Gothic New Town Hall. The Glockenspiel plays at 11:00 and 12:00 (and 17:00 March–October)." },
      { id: "viktualienmarkt", n: "Viktualienmarkt", a: "Altstadt", lat: 48.1351, lng: 11.5763, v: 20, leg: W(3), pt: "O mercado ao ar livre desde 1807, com o mastro bávaro e um jardim de cerveja no meio das bancas. Fecha ao domingo.", en: "The open-air market since 1807, with the Bavarian maypole and a beer garden among the stalls. Closed Sundays." },
      { id: "frauenkirche", n: "Frauenkirche", a: "Altstadt", lat: 48.1386, lng: 11.5734, v: 15, top: true, leg: W(6), pt: "As duas torres com cúpulas «em forma de cebola», o símbolo de Munique. Entrada gratuita.", en: "The twin towers with onion domes, Munich's emblem. Free to enter." },
      { id: "residenz", n: "Residenz e Odeonsplatz", a: "Altstadt", lat: 48.1418, lng: 11.5786, v: 20, o: true, leg: W(7), pt: "O palácio dos reis da Baviera e a praça com a igreja amarela dos Teatinos. O interior do palácio é pago.", en: "The Bavarian kings' palace and the square with the yellow Theatine Church. The palace interior is paid." },
      { id: "englischer-garten", n: "Jardim Inglês e Eisbach", a: "Lehel", lat: 48.1436, lng: 11.588, v: 30, top: true, leg: W(10, "Pelo Hofgarten"), pt: "Um dos maiores parques urbanos da Europa. À entrada, surfistas apanham a onda permanente do rio Eisbach.", en: "One of Europe's largest city parks. At its edge, surfers ride the Eisbach river's standing wave." },
      { id: "hofbraeuhaus", n: "Hofbräuhaus", a: "Altstadt", lat: 48.1376, lng: 11.5799, v: 30, leg: W(12), pt: "A cervejaria real de 1589: canecas de litro, música bávara e mesas corridas.", en: "The royal beer hall of 1589: litre steins, oompah music and long shared tables." },
      { id: "olympiapark", n: "Parque Olímpico e BMW Welt", a: "Milbertshofen", lat: 48.1755, lng: 11.5551, v: 45, x: true, top: true, leg: { m: "metro", min: 15, line: "U3 Odeonsplatz → Olympiazentrum", r: 1 }, pt: "O parque dos Jogos de 1972, com a cobertura em teia, e a montra gratuita da BMW em frente.", en: "The 1972 Olympic park with its tent-like roof, and BMW's free showroom across the road." }
    ]
  },
  {
    id: "vie", n: names("Viena", "Vienna", "Viena", "Vienne", "Wien"), cur: "EUR",
    ap: { iata: "VIE", name: "Vienna (VIE)", lat: 48.1103, lng: 16.5697 }, tz: "Europe/Vienna",
    single: 3.2, card: 0, cardName: "",
    alt: { type: "pass", price: 8.0, name: "Bilhete 24 h Wiener Linien" },
    air: { m: "train", min: 25, line: "S7 Flughafen → Wien Mitte", f: 4.4 },
    ret: { core: { m: "train", min: 35, line: "U4 Karlsplatz → Wien Mitte → S7", r: 1, f: 4.4 }, extra: { m: "train", min: 50, line: "U4 Schönbrunn → Wien Mitte → S7", r: 1, f: 4.4 } },
    stops: [
      { id: "stephansdom", n: "Catedral de Santo Estêvão", a: "Innere Stadt", lat: 48.2085, lng: 16.3731, v: 25, top: true, o: true, leg: W(12, "Wien Mitte → Stephansplatz"), pt: "A catedral gótica com o telhado de azulejos coloridos. A nave é gratuita; torres e catacumbas são pagas.", en: "The Gothic cathedral with its patterned tiled roof. The nave is free; towers and catacombs are paid." },
      { id: "graben", n: "Graben e Kohlmarkt", a: "Innere Stadt", lat: 48.2088, lng: 16.3694, v: 15, leg: W(4), pt: "As ruas elegantes do centro, com a Coluna da Peste e a pastelaria Demel, fornecedora da corte.", en: "The centre's elegant streets, with the Plague Column and Demel, the former court confectioner." },
      { id: "hofburg", n: "Hofburg e Michaelerplatz", a: "Innere Stadt", lat: 48.2079, lng: 16.3667, v: 30, top: true, o: true, leg: W(5), pt: "O palácio de inverno dos Habsburgo: apartamentos imperiais, Museu Sissi e Escola Espanhola de Equitação (pagos).", en: "The Habsburgs' winter palace: Imperial Apartments, Sisi Museum and Spanish Riding School (paid)." },
      { id: "oper", n: "Ópera Estatal e Albertina", a: "Innere Stadt", lat: 48.2038, lng: 16.3688, v: 25, o: true, leg: W(6), pt: "Uma das óperas mais famosas do mundo; lugares de pé à venda no próprio dia por poucos euros.", en: "One of the world's great opera houses; standing places go on sale on the day for a few euros." },
      { id: "naschmarkt", n: "Naschmarkt", a: "Wieden", lat: 48.1985, lng: 16.3627, v: 25, cl: [0], leg: W(10), pt: "O mercado mais famoso de Viena, com bancas e restaurantes de todo o mundo. Fechado ao domingo.", en: "Vienna's best-known market, with stalls and eateries from around the world. Closed Sundays." },
      { id: "karlskirche", n: "Karlskirche", a: "Wieden", lat: 48.1981, lng: 16.3718, v: 15, o: true, leg: W(8), pt: "A igreja barroca com duas colunas inspiradas na de Trajano, refletida no lago da Karlsplatz.", en: "The baroque church with twin columns inspired by Trajan's, mirrored in the Karlsplatz pool." },
      { id: "schoenbrunn", n: "Palácio de Schönbrunn", a: "Hietzing", lat: 48.1849, lng: 16.3122, v: 60, x: true, top: true, o: true, leg: { m: "metro", min: 15, line: "U4 Karlsplatz → Schönbrunn", r: 1 }, pt: "O palácio de verão imperial, Património da UNESCO. Os jardins e a Gloriette são gratuitos; o palácio é pago.", en: "The imperial summer palace, a UNESCO site. The gardens and the Gloriette are free; the palace is paid." }
    ]
  },
  {
    id: "prg", n: names("Praga", "Prague", "Praga", "Prague", "Prag"), cur: "CZK",
    ap: { iata: "PRG", name: "Václav Havel Prague (PRG)", lat: 50.1008, lng: 14.26 }, tz: "Europe/Prague",
    single: 40, card: 0, cardName: "",
    alt: { type: "pass", price: 120, name: "Bilhete 24 h PID" },
    air: { m: "bus", min: 50, line: "Autocarro 119 → Metro A → Malostranská → elétrico 22", r: 1 },
    ret: { core: { m: "bus", min: 50, line: "Metro A Muzeum → Nádraží Veleslavín → autocarro 119", r: 1 }, extra: { m: "bus", min: 60, line: "Metro C Vyšehrad → Muzeum → Metro A → autocarro 119", r: 1 } },
    stops: [
      { id: "hrad", n: "Castelo de Praga e São Vito", a: "Hradčany", lat: 50.0909, lng: 14.4005, v: 50, top: true, o: true, leg: W(0, "Elétrico 22 → Pražský hrad"), pt: "O maior complexo de castelo antigo do mundo, com a Catedral de São Vito. Os pátios são gratuitos; os interiores, pagos.", en: "The world's largest ancient castle complex, with St Vitus Cathedral. The courtyards are free; interiors are paid." },
      { id: "mala-strana", n: "Malá Strana", a: "Malá Strana", lat: 50.0878, lng: 14.404, v: 20, leg: W(15, "Nerudova"), pt: "O Bairro Pequeno: palácios barrocos e a igreja de São Nicolau no caminho do castelo para o rio.", en: "The Lesser Town: baroque palaces and St Nicholas Church on the way down from the castle to the river." },
      { id: "karluv-most", n: "Ponte Carlos", a: "Vltava", lat: 50.0865, lng: 14.4114, v: 20, top: true, leg: W(8), pt: "A ponte gótica de 1357 com 30 estátuas de santos. Vá cedo para a ver sem multidões.", en: "The Gothic bridge of 1357 lined with 30 statues of saints. Go early to see it without crowds." },
      { id: "staromestske", n: "Praça da Cidade Velha e Relógio Astronómico", a: "Staré Město", lat: 50.087, lng: 14.4208, v: 30, top: true, o: true, leg: W(10), pt: "O relógio de 1410 anima os apóstolos à hora certa; a torre da Câmara Velha tem a melhor vista (paga).", en: "The 1410 clock parades its apostles on the hour; the Old Town Hall tower has the best view (paid)." },
      { id: "josefov", n: "Bairro Judeu (Josefov)", a: "Josefov", lat: 50.09, lng: 14.418, v: 30, o: true, cl: [6], leg: W(5), pt: "Sinagogas e o Velho Cemitério Judeu. O Museu Judaico (pago) fecha ao sábado e nas festas judaicas.", en: "Synagogues and the Old Jewish Cemetery. The Jewish Museum (paid) closes on Saturdays and Jewish holidays." },
      { id: "vaclavske", n: "Praça Venceslau", a: "Nové Město", lat: 50.081, lng: 14.428, v: 15, leg: W(15), pt: "O grande bulevar da Revolução de Veludo de 1989, rematado pelo Museu Nacional.", en: "The grand boulevard of the 1989 Velvet Revolution, crowned by the National Museum." },
      { id: "vysehrad", n: "Vyšehrad", a: "Vyšehrad", lat: 50.0645, lng: 14.418, v: 40, x: true, leg: { m: "metro", min: 10, line: "Metro C Muzeum → Vyšehrad", r: 1 }, pt: "A fortaleza sobre o rio, com a basílica e o cemitério onde estão Dvořák e Mucha. Vista sem turistas.", en: "The fortress above the river, with the basilica and the cemetery of Dvořák and Mucha. Views without crowds." }
    ]
  },
  {
    id: "sin", n: names("Singapura", "Singapore", "Singapur", "Singapour", "Singapur"), cur: "SGD",
    ap: { iata: "SIN", name: "Singapore Changi (SIN)", lat: 1.3644, lng: 103.9915 }, tz: "Asia/Singapore",
    single: 2.0, card: 0, cardName: "", alt: null,
    air: { m: "metro", min: 40, line: "MRT Changi Airport → Tanah Merah → City Hall", r: 1 },
    ret: { core: { m: "metro", min: 50, line: "MRT Chinatown → Outram Park → Tanah Merah → Changi Airport", r: 1 }, extra: { m: "metro", min: 40, line: "MRT Bugis → Tanah Merah → Changi Airport", r: 1 } },
    stops: [
      { id: "padang", n: "National Gallery e Padang", a: "Civic District", lat: 1.2904, lng: 103.8515, v: 20, o: true, leg: W(5, "MRT City Hall"), pt: "O relvado colonial e os antigos Supremo Tribunal e Câmara, hoje a National Gallery. O terraço no último piso é gratuito.", en: "The colonial green and the former Supreme Court and City Hall, now the National Gallery. Its rooftop is free." },
      { id: "merlion", n: "Merlion Park", a: "Marina Bay", lat: 1.2868, lng: 103.8545, v: 15, top: true, leg: W(10), pt: "A estátua meio leão, meio peixe, símbolo da cidade, a deitar água para a baía em frente ao Marina Bay Sands.", en: "The half-lion, half-fish statue, the city's emblem, spouting water into the bay opposite Marina Bay Sands." },
      { id: "mbs", n: "Helix Bridge e Marina Bay Sands", a: "Marina Bay", lat: 1.2834, lng: 103.8607, v: 20, top: true, o: true, leg: W(20, "Esplanade → Helix Bridge"), pt: "A ponte em dupla hélice até ao hotel das três torres. O SkyPark no topo é pago.", en: "The double-helix bridge to the three-tower hotel. The SkyPark on top is paid." },
      { id: "gardens", n: "Gardens by the Bay", a: "Marina Bay", lat: 1.2816, lng: 103.8636, v: 40, top: true, o: true, leg: W(10), pt: "As Supertrees e o espetáculo de luz Garden Rhapsody (19h45 e 20h45, gratuito). As estufas são pagas.", en: "The Supertrees and the Garden Rhapsody light show (19:45 and 20:45, free). The conservatories are paid." },
      { id: "chinatown", n: "Chinatown e Templo do Dente de Buda", a: "Chinatown", lat: 1.2815, lng: 103.8443, v: 30, top: true, leg: { m: "metro", min: 12, line: "MRT Bayfront → Chinatown", r: 1 }, pt: "Lojas antigas, o templo hindu Sri Mariamman e o templo budista do Dente de Buda, gratuito.", en: "Old shophouses, the Hindu Sri Mariamman temple and the free Buddha Tooth Relic Temple." },
      { id: "maxwell", n: "Maxwell Food Centre", a: "Chinatown", lat: 1.2803, lng: 103.8448, v: 30, leg: W(4), pt: "Um hawker centre clássico: arroz de frango de Hainan, laksa e sumo de cana por poucos dólares.", en: "A classic hawker centre: Hainanese chicken rice, laksa and sugarcane juice for a few dollars." },
      { id: "little-india", n: "Little India", a: "Little India", lat: 1.3066, lng: 103.8518, v: 30, x: true, top: true, leg: { m: "metro", min: 10, line: "MRT Chinatown → Little India", r: 1 }, pt: "Flores, especiarias e saris à volta do templo Sri Veeramakaliamman e do mercado de Tekka.", en: "Flowers, spices and saris around Sri Veeramakaliamman temple and Tekka market." },
      { id: "kampong-glam", n: "Kampong Glam e Mesquita do Sultão", a: "Kampong Glam", lat: 1.3022, lng: 103.859, v: 30, x: true, leg: W(15), pt: "A cúpula dourada da Mesquita do Sultão e os murais e cafés da Haji Lane.", en: "The Sultan Mosque's golden dome and the murals and cafés of Haji Lane." }
    ]
  }
];

/** Nomes noutros idiomas (italiano, chinês, árabe, japonês, turco, russo e coreano). */
export const MORE_CITY_NAMES: Record<string, Record<string, string>> = {
  fra: { it: "Francoforte", zh: "法兰克福", ar: "فرانكفورت", ja: "フランクフルト", tr: "Frankfurt", ru: "Франкфурт-на-Майне", ko: "프랑크푸르트" },
  ber: { it: "Berlino", zh: "柏林", ar: "برلين", ja: "ベルリン", tr: "Berlin", ru: "Берлин", ko: "베를린" },
  muc: { it: "Monaco di Baviera", zh: "慕尼黑", ar: "ميونخ", ja: "ミュンヘン", tr: "Münih", ru: "Мюнхен", ko: "뮌헨" },
  vie: { it: "Vienna", zh: "维也纳", ar: "فيينا", ja: "ウィーン", tr: "Viyana", ru: "Вена", ko: "빈" },
  prg: { it: "Praga", zh: "布拉格", ar: "براغ", ja: "プラハ", tr: "Prag", ru: "Прага", ko: "프라하" },
  sin: { it: "Singapore", zh: "新加坡", ar: "سنغافورة", ja: "シンガポール", tr: "Singapur", ru: "Сингапур", ko: "싱가포르" }
};
