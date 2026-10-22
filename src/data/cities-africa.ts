/**
 * Cidades de África (outubro de 2026): Marraquexe, Casablanca, Cidade do Cabo, Zanzibar (Stone Town), Tunes,
 * Adis Abeba, Nairobi, Luanda, Acra, Kigali e Dacar.
 * Em várias destas cidades a forma prática de ir de um sítio a outro é o táxi ou uma app (Bolt, Uber, Yango, Ride, Heetch):
 * os valores são corridas típicas de referência, em moeda local. Mudam sem aviso; a app mostra sempre "confirme no local".
 */
import type { City, Leg } from "./cities";

const W = (min: number, line = ""): Leg => ({ m: "walk", min, line });
const names = (pt: string, en: string, es: string, fr: string, de: string) => ({ pt, en, es, fr, de });
const car = (min: number, line: string, f: number): Leg => ({ m: "car", min, line, f });

export const AFRICA_CITIES: City[] = [
  {
    id: "rak", n: names("Marraquexe", "Marrakech", "Marrakech", "Marrakech", "Marrakesch"), cur: "MAD",
    ap: { iata: "RAK", name: "Marrakech-Menara (RAK)", lat: 31.6069, lng: -8.0363 }, tz: "Africa/Casablanca",
    single: 4, card: 0, cardName: "", alt: null,
    air: { m: "bus", min: 25, line: "Autocarro 19 Aeroporto → Koutoubia", f: 30 },
    ret: { core: car(20, "Petit taxi Kasbah → Aeroporto", 100), extra: car(20, "Petit taxi Majorelle → Aeroporto", 100) },
    stops: [
      { id: "rak-koutoubia", n: "Mesquita Koutoubia", a: "Medina", lat: 31.6237, lng: -7.9936, v: 15, top: true, leg: W(2, "Paragem Koutoubia"), pt: "O minarete almóada do século XII, com 77 metros, que serve de farol à medina. Só os muçulmanos entram; os jardins à volta são de todos.", en: "The 12th-century Almohad minaret, 77 metres tall, that guides you through the medina. Only Muslims may enter; the gardens around it are open to all." },
      { id: "rak-jemaa", n: "Praça Jemaa el-Fna", a: "Medina", lat: 31.6258, lng: -7.9891, v: 30, top: true, leg: W(6), pt: "A grande praça de contadores de histórias, músicos gnawa e bancas de sumo de laranja; ao fim da tarde enche-se de grelhados.", en: "The great square of storytellers, Gnawa musicians and orange-juice stalls; at dusk it fills with grills." },
      { id: "rak-souks", n: "Souks e Medersa Ben Youssef", a: "Medina", lat: 31.6318, lng: -7.9862, v: 45, o: true, leg: W(12, "Pelos souks"), pt: "Os labirintos de couro, especiarias e lanternas até à escola corânica de 1565, com o pátio de estuque e cedro (paga).", en: "The maze of leather, spices and lanterns leading to the 1565 Koranic school, with its courtyard of stucco and cedar (paid)." },
      { id: "rak-bahia", n: "Palácio da Bahia", a: "Mellah", lat: 31.6216, lng: -7.9831, v: 30, o: true, leg: W(20), pt: "O palácio do século XIX de tetos pintados, azulejos zellige e jardins de laranjeiras (pago).", en: "The 19th-century palace of painted ceilings, zellige tiles and orange-tree gardens (paid)." },
      { id: "rak-saadian", n: "Túmulos Saadianos e Kasbah", a: "Kasbah", lat: 31.6173, lng: -7.9886, v: 25, o: true, leg: W(10), pt: "Os mausoléus da dinastia saadiana, redescobertos em 1917, com a Sala das Doze Colunas em mármore de Carrara (pagos).", en: "The Saadian dynasty mausoleums, rediscovered in 1917, with the Hall of Twelve Columns in Carrara marble (paid)." },
      { id: "rak-majorelle", n: "Jardim Majorelle e Museu Yves Saint Laurent", a: "Guéliz", lat: 31.6417, lng: -8.0033, v: 45, x: true, top: true, o: true, leg: car(15, "Petit taxi → Majorelle", 30), pt: "O jardim azul de cactos e bambus do pintor Jacques Majorelle, salvo por Yves Saint Laurent; ao lado, o museu do criador. Reserve hora online.", en: "Painter Jacques Majorelle's blue garden of cacti and bamboo, saved by Yves Saint Laurent; next door, the designer's museum. Book a time online." }
    ]
  },
  {
    id: "cas", n: names("Casablanca", "Casablanca", "Casablanca", "Casablanca", "Casablanca"), cur: "MAD",
    ap: { iata: "CMN", name: "Mohammed V (CMN)", lat: 33.3675, lng: -7.5898 }, tz: "Africa/Casablanca",
    single: 8, card: 0, cardName: "", alt: null,
    air: { m: "train", min: 40, line: "Comboio ONCF Aeroporto → Casa Voyageurs", f: 50 },
    ret: { core: { m: "train", min: 55, line: "A pé até Casa Port → Comboio ONCF → Aeroporto", f: 50 }, extra: car(40, "Grand taxi Ain Diab → Aeroporto", 300) },
    stops: [
      { id: "cas-unite", n: "Praça Mohammed V e centro Art Déco", a: "Centre-ville", lat: 33.5948, lng: -7.6188, v: 25, leg: { m: "tram", min: 15, line: "Elétrico T1 Casa Voyageurs → Place Mohammed V", r: 1 }, pt: "A praça dos palácios mouriscos dos anos 1920 e as fachadas Art Déco do bulevar Mohammed V, herança do protetorado francês.", en: "The square of 1920s Moorish-style palaces and the Art Deco façades of Boulevard Mohammed V, a legacy of the French protectorate." },
      { id: "cas-sacrecoeur", n: "Catedral do Sagrado Coração e Parque da Liga Árabe", a: "Centre-ville", lat: 33.5885, lng: -7.6265, v: 20, leg: W(12), pt: "A catedral branca de 1930, hoje centro cultural, e o grande parque de palmeiras ao lado.", en: "The white 1930 cathedral, now a cultural centre, and the big palm-lined park beside it." },
      { id: "cas-habous", n: "Bairro Habous", a: "Habous", lat: 33.5772, lng: -7.604, v: 30, leg: car(10, "Petit taxi → Habous", 20), pt: "A «nova medina» dos anos 1930, com arcadas, livreiros, olivas e a pastelaria Bennis.", en: "The 1930s «new medina», with arcades, booksellers, olives and the Bennis pastry shop." },
      { id: "cas-medina", n: "Medina antiga e Skala", a: "Ancienne Médina", lat: 33.6037, lng: -7.6197, v: 30, leg: car(15, "Petit taxi → Bab Marrakech", 20), pt: "A medina antiga dentro das muralhas, com o bastião da Skala e os seus canhões virados para o Atlântico.", en: "The old walled medina, with the Skala bastion and its cannons facing the Atlantic." },
      { id: "cas-hassan", n: "Mesquita Hassan II", a: "Corniche", lat: 33.6086, lng: -7.6326, v: 60, top: true, o: true, leg: W(15, "Pelo boulevard des Almohades"), pt: "Uma das maiores mesquitas do mundo, sobre o oceano, com o minarete de 210 metros. Uma das poucas em Marrocos com visitas guiadas para não muçulmanos (pagas).", en: "One of the world's largest mosques, built over the ocean, with a 210-metre minaret. One of the few in Morocco with guided tours for non-Muslims (paid)." },
      { id: "cas-corniche", n: "Corniche de Ain Diab", a: "Ain Diab", lat: 33.594, lng: -7.672, v: 40, x: true, leg: car(15, "Petit taxi → Ain Diab", 25), pt: "O passeio marítimo das praias e cafés e, na maré baixa, o caminho até ao santuário de Sidi Abderrahmane, num rochedo.", en: "The seafront of beaches and cafés and, at low tide, the path to the Sidi Abderrahmane shrine on its rock." }
    ]
  },
  {
    id: "cpt", n: names("Cidade do Cabo", "Cape Town", "Ciudad del Cabo", "Le Cap", "Kapstadt"), cur: "ZAR",
    ap: { iata: "CPT", name: "Cape Town International (CPT)", lat: -33.9715, lng: 18.6021 }, tz: "Africa/Johannesburg",
    single: 15, card: 0, cardName: "", alt: null,
    air: { m: "bus", min: 35, line: "MyCiTi A01 Aeroporto → Civic Centre", f: 100 },
    ret: { core: { m: "bus", min: 70, line: "Autocarro MyCiTi → Civic Centre → A01 Aeroporto", r: 1, f: 100 }, extra: car(30, "Uber/Bolt Kirstenbosch → Aeroporto", 280) },
    stops: [
      { id: "cpt-company", n: "Company's Garden", a: "City Bowl", lat: -33.9275, lng: 18.417, v: 30, leg: W(10, "Civic Centre"), pt: "A horta de 1652 da Companhia Holandesa das Índias, hoje jardim com o parlamento, a Galeria Nacional e o Museu Sul-Africano.", en: "The Dutch East India Company's 1652 vegetable garden, now a park with Parliament, the National Gallery and the South African Museum." },
      { id: "cpt-bokaap", n: "Bo-Kaap", a: "Bo-Kaap", lat: -33.9205, lng: 18.4153, v: 30, top: true, leg: W(12), pt: "As casas pintadas de cores vivas do bairro malaio do Cabo, com mesquitas antigas e o museu do bairro. Fotografe com respeito: são casas de família.", en: "The brightly painted houses of the Cape Malay quarter, with old mosques and the neighbourhood museum. Photograph respectfully: these are family homes." },
      { id: "cpt-castle", n: "Castelo da Boa Esperança e District Six", a: "City Bowl", lat: -33.9258, lng: 18.4276, v: 45, o: true, leg: W(18, "Pela Wale Street e Darling Street"), pt: "O forte pentagonal de 1679, o edifício colonial mais antigo do país, e o museu do bairro destruído pelo apartheid.", en: "The 1679 pentagonal fort, the country's oldest colonial building, and the museum of the neighbourhood destroyed under apartheid." },
      { id: "cpt-waterfront", n: "V&A Waterfront", a: "Waterfront", lat: -33.9036, lng: 18.4207, v: 45, top: true, leg: { m: "bus", min: 15, line: "MyCiTi 104 → Waterfront", r: 1 }, pt: "O porto vitoriano com lojas, o mercado Watershed, focas no cais e os barcos para Robben Island, a prisão de Mandela (reserve com dias de antecedência).", en: "The Victorian harbour with shops, the Watershed market, seals on the quay and the boats to Robben Island, Mandela's prison (book days ahead)." },
      { id: "cpt-tablemtn", n: "Table Mountain", a: "Table Mountain", lat: -33.948, lng: 18.4031, v: 90, top: true, o: true, leg: car(15, "Uber/Bolt → Teleférico", 90), pt: "O teleférico de cabine giratória sobe à montanha plana sobre a cidade. Fecha com vento: confirme no próprio dia.", en: "The rotating cable car climbs the flat-topped mountain above the city. It closes in high wind: check on the day." },
      { id: "cpt-kirstenbosch", n: "Jardim Botânico de Kirstenbosch", a: "Newlands", lat: -33.9875, lng: 18.4327, v: 60, x: true, o: true, leg: car(20, "Uber/Bolt → Kirstenbosch", 120), pt: "Um dos grandes jardins botânicos do mundo, na encosta da montanha, com o passadiço Boomslang entre as copas e concertos ao domingo no verão.", en: "One of the world's great botanical gardens, on the mountain slope, with the Boomslang canopy walkway and Sunday summer concerts." }
    ]
  },
  {
    id: "zan", n: names("Zanzibar (Stone Town)", "Zanzibar (Stone Town)", "Zanzíbar (Stone Town)", "Zanzibar (Stone Town)", "Sansibar (Stone Town)"), cur: "TZS",
    ap: { iata: "ZNZ", name: "Abeid Amani Karume (ZNZ)", lat: -6.222, lng: 39.2249 }, tz: "Africa/Dar_es_Salaam",
    single: 1000, card: 0, cardName: "", alt: null,
    air: car(20, "Táxi do aeroporto → Forodhani", 30000),
    ret: { core: car(20, "Táxi Darajani → Aeroporto", 30000), extra: { m: "ferry", min: 55, line: "Barco para Stone Town → táxi para o aeroporto", f: 70000 } },
    stops: [
      { id: "znz-forodhani", n: "Jardins de Forodhani", a: "Stone Town", lat: -6.1617, lng: 39.188, v: 20, top: true, leg: W(0), pt: "O jardim à beira-mar onde à noite se monta o mercado de comida de rua: espetadas de peixe, pizza de Zanzibar e sumo de cana.", en: "The seafront garden where the street-food market sets up at night: fish skewers, Zanzibar pizza and sugar-cane juice." },
      { id: "znz-fort", n: "Forte Antigo", a: "Stone Town", lat: -6.1627, lng: 39.1886, v: 20, leg: W(2), pt: "O forte omanita do século XVII, construído sobre uma igreja portuguesa, hoje com anfiteatro, lojas de artesanato e um café.", en: "The 17th-century Omani fort, built over a Portuguese church, now with an amphitheatre, craft shops and a café." },
      { id: "znz-palace", n: "Casa das Maravilhas e Palácio do Sultão", a: "Stone Town", lat: -6.1605, lng: 39.1899, v: 20, o: true, leg: W(3), pt: "A Casa das Maravilhas de 1883, a primeira com eletricidade e elevador da África Oriental (em restauro), e o palácio-museu dos sultões ao lado.", en: "The 1883 House of Wonders, the first in East Africa with electricity and a lift (under restoration), and the sultans' palace museum next door." },
      { id: "znz-cathedral", n: "Catedral Anglicana e antigo mercado de escravos", a: "Mkunazini", lat: -6.1661, lng: 39.1924, v: 45, top: true, o: true, leg: W(12, "Pelas ruelas"), pt: "A catedral de 1879 construída sobre o último mercado de escravos da África Oriental, com as câmaras subterrâneas e o memorial (visita paga).", en: "The 1879 cathedral built on East Africa's last slave market, with the underground chambers and the memorial (paid visit)." },
      { id: "znz-darajani", n: "Mercado de Darajani", a: "Darajani", lat: -6.163, lng: 39.196, v: 25, leg: W(8), pt: "O mercado central de especiarias, frutas, peixe e tecidos kanga, com o burburinho de toda a ilha.", en: "The central market of spices, fruit, fish and kanga cloth, with the bustle of the whole island." },
      { id: "znz-prison", n: "Ilha da Prisão (Changuu)", a: "Changuu", lat: -6.1146, lng: 39.169, v: 90, x: true, o: true, leg: { m: "ferry", min: 30, line: "Barco desde a praia de Forodhani", f: 40000 }, pt: "A ilha a 30 minutos de barco com tartarugas-gigantes de Aldabra, uma prisão de 1893 que nunca recebeu presos e água para mergulhar.", en: "The island 30 minutes away by boat, with giant Aldabra tortoises, an 1893 prison that never held prisoners and water for snorkelling." }
    ]
  },
  {
    id: "tun", n: names("Tunes", "Tunis", "Túnez", "Tunis", "Tunis"), cur: "TND",
    ap: { iata: "TUN", name: "Tunis-Carthage (TUN)", lat: 36.851, lng: 10.2272 }, tz: "Africa/Tunis",
    single: 0.8, card: 0, cardName: "", alt: null,
    air: car(20, "Táxi amarelo → Avenida Habib Bourguiba", 15),
    ret: { core: car(25, "Táxi Le Bardo → Aeroporto", 15), extra: car(20, "Táxi Sidi Bou Said → Aeroporto", 20) },
    stops: [
      { id: "tun-bourguiba", n: "Avenida Habib Bourguiba", a: "Ville nouvelle", lat: 36.7998, lng: 10.1806, v: 20, leg: W(0), pt: "A avenida de ficus e esplanadas da cidade francesa, com a catedral de São Vicente de Paulo e o Teatro Municipal Art Nouveau.", en: "The tree-lined boulevard of cafés from the French city, with St Vincent de Paul Cathedral and the Art Nouveau Municipal Theatre." },
      { id: "tun-babbhar", n: "Bab el Bhar", a: "Medina", lat: 36.7995, lng: 10.1747, v: 10, leg: W(8), pt: "A Porta do Mar, entrada na medina classificada pela UNESCO, onde começam as ruelas dos souks.", en: "The Sea Gate, entrance to the UNESCO-listed medina, where the souk lanes begin." },
      { id: "tun-zitouna", n: "Mesquita Zitouna e souks", a: "Medina", lat: 36.7975, lng: 10.1706, v: 35, top: true, leg: W(8, "Pela rua Jamaa Zitouna"), pt: "A grande mesquita do século IX, coração da medina, rodeada pelos souks dos perfumes, dos chéchias e do ouro. Os não muçulmanos veem o pátio da entrada em horas limitadas.", en: "The great 9th-century mosque at the heart of the medina, ringed by the souks of perfume, chechia hats and gold. Non-Muslims may view the courtyard at limited hours." },
      { id: "tun-dar", n: "Dar Ben Abdallah e Tourbet el Bey", a: "Medina", lat: 36.7935, lng: 10.1695, v: 30, o: true, leg: W(10), pt: "Um palácio do século XVIII com museu de artes e tradições e, perto, o mausoléu dos beis husseinitas com mármores e azulejos.", en: "An 18th-century palace with a museum of arts and traditions and, nearby, the mausoleum of the Husseinite beys with marble and tiles." },
      { id: "tun-bardo", n: "Museu do Bardo", a: "Le Bardo", lat: 36.8094, lng: 10.134, v: 75, top: true, o: true, cl: [1], leg: { m: "tram", min: 30, line: "Metro ligeiro 4 Place Barcelone → Le Bardo", r: 1 }, pt: "A maior coleção de mosaicos romanos do mundo, num palácio dos beis. Fecha à segunda.", en: "The world's largest collection of Roman mosaics, in a palace of the beys. Closed Mondays." },
      { id: "tun-sidibou", n: "Sidi Bou Said e Cartago", a: "Sidi Bou Said", lat: 36.8687, lng: 10.3417, v: 60, x: true, top: true, leg: { m: "train", min: 60, line: "Metro ligeiro → Tunis Marine → TGM Sidi Bou Said", r: 2 }, pt: "A aldeia branca e azul sobre o golfo, com o Café des Nattes; a caminho, as termas de Antonino e o porto púnico de Cartago.", en: "The white-and-blue village above the gulf, with the Café des Nattes; on the way, the Antonine Baths and the Punic port of Carthage." }
    ]
  },
  {
    id: "add", n: names("Adis Abeba", "Addis Ababa", "Adís Abeba", "Addis-Abeba", "Addis Abeba"), cur: "ETB",
    ap: { iata: "ADD", name: "Bole International (ADD)", lat: 8.9779, lng: 38.7993 }, tz: "Africa/Addis_Ababa",
    single: 6, card: 0, cardName: "", alt: null,
    air: car(25, "Ride/táxi Bole → Unity Park", 500),
    ret: { core: car(35, "Ride/táxi Merkato → Bole", 600), extra: car(45, "Ride/táxi Entoto → Bole", 900) },
    stops: [
      { id: "add-unity", n: "Unity Park (Palácio Nacional)", a: "Arat Kilo", lat: 9.02, lng: 38.7636, v: 60, top: true, o: true, leg: W(0), pt: "Os jardins e palácios de Menelik II e Haile Selassie abertos ao público, com o salão do trono e um pequeno zoo de leões-da-etiópia (pago).", en: "The gardens and palaces of Menelik II and Haile Selassie opened to the public, with the throne hall and a small zoo of Ethiopian lions (paid)." },
      { id: "add-trinity", n: "Catedral da Santíssima Trindade", a: "Arat Kilo", lat: 9.0302, lng: 38.7656, v: 30, o: true, leg: W(20), pt: "A catedral ortodoxa de 1942 com vitrais e o túmulo do imperador Haile Selassie; descalce-se se for pedido.", en: "The 1942 Orthodox cathedral with stained glass and the tomb of Emperor Haile Selassie; remove your shoes if asked." },
      { id: "add-museum", n: "Museu Nacional (Lucy)", a: "Arat Kilo", lat: 9.0386, lng: 38.7614, v: 45, top: true, o: true, leg: W(15), pt: "O museu dos fósseis de Lucy, com 3,2 milhões de anos, e de Selam, além do trono de Haile Selassie.", en: "The museum of the 3.2-million-year-old Lucy fossil and of Selam, plus Haile Selassie's throne." },
      { id: "add-piazza", n: "Piazza e café Tomoca", a: "Piazza", lat: 9.0349, lng: 38.7509, v: 25, leg: W(15), pt: "O bairro da ocupação italiana, com prédios dos anos 30 e o Tomoca de 1953: o café da terra onde o café nasceu.", en: "The Italian-era quarter, with 1930s buildings and Tomoca, opened in 1953: coffee in the land where coffee was born." },
      { id: "add-merkato", n: "Merkato", a: "Merkato", lat: 9.031, lng: 38.738, v: 40, leg: car(10, "Ride → Merkato", 200), pt: "Um dos maiores mercados ao ar livre de África: especiarias, cestos, café e o bairro dos recicladores. Leve pouco e vá com guia se puder.", en: "One of Africa's largest open-air markets: spices, baskets, coffee and the recyclers' quarter. Carry little and go with a guide if you can." },
      { id: "add-entoto", n: "Monte Entoto e Entoto Park", a: "Entoto", lat: 9.0822, lng: 38.7649, v: 60, x: true, leg: car(40, "Ride → Entoto Park", 600), pt: "A antiga capital de Menelik a 3.000 metros, com florestas de eucaliptos, igrejas e a vista sobre a cidade.", en: "Menelik's old capital at 3,000 metres, with eucalyptus forests, churches and the view over the city." }
    ]
  },
  {
    id: "nbo", n: names("Nairobi", "Nairobi", "Nairobi", "Nairobi", "Nairobi"), cur: "KES",
    ap: { iata: "NBO", name: "Jomo Kenyatta (NBO)", lat: -1.3192, lng: 36.9278 }, tz: "Africa/Nairobi",
    single: 100, card: 0, cardName: "", alt: null,
    air: car(40, "Uber/Bolt JKIA → Museu Nacional", 2000),
    ret: { core: car(50, "Uber/Bolt Karen → JKIA", 2500), extra: car(35, "Uber/Bolt Bomas → JKIA", 2000) },
    stops: [
      { id: "nbo-museum", n: "Museu Nacional de Nairobi", a: "Museum Hill", lat: -1.2742, lng: 36.8146, v: 60, o: true, leg: W(0), pt: "A história natural e cultural do Quénia, com fósseis do Turkana e um jardim de serpentes ao lado.", en: "Kenya's natural and cultural history, with Turkana fossils and a snake park next door." },
      { id: "nbo-kicc", n: "KICC e centro da cidade", a: "CBD", lat: -1.2885, lng: 36.8233, v: 30, top: true, o: true, leg: car(10, "Uber/Bolt → KICC", 300), pt: "O centro de congressos de 1973 em forma de botão de flor; do heliporto no topo vê-se a cidade e, em dias limpos, o Kilimanjaro (pago).", en: "The 1973 conference centre shaped like a flower bud; from the rooftop helipad you see the city and, on clear days, Kilimanjaro (paid)." },
      { id: "nbo-sheldrick", n: "Orfanato de elefantes Sheldrick", a: "Nairobi National Park", lat: -1.3762, lng: 36.7747, v: 60, top: true, o: true, leg: car(40, "Uber/Bolt → Sheldrick Wildlife Trust", 1200), pt: "Elefantes órfãos a tomar biberão e a brincar na lama, só entre as 11h e o meio-dia, com reserva online.", en: "Orphaned elephants bottle-fed and playing in the mud, only from 11 am to noon, booked online." },
      { id: "nbo-giraffe", n: "Giraffe Centre", a: "Lang'ata", lat: -1.3762, lng: 36.7448, v: 45, top: true, o: true, leg: car(15, "Uber/Bolt → Giraffe Centre", 600), pt: "A plataforma onde se dá comida às girafas-de-rothschild, cara a cara, num centro de conservação.", en: "The platform where you feed Rothschild giraffes face to face, at a conservation centre." },
      { id: "nbo-karen", n: "Museu Karen Blixen", a: "Karen", lat: -1.3505, lng: 36.7125, v: 45, o: true, leg: car(10, "Uber/Bolt → Karen Blixen", 400), pt: "A casa da quinta de café da autora de «África Minha», aos pés dos montes Ngong.", en: "The coffee-farm house of the author of «Out of Africa», at the foot of the Ngong Hills." },
      { id: "nbo-bomas", n: "Bomas of Kenya", a: "Lang'ata", lat: -1.3383, lng: 36.7725, v: 75, x: true, o: true, leg: car(15, "Uber/Bolt → Bomas", 500), pt: "Aldeias tradicionais das etnias do Quénia e um espetáculo de danças à tarde (pago).", en: "Traditional homesteads of Kenya's peoples and an afternoon dance show (paid)." }
    ]
  },
  {
    id: "lad", n: names("Luanda", "Luanda", "Luanda", "Luanda", "Luanda"), cur: "AOA",
    ap: { iata: "NBJ", name: "Aeroporto Internacional Dr. António Agostinho Neto (NBJ)", lat: -9.05, lng: 13.49 }, tz: "Africa/Luanda",
    single: 300, card: 0, cardName: "", alt: null,
    air: car(60, "Táxi/Yango NBJ → Marginal", 25000),
    ret: { core: car(60, "Táxi/Yango Ilha → NBJ", 25000), extra: car(75, "Táxi/Yango Miradouro da Lua → NBJ", 25000) },
    stops: [
      { id: "lad-marginal", n: "Marginal de Luanda", a: "Baixa", lat: -8.8137, lng: 13.2311, v: 30, top: true, leg: W(0), pt: "A avenida 4 de Fevereiro com palmeiras e passeio à beira da baía, entre os prédios novos e o porto. Ao fim da tarde enche-se de corredores e famílias.", en: "The palm-lined 4 de Fevereiro avenue and promenade along the bay, between new towers and the port. At dusk it fills with joggers and families." },
      { id: "lad-baixa", n: "Baixa: Igreja da Nazaré e Palácio de Ferro", a: "Baixa", lat: -8.8133, lng: 13.2336, v: 25, leg: W(8), pt: "A igreja de 1664 com azulejos portugueses e o pequeno palácio de ferro pré-fabricado, atribuído à escola de Eiffel.", en: "The 1664 church with Portuguese tiles and the small prefabricated iron palace attributed to the Eiffel school." },
      { id: "lad-fortaleza", n: "Fortaleza de São Miguel", a: "Baixa", lat: -8.81, lng: 13.2223, v: 40, top: true, o: true, leg: W(20, "A subir pela Rua Major Kanhangulo"), pt: "A fortaleza de 1576 sobre a baía, com azulejos que contam a história colonial, e o Museu Nacional de História Militar (pago).", en: "The 1576 fortress above the bay, with tiles telling the colonial story, and the National Museum of Military History (paid)." },
      { id: "lad-memorial", n: "Memorial António Agostinho Neto", a: "Praia do Bispo", lat: -8.8352, lng: 13.2246, v: 45, top: true, o: true, leg: car(10, "Táxi/Yango → Memorial", 1500), pt: "A torre de 120 metros do mausoléu do primeiro presidente de Angola, com museu e esplanada sobre o mar.", en: "The 120-metre tower of the mausoleum of Angola's first president, with a museum and a terrace over the sea." },
      { id: "lad-ilha", n: "Ilha de Luanda", a: "Ilha do Cabo", lat: -8.792, lng: 13.229, v: 60, top: true, leg: car(15, "Táxi/Yango → Ilha", 2000), pt: "A restinga de areia com praias, restaurantes de peixe e música ao vivo; o pôr do sol sobre o Atlântico é o momento da cidade.", en: "The sand spit with beaches, fish restaurants and live music; sunset over the Atlantic is the city's moment." },
      { id: "lad-lua", n: "Miradouro da Lua", a: "Belas", lat: -9.2333, lng: 13.1667, v: 45, x: true, leg: car(70, "Táxi/Yango pela Estrada de Samba → Miradouro da Lua", 15000), pt: "Falésias esculpidas pela erosão em tons de vermelho e ocre, a 40 km a sul da cidade, com vista para o mar.", en: "Cliffs carved by erosion in shades of red and ochre, 40 km south of the city, overlooking the sea." }
    ]
  },
  {
    id: "acc", n: names("Acra", "Accra", "Acra", "Accra", "Accra"), cur: "GHS",
    ap: { iata: "ACC", name: "Kotoka International (ACC)", lat: 5.6052, lng: -0.1668 }, tz: "Africa/Accra",
    single: 7, card: 0, cardName: "", alt: null,
    air: car(25, "Uber/Bolt → Kwame Nkrumah Park", 80),
    ret: { core: car(20, "Uber/Bolt Osu → Aeroporto", 70), extra: car(20, "Uber/Bolt Labadi → Aeroporto", 70) },
    stops: [
      { id: "acc-nkrumah", n: "Parque Memorial Kwame Nkrumah", a: "Centro", lat: 5.5446, lng: -0.2023, v: 40, top: true, o: true, leg: W(0), pt: "O mausoléu e museu do primeiro presidente do Gana, no lugar onde declarou a independência em 1957 (pago).", en: "The mausoleum and museum of Ghana's first president, on the spot where he declared independence in 1957 (paid)." },
      { id: "acc-jamestown", n: "Jamestown e o farol", a: "Jamestown", lat: 5.5341, lng: -0.2128, v: 45, top: true, leg: car(10, "Uber/Bolt → Jamestown", 40), pt: "O bairro de pescadores mais antigo, com o farol, o forte Ussher, as canoas pintadas e os ginásios de boxe. Vá com um guia local.", en: "The oldest fishing quarter, with the lighthouse, Ussher Fort, painted canoes and boxing gyms. Go with a local guide." },
      { id: "acc-makola", n: "Mercado de Makola", a: "Centro", lat: 5.55, lng: -0.209, v: 30, leg: car(10, "Uber/Bolt → Makola", 40), pt: "O grande mercado de tecidos wax, especiarias e contas. Muito cheio: guarde o telemóvel.", en: "The big market of wax-print fabrics, spices and beads. Very crowded: keep your phone away." },
      { id: "acc-independence", n: "Praça da Independência (Black Star Square)", a: "Osu", lat: 5.548, lng: -0.1925, v: 20, leg: car(10, "Uber/Bolt → Black Star Square", 40), pt: "A enorme praça de desfiles com o Arco da Independência e a Estrela Negra, junto ao oceano.", en: "The vast parade ground with the Independence Arch and the Black Star, by the ocean." },
      { id: "acc-osu", n: "Osu e Oxford Street", a: "Osu", lat: 5.556, lng: -0.182, v: 40, leg: car(10, "Uber/Bolt → Oxford Street", 40), pt: "A rua animada de lojas, restaurantes e vida noturna, com o castelo de Christiansborg perto do mar.", en: "The lively street of shops, restaurants and nightlife, with Christiansborg Castle by the sea." },
      { id: "acc-labadi", n: "Praia de Labadi", a: "La", lat: 5.56, lng: -0.145, v: 60, x: true, leg: car(15, "Uber/Bolt → Labadi", 50), pt: "A praia mais conhecida da cidade, com cavalos, tambores e bares ao fim de semana (entrada paga).", en: "The city's best-known beach, with horses, drummers and bars at weekends (paid entry)." }
    ]
  },
  {
    id: "kgl", n: names("Kigali", "Kigali", "Kigali", "Kigali", "Kigali"), cur: "RWF",
    ap: { iata: "KGL", name: "Kigali International (KGL)", lat: -1.9686, lng: 30.1395 }, tz: "Africa/Kigali",
    single: 500, card: 0, cardName: "", alt: null,
    air: car(25, "Táxi/Move → Memorial", 8000),
    ret: { core: car(35, "Táxi/Move Nyamirambo → Aeroporto", 8000), extra: car(5, "Táxi/Move Kanombe → Aeroporto", 2000) },
    stops: [
      { id: "kgl-memorial", n: "Memorial do Genocídio de Kigali", a: "Gisozi", lat: -1.9306, lng: 30.0607, v: 90, top: true, leg: W(0), pt: "O memorial onde repousam mais de 250 mil vítimas do genocídio contra os tutsis de 1994. Entrada gratuita; reserve tempo e silêncio.", en: "The memorial where more than 250,000 victims of the 1994 genocide against the Tutsi are laid to rest. Free entry; allow time and quiet." },
      { id: "kgl-inema", n: "Inema Arts Center", a: "Kacyiru", lat: -1.954, lng: 30.089, v: 40, leg: car(15, "Táxi/Move → Inema", 4000), pt: "O coletivo de artistas ruandeses com galeria, ateliês e pinturas vivas da nova arte do país.", en: "The Rwandan artists' collective with a gallery, studios and vivid paintings of the country's new art." },
      { id: "kgl-kcc", n: "Kigali Convention Centre", a: "Kimihurura", lat: -1.954, lng: 30.0925, v: 20, leg: W(10), pt: "A cúpula iluminada inspirada no palácio real tradicional, símbolo da Kigali moderna, à noite com cores que mudam.", en: "The lit dome inspired by the traditional royal palace, symbol of modern Kigali, glowing in changing colours at night." },
      { id: "kgl-kimironko", n: "Mercado de Kimironko", a: "Kimironko", lat: -1.9496, lng: 30.1263, v: 40, top: true, leg: car(15, "Mota-táxi ou táxi → Kimironko", 3000), pt: "O maior mercado da cidade: fruta, cestos, tecidos kitenge e alfaiates que fazem uma peça em poucas horas.", en: "The city's biggest market: fruit, baskets, kitenge fabric and tailors who make a garment in a few hours." },
      { id: "kgl-nyamirambo", n: "Nyamirambo", a: "Nyamirambo", lat: -1.9795, lng: 30.043, v: 60, top: true, leg: car(30, "Táxi/Move → Nyamirambo", 7000), pt: "O bairro mais animado, com a mesquita verde, cafés e o passeio guiado do Nyamirambo Women's Center.", en: "The liveliest neighbourhood, with the green mosque, cafés and the Nyamirambo Women's Center walking tour." },
      { id: "kgl-palace", n: "Museu do Palácio Presidencial (Kanombe)", a: "Kanombe", lat: -1.9705, lng: 30.1412, v: 45, x: true, o: true, leg: car(35, "Táxi/Move → Kanombe", 8000), pt: "A antiga residência presidencial junto ao aeroporto, com os destroços do avião abatido em 1994 (pago).", en: "The former presidential residence beside the airport, with the wreckage of the plane shot down in 1994 (paid)." }
    ]
  },
  {
    id: "dkr", n: names("Dacar", "Dakar", "Dakar", "Dakar", "Dakar"), cur: "XOF",
    ap: { iata: "DSS", name: "Blaise Diagne (DSS)", lat: 14.67, lng: -17.0733 }, tz: "Africa/Dakar",
    single: 400, card: 0, cardName: "", alt: null,
    air: car(60, "Táxi AIBD → Plateau", 25000),
    ret: { core: car(55, "Táxi Mamelles → AIBD", 25000), extra: car(60, "Táxi Almadies → AIBD", 25000) },
    stops: [
      { id: "dkr-plateau", n: "Praça da Independência", a: "Plateau", lat: 14.668, lng: -17.4321, v: 15, leg: W(0), pt: "A praça central do Plateau colonial, com o palácio da Câmara de Comércio e as avenidas que descem ao porto.", en: "The central square of the colonial Plateau, with the Chamber of Commerce palace and avenues running down to the port." },
      { id: "dkr-kermel", n: "Mercado Kermel", a: "Plateau", lat: 14.6694, lng: -17.4275, v: 25, leg: W(8), pt: "O mercado circular de 1910, reconstruído, com peixe, flores, frutas e artesanato à volta.", en: "The circular 1910 market, rebuilt, with fish, flowers, fruit and crafts around it." },
      { id: "dkr-goree", n: "Ilha de Gorée", a: "Gorée", lat: 14.667, lng: -17.3986, v: 120, top: true, o: true, leg: { m: "ferry", min: 25, line: "Chaloupe do porto de Dakar → Gorée", f: 5200 }, pt: "A ilha sem carros, Património da UNESCO, com a Casa dos Escravos e a sua «porta sem retorno», ruas de buganvílias e o forte.", en: "The car-free island, a UNESCO site, with the House of Slaves and its «door of no return», bougainvillea lanes and the fort." },
      { id: "dkr-mcn", n: "Museu das Civilizações Negras", a: "Plateau", lat: 14.6703, lng: -17.4351, v: 45, o: true, leg: { m: "ferry", min: 30, line: "Chaloupe de regresso → a pé", r: 0 }, pt: "O grande museu de 2018 sobre as culturas de África e da diáspora, com arte contemporânea e máscaras (pago).", en: "The great 2018 museum of the cultures of Africa and its diaspora, with contemporary art and masks (paid)." },
      { id: "dkr-renaissance", n: "Monumento da Renascença Africana", a: "Ouakam", lat: 14.7222, lng: -17.495, v: 40, top: true, o: true, leg: car(20, "Táxi → Mamelles", 3000), pt: "A estátua de bronze de 49 metros sobre a colina das Mamelles, com miradouro na cabeça e vista sobre a península (pago).", en: "The 49-metre bronze statue on the Mamelles hill, with a lookout in the head and a view over the peninsula (paid)." },
      { id: "dkr-almadies", n: "Pointe des Almadies e Ngor", a: "Almadies", lat: 14.7444, lng: -17.53, v: 50, x: true, leg: car(15, "Táxi → Almadies", 3000), pt: "O ponto mais ocidental de África continental, com grelhados de peixe e, ao lado, a pequena ilha de Ngor a cinco minutos de piroga.", en: "The westernmost point of mainland Africa, with grilled-fish spots and, next door, little Ngor Island five minutes away by pirogue." }
    ]
  }
];

