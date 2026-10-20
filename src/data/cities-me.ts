/**
 * Cidades do Médio Oriente: Dubai, Abu Dhabi, Doha, Riade, Jedá, Cairo, Amã e Mascate.
 * Tarifas de referência de outubro de 2026 (fontes: RTA Dubai, ITC Abu Dhabi, Doha Metro, Riyadh Metro/Darb,
 * Cairo Metro, Sariyah Airport Express, Mwasalat). Táxis e apps (Uber/Careem) com valor estimado em `f`.
 * Nestas cidades o calor e as distâncias pedem mais transporte: os roteiros usam metro onde há e táxi/app onde não há.
 */
import type { City, Leg } from "./cities";

const W = (min: number, line = ""): Leg => ({ m: "walk", min, line });
const car = (min: number, f: number, line = "Uber / Careem"): Leg => ({ m: "car", min, f, line });
const names = (pt: string, en: string, es: string, fr: string, de: string) => ({ pt, en, es, fr, de });

export const ME_CITIES: City[] = [
  {
    id: "dxb", n: names("Dubai", "Dubai", "Dubái", "Dubaï", "Dubai"), cur: "AED",
    ap: { iata: "DXB", name: "Dubai International (DXB)", lat: 25.2532, lng: 55.3657 }, tz: "Asia/Dubai",
    single: 5, card: 6, cardName: "cartão Nol Silver", alt: null,
    air: { m: "metro", min: 30, line: "Linha Vermelha → BurJuman → Linha Verde → Al Fahidi", r: 1 },
    ret: { core: { m: "metro", min: 30, line: "Burj Khalifa/Dubai Mall → Linha Vermelha → Aeroporto T1/T3", r: 1 }, extra: { m: "metro", min: 50, line: "Linha Vermelha → Aeroporto T1/T3", r: 1 } },
    stops: [
      { id: "al-fahidi", n: "Al Fahidi (Al Bastakiya)", a: "Bur Dubai", lat: 25.2636, lng: 55.2998, v: 35, top: true, leg: W(0, "Metro Al Fahidi"), pt: "O bairro antigo de casas de coral e torres de vento, com galerias e cafés à sombra. O Dubai antes dos arranha-céus.", en: "The old quarter of coral-stone houses and wind towers, with galleries and shaded cafés. Dubai before the skyscrapers." },
      { id: "abra", n: "Abra no Creek e souk das especiarias", a: "Deira", lat: 25.2688, lng: 55.2969, v: 45, top: true, leg: { m: "ferry", min: 10, line: "Abra (barco tradicional) Bur Dubai → Deira · 1 AED em dinheiro", f: 1 }, pt: "Atravesse o Creek num abra de madeira e perca-se no souk das especiarias: açafrão, incenso e frutos secos. Negociar faz parte.", en: "Cross the Creek on a wooden abra and wander the spice souk: saffron, frankincense and dried fruit. Haggling is part of it." },
      { id: "gold-souk", n: "Souk do Ouro", a: "Deira", lat: 25.2705, lng: 55.2975, v: 25, leg: W(8), pt: "Montras cheias de ouro de 18 a 24 quilates, vendido ao peso. Mesmo sem comprar, é um espetáculo.", en: "Windows full of 18 to 24 carat gold, sold by weight. Even if you don't buy, it's a sight." },
      { id: "museum-future", n: "Museu do Futuro", a: "Sheikh Zayed Road", lat: 25.2192, lng: 55.2820, v: 20, o: true, leg: { m: "metro", min: 25, line: "Al Ras (Verde) → Union → Vermelha → Emirates Towers", r: 1 }, pt: "O edifício-toro coberto de caligrafia árabe. O exterior é gratuito; o interior é pago e pede reserva.", en: "The torus-shaped building wrapped in Arabic calligraphy. The outside is free; the inside is paid and needs booking." },
      { id: "burj-khalifa", n: "Burj Khalifa, Dubai Mall e Fonte", a: "Downtown", lat: 25.1972, lng: 55.2744, v: 60, top: true, o: true, leg: { m: "metro", min: 10, line: "Linha Vermelha → Burj Khalifa/Dubai Mall", r: 1 }, pt: "A torre mais alta do mundo, o centro comercial gigante e a fonte dançante (espetáculos à noite, a cada 30 min, grátis). Subir ao At the Top é pago.", en: "The world's tallest tower, the giant mall and the dancing fountain (free shows every 30 min in the evening). Going up At the Top is paid." },
      { id: "marina", n: "Dubai Marina e praia JBR", a: "Marina", lat: 25.0800, lng: 55.1400, v: 45, x: true, leg: { m: "metro", min: 25, line: "Linha Vermelha → Sobha Realty / DMCC", r: 1 }, pt: "Passeio entre torres à beira da marina e areia na praia pública de JBR. Bonito ao pôr do sol.", en: "A promenade between towers along the marina, and sand on the public JBR beach. Lovely at sunset." }
    ]
  },
  {
    id: "auh", n: names("Abu Dhabi", "Abu Dhabi", "Abu Dabi", "Abou Dabi", "Abu Dhabi"), cur: "AED",
    ap: { iata: "AUH", name: "Zayed International (AUH)", lat: 24.4330, lng: 54.6511 }, tz: "Asia/Dubai",
    single: 4, card: 10, cardName: "cartão Hafilat", alt: null,
    air: car(25, 55, "Táxi / Uber / Careem"),
    ret: { core: car(35, 75, "Táxi / Uber / Careem"), extra: car(30, 70, "Táxi / Uber / Careem") },
    stops: [
      { id: "grand-mosque", n: "Mesquita Sheikh Zayed", a: "Khor Al Maqta", lat: 24.4128, lng: 54.4750, v: 75, top: true, leg: W(0), pt: "Mármore branco, 82 cúpulas e o maior tapete feito à mão do mundo. Entrada gratuita com reserva online; roupa que cubra braços e pernas (mulheres com lenço). Sexta só à tarde.", en: "White marble, 82 domes and the world's largest hand-knotted carpet. Free entry with online booking; clothes covering arms and legs (women with a headscarf). Fridays afternoon only." },
      { id: "qasr-watan", n: "Qasr Al Watan", a: "Al Ras Al Akhdar", lat: 24.4625, lng: 54.3058, v: 45, o: true, leg: car(20, 40, "Táxi / Uber / Careem"), pt: "O palácio presidencial aberto ao público: salões dourados e a grande cúpula. Entrada paga; à noite há espetáculo de luz na fachada.", en: "The presidential palace open to visitors: gilded halls and the great dome. Paid entry; a light show plays on the façade at night." },
      { id: "emirates-palace", n: "Emirates Palace e Etihad Towers", a: "West Corniche", lat: 24.4615, lng: 54.3173, v: 25, leg: W(12), pt: "O hotel-palácio mais famoso do Golfo e, em frente, as torres onde fica o miradouro Observation Deck at 300.", en: "The Gulf's most famous palace hotel and, opposite, the towers with the Observation Deck at 300." },
      { id: "heritage-village", n: "Heritage Village", a: "Breakwater", lat: 24.4785, lng: 54.3216, v: 25, leg: car(8, 15, "Táxi / Uber / Careem"), pt: "Réplica de um oásis antigo: tendas beduínas, artesãos, um souk pequeno e a vista do skyline do outro lado da água. Entrada gratuita.", en: "A recreated old oasis: Bedouin tents, craftspeople, a small souk and the skyline view across the water. Free entry." },
      { id: "corniche-auh", n: "Corniche de Abu Dhabi", a: "Corniche", lat: 24.4780, lng: 54.3330, v: 35, top: true, leg: car(10, 15, "Táxi / Uber / Careem"), pt: "Oito quilómetros de passeio, praia pública e o skyline sobre o golfo. Melhor ao fim da tarde.", en: "Eight kilometres of promenade, a public beach and the skyline over the Gulf. Best in the late afternoon." },
      { id: "louvre-auh", n: "Louvre Abu Dhabi", a: "Saadiyat", lat: 24.5337, lng: 54.3983, v: 75, x: true, o: true, cl: [1], leg: car(20, 35, "Táxi / Uber / Careem"), pt: "A cúpula rendada que filtra o sol como uma «chuva de luz», sobre o mar. Entrada paga; fecha à segunda.", en: "The lace-like dome that filters the sun into a «rain of light», over the sea. Paid entry; closed Mondays." }
    ]
  },
  {
    id: "doh", n: names("Doha", "Doha", "Doha", "Doha", "Doha"), cur: "QAR",
    ap: { iata: "DOH", name: "Hamad International (DOH)", lat: 25.2731, lng: 51.6081 }, tz: "Asia/Qatar",
    single: 2, card: 10, cardName: "Travel Card Standard", alt: null,
    air: { m: "metro", min: 20, line: "Linha Vermelha → Msheireb", r: 1 },
    ret: { core: { m: "metro", min: 30, line: "Corniche → Linha Vermelha → Aeroporto HIA T1", r: 1 }, extra: { m: "metro", min: 40, line: "Katara → Linha Vermelha → Aeroporto HIA T1", r: 1 } },
    stops: [
      { id: "msheireb", n: "Msheireb Downtown", a: "Msheireb", lat: 25.2865, lng: 51.5260, v: 30, leg: W(0, "Metro Msheireb"), pt: "O bairro novo construído com a arquitetura tradicional do Catar, com quatro casas-museu históricas de entrada gratuita.", en: "The new district built on traditional Qatari architecture, with four historic house museums that are free to enter." },
      { id: "souq-waqif", n: "Souq Waqif", a: "Downtown", lat: 25.2867, lng: 51.5330, v: 50, top: true, leg: W(10), pt: "O mercado tradicional restaurado: especiarias, falcões, tecidos e cafés com shisha. Ganha vida ao fim da tarde.", en: "The restored traditional market: spices, falcons, textiles and shisha cafés. It comes alive in the late afternoon." },
      { id: "nmoq", n: "Museu Nacional do Catar", a: "Downtown", lat: 25.2881, lng: 51.5480, v: 40, o: true, top: true, leg: W(15), pt: "O edifício de Jean Nouvel inspirado na «rosa do deserto». O exterior impressiona; o interior é pago.", en: "Jean Nouvel's building inspired by the «desert rose». The outside is striking; the inside is paid." },
      { id: "mia", n: "Museu de Arte Islâmica e MIA Park", a: "Corniche", lat: 25.2955, lng: 51.5390, v: 45, o: true, leg: W(18, "Pela Corniche"), pt: "Obra de I. M. Pei sobre a água, com o parque e a melhor vista de West Bay. Entrada no museu paga.", en: "I. M. Pei's museum on the water, with the park and the best view of West Bay. Museum entry is paid." },
      { id: "corniche-doh", n: "Corniche e dhows", a: "Corniche", lat: 25.2960, lng: 51.5300, v: 30, leg: W(12), pt: "O passeio em meia-lua da baía, com os barcos dhow de madeira e as torres de West Bay em frente.", en: "The crescent promenade around the bay, with wooden dhow boats and West Bay's towers opposite." },
      { id: "katara", n: "Aldeia Cultural de Katara", a: "Katara", lat: 25.3600, lng: 51.5260, v: 50, x: true, leg: { m: "metro", min: 20, line: "Linha Vermelha → Katara", r: 1 }, pt: "Anfiteatro, mesquitas coloridas, praia e restaurantes num bairro cultural junto ao mar.", en: "An amphitheatre, colourful mosques, a beach and restaurants in a seaside cultural village." }
    ]
  },
  {
    id: "ruh", n: names("Riade", "Riyadh", "Riad", "Riyad", "Riad"), cur: "SAR",
    ap: { iata: "RUH", name: "King Khalid International (RUH)", lat: 24.9576, lng: 46.6988 }, tz: "Asia/Riyadh",
    single: 4, card: 0, cardName: "bilhete de 2 horas (app Darb ou máquina)", alt: null,
    air: { m: "metro", min: 30, line: "Linha Amarela (4) → KAFD", r: 1 },
    ret: { core: { m: "metro", min: 55, line: "Linha Azul → KAFD → Linha Amarela → Aeroporto", r: 1 }, extra: car(40, 85, "Uber / Careem") },
    stops: [
      { id: "kafd", n: "KAFD (Distrito Financeiro)", a: "Al Aqiq", lat: 24.7633, lng: 46.6417, v: 20, leg: W(0, "Metro KAFD"), pt: "Torres de vidro e a estação de metro desenhada por Zaha Hadid Architects: a Riade nova num só olhar.", en: "Glass towers and the metro station designed by Zaha Hadid Architects: the new Riyadh at a glance." },
      { id: "kingdom", n: "Kingdom Centre e Sky Bridge", a: "Olaya", lat: 24.7113, lng: 46.6744, v: 35, o: true, top: true, leg: { m: "metro", min: 15, line: "Linha Azul → Kingdom Centre", r: 1 }, pt: "O arranha-céus com o «buraco» no topo. A ponte suspensa a 300 m é paga e tem a melhor vista da cidade.", en: "The skyscraper with the «hole» at the top. The Sky Bridge at 300 m is paid and has the city's best view." },
      { id: "masmak", n: "Forte Al Masmak e Souq Al Zal", a: "Qasr Al Hukm", lat: 24.6312, lng: 46.7134, v: 45, top: true, leg: { m: "metro", min: 20, line: "Linha Azul → Qasr Al Hukm", r: 1 }, pt: "O forte de adobe onde começou a história do reino (entrada gratuita) e, ao lado, o souk de tapetes, incenso e antiguidades.", en: "The mud-brick fort where the kingdom's story began (free entry) and, next door, the souk of rugs, incense and antiques." },
      { id: "national-museum-ruh", n: "Museu Nacional da Arábia Saudita", a: "Al Murabba", lat: 24.6475, lng: 46.7106, v: 45, leg: car(10, 15), pt: "A história da Península Arábica, dos primeiros povos ao reino moderno, em salas amplas e bem explicadas.", en: "The story of the Arabian Peninsula, from the first peoples to the modern kingdom, in spacious, well-explained galleries." },
      { id: "murabba", n: "Palácio Murabba", a: "Al Murabba", lat: 24.6490, lng: 46.7090, v: 25, leg: W(5, "Pelo parque"), pt: "O palácio de adobe do rei fundador, Abdulaziz, com pátios e salas de receção restauradas, no parque do museu.", en: "The founding king Abdulaziz's mud-brick palace, with restored courtyards and reception rooms, in the museum park." },
      { id: "diriyah", n: "Diriyah: At-Turaif e Bujairi", a: "Diriyah", lat: 24.7360, lng: 46.5770, v: 75, x: true, o: true, leg: car(25, 45), pt: "O berço da dinastia saudita, Património Mundial da UNESCO: ruínas de adobe e o terraço Bujairi com restaurantes. At-Turaif é pago.", en: "The birthplace of the Saudi state, a UNESCO World Heritage Site: mud-brick ruins and the Bujairi Terrace with restaurants. At-Turaif is paid." }
    ]
  },
  {
    id: "jed", n: names("Jedá", "Jeddah", "Yeda", "Djeddah", "Dschidda"), cur: "SAR",
    ap: { iata: "JED", name: "King Abdulaziz International (JED)", lat: 21.6796, lng: 39.1565 }, tz: "Asia/Riyadh",
    single: 4, card: 0, cardName: "cartão Jeddah Bus ou contactless", alt: null,
    air: car(35, 80),
    ret: { core: car(35, 75), extra: car(35, 75) },
    stops: [
      { id: "al-balad", n: "Al-Balad e Casa Nassif", a: "Al-Balad", lat: 21.4826, lng: 39.1867, v: 60, top: true, leg: W(0), pt: "A cidade histórica, Património Mundial: casas de coral com janelas de madeira rendada (rawasheen). A Casa Nassif mostra o interior.", en: "The historic town, a World Heritage Site: coral-stone houses with carved wooden windows (rawasheen). Nassif House shows the interior." },
      { id: "souq-alawi", n: "Souq Al Alawi", a: "Al-Balad", lat: 21.4836, lng: 39.1880, v: 30, leg: W(5), pt: "O souk mais antigo de Jedá: perfumes, tâmaras, tecidos e a vida de rua entre as casas antigas.", en: "Jeddah's oldest souk: perfumes, dates, fabrics and street life between the old houses." },
      { id: "matbouli", n: "Casa Matbouli", a: "Al-Balad", lat: 21.4846, lng: 39.1866, v: 25, o: true, leg: W(5), pt: "Casa-museu de uma família de mercadores, com quartos, objetos e fotografias de há mais de um século.", en: "A merchant family's house museum, with rooms, objects and photographs from over a century ago." },
      { id: "corniche-jed", n: "Corniche e Fonte do Rei Fahd", a: "Corniche", lat: 21.5133, lng: 39.1530, v: 35, top: true, leg: car(15, 25), pt: "O passeio sobre o Mar Vermelho, com esculturas ao ar livre. A fonte mais alta do mundo funciona sobretudo à noite.", en: "The promenade on the Red Sea, with open-air sculptures. The world's tallest fountain runs mainly at night." },
      { id: "al-rahma", n: "Mesquita Al Rahma («flutuante»)", a: "North Corniche", lat: 21.5536, lng: 39.1313, v: 20, leg: car(10, 20), pt: "A mesquita branca construída sobre o mar, que parece flutuar na maré alta. Visite fora das horas de oração.", en: "The white mosque built over the sea, which seems to float at high tide. Visit outside prayer times." }
    ]
  },
  {
    id: "cai", n: names("Cairo", "Cairo", "El Cairo", "Le Caire", "Kairo"), cur: "EGP",
    ap: { iata: "CAI", name: "Cairo International (CAI)", lat: 30.1219, lng: 31.4056 }, tz: "Africa/Cairo",
    single: 10, card: 0, cardName: "bilhete de metro", alt: null,
    air: car(60, 550),
    ret: { core: car(45, 280), extra: car(45, 280) },
    stops: [
      { id: "gem", n: "Grande Museu Egípcio (GEM)", a: "Giza", lat: 29.9947, lng: 31.1197, v: 75, top: true, o: true, leg: W(0), pt: "O maior museu arqueológico do mundo, com o tesouro completo de Tutankhamon e a estátua de Ramsés II na entrada. Entrada paga; reserve online.", en: "The world's largest archaeological museum, with Tutankhamun's complete treasure and the statue of Ramesses II at the entrance. Paid entry; book online." },
      { id: "pyramids", n: "Pirâmides de Gizé", a: "Giza", lat: 29.9792, lng: 31.1342, v: 75, top: true, o: true, leg: car(10, 60), pt: "Quéops, Quéfren e Miquerinos: a única das Sete Maravilhas antigas que resiste. Entrada no planalto paga; use o autocarro interno e recuse passeios de camelo sem preço fechado.", en: "Khufu, Khafre and Menkaure: the only surviving Wonder of the Ancient World. Paid plateau entry; use the internal bus and refuse camel rides without a fixed price." },
      { id: "sphinx", n: "Esfinge e Templo do Vale", a: "Giza", lat: 29.9753, lng: 31.1376, v: 25, leg: W(20, "Pelo planalto"), pt: "A Esfinge vigia as pirâmides há 4500 anos. A vista clássica com as pirâmides atrás é a partir do Templo do Vale.", en: "The Sphinx has guarded the pyramids for 4,500 years. The classic view with the pyramids behind is from the Valley Temple." },
      { id: "egyptian-museum", n: "Museu Egípcio (Tahrir)", a: "Downtown", lat: 30.0478, lng: 31.2336, v: 45, o: true, leg: car(45, 220), pt: "O museu cor-de-rosa da Praça Tahrir, com mais de cem anos: estátuas, sarcófagos e a sala das múmias reais de outrora. Entrada paga.", en: "The century-old pink museum on Tahrir Square: statues, sarcophagi and treasures packed into grand halls. Paid entry." },
      { id: "khan", n: "Khan el-Khalili e rua Al-Muizz", a: "Islamic Cairo", lat: 30.0477, lng: 31.2623, v: 50, top: true, leg: car(20, 90), pt: "O bazar do século XIV, o café El Fishawy e a rua medieval mais bonita do Cairo, com mesquitas e madraças.", en: "The 14th-century bazaar, El Fishawy café and Cairo's most beautiful medieval street, with mosques and madrasas." },
      { id: "citadel-cai", n: "Cidadela de Saladino e Mesquita de Muhammad Ali", a: "Citadel", lat: 30.0287, lng: 31.2599, v: 50, x: true, o: true, leg: car(15, 70), pt: "A fortaleza medieval no alto da cidade e a mesquita de alabastro com cúpulas otomanas. Vista sobre todo o Cairo. Entrada paga.", en: "The medieval fortress above the city and the alabaster mosque with Ottoman domes. A view over all of Cairo. Paid entry." }
    ]
  },
  {
    id: "amm", n: names("Amã", "Amman", "Amán", "Amman", "Amman"), cur: "JOD",
    ap: { iata: "AMM", name: "Queen Alia International (AMM)", lat: 31.7226, lng: 35.9932 }, tz: "Asia/Amman",
    single: 0.5, card: 0, cardName: "", alt: null,
    air: { m: "bus", min: 70, line: "Sariyah Airport Express → 7.º Círculo + táxi", f: 6.5 },
    ret: { core: car(40, 25, "Careem / táxi"), extra: car(40, 25, "Careem / táxi") },
    stops: [
      { id: "citadel", n: "Cidadela de Amã", a: "Jabal al-Qal'a", lat: 31.9547, lng: 35.9343, v: 50, top: true, o: true, leg: W(0), pt: "O Templo de Hércules, o palácio omíada e a melhor vista da cidade branca. Entrada paga (incluída no Jordan Pass).", en: "The Temple of Hercules, the Umayyad palace and the best view of the white city. Paid entry (included in the Jordan Pass)." },
      { id: "roman-theatre", n: "Teatro Romano", a: "Downtown", lat: 31.9517, lng: 35.9394, v: 30, top: true, o: true, leg: W(15, "Escadas a descer"), pt: "Um teatro do século II para 6 mil pessoas, escavado na colina. Suba às últimas filas para a vista.", en: "A 2nd-century theatre for 6,000 people, cut into the hillside. Climb to the top rows for the view." },
      { id: "downtown-amm", n: "Baixa (Al-Balad) e souks", a: "Al-Balad", lat: 31.9510, lng: 35.9330, v: 45, leg: W(10), pt: "Souk do ouro, especiarias, falafel no Hashem e knafeh quente na Habibah. O coração popular de Amã.", en: "The gold souk, spices, falafel at Hashem and hot knafeh at Habibah. Amman's everyday heart." },
      { id: "rainbow", n: "Rainbow Street", a: "Jabal Amman", lat: 31.9497, lng: 35.9245, v: 35, leg: W(20, "A subir"), pt: "A rua dos cafés com terraço, lojas de artesanato e vista sobre os telhados de Jabal Amman.", en: "The street of terrace cafés, craft shops and views over Jabal Amman's rooftops." },
      { id: "abdullah-mosque", n: "Mesquita do Rei Abdullah I", a: "Al-Abdali", lat: 31.9636, lng: 35.9133, v: 25, leg: car(10, 2.5, "Táxi / Careem"), pt: "A mesquita da cúpula azul em mosaico, aberta a visitantes não muçulmanos fora das orações (com roupa adequada).", en: "The mosque with the blue mosaic dome, open to non-Muslim visitors outside prayer times (with suitable clothing)." }
    ]
  },
  {
    id: "mct", n: names("Mascate", "Muscat", "Mascate", "Mascate", "Maskat"), cur: "OMR",
    ap: { iata: "MCT", name: "Muscat International (MCT)", lat: 23.5933, lng: 58.2844 }, tz: "Asia/Muscat",
    single: 0.5, card: 0, cardName: "", alt: null,
    air: car(20, 6, "Táxi / Otaxi / Careem"),
    ret: { core: car(40, 12, "Táxi / Otaxi / Careem"), extra: car(20, 8, "Táxi / Otaxi / Careem") },
    stops: [
      { id: "grand-mosque-mct", n: "Grande Mesquita Sultan Qaboos", a: "Al Ghubrah", lat: 23.5840, lng: 58.3890, v: 60, top: true, leg: W(0), pt: "Mármore, um lustre de cristal de 14 m e um tapete persa gigante. Visitantes não muçulmanos: sábado a quinta, 8:00–11:00, com braços e pernas cobertos (mulheres com lenço).", en: "Marble, a 14 m crystal chandelier and a giant Persian carpet. Non-Muslim visitors: Saturday to Thursday, 8:00–11:00, with arms and legs covered (women with a headscarf)." },
      { id: "opera-mct", n: "Royal Opera House Muscat", a: "Shati Al Qurum", lat: 23.6135, lng: 58.4706, v: 30, leg: car(12, 4, "Táxi / Otaxi / Careem"), pt: "A ópera em pedra clara, com jardins e galeria de lojas. Visitas guiadas pagas em alguns dias.", en: "The pale-stone opera house, with gardens and a shopping gallery. Paid guided tours on some days." },
      { id: "mutrah", n: "Corniche e Souq de Mutrah", a: "Mutrah", lat: 23.6158, lng: 58.5636, v: 60, top: true, leg: car(20, 6, "Táxi / Otaxi / Careem"), pt: "Incenso, prata e lenços no souk coberto, e o passeio marítimo com os barcos e o forte português no alto.", en: "Frankincense, silver and scarves in the covered souk, and the seafront with the boats and the Portuguese fort above." },
      { id: "al-alam", n: "Palácio Al Alam e Muscat Antiga", a: "Old Muscat", lat: 23.6146, lng: 58.5955, v: 30, leg: car(10, 3, "Táxi / Otaxi / Careem"), pt: "O palácio cerimonial azul e dourado entre os fortes portugueses de Mirani e Jalali. Só exterior.", en: "The blue-and-gold ceremonial palace between the Portuguese forts of Mirani and Jalali. Exterior only." },
      { id: "national-museum-om", n: "Museu Nacional de Omã", a: "Old Muscat", lat: 23.6143, lng: 58.5915, v: 40, o: true, leg: W(5), pt: "Do incenso à navegação: a história de Omã em salas modernas, em frente ao palácio. Entrada paga.", en: "From frankincense to seafaring: Oman's history in modern galleries opposite the palace. Paid entry." }
    ]
  }
];

/** Nomes em italiano, chinês, árabe e japonês. */
export const ME_NAMES: Record<string, Record<string, string>> = {
  dxb: { it: "Dubai", zh: "迪拜", ar: "دبي", ja: "ドバイ" },
  auh: { it: "Abu Dhabi", zh: "阿布扎比", ar: "أبوظبي", ja: "アブダビ" },
  doh: { it: "Doha", zh: "多哈", ar: "الدوحة", ja: "ドーハ" },
  ruh: { it: "Riad", zh: "利雅得", ar: "الرياض", ja: "リヤド" },
  jed: { it: "Gedda", zh: "吉达", ar: "جدة", ja: "ジッダ" },
  cai: { it: "Il Cairo", zh: "开罗", ar: "القاهرة", ja: "カイロ" },
  amm: { it: "Amman", zh: "安曼", ar: "عمّان", ja: "アンマン" },
  mct: { it: "Mascate", zh: "马斯喀特", ar: "مسقط", ja: "マスカット" }
};
