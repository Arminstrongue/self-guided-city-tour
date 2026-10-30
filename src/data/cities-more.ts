/**
 * Cidades acrescentadas em outubro de 2026: Frankfurt, Berlim, Munique, Viena, Praga e Singapura —
 * grandes aeroportos de escala com o centro a menos de 45 minutos.
 * Tarifas de referência de outubro de 2026 (RMV, VBB, MVV, Wiener Linien/ÖBB, PID, LTA/SMRT): mudam sem aviso,
 * a app mostra sempre "confirme no local".
 */
import type { City, Leg } from "./cities";

const W = (min: number, line = ""): Leg => ({ m: "walk", min, line });
const names = (pt: string, en: string, es: string, fr: string, de: string) => ({ pt, en, es, fr, de });
const car = (min: number, line: string, f: number): Leg => ({ m: "car", min, line, f });

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
  },
{
    id: "zrh", n: names("Zurique", "Zurich", "Zúrich", "Zurich", "Zürich"), cur: "CHF",
    ap: { iata: "ZRH", name: "Zurich (ZRH)", lat: 47.4647, lng: 8.5492 }, tz: "Europe/Zurich",
    single: 4.7, card: 0, cardName: "",
    alt: { type: "pass", price: 29, name: "Zürich Card 24 h (com aeroporto)", includesAirport: true },
    air: { m: "train", min: 12, line: "Comboio Flughafen → Zürich HB", f: 7.2 },
    ret: { core: { m: "train", min: 25, line: "A pé até Zürich HB → Comboio → Flughafen", f: 7.2 }, extra: { m: "train", min: 25, line: "A pé até Zürich HB → Comboio → Flughafen", f: 7.2 } },
    stops: [
      { id: "zrh-bahnhofstrasse", n: "Bahnhofstrasse", a: "City", lat: 47.3725, lng: 8.5390, v: 20, top: true, leg: W(3, "Zürich HB → Bahnhofstrasse"), pt: "A rua comercial mais famosa da cidade, da estação central até ao lago, com relojoarias, joalharias e os bancos da Paradeplatz.", en: "The city's most famous shopping street, from the main station to the lake, with watchmakers, jewellers and the banks of Paradeplatz." },
      { id: "zrh-lindenhof", n: "Lindenhof", a: "Altstadt", lat: 47.3729, lng: 8.5410, v: 15, leg: W(6, "Pela Rennweg"), pt: "A colina onde nasceu Zurique: forte romano, jogadores de xadrez e vista sobre o Limmat e o Grossmünster.", en: "The hill where Zurich began: a Roman fort site, chess players and views over the Limmat and the Grossmünster." },
      { id: "zrh-stpeter", n: "Igreja de São Pedro (St. Peter)", a: "Altstadt", lat: 47.3710, lng: 8.5410, v: 10, leg: W(3), pt: "A igreja paroquial mais antiga da cidade, com o maior mostrador de relógio de torre da Europa: 8,7 m.", en: "The city's oldest parish church, with Europe's largest tower clock face: 8.7 m across." },
      { id: "zrh-fraumuenster", n: "Fraumünster (vitrais de Chagall)", a: "Altstadt", lat: 47.3697, lng: 8.5413, v: 20, top: true, o: true, leg: W(3), pt: "A abadia fundada em 853, com os cinco vitrais de Marc Chagall no coro. Entrada paga (CHF 5).", en: "The abbey church founded in 853, with Marc Chagall's five stained-glass windows in the choir. Paid entry (CHF 5)." },
      { id: "zrh-buerkliplatz", n: "Bürkliplatz e lago de Zurique", a: "Seefeld / City", lat: 47.3667, lng: 8.5410, v: 20, leg: W(5), pt: "O cais sobre o lago, com barcos, mercado e vista para os Alpes em dias limpos.", en: "The lakeside quay, with boats, a market and views of the Alps on clear days." },
      { id: "zrh-grossmuenster", n: "Grossmünster", a: "Altstadt", lat: 47.3701, lng: 8.5441, v: 25, top: true, o: true, leg: W(8, "Pela Quaibrücke e Limmatquai"), pt: "As torres gémeas símbolo de Zurique, onde Zwingli lançou a Reforma em 1519. A torre Karlsturm é paga (CHF 5).", en: "The twin-towered symbol of Zurich, where Zwingli launched the Reformation in 1519. The Karlsturm tower is paid (CHF 5)." },
      { id: "zrh-niederdorf", n: "Niederdorf", a: "Altstadt", lat: 47.3727, lng: 8.5440, v: 25, leg: W(5), pt: "O coração pedonal da cidade velha, com vielas, lojas, cafés e o Cabaret Voltaire, berço do Dada.", en: "The car-free heart of the Old Town, with lanes, shops, cafés and the Cabaret Voltaire, birthplace of Dada." },
      { id: "zrh-polyterrasse", n: "Polyterrasse e ETH", a: "Hochschulen", lat: 47.3765, lng: 8.5475, v: 20, x: true, leg: { m: "tram", min: 5, line: "A pé até Central → Polybahn → Polyterrasse", f: 1.2 }, pt: "O funicular de 1889 sobe ao terraço da ETH, onde estudou Einstein, com vista sobre os telhados e o lago.", en: "The 1889 funicular climbs to the terrace of ETH, where Einstein studied, with views over the rooftops and the lake." }
    ]
  },
{
    id: "brn", n: names("Berna", "Bern", "Berna", "Berne", "Bern"), cur: "CHF",
    ap: { iata: "ZRH", name: "Zurich (ZRH)", lat: 47.4647, lng: 8.5492 }, tz: "Europe/Zurich",
    single: 5.2, card: 0, cardName: "",
    alt: { type: "pass", price: 10.4, name: "Tageskarte Libero (zonas 100/101)" },
    air: { m: "train", min: 75, line: "IC Zürich Flughafen → Bern" },
    ret: { core: { m: "train", min: 100, line: "A pé até Bern Bahnhof → IC → Zürich Flughafen" }, extra: { m: "train", min: 95, line: "Autocarro 12 → Bern Bahnhof → IC → Zürich Flughafen", r: 1 } },
    stops: [
      { id: "brn-bundeshaus", n: "Palácio Federal (Bundeshaus)", a: "Bundesplatz", lat: 46.9466, lng: 7.4441, v: 20, top: true, leg: W(5, "Bern Bahnhof → Bundesplatz"), pt: "A sede do parlamento e do governo suíço, com cúpula verde e terraço sobre o Aare. Visitas guiadas gratuitas, com reserva.", en: "The seat of the Swiss parliament and government, with a green dome and a terrace above the Aare. Free guided tours, booking advised." },
      { id: "brn-zytglogge", n: "Torre do Relógio (Zytglogge)", a: "Altstadt", lat: 46.9479, lng: 7.4476, v: 15, top: true, o: true, leg: W(6, "Pela Marktgasse"), pt: "A torre do século XIII com relógio astronómico; à hora certa desfilam ursos, o bobo e o galo.", en: "The 13th-century tower with an astronomical clock; on the hour, bears, a jester and a rooster parade." },
      { id: "brn-einsteinhaus", n: "Casa de Einstein", a: "Kramgasse", lat: 46.9481, lng: 7.4505, v: 25, o: true, leg: W(3, "Pela Kramgasse"), pt: "O apartamento onde Einstein viveu de 1903 a 1905, nos anos da relatividade restrita. Entrada paga (CHF 8).", en: "The flat where Einstein lived from 1903 to 1905, the years of special relativity. Paid entry (CHF 8)." },
      { id: "brn-muenster", n: "Catedral de Berna (Münster)", a: "Altstadt", lat: 46.9472, lng: 7.4511, v: 25, top: true, o: true, leg: W(4), pt: "A torre de igreja mais alta da Suíça e o portal do Juízo Final. A igreja é gratuita; a torre é paga (CHF 6).", en: "Switzerland's tallest church tower and the Last Judgement portal. The church is free; the tower is paid (CHF 6)." },
      { id: "brn-baerenpark", n: "Parque dos Ursos (BärenPark)", a: "Nydegg", lat: 46.9480, lng: 7.4597, v: 20, top: true, leg: W(12, "Pela Junkerngasse e Nydeggbrücke"), pt: "Os ursos, símbolo de Berna, vivem na encosta sobre o Aare, junto à ponte de Nydegg. Gratuito.", en: "The bears, Bern's emblem, live on the slope above the Aare by the Nydegg Bridge. Free." },
      { id: "brn-rosengarten", n: "Rosengarten", a: "Altenberg", lat: 46.9520, lng: 7.4600, v: 20, leg: W(10, "A subir"), pt: "Mais de 250 variedades de rosas e uma vista ampla sobre a cidade velha e a curva do Aare.", en: "More than 250 rose varieties and a wide view over the Old Town and the bend of the Aare." },
      { id: "brn-paulklee", n: "Zentrum Paul Klee", a: "Schöngrün", lat: 46.9489, lng: 7.4746, v: 60, x: true, o: true, cl: [1], leg: { m: "bus", min: 25, line: "Autocarro 12 → Zentrum Paul Klee", r: 1 }, pt: "Cerca de 4000 obras de Paul Klee no edifício em ondas de Renzo Piano. Pago; fechado à segunda.", en: "Some 4,000 works by Paul Klee in Renzo Piano's wave-shaped building. Paid; closed Mondays." }
    ]
  },
{
    id: "ath", n: names("Atenas", "Athens", "Atenas", "Athènes", "Athen"), cur: "EUR",
    ap: { iata: "ATH", name: "Athens International (ATH)", lat: 37.9364, lng: 23.9445 }, tz: "Europe/Athens",
    single: 1.2, card: 0, cardName: "",
    alt: { type: "pass", price: 4.1, name: "Bilhete 24 h OASA (sem aeroporto)" },
    air: { m: "metro", min: 40, line: "Metro 3 Aeroporto → Syntagma", f: 9.0 },
    ret: { core: { m: "metro", min: 45, line: "Metro 3 Monastiraki → Aeroporto (de 36 em 36 min)", f: 9.0 }, extra: { m: "metro", min: 45, line: "Metro 3 Evangelismos → Aeroporto (de 36 em 36 min)", f: 9.0 } },
    stops: [
      { id: "ath-syntagma", n: "Praça Syntagma e Parlamento", a: "Syntagma", lat: 37.9755, lng: 23.7348, v: 20, top: true, leg: W(0, "Metro Syntagma"), pt: "O Parlamento, antigo palácio real, e o Túmulo do Soldado Desconhecido, onde os evzones de saiote trocam a guarda a cada hora.", en: "The Parliament, a former royal palace, and the Tomb of the Unknown Soldier, where kilted Evzones change the guard every hour." },
      { id: "ath-plaka", n: "Plaka e Anafiotika", a: "Plaka", lat: 37.9722, lng: 23.7278, v: 30, leg: W(12, "Rua Kydathineon"), pt: "O bairro mais antigo da cidade, aos pés da Acrópole; lá em cima, as casinhas brancas de Anafiotika parecem uma ilha das Cíclades.", en: "The city's oldest quarter at the foot of the Acropolis; above it, the whitewashed houses of Anafiotika look like a Cycladic island." },
      { id: "ath-museum", n: "Museu da Acrópole", a: "Makrygianni", lat: 37.9686, lng: 23.7285, v: 60, top: true, o: true, leg: W(10), pt: "O museu de vidro de 2009 com as esculturas originais da Acrópole; por baixo, as escavações de um bairro antigo. Pago.", en: "The 2009 glass museum holding the Acropolis's original sculptures; beneath it, an excavated ancient neighbourhood. Paid." },
      { id: "ath-acropolis", n: "Acrópole e Pártenon", a: "Acrópole", lat: 37.9715, lng: 23.7267, v: 90, top: true, o: true, leg: W(5, "Entrada sul · Dionysiou Areopagitou"), pt: "O templo de Atena do século V a.C., Património da UNESCO. Bilhete com hora marcada (30 €): reserve online e vá cedo, antes do calor.", en: "Athena's 5th-century BC temple, a UNESCO site. Timed ticket (€30): book online and go early, before the heat." },
      { id: "ath-agora", n: "Ágora Antiga e Templo de Hefesto", a: "Thiseio", lat: 37.9749, lng: 23.7243, v: 45, o: true, leg: W(15, "Pelo Areópago"), pt: "A praça onde Sócrates ensinava, com um dos templos gregos mais bem conservados e a Stoa de Átalo reconstruída. Paga.", en: "The square where Socrates taught, with one of the best-preserved Greek temples and the rebuilt Stoa of Attalos. Paid." },
      { id: "ath-monastiraki", n: "Monastiraki", a: "Monastiraki", lat: 37.976, lng: 23.7256, v: 25, leg: W(6), pt: "A praça da mesquita otomana e da Biblioteca de Adriano, à entrada da feira da ladra e das ruas do souvlaki.", en: "The square of the Ottoman mosque and Hadrian's Library, at the gate of the flea market and the souvlaki streets." },
      { id: "ath-lycabettus", n: "Monte Licabeto", a: "Kolonaki", lat: 37.9819, lng: 23.7433, v: 50, x: true, top: true, leg: { m: "metro", min: 25, line: "Metro 3 Monastiraki → Evangelismos + subida", r: 1 }, pt: "A colina mais alta do centro, com a capela de São Jorge no topo e Atenas até ao mar. Sobe-se a pé ou de funicular (pago).", en: "The highest hill in the centre, with St George's chapel on top and Athens spread out to the sea. Walk up or take the funicular (paid)." }
    ]
  },
{
    id: "fnc", n: names("Funchal", "Funchal", "Funchal", "Funchal", "Funchal"), cur: "EUR",
    ap: { iata: "FNC", name: "Madeira Cristiano Ronaldo (FNC)", lat: 32.6979, lng: -16.7745 }, tz: "Atlantic/Madeira",
    single: 1.45, card: 0.5, cardName: "cartão GIRO",
    alt: { type: "pass", price: 4.95, name: "Passe 1 dia Horários do Funchal (municipal)" },
    air: { m: "bus", min: 45, line: "Aerobus Aeroporto → Avenida do Mar", f: 5.55 },
    ret: { core: { m: "bus", min: 45, line: "Aerobus Avenida do Mar → Aeroporto", f: 5.55 }, extra: { m: "bus", min: 75, line: "Autocarro 31 Jardim Botânico → centro → Aerobus", r: 1, f: 5.55 } },
    stops: [
      { id: "fnc-se", n: "Sé do Funchal", a: "Sé", lat: 32.6483, lng: -16.9083, v: 20, top: true, leg: W(5, "Avenida do Mar → Rua da Sé"), pt: "A catedral elevada a sé em 1514, com portal gótico e teto mudéjar em cedro da ilha. Entrada gratuita.", en: "The church raised to cathedral in 1514, with a Gothic portal and a Mudéjar ceiling of island cedar. Free to enter." },
      { id: "fnc-municipio", n: "Praça do Município e Igreja do Colégio", a: "Sé", lat: 32.6497, lng: -16.9078, v: 20, o: true, leg: W(5), pt: "A praça calcetada entre a Câmara do século XVIII e a Igreja do Colégio, do século XVII. Ao lado, o Museu de Arte Sacra (pago).", en: "The paved square between the 18th-century City Hall and the 17th-century Colégio Church. Next door, the Museum of Sacred Art (paid)." },
      { id: "fnc-lavradores", n: "Mercado dos Lavradores", a: "Santa Maria Maior", lat: 32.6486, lng: -16.9039, v: 25, top: true, cl: [0], leg: W(8), pt: "O mercado de 1940 com painéis de azulejo: frutos tropicais, flores e o peixe-espada-preto. Fechado ao domingo.", en: "The 1940 market with tile panels: tropical fruit, flowers and black scabbardfish. Closed Sundays." },
      { id: "fnc-santa-maria", n: "Zona Velha e Rua de Santa Maria", a: "Santa Maria Maior", lat: 32.648, lng: -16.901, v: 25, top: true, leg: W(5), pt: "Uma das primeiras zonas povoadas do Funchal, com cerca de 200 portas pintadas por artistas.", en: "One of Funchal's first settled areas, with around 200 doors painted by artists." },
      { id: "fnc-sao-tiago", n: "Forte de São Tiago", a: "Santa Maria Maior", lat: 32.6467, lng: -16.8986, v: 20, leg: W(5), pt: "O forte amarelo de 1614 que defendia o porto, junto à praia da Barreirinha. Entrada gratuita, com vista sobre a baía.", en: "The yellow fort of 1614 that guarded the harbour, beside Barreirinha beach. Free to enter, with views over the bay." },
      { id: "fnc-monte", n: "Monte: igreja e carros de cesto", a: "Monte", lat: 32.676, lng: -16.9025, v: 50, x: true, top: true, o: true, leg: { m: "bus", min: 20, line: "Teleférico Zona Velha → Monte", f: 14.5 }, pt: "A igreja onde repousa o último imperador da Áustria; daqui descem os carros de cesto, 2 km em cerca de 10 minutos (pago).", en: "The church where the last Austrian emperor lies; from here the wicker toboggans run 2 km down in about 10 minutes (paid)." },
      { id: "fnc-botanico", n: "Jardim Botânico da Madeira", a: "Bom Sucesso", lat: 32.6622, lng: -16.8958, v: 45, x: true, o: true, leg: { m: "bus", min: 15, line: "Teleférico Babosas → Jardim Botânico" }, pt: "Mais de 2000 plantas de todos os continentes numa antiga quinta com vista sobre a baía. Entrada paga.", en: "More than 2,000 plants from every continent on a former estate overlooking the bay. Paid entry." }
    ]
  },
{
    id: "dub", n: names("Dublin", "Dublin", "Dublín", "Dublin", "Dublin"), cur: "EUR",
    ap: { iata: "DUB", name: "Dublin (DUB)", lat: 53.4213, lng: -6.2701 }, tz: "Europe/Dublin",
    single: 2.6, card: 0, cardName: "",
    alt: { type: "pass", price: 8.0, name: "TFI Leap Visitor Card 24 h", includesAirport: true },
    air: { m: "bus", min: 40, line: "Autocarro 16 Aeroporto → O'Connell Street", r: 1 },
    ret: { core: { m: "bus", min: 55, line: "A pé até George's Street → Autocarro 16 → Aeroporto", r: 1 }, extra: { m: "bus", min: 55, line: "A pé até Heuston → Dublin Express 782 → Aeroporto", f: 8 } },
    stops: [
      { id: "dub-gpo", n: "General Post Office e O'Connell Street", a: "O'Connell Street", lat: 53.3493, lng: -6.2611, v: 15, top: true, leg: W(2, "Paragem O'Connell Street"), pt: "O correio de 1818 onde Patrick Pearse leu a Proclamação da República na Páscoa de 1916. Da revolta só sobrou a fachada de granito.", en: "The 1818 post office where Patrick Pearse read the Proclamation of the Republic at Easter 1916. Only the granite façade survived the Rising." },
      { id: "dub-hapenny", n: "Ponte Ha'penny e Temple Bar", a: "Temple Bar", lat: 53.3463, lng: -6.2631, v: 25, top: true, leg: W(5), pt: "A ponte pedonal de ferro de 1816 sobre o Liffey e, do outro lado, as ruas empedradas de pubs, galerias e música ao vivo de Temple Bar.", en: "The 1816 cast-iron footbridge over the Liffey and, across it, Temple Bar's cobbled lanes of pubs, galleries and live music." },
      { id: "dub-trinity", n: "Trinity College e Livro de Kells", a: "College Green", lat: 53.3439, lng: -6.2575, v: 45, top: true, o: true, leg: W(8), pt: "O pátio da universidade de 1592 é livre; a Old Library, com a Long Room e o Livro de Kells, é paga e com hora marcada.", en: "The 1592 university's courtyards are free; the Old Library, with the Long Room and the Book of Kells, is paid and timed." },
      { id: "dub-grafton", n: "Grafton Street", a: "Grafton Street", lat: 53.3414, lng: -6.2603, v: 15, leg: W(5), pt: "A rua pedonal das compras, com músicos de rua a cada esquina; a estátua de Molly Malone está ao lado, na Suffolk Street.", en: "The pedestrian shopping street, with buskers on every corner; the Molly Malone statue is just off it on Suffolk Street." },
      { id: "dub-stephens", n: "St Stephen's Green", a: "St Stephen's Green", lat: 53.3382, lng: -6.2592, v: 20, leg: W(5), pt: "O parque vitoriano no topo da Grafton Street, com lago, patos e o Arco dos Fuzileiros à entrada.", en: "The Victorian park at the top of Grafton Street, with a lake, ducks and the Fusiliers' Arch at the entrance." },
      { id: "dub-stpatricks", n: "Catedral de São Patrício", a: "The Liberties", lat: 53.3395, lng: -6.2715, v: 30, top: true, o: true, leg: W(15, "Pela Aungier Street"), pt: "A maior igreja da Irlanda, fundada em 1191, onde Jonathan Swift foi deão e está sepultado. Entrada paga.", en: "Ireland's largest church, founded in 1191, where Jonathan Swift was dean and lies buried. Paid entry." },
      { id: "dub-christchurch", n: "Catedral de Christ Church", a: "Old City", lat: 53.3431, lng: -6.2714, v: 30, o: true, leg: W(6), pt: "A catedral viking-normanda de cerca de 1030, com a maior cripta da Irlanda e da Grã-Bretanha e o túmulo de Strongbow (pago).", en: "The Viking-Norman cathedral from around 1030, with the largest crypt in Britain or Ireland and Strongbow's tomb (paid)." },
      { id: "dub-guinness", n: "Guinness Storehouse", a: "St James's Gate", lat: 53.3419, lng: -6.2867, v: 90, x: true, top: true, o: true, leg: W(15, "Pela Thomas Street"), pt: "Sete pisos na antiga fermentação de 1902 da cervejaria, com uma pint incluída no Gravity Bar e vista de 360°. Reserve.", en: "Seven floors in the brewery's 1902 fermentation plant, with a pint included at the Gravity Bar and a 360° view. Book ahead." },
      { id: "dub-kilmainham", n: "Prisão de Kilmainham", a: "Kilmainham", lat: 53.3417, lng: -6.3094, v: 60, x: true, o: true, leg: W(20), pt: "A prisão de 1796 onde foram fuzilados os líderes da revolta de 1916. Só com visita guiada e bilhete comprado online.", en: "The 1796 gaol where the leaders of the 1916 Rising were executed. Guided tour only, with tickets bought online." }
    ]
  },
{
    id: "dar", n: names("Dar es Salaam", "Dar es Salaam", "Dar es Salaam", "Dar es Salaam", "Daressalam"), cur: "TZS",
    ap: { iata: "DAR", name: "Julius Nyerere International (DAR)", lat: -6.8781, lng: 39.2026 }, tz: "Africa/Dar_es_Salaam",
    single: 1000, card: 0, cardName: "", alt: null,
    air: car(40, "Bolt/táxi JNIA → Museu Nacional", 20000),
    ret: { core: car(40, "Bolt/táxi Kariakoo → JNIA", 20000), extra: car(45, "Bolt/táxi Coco Beach → JNIA", 20000) },
    stops: [
      { id: "dar-museum", n: "Museu Nacional e Jardim Botânico", a: "Kivukoni", lat: -6.8139, lng: 39.2886, v: 45, top: true, o: true, leg: W(0), pt: "O museu de 1934 com o crânio de Paranthropus boisei encontrado pelos Leakey em Olduvai, a história de Kilwa e da época colonial; ao lado, o jardim botânico.", en: "The 1934 museum with the Paranthropus boisei skull found by the Leakeys at Olduvai, the story of Kilwa and the colonial era; next door, the botanical garden." },
      { id: "dar-askari", n: "Monumento Askari", a: "Kivukoni", lat: -6.8166, lng: 39.2896, v: 10, leg: W(5), pt: "A estátua de bronze de 1927 aos soldados e carregadores africanos da Primeira Guerra Mundial, no ponto que marca o centro da cidade.", en: "The 1927 bronze statue to the African soldiers and porters of the First World War, at the spot said to mark the city centre." },
      { id: "dar-stjoseph", n: "Catedral de São José", a: "Kivukoni", lat: -6.8175, lng: 39.2915, v: 15, leg: W(5, "Pela Sokoine Drive"), pt: "A catedral católica de torre gótica virada para o porto, do tempo da África Oriental Alemã.", en: "The Catholic cathedral with a Gothic spire facing the harbour, from the days of German East Africa." },
      { id: "dar-azania", n: "Igreja Luterana de Azania Front", a: "Kivukoni", lat: -6.816, lng: 39.294, v: 15, leg: W(5), pt: "A igreja luterana alemã de 1899–1902, com telhado de telha vermelha e campanário, na marginal do porto.", en: "The German Lutheran church of 1899–1902, with a red-tiled roof and belfry, on the harbour front." },
      { id: "dar-fish", n: "Mercado de peixe de Kivukoni", a: "Kivukoni", lat: -6.8215, lng: 39.297, v: 30, top: true, leg: W(10, "Pelo passeio marítimo"), pt: "O grande mercado de peixe da cidade, junto ao ferry de Kigamboni: leilões de manhã cedo, polvo, lulas e peixe frito na hora.", en: "The city's great fish market, by the Kigamboni ferry: early-morning auctions, octopus, squid and fish fried on the spot." },
      { id: "dar-kariakoo", n: "Mercado de Kariakoo", a: "Kariakoo", lat: -6.8189, lng: 39.2743, v: 40, top: true, leg: car(10, "Bolt/bajaji → Kariakoo", 5000), pt: "O bairro comercial e o mercado central, com fruta, especiarias e tecidos kanga. O nome vem do Carrier Corps da Primeira Guerra. Leve pouco.", en: "The shopping district and central market, with fruit, spices and kanga cloth. The name comes from the First World War Carrier Corps. Carry little." },
      { id: "dar-village", n: "Village Museum (Makumbusho)", a: "Mikocheni", lat: -6.7738, lng: 39.2698, v: 75, x: true, o: true, leg: car(30, "Bolt/táxi → Makumbusho", 13000), pt: "O museu ao ar livre de 1967 com casas tradicionais de 16 povos da Tanzânia e música e dança todos os dias (pago).", en: "The open-air museum from 1967 with traditional houses of 16 Tanzanian peoples and daily music and dance (paid)." },
      { id: "dar-coco", n: "Coco Beach (Oyster Bay)", a: "Oyster Bay", lat: -6.7753, lng: 39.293, v: 45, x: true, leg: car(10, "Bolt/táxi → Coco Beach", 5000), pt: "A praia urbana de areia branca de Oyster Bay, onde a cidade vem ao fim da tarde comer milho assado e mandioca frita.", en: "Oyster Bay's white-sand city beach, where locals come in the late afternoon for roast maize and fried cassava." }
    ]
  },
{
    id: "hkg", n: names("Hong Kong", "Hong Kong", "Hong Kong", "Hong Kong", "Hongkong"), cur: "HKD",
    ap: { iata: "HKG", name: "Hong Kong International (HKG)", lat: 22.308, lng: 113.9185 }, tz: "Asia/Hong_Kong",
    single: 12, card: 0, cardName: "",
    alt: { type: "pass", price: 75, name: "MTR Tourist Day Pass (24 h, sem Airport Express)" },
    air: { m: "train", min: 24, line: "Airport Express → Hong Kong (Central)", f: 120 },
    ret: { core: { m: "train", min: 50, line: "MTR East Tsim Sha Tsui → Austin → Airport Express Kowloon", r: 1, f: 105 }, extra: { m: "train", min: 55, line: "MTR Mong Kok → Lai King → Tsing Yi → Airport Express", r: 1, f: 73 } },
    stops: [
      { id: "hkg-statue-square", n: "Statue Square e Tribunal de Última Instância", a: "Central", lat: 22.2808, lng: 114.1597, v: 15, leg: W(8, "Hong Kong (IFC) a pé"), pt: "A praça colonial entre as torres do HSBC e do Bank of China, com o antigo Supremo Tribunal de granito, hoje Tribunal de Última Instância.", en: "The colonial square between the HSBC and Bank of China towers, with the granite former Supreme Court, now the Court of Final Appeal." },
      { id: "hkg-peak", n: "Victoria Peak (Peak Tram)", a: "The Peak", lat: 22.2709, lng: 114.1497, v: 45, top: true, c: 116, o: true, leg: { m: "tram", min: 20, line: "A pé até Garden Road → Peak Tram" }, pt: "O funicular de 1888 sobe quase 400 metros até à Peak Tower e à vista sobre o porto. Ida e volta incluída; o terraço Sky Terrace 428 é pago.", en: "The 1888 funicular climbs almost 400 metres to the Peak Tower and the harbour view. Return ride included; the Sky Terrace 428 deck is paid." },
      { id: "hkg-tai-kwun", n: "Tai Kwun", a: "Central", lat: 22.2817, lng: 114.1544, v: 25, leg: { m: "tram", min: 20, line: "Peak Tram → Garden Road a pé" }, pt: "A antiga esquadra central, a prisão Victoria e o tribunal, recuperados em 2018 como centro de arte e património. Entrada gratuita.", en: "The former Central Police Station, Victoria Prison and magistracy, restored in 2018 as a heritage and arts centre. Free entry." },
      { id: "hkg-man-mo", n: "Templo Man Mo", a: "Sheung Wan", lat: 22.284, lng: 114.1503, v: 20, top: true, leg: W(10, "Hollywood Road"), pt: "Templo de 1847 aos deuses da literatura e da guerra, com espirais de incenso penduradas do teto. Gratuito, das 8h às 18h.", en: "An 1847 temple to the gods of literature and war, with incense coils hanging from the ceiling. Free, 8:00–18:00." },
      { id: "hkg-tst", n: "Star Ferry e Torre do Relógio", a: "Tsim Sha Tsui", lat: 22.2936, lng: 114.1694, v: 20, top: true, c: 5, leg: { m: "ferry", min: 30, line: "A pé até Central Pier 7 → Star Ferry" }, pt: "A travessia clássica do porto por poucos dólares até à torre de 1915 da antiga estação de Kowloon. Ao lado, o Museu de Arte (gratuito).", en: "The classic harbour crossing for a few dollars to the 1915 clock tower of the old Kowloon station. Next door, the free Museum of Art." },
      { id: "hkg-avenue-stars", n: "Avenue of Stars e Symphony of Lights", a: "Tsim Sha Tsui", lat: 22.2933, lng: 114.1745, v: 30, top: true, leg: W(10, "Tsim Sha Tsui Promenade"), pt: "O passeio do cinema de Hong Kong, com a estátua de Bruce Lee e o skyline da Ilha em frente. Às 20h, espetáculo de luzes gratuito.", en: "The promenade honouring Hong Kong cinema, with Bruce Lee's statue and the Island skyline opposite. Free light show at 20:00." },
      { id: "hkg-temple-street", n: "Mercado noturno de Temple Street", a: "Yau Ma Tei", lat: 22.306, lng: 114.1698, v: 30, x: true, leg: { m: "metro", min: 15, line: "MTR Tsim Sha Tsui → Jordan", r: 1 }, pt: "Bancas de bugigangas, adivinhos e marisco em mesas de rua, do fim da tarde até tarde.", en: "Stalls of trinkets, fortune tellers and seafood at street tables, from late afternoon until late." },
      { id: "hkg-ladies-market", n: "Ladies' Market (Tung Choi Street)", a: "Mong Kok", lat: 22.3187, lng: 114.1716, v: 30, x: true, leg: { m: "metro", min: 10, line: "MTR Jordan → Mong Kok", r: 1 }, pt: "Cerca de um quilómetro de bancas de roupa e lembranças num dos bairros mais densos do mundo. Regateie e pague em dinheiro.", en: "About a kilometre of clothes and souvenir stalls in one of the world's densest districts. Bargain and pay cash." }
    ]
  },
{
    id: "bkk", n: names("Banguecoque", "Bangkok", "Bangkok", "Bangkok", "Bangkok"), cur: "THB",
    ap: { iata: "BKK", name: "Suvarnabhumi (BKK)", lat: 13.69, lng: 100.7501 }, tz: "Asia/Bangkok",
    single: 25, card: 0, cardName: "", alt: null,
    air: { m: "train", min: 60, line: "Airport Rail Link → Makkasan → MRT Phetchaburi → Sanam Chai", r: 1, f: 35 },
    ret: { core: { m: "train", min: 55, line: "MRT Hua Lamphong → Phetchaburi → Airport Rail Link Makkasan", r: 1, f: 35 }, extra: { m: "train", min: 50, line: "BTS National Stadium → Siam → Phaya Thai → Airport Rail Link", r: 1, f: 45 } },
    stops: [
      { id: "bkk-grand-palace", n: "Grande Palácio e Wat Phra Kaew", a: "Rattanakosin", lat: 13.75, lng: 100.4913, v: 60, top: true, o: true, leg: W(15, "MRT Sanam Chai a pé"), pt: "A residência real desde 1782 e o templo do Buda de Esmeralda. Bilhete de 500 THB, à venda das 8h30 às 15h30; mangas e calças compridas.", en: "The royal residence since 1782 and the temple of the Emerald Buddha. THB 500 ticket, sold 8:30–15:30; sleeves and long trousers." },
      { id: "bkk-wat-pho", n: "Wat Pho (Buda Reclinado)", a: "Rattanakosin", lat: 13.7465, lng: 100.493, v: 40, top: true, o: true, leg: W(10), pt: "O Buda reclinado dourado de 46 metros e a escola de massagem tailandesa do templo. Entrada de 300 THB.", en: "The 46-metre gilded Reclining Buddha and the temple's Thai massage school. THB 300 entry." },
      { id: "bkk-wat-arun", n: "Wat Arun (Templo da Aurora)", a: "Thonburi", lat: 13.7437, lng: 100.4888, v: 30, top: true, o: true, leg: { m: "ferry", min: 15, line: "Tha Tien → ferry → Wat Arun" }, pt: "Do outro lado do rio, a torre coberta de porcelana chinesa. Travessia de barco de poucos minutos; entrada paga.", en: "Across the river, the tower covered in Chinese porcelain. A few minutes by crossing ferry; paid entry." },
      { id: "bkk-yaowarat", n: "Chinatown (Yaowarat)", a: "Samphanthawong", lat: 13.7408, lng: 100.5097, v: 40, top: true, leg: { m: "metro", min: 25, line: "Ferry → Tha Tien → MRT Sanam Chai → Wat Mangkon", r: 1 }, pt: "A avenida dos letreiros néon e das lojas de ouro; ao fim da tarde, as bancas de comida enchem os passeios.", en: "The avenue of neon signs and gold shops; in the evening, food stalls fill the pavements." },
      { id: "bkk-wat-traimit", n: "Wat Traimit (Buda de Ouro)", a: "Samphanthawong", lat: 13.7378, lng: 100.5135, v: 25, o: true, leg: W(10), pt: "O Buda de ouro maciço de cinco toneladas e meia, escondido durante séculos sob estuque. Aberto das 8h às 17h; entrada paga.", en: "The five-and-a-half-tonne solid gold Buddha, hidden for centuries under stucco. Open 8:00–17:00; paid entry." },
      { id: "bkk-lumphini", n: "Parque Lumphini", a: "Pathum Wan", lat: 13.7314, lng: 100.5414, v: 30, x: true, leg: { m: "metro", min: 15, line: "MRT Hua Lamphong → Lumphini", r: 1 }, pt: "O grande parque da cidade, com lagos, varanos e tai chi ao amanhecer. Gratuito.", en: "The city's great park, with lakes, monitor lizards and tai chi at dawn. Free." },
      { id: "bkk-jim-thompson", n: "Casa de Jim Thompson", a: "Pathum Wan", lat: 13.7492, lng: 100.5283, v: 45, x: true, o: true, leg: { m: "metro", min: 25, line: "MRT Lumphini → Si Lom → BTS Sala Daeng → National Stadium", r: 2 }, pt: "Casas de teca tradicionais do americano que relançou a seda tailandesa. Visita só com guia, 250 THB, até às 17h.", en: "Traditional teak houses of the American who revived Thai silk. Guided visits only, THB 250, until 17:00." }
    ]
  },
{
    id: "dps", n: names("Bali (Ubud)", "Bali (Ubud)", "Bali (Ubud)", "Bali (Ubud)", "Bali (Ubud)"), cur: "IDR",
    ap: { iata: "DPS", name: "I Gusti Ngurah Rai (DPS)", lat: -8.7482, lng: 115.1672 }, tz: "Asia/Makassar",
    single: 0, card: 0, cardName: "", alt: null,
    air: { m: "car", min: 90, line: "Grab/táxi do aeroporto → Palácio de Ubud" },
    ret: { core: { m: "car", min: 90, line: "Grab/táxi Campuhan → Aeroporto" }, extra: { m: "car", min: 100, line: "Grab/táxi Tegallalang → Aeroporto" } },
    stops: [
      { id: "dps-palace", n: "Palácio de Ubud (Puri Saren Agung)", a: "Ubud", lat: -8.5067, lng: 115.2626, v: 20, top: true, leg: W(0, "Jalan Raya Ubud"), pt: "O palácio da família real de Ubud, com portões de pedra esculpidos e pátios abertos ao público; à noite há danças balinesas no pavilhão principal.", en: "The palace of Ubud's royal family, with carved stone gateways and courtyards open to the public; at night Balinese dances are held in the main pavilion." },
      { id: "dps-market", n: "Mercado de Arte de Ubud", a: "Ubud", lat: -8.5071, lng: 115.2631, v: 30, leg: W(2), pt: "O mercado em frente ao palácio, com tecidos, máscaras, cestos, pinturas e prata; de manhã cedo ainda se vendem fruta e flores para as oferendas. Regateie com simpatia.", en: "The market opposite the palace, with fabrics, masks, baskets, paintings and silver; early in the morning fruit and flowers for offerings are still sold. Bargain with a smile." },
      { id: "dps-monkey", n: "Floresta Sagrada dos Macacos", a: "Padangtegal", lat: -8.5188, lng: 115.2584, v: 60, top: true, o: true, leg: W(15, "Pela Jalan Monkey Forest"), pt: "Mais de mil macacos-de-cauda-longa entre templos do século XIV e árvores gigantes (pago). Não leve comida nem sacos de plástico e não olhe os macacos nos olhos.", en: "More than a thousand long-tailed macaques among 14th-century temples and giant trees (paid). Bring no food or plastic bags and don't look the monkeys in the eye." },
      { id: "dps-saraswati", n: "Templo Taman Saraswati", a: "Ubud", lat: -8.506, lng: 115.2615, v: 15, top: true, leg: W(20, "Jalan Monkey Forest → Jalan Raya Ubud"), pt: "O templo da deusa das artes e do saber, desenhado por Lempad nos anos 1950, com um lago de lótus à entrada.", en: "The temple of the goddess of arts and learning, designed by Lempad in the 1950s, with a lotus pond at the entrance." },
      { id: "dps-lukisan", n: "Museu Puri Lukisan", a: "Ubud", lat: -8.5051, lng: 115.2603, v: 45, o: true, leg: W(3), pt: "O primeiro museu de arte de Bali, aberto em 1956, com a pintura balinesa moderna e os desenhos de Lempad, entre jardins (pago).", en: "Bali's first art museum, opened in 1956, with modern Balinese painting and Lempad's drawings, set in gardens (paid)." },
      { id: "dps-campuhan", n: "Campuhan Ridge Walk", a: "Campuhan", lat: -8.5045, lng: 115.2555, v: 60, top: true, leg: W(10, "Jalan Raya Ubud → ponte de Campuhan"), pt: "O passeio pela crista de erva entre dois vales de rio, a começar junto ao templo Gunung Lebah. Vá cedo ou ao fim da tarde, quando está mais fresco.", en: "The walk along a grassy ridge between two river valleys, starting by Gunung Lebah temple. Go early or late in the afternoon, when it's cooler." },
      { id: "dps-tegallalang", n: "Socalcos de arroz de Tegallalang", a: "Tegallalang", lat: -8.434, lng: 115.2793, v: 45, x: true, top: true, leg: { m: "car", min: 30, line: "Grab/táxi → Tegallalang" }, pt: "Os socalcos de arroz em anfiteatro a cerca de 10 km a norte de Ubud, regados pelo sistema subak. Os caminhos são estreitos; de manhã cedo há menos gente.", en: "Amphitheatre-shaped rice terraces about 10 km north of Ubud, watered by the subak system. The paths are narrow; early morning is quieter." }
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
  sin: { it: "Singapore", zh: "新加坡", ar: "سنغافورة", ja: "シンガポール", tr: "Singapur", ru: "Сингапур", ko: "싱가포르" },
  zrh: { it: "Zurigo", zh: "苏黎世", ar: "زيورخ", ja: "チューリッヒ", tr: "Zürih", ru: "Цюрих", ko: "취리히" },
  brn: { it: "Berna", zh: "伯尔尼", ar: "برن", ja: "ベルン", tr: "Bern", ru: "Берн", ko: "베른" },
  ath: { it: "Atene", zh: "雅典", ar: "أثينا", ja: "アテネ", tr: "Atina", ru: "Афины", ko: "아테네" },
  fnc: { it: "Funchal", zh: "丰沙尔", ar: "فونشال", ja: "フンシャル", tr: "Funchal", ru: "Фуншал", ko: "푼샬" },
  dub: { it: "Dublino", zh: "都柏林", ar: "دبلن", ja: "ダブリン", tr: "Dublin", ru: "Дублин", ko: "더블린" },
  dar: { it: "Dar es Salaam", zh: "达累斯萨拉姆", ar: "دار السلام", ja: "ダルエスサラーム", tr: "Darüsselam", ru: "Дар-эс-Салам", ko: "다르에스살람" },
  hkg: { it: "Hong Kong", zh: "香港", ar: "هونغ كونغ", ja: "香港", tr: "Hong Kong", ru: "Гонконг", ko: "홍콩" },
  bkk: { it: "Bangkok", zh: "曼谷", ar: "بانكوك", ja: "バンコク", tr: "Bangkok", ru: "Бангкок", ko: "방콕" },
  dps: { it: "Bali (Ubud)", zh: "巴厘岛（乌布）", ar: "بالي (أوبود)", ja: "バリ島（ウブド）", tr: "Bali (Ubud)", ru: "Бали (Убуд)", ko: "발리(우붓)" }
};