export const AFRICA_NAMES: Record<string, Record<string, string>> = {
  rak: { it: "Marrakech", zh: "马拉喀什", ar: "مراكش", ja: "マラケシュ", tr: "Marakeş", ru: "Марракеш", ko: "마라케시" },
  cas: { it: "Casablanca", zh: "卡萨布兰卡", ar: "الدار البيضاء", ja: "カサブランカ", tr: "Kazablanka", ru: "Касабланка", ko: "카사블랑카" },
  cpt: { it: "Città del Capo", zh: "开普敦", ar: "كيب تاون", ja: "ケープタウン", tr: "Cape Town", ru: "Кейптаун", ko: "케이프타운" },
  zan: { it: "Zanzibar (Stone Town)", zh: "桑给巴尔（石头城）", ar: "زنجبار (المدينة الحجرية)", ja: "ザンジバル（ストーンタウン）", tr: "Zanzibar (Stone Town)", ru: "Занзибар (Стоун-Таун)", ko: "잔지바르(스톤타운)" },
  tun: { it: "Tunisi", zh: "突尼斯", ar: "تونس", ja: "チュニス", tr: "Tunus", ru: "Тунис", ko: "튀니스" },
  add: { it: "Addis Abeba", zh: "亚的斯亚贝巴", ar: "أديس أبابا", ja: "アディスアベバ", tr: "Addis Ababa", ru: "Аддис-Абеба", ko: "아디스아바바" },
  nbo: { it: "Nairobi", zh: "内罗毕", ar: "نيروبي", ja: "ナイロビ", tr: "Nairobi", ru: "Найроби", ko: "나이로비" },
  lad: { it: "Luanda", zh: "罗安达", ar: "لواندا", ja: "ルアンダ", tr: "Luanda", ru: "Луанда", ko: "루안다" },
  acc: { it: "Accra", zh: "阿克拉", ar: "أكرا", ja: "アクラ", tr: "Akra", ru: "Аккра", ko: "아크라" },
  kgl: { it: "Kigali", zh: "基加利", ar: "كيغالي", ja: "キガリ", tr: "Kigali", ru: "Кигали", ko: "키갈리" },
  dkr: { it: "Dakar", zh: "达喀尔", ar: "داكار", ja: "ダカール", tr: "Dakar", ru: "Дакар", ko: "다카르" }
};
