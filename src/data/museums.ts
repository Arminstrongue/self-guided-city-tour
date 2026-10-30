/**
 * Museus e monumentos principais por cidade: horários e preço de adulto em moeda local.
 * Valores de referência recolhidos em outubro de 2026 — mudam com frequência; a app mostra
 * sempre a ligação para o site oficial. Editar aqui (ou no painel, numa próxima versão).
 * h: [dias (0 = domingo), abre, fecha]; vários blocos para horários diferentes por dia.
 */
export type Hours = [number[], string, string][];
export type Museum = {
  id: string; n: string; lat: number; lng: number;
  price: number;           // 0 = gratuito
  h: Hours;
  book?: boolean;          // reserva recomendada ou obrigatória
  url: string;
  pt: string; en: string;  // nota curta (dia grátis, dicas)
};

const ALL = [0, 1, 2, 3, 4, 5, 6];
const NO_MON = [0, 2, 3, 4, 5, 6];
const NO_TUE = [0, 1, 3, 4, 5, 6];

export const MUSEUMS: Record<string, Museum[]> = {
  lis: [
    { id: "jeronimos-m", n: "Mosteiro dos Jerónimos", lat: 38.6979, lng: -9.2068, price: 18, h: [[NO_MON, "09:30", "17:30"]], book: true, url: "https://www.museusemonumentos.pt", pt: "Fechado à segunda. Compre online para evitar a fila.", en: "Closed Mondays. Buy online to skip the queue." },
    { id: "castelo-sj", n: "Castelo de São Jorge", lat: 38.7139, lng: -9.1335, price: 15, h: [[ALL, "09:00", "18:00"]], url: "https://castelodesaojorge.pt", pt: "Aberto até às 21:00 de março a outubro.", en: "Open until 21:00 from March to October." },
    { id: "azulejo", n: "Museu Nacional do Azulejo", lat: 38.7247, lng: -9.1136, price: 8, h: [[NO_MON, "10:00", "18:00"]], url: "https://www.museusemonumentos.pt", pt: "Fechado à segunda.", en: "Closed Mondays." },
    { id: "oceanario", n: "Oceanário de Lisboa", lat: 38.7635, lng: -9.0937, price: 25, h: [[ALL, "10:00", "19:00"]], url: "https://www.oceanario.pt", pt: "Perto do aeroporto (metro Oriente): bom para escalas curtas.", en: "Near the airport (Oriente metro): good for short layovers." }
  ],
  opo: [
    { id: "lello", n: "Livraria Lello", lat: 41.1468, lng: -8.6149, price: 10, h: [[ALL, "09:30", "19:00"]], book: true, url: "https://www.livrarialello.pt", pt: "O bilhete desconta na compra de um livro.", en: "The ticket is deducted from a book purchase." },
    { id: "clerigos-t", n: "Torre dos Clérigos", lat: 41.1457, lng: -8.6141, price: 10, h: [[ALL, "09:00", "19:00"]], url: "https://www.torredosclerigos.pt", pt: "225 degraus até à melhor vista do Porto.", en: "225 steps to the best view of Porto." },
    { id: "bolsa", n: "Palácio da Bolsa", lat: 41.1413, lng: -8.6155, price: 14, h: [[ALL, "09:00", "18:30"]], url: "https://www.palaciodabolsa.com", pt: "Só com visita guiada; o Salão Árabe é o destaque.", en: "Guided tours only; the Arab Room is the highlight." }
  ],
  mad: [
    { id: "prado-m", n: "Museo del Prado", lat: 40.4138, lng: -3.6921, price: 15, h: [[[1, 2, 3, 4, 5, 6], "10:00", "20:00"], [[0], "10:00", "19:00"]], book: true, url: "https://www.museodelprado.es", pt: "Grátis nas últimas 2 horas (seg–sáb 18–20, dom 17–19).", en: "Free in the last 2 hours (Mon–Sat 18–20, Sun 17–19)." },
    { id: "reina-sofia", n: "Museo Reina Sofía (Guernica)", lat: 40.4086, lng: -3.6945, price: 12, h: [[[1, 3, 4, 5, 6], "10:00", "21:00"], [[0], "10:00", "14:30"]], url: "https://www.museoreinasofia.es", pt: "Fechado à terça. Grátis seg e qua–sáb 19–21.", en: "Closed Tuesdays. Free Mon and Wed–Sat 19–21." },
    { id: "palacio-real-m", n: "Palacio Real", lat: 40.418, lng: -3.7143, price: 16, h: [[ALL, "10:00", "18:00"]], book: true, url: "https://www.patrimonionacional.es", pt: "Até às 19:00 de abril a setembro.", en: "Until 19:00 from April to September." }
  ],
  bcn: [
    { id: "sagrada-m", n: "Sagrada Família", lat: 41.4036, lng: 2.1744, price: 26, h: [[ALL, "09:00", "18:00"]], book: true, url: "https://sagradafamilia.org", pt: "Reserva obrigatória na prática; até às 20:00 no verão.", en: "Booking effectively required; until 20:00 in summer." },
    { id: "guell", n: "Park Güell", lat: 41.4145, lng: 2.1527, price: 18, h: [[ALL, "09:30", "19:30"]], book: true, url: "https://parkguell.barcelona", pt: "Entrada com hora marcada na zona monumental.", en: "Timed entry to the monumental zone." },
    { id: "picasso", n: "Museu Picasso", lat: 41.3852, lng: 2.1809, price: 15, h: [[NO_MON, "10:00", "19:00"]], url: "https://museupicassobcn.cat", pt: "Fechado à segunda. Grátis às quintas 17–19.", en: "Closed Mondays. Free Thursdays 17–19." }
  ],
  par: [
    { id: "louvre-m", n: "Musée du Louvre", lat: 48.8606, lng: 2.3376, price: 22, h: [[[0, 1, 4, 6], "09:00", "18:00"], [[3, 5], "09:00", "21:00"]], book: true, url: "https://www.louvre.fr", pt: "Fechado à terça. Desde 2026, visitantes de fora do EEE pagam 32 €.", en: "Closed Tuesdays. Since 2026, non-EEA visitors pay €32." },
    { id: "orsay", n: "Musée d'Orsay", lat: 48.86, lng: 2.3266, price: 16, h: [[[0, 2, 3, 5, 6], "09:30", "18:00"], [[4], "09:30", "21:45"]], url: "https://www.musee-orsay.fr", pt: "Fechado à segunda; quinta até tarde.", en: "Closed Mondays; late opening Thursdays." },
    { id: "eiffel-m", n: "Torre Eiffel (topo)", lat: 48.8584, lng: 2.2945, price: 36, h: [[ALL, "09:30", "23:45"]], book: true, url: "https://www.toureiffel.paris", pt: "Preço de elevador até ao topo; pelas escadas até ao 2.º andar é mais barato.", en: "Lift-to-top price; stairs to the 2nd floor are cheaper." }
  ],
  lon: [
    { id: "british", n: "British Museum", lat: 51.5194, lng: -0.127, price: 0, h: [[[0, 1, 2, 3, 4, 6], "10:00", "17:00"], [[5], "10:00", "20:30"]], url: "https://www.britishmuseum.org", pt: "Gratuito; exposições temporárias pagas.", en: "Free; temporary exhibitions are paid." },
    { id: "ng", n: "National Gallery", lat: 51.5089, lng: -0.1283, price: 0, h: [[[0, 1, 2, 3, 4, 6], "10:00", "18:00"], [[5], "10:00", "21:00"]], url: "https://www.nationalgallery.org.uk", pt: "Gratuito, na Trafalgar Square.", en: "Free, on Trafalgar Square." },
    // Fonte: Visit London (visitlondon.com), consultado em outubro de 2026.
    { id: "science", n: "Science Museum", lat: 51.4978, lng: -0.1745, price: 0, h: [[ALL, "10:00", "18:00"]], book: true, url: "https://www.sciencemuseum.org.uk", pt: "Gratuito, mas é preciso reservar a entrada online. Última entrada às 17:15. O IMAX, os simuladores e algumas exposições são pagos.", en: "Free, but entry must be booked online. Last entry 17:15. The IMAX, simulators and some exhibitions are paid." },
    { id: "nhm", n: "Natural History Museum", lat: 51.4967, lng: -0.1764, price: 0, h: [[ALL, "10:00", "17:50"]], url: "https://www.nhm.ac.uk", pt: "Gratuito; reserve uma hora de entrada nas férias escolares.", en: "Free; book a time slot in school holidays." },
    { id: "tower", n: "Tower of London", lat: 51.5081, lng: -0.0759, price: 35, h: [[ALL, "09:00", "17:30"]], book: true, url: "https://www.hrp.org.uk/tower-of-london", pt: "As joias da coroa; mais barato online.", en: "The Crown Jewels; cheaper online." }
  ],
  rom: [
    { id: "colosseo-m", n: "Coliseu, Fórum e Palatino", lat: 41.8902, lng: 12.4922, price: 18, h: [[ALL, "08:30", "16:30"]], book: true, url: "https://colosseo.it", pt: "Fecha uma hora antes do pôr do sol (até ~19:15 no verão).", en: "Closes an hour before sunset (until ~19:15 in summer)." },
    { id: "vaticano", n: "Museus do Vaticano e Capela Sistina", lat: 41.9065, lng: 12.4536, price: 20, h: [[[1, 2, 3, 4, 5, 6], "08:00", "19:00"]], book: true, url: "https://www.museivaticani.va", pt: "Fechado ao domingo (exceto o último do mês, grátis).", en: "Closed Sundays (except the last of the month, free)." },
    { id: "borghese", n: "Galleria Borghese", lat: 41.9142, lng: 12.4922, price: 15, h: [[NO_MON, "09:00", "19:00"]], book: true, url: "https://galleriaborghese.beniculturali.it", pt: "Reserva obrigatória; fechado à segunda.", en: "Booking required; closed Mondays." },
    { id: "pantheon-m", n: "Panteão", lat: 41.8986, lng: 12.4769, price: 5, h: [[ALL, "09:00", "19:00"]], url: "https://www.pantheonroma.com", pt: "Bilhete simples à porta.", en: "Simple ticket at the door." }
  ],
  ams: [
    { id: "rijks-m", n: "Rijksmuseum", lat: 52.36, lng: 4.8852, price: 25, h: [[ALL, "09:00", "17:00"]], url: "https://www.rijksmuseum.nl", pt: "A Ronda da Noite de Rembrandt.", en: "Rembrandt's Night Watch." },
    { id: "vangogh", n: "Van Gogh Museum", lat: 52.3584, lng: 4.8811, price: 22, h: [[ALL, "09:00", "18:00"]], book: true, url: "https://www.vangoghmuseum.nl", pt: "Só bilhetes online com hora marcada.", en: "Timed online tickets only." },
    { id: "annefrank-m", n: "Casa de Anne Frank", lat: 52.3752, lng: 4.884, price: 16, h: [[ALL, "09:00", "22:00"]], book: true, url: "https://www.annefrank.org", pt: "Bilhetes só online, libertados 6 semanas antes.", en: "Online tickets only, released 6 weeks ahead." }
  ],
  edi: [
    { id: "castle-m", n: "Edinburgh Castle", lat: 55.9486, lng: -3.1999, price: 22, h: [[ALL, "09:30", "17:00"]], book: true, url: "https://www.edinburghcastle.scot", pt: "Até às 18:00 de abril a setembro; mais barato online.", en: "Until 18:00 April–September; cheaper online." },
    { id: "nms-m", n: "National Museum of Scotland", lat: 55.9469, lng: -3.1892, price: 0, h: [[ALL, "10:00", "17:00"]], url: "https://www.nms.ac.uk", pt: "Gratuito, com terraço no telhado.", en: "Free, with a rooftop terrace." },
    { id: "sng", n: "Scottish National Gallery", lat: 55.9509, lng: -3.1957, price: 0, h: [[ALL, "10:00", "17:00"]], url: "https://www.nationalgalleries.org", pt: "Gratuito, junto aos Princes Street Gardens.", en: "Free, by Princes Street Gardens." }
  ],
  man: [
    { id: "manchester-museum", n: "Manchester Museum", lat: 53.4664, lng: -2.2337, price: 0, h: [[ALL, "10:00", "17:00"]], url: "https://www.museum.manchester.ac.uk", pt: "Gratuito: dinossauros, Egito e cultura do sul da Ásia.", en: "Free: dinosaurs, Egypt and South Asian culture." },
    { id: "nfm", n: "National Football Museum", lat: 53.4855, lng: -2.2423, price: 15, h: [[ALL, "10:00", "17:00"]], url: "https://www.nationalfootballmuseum.com", pt: "O bilhete costuma valer para voltar durante um ano.", en: "Tickets usually allow return visits for a year." },
    { id: "sim", n: "Science and Industry Museum", lat: 53.4772, lng: -2.2551, price: 0, h: [[ALL, "10:00", "17:00"]], url: "https://www.scienceandindustrymuseum.org.uk", pt: "Gratuito; algumas galerias em obras.", en: "Free; some galleries under renovation." }
  ],
  gla: [
    { id: "kelvingrove-m", n: "Kelvingrove Art Gallery and Museum", lat: 55.8686, lng: -4.2906, price: 0, h: [[[1, 2, 3, 4, 6], "10:00", "17:00"], [[0, 5], "11:00", "17:00"]], url: "https://www.glasgowlife.org.uk", pt: "Gratuito; recital de órgão a meio do dia.", en: "Free; lunchtime organ recital." },
    { id: "riverside-m", n: "Riverside Museum", lat: 55.865, lng: -4.306, price: 0, h: [[[1, 2, 3, 4, 6], "10:00", "17:00"], [[0, 5], "11:00", "17:00"]], url: "https://www.glasgowlife.org.uk", pt: "Gratuito: transportes e o veleiro Glenlee.", en: "Free: transport and the Glenlee tall ship." },
    { id: "cathedral-g", n: "Glasgow Cathedral", lat: 55.8628, lng: -4.2343, price: 0, h: [[[1, 2, 3, 4, 5, 6], "09:30", "17:30"], [[0], "13:00", "17:00"]], url: "https://www.historicenvironment.scot", pt: "Gratuito; ao domingo só à tarde.", en: "Free; Sunday afternoons only." }
  ],
  liv: [
    { id: "mol", n: "Museum of Liverpool", lat: 53.404, lng: -2.995, price: 0, h: [[ALL, "10:00", "17:00"]], url: "https://www.liverpoolmuseums.org.uk", pt: "Gratuito, no Pier Head.", en: "Free, at Pier Head." },
    { id: "beatles-m", n: "The Beatles Story", lat: 53.3993, lng: -2.9922, price: 22, h: [[ALL, "10:00", "18:00"]], url: "https://www.beatlesstory.com", pt: "Mais barato online.", en: "Cheaper online." },
    { id: "walker", n: "Walker Art Gallery", lat: 53.4099, lng: -2.9796, price: 0, h: [[ALL, "10:00", "17:00"]], url: "https://www.liverpoolmuseums.org.uk", pt: "Gratuito, ao lado de St George's Hall.", en: "Free, next to St George's Hall." }
  ],
  ist: [
    { id: "ayasofya", n: "Santa Sofia (Ayasofya)", lat: 41.0086, lng: 28.9802, price: 1270, h: [[ALL, "08:00", "19:00"]], url: "https://muze.gov.tr", pt: "25 € para estrangeiros, só à porta. À sexta fecha ao meio-dia (oração), cerca das 12:00–14:30.", en: "€25 for foreigners, at the door only. On Fridays it closes around midday prayers (about 12:00–14:30)." },
    { id: "topkapi-m", n: "Palácio de Topkapı (com Harém)", lat: 41.0115, lng: 28.9834, price: 2750, h: [[[0, 1, 3, 4, 5, 6], "09:00", "17:00"]], book: true, url: "https://muze.gov.tr", pt: "Fechado à terça. Reserve meio dia.", en: "Closed Tuesdays. Allow half a day." },
    { id: "yerebatan", n: "Cisterna da Basílica", lat: 41.0084, lng: 28.9779, price: 1950, h: [[ALL, "09:00", "22:00"]], url: "https://yerebatan.com", pt: "Pausa diária por volta das 18:30–19:30; o horário noturno pode mudar.", en: "Daily break around 18:30–19:30; evening hours may change." },
    { id: "galata-m", n: "Torre de Gálata", lat: 41.0256, lng: 28.9742, price: 1525, h: [[ALL, "08:30", "23:00"]], url: "https://muze.gov.tr", pt: "30 € para estrangeiros; pausa por volta das 17:45–19:00. Fila menor de manhã cedo.", en: "€30 for foreigners; break around 17:45–19:00. Shorter queues early morning." },
    { id: "dolmabahce", n: "Palácio de Dolmabahçe", lat: 41.0391, lng: 29.0001, price: 2000, h: [[[0, 2, 3, 4, 5, 6], "09:00", "17:00"]], url: "https://www.millisaraylar.gov.tr", pt: "Fechado à segunda. Perto de Taksim, à beira do Bósforo.", en: "Closed Mondays. Near Taksim, on the Bosphorus." }
  ],
  dxb: [
    { id: "at-the-top", n: "Burj Khalifa — At the Top", lat: 25.1972, lng: 55.2744, price: 169, h: [[ALL, "10:00", "23:00"]], book: true, url: "https://www.burjkhalifa.ae", pt: "Preço base dos pisos 124–125 fora das horas de pôr do sol; ao pôr do sol custa mais. Reserve online.", en: "Base price for levels 124–125 outside sunset hours; sunset slots cost more. Book online." },
    { id: "motf", n: "Museu do Futuro", lat: 25.2192, lng: 55.2820, price: 149, h: [[ALL, "10:00", "21:30"]], book: true, url: "https://museumofthefuture.ae", pt: "Bilhetes com hora marcada; esgota com frequência.", en: "Timed tickets; often sells out." }
  ],
  auh: [
    { id: "szgm", n: "Mesquita Sheikh Zayed", lat: 24.4128, lng: 54.4750, price: 0, h: [[[0, 1, 2, 3, 4, 6], "09:00", "22:00"], [[5], "16:30", "22:00"]], book: true, url: "https://www.szgmc.gov.ae", pt: "Gratuita com reserva online. Sexta só à tarde. Roupa que cubra braços e pernas.", en: "Free with online booking. Fridays afternoon only. Clothes covering arms and legs." },
    { id: "qaw", n: "Qasr Al Watan", lat: 24.4625, lng: 54.3058, price: 65, h: [[ALL, "10:00", "18:30"]], url: "https://www.qasralwatan.ae", pt: "Palácio e jardins; espetáculo de luz à noite com bilhete à parte.", en: "Palace and gardens; evening light show on a separate ticket." },
    { id: "louvre", n: "Louvre Abu Dhabi", lat: 24.5337, lng: 54.3983, price: 63, h: [[[0, 2, 3, 4], "10:00", "18:30"], [[5, 6], "10:00", "20:30"]], url: "https://www.louvreabudhabi.ae", pt: "Fechado à segunda.", en: "Closed Mondays." }
  ],
  doh: [
    { id: "nmoq-m", n: "Museu Nacional do Catar", lat: 25.2881, lng: 51.5480, price: 50, h: [[[0, 1, 2, 3, 4, 6], "09:00", "19:00"], [[5], "13:30", "19:00"]], url: "https://qm.org.qa", pt: "Sexta só à tarde. Gratuito para residentes.", en: "Friday afternoons only. Free for residents." },
    { id: "mia-m", n: "Museu de Arte Islâmica", lat: 25.2955, lng: 51.5390, price: 50, h: [[[0, 1, 2, 3, 4, 6], "09:00", "19:00"], [[5], "13:30", "19:00"]], url: "https://qm.org.qa", pt: "O parque MIA é gratuito e aberto até tarde.", en: "MIA Park is free and open late." }
  ],
  ruh: [
    { id: "masmak-m", n: "Forte Al Masmak", lat: 24.6312, lng: 46.7134, price: 0, h: [[[0, 1, 2, 3, 4, 6], "08:00", "21:00"], [[5], "16:00", "21:00"]], url: "https://www.visitsaudi.com", pt: "Entrada gratuita. Horário de sexta reduzido; confirme no local.", en: "Free entry. Shorter hours on Fridays; check locally." },
    { id: "turaif", n: "At-Turaif (Diriyah)", lat: 24.7338, lng: 46.5727, price: 100, h: [[ALL, "10:00", "24:00"]], book: true, url: "https://www.diriyah.sa", pt: "Bilhete com hora marcada no site de Diriyah; o preço varia com a época.", en: "Timed tickets on the Diriyah website; price varies by season." }
  ],
  cai: [
    { id: "gem-m", n: "Grande Museu Egípcio", lat: 29.9947, lng: 31.1197, price: 1700, h: [[[0, 1, 2, 4, 5], "09:00", "18:00"], [[3, 6], "09:00", "21:00"]], book: true, url: "https://visit-gem.com", pt: "Preço para estrangeiros; reserve online. Fecha mais tarde à quarta e ao sábado.", en: "Foreigner price; book online. Open later on Wednesdays and Saturdays." },
    { id: "giza", n: "Planalto de Gizé (pirâmides)", lat: 29.9792, lng: 31.1342, price: 700, h: [[ALL, "07:00", "17:00"]], url: "https://egymonuments.gov.eg", pt: "Entrar dentro de uma pirâmide e o autocarro interno são bilhetes à parte. Só cartão em muitas bilheteiras.", en: "Going inside a pyramid and the internal bus are extra tickets. Card-only at many ticket desks." },
    { id: "egm", n: "Museu Egípcio (Tahrir)", lat: 30.0478, lng: 31.2336, price: 550, h: [[ALL, "09:00", "17:00"]], url: "https://egymonuments.gov.eg", pt: "Preço para estrangeiros.", en: "Foreigner price." }
  ],
  amm: [
    { id: "citadel-m", n: "Cidadela de Amã", lat: 31.9547, lng: 35.9343, price: 3, h: [[ALL, "08:00", "17:00"]], url: "https://www.jordanpass.jo", pt: "Incluída no Jordan Pass. Fecha mais tarde no verão.", en: "Included in the Jordan Pass. Closes later in summer." },
    { id: "theatre-m", n: "Teatro Romano", lat: 31.9517, lng: 35.9394, price: 2, h: [[ALL, "08:00", "17:00"]], url: "https://www.jordanpass.jo", pt: "Incluído no Jordan Pass, com dois pequenos museus de folclore.", en: "Included in the Jordan Pass, with two small folklore museums." }
  ],
  mct: [
    { id: "sqgm-m", n: "Grande Mesquita Sultan Qaboos", lat: 23.5840, lng: 58.3890, price: 0, h: [[[0, 1, 2, 3, 4, 6], "08:00", "11:00"]], url: "https://www.experienceoman.om", pt: "Gratuita. Visitantes só de sábado a quinta de manhã; roupa que cubra braços e pernas, mulheres com lenço.", en: "Free. Visitors only Saturday to Thursday mornings; clothes covering arms and legs, women with a headscarf." },
    { id: "nmo-m", n: "Museu Nacional de Omã", lat: 23.6143, lng: 58.5915, price: 5, h: [[[0, 1, 2, 3, 4, 6], "10:00", "17:00"]], url: "https://www.nm.gov.om", pt: "Confirme o horário de sexta no site.", en: "Check Friday hours on the website." }
  ],
  bir: [
    { id: "thinktank", n: "Thinktank Science Museum", lat: 52.4826, lng: -1.8862, price: 16, h: [[ALL, "10:00", "17:00"]], url: "https://www.birminghammuseums.org.uk", pt: "Museu de ciência interativo em Eastside.", en: "Hands-on science museum in Eastside." },
    { id: "barber", n: "Barber Institute of Fine Arts", lat: 52.4508, lng: -1.9293, price: 0, h: [[[1, 2, 3, 4, 5], "10:00", "17:00"], [[0, 6], "11:00", "17:00"]], url: "https://barber.org.uk", pt: "Gratuito: Monet, Van Gogh e Rubens na universidade.", en: "Free: Monet, Van Gogh and Rubens at the university." },
    { id: "cadbury-m", n: "Cadbury World", lat: 52.4285, lng: -1.9314, price: 23, h: [[ALL, "10:00", "17:00"]], book: true, url: "https://www.cadburyworld.co.uk", pt: "Reserve com antecedência; horários variam por época.", en: "Book ahead; hours vary by season." }
  ],
  fra: [
    { id: "staedel", n: "Städel Museum", lat: 50.1032, lng: 8.6743, price: 18, h: [[[2, 3, 5, 6, 0], "10:00", "18:00"], [[4], "10:00", "21:00"]], url: "https://www.staedelmuseum.de", pt: "Fechado à segunda; quinta até às 21h. Ao fim de semana o bilhete é um pouco mais caro.", en: "Closed Mondays; Thursdays until 21:00. Weekend tickets cost a little more." },
    { id: "main-tower-m", n: "Main Tower (miradouro)", lat: 50.1124, lng: 8.672, price: 11, h: [[[0, 1, 2, 3, 4], "10:00", "21:00"], [[5, 6], "10:00", "23:00"]], url: "https://www.maintower.de", pt: "Controlo de segurança como no aeroporto; o terraço fecha com vento forte ou tempestade.", en: "Airport-style security check; the deck closes in strong wind or storms." },
    { id: "goethe-haus", n: "Casa de Goethe e Museu do Romantismo", lat: 50.1113, lng: 8.6777, price: 10, h: [[[2, 3, 5, 6, 0], "10:00", "18:00"], [[4], "10:00", "21:00"]], url: "https://frankfurter-goethe-haus.de", pt: "A casa onde nasceu Goethe, com o museu do Romantismo alemão ao lado. Fechado à segunda.", en: "Goethe's birthplace, with the German Romanticism museum next door. Closed Mondays." },
    { id: "senckenberg", n: "Museu de História Natural Senckenberg", lat: 50.1175, lng: 8.6516, price: 12, h: [[[1, 2, 4, 5], "09:00", "17:00"], [[3], "09:00", "20:00"], [[6, 0], "09:00", "18:00"]], url: "https://museumfrankfurt.senckenberg.de", pt: "Dinossauros e baleias; ótimo com crianças.", en: "Dinosaurs and whales; great with children." }
  ],
  ber: [
    { id: "reichstag-m", n: "Cúpula do Reichstag", lat: 52.5186, lng: 13.3762, price: 0, h: [[ALL, "08:00", "24:00"]], book: true, url: "https://www.bundestag.de/en/visittheBundestag", pt: "Gratuito mas só com reserva online (alguns dias antes) e passaporte. Última entrada às 21h45.", en: "Free but only with an online booking (a few days ahead) and your passport. Last entry 21:45." },
    { id: "neues-museum", n: "Neues Museum (Nefertiti)", lat: 52.5206, lng: 13.3977, price: 14, h: [[[2, 3, 4, 5, 6, 0], "10:00", "18:00"]], book: true, url: "https://www.smb.museum", pt: "O busto de Nefertiti. Bilhete com hora marcada; a maioria dos museus da ilha fecha à segunda. O Pergamon está em obras.", en: "The bust of Nefertiti. Timed tickets; most island museums close on Mondays. The Pergamon is under renovation." },
    { id: "fernsehturm", n: "Torre de TV (Fernsehturm)", lat: 52.5208, lng: 13.4094, price: 25, h: [[ALL, "10:00", "22:00"]], book: true, url: "https://tv-turm.de", pt: "Bilhetes com hora marcada; compre online para evitar a fila.", en: "Timed tickets; buy online to skip the queue." },
    { id: "berliner-dom", n: "Catedral de Berlim", lat: 52.5191, lng: 13.4011, price: 10, h: [[[1, 2, 3, 4, 5, 6], "09:00", "18:00"], [[0], "12:00", "18:00"]], url: "https://www.berlinerdom.de", pt: "Inclui a subida à cúpula (270 degraus) e a cripta dos Hohenzollern.", en: "Includes the dome walk (270 steps) and the Hohenzollern crypt." }
  ],
  muc: [
    { id: "residenz-m", n: "Residenz (museu)", lat: 48.1418, lng: 11.5786, price: 10, h: [[ALL, "10:00", "17:00"]], url: "https://www.residenz-muenchen.de", pt: "De abril a meados de outubro abre das 9h às 18h. O Tesouro tem bilhete à parte.", en: "April to mid-October: 9:00–18:00. The Treasury has a separate ticket." },
    { id: "deutsches-museum", n: "Deutsches Museum", lat: 48.1299, lng: 11.5834, price: 15, h: [[ALL, "09:00", "17:00"]], url: "https://www.deutsches-museum.de", pt: "Um dos maiores museus de ciência e técnica do mundo, numa ilha do rio Isar.", en: "One of the world's largest science and technology museums, on an island in the Isar." },
    { id: "alte-pinakothek", n: "Alte Pinakothek", lat: 48.1482, lng: 11.57, price: 9, h: [[[2, 3], "10:00", "20:00"], [[4, 5, 6, 0], "10:00", "18:00"]], url: "https://www.pinakothek.de", pt: "Dürer, Rubens e Rafael. Ao domingo a entrada custa 1 €. Fechado à segunda.", en: "Dürer, Rubens and Raphael. €1 entry on Sundays. Closed Mondays." },
    { id: "bmw-museum", n: "Museu BMW", lat: 48.1769, lng: 11.5594, price: 10, h: [[[2, 3, 4, 5, 6, 0], "10:00", "18:00"]], url: "https://www.bmw-welt.com", pt: "A BMW Welt, em frente, é gratuita. O museu fecha à segunda.", en: "BMW Welt opposite is free. The museum closes on Mondays." }
  ],
  vie: [
    { id: "schoenbrunn-m", n: "Palácio de Schönbrunn (Imperial Tour)", lat: 48.1849, lng: 16.3122, price: 29, h: [[ALL, "08:30", "17:00"]], book: true, url: "https://www.schoenbrunn.at", pt: "Bilhete com hora marcada: compre online. Jardins e Gloriette gratuitos; no verão fecha às 17h30.", en: "Timed tickets: buy online. The gardens and Gloriette are free; in summer it closes at 17:30." },
    { id: "sisi", n: "Hofburg: Apartamentos Imperiais e Museu Sissi", lat: 48.2079, lng: 16.3667, price: 21, h: [[ALL, "09:00", "17:30"]], url: "https://www.sisimuseum-hofburg.at", pt: "Em julho e agosto abre até às 18h.", en: "Open until 18:00 in July and August." },
    { id: "albertina", n: "Albertina", lat: 48.2045, lng: 16.3681, price: 20, h: [[[0, 1, 2, 4, 6], "10:00", "18:00"], [[3, 5], "10:00", "21:00"]], url: "https://www.albertina.at", pt: "De Monet a Picasso, e salas imperiais. Quarta e sexta até às 21h.", en: "Monet to Picasso, plus state rooms. Wednesdays and Fridays until 21:00." },
    { id: "khm", n: "Kunsthistorisches Museum", lat: 48.2038, lng: 16.3617, price: 21, h: [[[2, 3, 5, 6, 0], "10:00", "18:00"], [[4], "10:00", "21:00"]], url: "https://www.khm.at", pt: "Bruegel, Vermeer e um café sob a cúpula. Fechado à segunda (exceto de junho a agosto).", en: "Bruegel, Vermeer and a café under the dome. Closed Mondays (except June–August)." }
  ],
  prg: [
    { id: "hrad-m", n: "Castelo de Praga (circuito)", lat: 50.0909, lng: 14.4005, price: 450, h: [[ALL, "09:00", "17:00"]], url: "https://www.hrad.cz", pt: "Inclui São Vito (parte paga), Palácio Real, Basílica de São Jorge e Viela Dourada. De novembro a março fecha às 16h.", en: "Covers St Vitus (paid area), the Old Royal Palace, St George's Basilica and Golden Lane. November–March it closes at 16:00." },
    { id: "radnice", n: "Câmara Velha e torre", lat: 50.087, lng: 14.4208, price: 300, h: [[[1], "11:00", "22:00"], [[0, 2, 3, 4, 5, 6], "09:00", "22:00"]], url: "https://www.prague.eu", pt: "A melhor vista da Cidade Velha; há elevador. Veja os apóstolos do relógio à hora certa, por dentro.", en: "The best Old Town view; there's a lift. See the clock's apostles from inside on the hour." },
    { id: "zidovske", n: "Museu Judaico de Praga", lat: 50.09, lng: 14.418, price: 650, h: [[[0, 1, 2, 3, 4, 5], "09:00", "18:00"]], url: "https://www.jewishmuseum.cz", pt: "Um bilhete para as sinagogas e o Velho Cemitério. Fechado ao sábado e nas festas judaicas; no inverno fecha às 16h30.", en: "One ticket for the synagogues and the Old Cemetery. Closed Saturdays and Jewish holidays; in winter it closes at 16:30." },
    { id: "narodni", n: "Museu Nacional", lat: 50.0791, lng: 14.4307, price: 350, h: [[ALL, "10:00", "18:00"]], url: "https://www.nm.cz", pt: "O grande edifício no topo da Praça Venceslau; a cúpula tem vista sobre a praça.", en: "The grand building atop Wenceslas Square; its dome looks down the square." }
  ],
  sin: [
    { id: "domes", n: "Gardens by the Bay: Flower Dome e Cloud Forest", lat: 1.2816, lng: 103.8636, price: 53, h: [[ALL, "09:00", "21:00"]], url: "https://www.gardensbythebay.com.sg", pt: "As duas estufas refrigeradas; ótimas para fugir ao calor. A Supertree Grove e o espetáculo de luz são gratuitos.", en: "The two cooled conservatories, great to escape the heat. Supertree Grove and the light show are free." },
    { id: "skypark", n: "Marina Bay Sands SkyPark", lat: 1.2834, lng: 103.8607, price: 36, h: [[ALL, "10:00", "21:00"]], book: true, url: "https://www.marinabaysands.com", pt: "Miradouro no 57.º andar; a piscina é só para hóspedes. Ao pôr do sol enche: reserve.", en: "Observation deck on the 57th floor; the pool is for hotel guests only. Busy at sunset: book." },
    { id: "national-gallery", n: "National Gallery Singapore", lat: 1.2904, lng: 103.8515, price: 20, h: [[ALL, "10:00", "19:00"]], url: "https://www.nationalgallery.sg", pt: "Arte do Sudeste Asiático nos antigos tribunal e câmara. O terraço do último piso é gratuito.", en: "Southeast Asian art in the former courthouse and city hall. The rooftop is free." },
    { id: "btrt", n: "Templo da Relíquia do Dente de Buda", lat: 1.2815, lng: 103.8443, price: 0, h: [[ALL, "07:00", "17:00"]], url: "https://www.btrts.org.sg", pt: "Gratuito. Ombros e joelhos cobertos (há panos à entrada); o jardim no telhado tem uma roda de oração.", en: "Free. Cover shoulders and knees (wraps at the door); the rooftop garden has a prayer wheel." }
  ],
  zrh: [
    { id: "zrh-fraumuenster-m", n: "Fraumünster (vitrais de Chagall)", lat: 47.3697, lng: 8.5413, price: 5, h: [[[1, 2, 3, 4, 5, 6], "10:00", "17:00"], [[0], "12:00", "17:00"]], url: "https://www.zuerich.com/en/visit/attractions/fraumunster-art-history-and-divine-stained-glass-windows", pt: "Horário de novembro a fevereiro; de março a outubro fecha às 18h. Ao domingo abre depois do culto. Grátis com a Zürich Card.", en: "November–February hours; March–October it closes at 18:00. On Sundays it opens after the service. Free with the Zürich Card." },
    { id: "zrh-karlsturm", n: "Grossmünster: torre Karlsturm", lat: 47.3701, lng: 8.5441, price: 5, h: [[[1, 2, 3, 4, 5, 6], "10:00", "17:00"], [[0], "12:30", "17:00"]], url: "https://www.zuerich.com/en/visit/attractions/grossmunster", pt: "187 degraus até às janelas panorâmicas. De março a outubro fecha às 18h; ao domingo só depois do culto. Grátis com a Zürich Card; obras de renovação até 2029.", en: "187 steps to the panoramic windows. March–October it closes at 18:00; on Sundays only after the service. Free with the Zürich Card; renovation works until 2029." },
    { id: "zrh-landesmuseum", n: "Museu Nacional Suíço (Landesmuseum)", lat: 47.3790, lng: 8.5404, price: 13, h: [[[0, 2, 3, 4, 5, 6], "10:00", "17:00"]], url: "https://www.landesmuseum.ch/en/your-visit/opening-times", pt: "Ao lado da estação central: a história da Suíça num edifício de 1898. Fechado à segunda; grátis até aos 16 anos e com a Zürich Card.", en: "Next to the main station: Swiss history in an 1898 building. Closed Mondays; free under 16 and with the Zürich Card." },
    { id: "zrh-kunsthaus", n: "Kunsthaus Zürich", lat: 47.3703, lng: 8.5482, price: 24, h: [[[0, 2, 3, 5, 6], "10:00", "18:00"], [[4], "10:00", "20:00"]], url: "https://www.kunsthaus.ch/en/besuch-planen/besucherinfos/", pt: "Coleção grátis para todos à quarta-feira. Quinta até às 20h; fechado à segunda.", en: "The collection is free for everyone on Wednesdays. Thursdays until 20:00; closed Mondays." }
  ],
  brn: [
    { id: "brn-muenster-t", n: "Torre da Catedral (Münsterturm)", lat: 46.9472, lng: 7.4511, price: 6, h: [[[1, 2, 3, 4, 5], "12:00", "15:30"], [[6], "10:00", "16:30"], [[0], "11:30", "15:30"]], url: "https://www.bernermuenster.ch/besuchen/turmbesteigung", pt: "Horário de inverno (última subida). 344 degraus até à galeria a 64 m; bilhete no balcão de informação. A igreja é gratuita.", en: "Winter hours (last ascent). 344 steps to the gallery at 64 m; tickets at the information desk. The church itself is free." },
    { id: "brn-einsteinhaus-m", n: "Casa de Einstein (Einsteinhaus)", lat: 46.9481, lng: 7.4505, price: 8, h: [[ALL, "10:00", "17:00"]], url: "https://www.einstein-bern.ch/", pt: "Última entrada às 16h45. Fecha de 19 de dezembro de 2026 a 31 de janeiro de 2027.", en: "Last entry 16:45. Closed from 19 December 2026 to 31 January 2027." },
    { id: "brn-zpk", n: "Zentrum Paul Klee", lat: 46.9489, lng: 7.4746, price: 20, h: [[NO_MON, "10:00", "17:00"]], url: "https://www.zpk.org/en/information", pt: "Autocarro 12 desde a estação (cerca de 20 min). Fechado à segunda e a 24 e 25 de dezembro.", en: "Bus 12 from the station (about 20 min). Closed Mondays and on 24 and 25 December." }
  ],
  ath: [
    { id: "acropolis-m", n: "Acrópole e encostas", lat: 37.9715, lng: 23.7267, price: 30, h: [[ALL, "08:00", "17:00"]], book: true, url: "https://hhticket.gr", pt: "Bilhete com hora marcada: compre online. De abril a outubro abre até às 20h; de novembro a março, 1.º e 3.º domingo grátis.", en: "Timed tickets: buy online. April–October open until 20:00; November–March, free on the 1st and 3rd Sunday." },
    { id: "acropolis-museum", n: "Museu da Acrópole", lat: 37.9686, lng: 23.7285, price: 20, h: [[[1, 2, 3, 4], "09:00", "17:00"], [[5], "09:00", "22:00"], [[0, 6], "09:00", "20:00"]], book: true, url: "https://www.theacropolismuseum.gr", pt: "Horário de inverno (nov.–mar.); de abril a outubro abre até às 20h (segunda até às 17h). Sexta até às 22h.", en: "Winter hours (Nov–Mar); April–October open until 20:00 (Mondays until 17:00). Fridays until 22:00." },
    { id: "agora-m", n: "Ágora Antiga e Museu da Stoa de Átalo", lat: 37.9749, lng: 23.7243, price: 20, h: [[[0, 1, 3, 4, 5, 6], "08:00", "17:00"], [[2], "10:00", "17:00"]], url: "https://archaeologicalmuseums.culture.gov.gr/en/museum/5df34af3deca5e2d79e8c180/museum-of-ancient-agora", pt: "O bilhete inclui o sítio e o museu. De abril a outubro fecha às 18h.", en: "The ticket covers the site and the museum. April–October it closes at 18:00." },
    { id: "nam", n: "Museu Arqueológico Nacional", lat: 37.989, lng: 23.7323, price: 20, h: [[[0, 1, 3, 4, 5, 6], "08:30", "15:30"], [[2], "13:00", "20:00"]], url: "https://www.namuseum.gr/en/episkepsi/", pt: "A máscara de Agamémnon e o bronze de Artemísio. Horário de inverno; de maio a meados de novembro abre das 8h às 20h.", en: "The Mask of Agamemnon and the Artemision Bronze. Winter hours; from May to mid-November open 08:00–20:00." }
  ],
  fnc: [
    { id: "botanico-m", n: "Jardim Botânico da Madeira", lat: 32.6622, lng: -16.8958, price: 10, h: [[ALL, "09:00", "18:00"]], url: "https://ifcn.madeira.gov.pt", pt: "Bilhetes à venda até às 17h30. Fechado no dia de Natal. Autocarros 29, 30, 31 e 31A ou teleférico desde o Monte.", en: "Tickets sold until 17:30. Closed on Christmas Day. Buses 29, 30, 31 and 31A, or the cable car from Monte." },
    { id: "arte-sacra", n: "Museu de Arte Sacra do Funchal", lat: 32.6495, lng: -16.909, price: 10, h: [[[1, 2, 3, 4, 5], "10:00", "17:30"], [[6], "10:00", "13:30"]], url: "https://cultura.madeira.gov.pt/en/arte-sacra-museum-of-funchal.html", pt: "Pintura flamenga comprada com o comércio do açúcar. Fechado ao domingo e feriados.", en: "Flemish paintings bought with the sugar trade. Closed Sundays and public holidays." },
    { id: "quinta-cruzes", n: "Museu Quinta das Cruzes", lat: 32.6527, lng: -16.9128, price: 10, h: [[[0, 2, 3, 4, 5, 6], "10:00", "17:30"]], url: "https://cultura.madeira.gov.pt/en/quinta-das-cruzes-museum", pt: "Casa-museu de artes decorativas com jardim. Fechado à segunda e feriados.", en: "Decorative-arts house museum with a garden. Closed Mondays and public holidays." }
  ],
  dub: [
    { id: "dub-kells-m", n: "Livro de Kells e Old Library (Trinity College)", lat: 53.3439, lng: -6.2575, price: 19, h: [[[1, 2, 3, 4, 5], "09:00", "18:00"], [[6], "09:00", "18:30"], [[0], "09:30", "18:00"]], book: true, url: "https://www.visittrinity.ie", pt: "Bilhete com hora marcada; a Long Room continua aberta durante as obras da biblioteca. A versão com a exposição digital custa mais.", en: "Timed tickets; the Long Room stays open during the library works. The version with the digital exhibition costs more." },
    { id: "dub-guinness-m", n: "Guinness Storehouse", lat: 53.3419, lng: -6.2867, price: 26, h: [[[0, 1, 2, 3, 4], "09:30", "17:00"], [[5, 6], "09:30", "18:00"]], book: true, url: "https://www.guinness-storehouse.com", pt: "Preço desde 26 € online (varia com o dia e a hora; à porta custa mais 2 €). Inclui uma bebida no Gravity Bar; conte 90 min.", en: "From €26 online (varies by date and time; €2 more at the door). Includes a drink at the Gravity Bar; allow 90 min." },
    { id: "dub-kilmainham-m", n: "Prisão de Kilmainham", lat: 53.3417, lng: -6.3094, price: 8, h: [[ALL, "10:30", "17:15"]], book: true, url: "https://heritageireland.ie/places-to-visit/kilmainham-gaol/", pt: "Só visita guiada, com bilhete comprado no site oficial. De abril a setembro fecha às 17h45; fechado de 24 a 27 de dezembro.", en: "Guided tour only, with tickets from the official site. April to September it closes at 17:45; closed 24–27 December." },
    { id: "dub-stpatricks-m", n: "Catedral de São Patrício", lat: 53.3395, lng: -6.2715, price: 11.5, h: [[[1, 2, 3, 4, 5], "09:30", "17:00"], [[6], "09:00", "18:00"], [[0], "09:00", "10:30"], [[0], "13:00", "14:30"], [[0], "16:30", "18:00"]], url: "https://stpatrickscathedral.ie/visit/", pt: "Horas de última entrada; ao domingo só entre os serviços. Visitas guiadas gratuitas de segunda a sábado às 10h30 e 14h30.", en: "Times shown are last admission; on Sundays only between services. Free guided tours Monday to Saturday at 10:30 and 14:30." }
  ],
  hkg: [
    { id: "hkg-moa", n: "Museu de Arte de Hong Kong", lat: 22.2935, lng: 114.172, price: 0, h: [[[1, 2, 3, 5], "10:00", "18:00"], [[0, 6], "10:00", "21:00"]], url: "https://hk.art.museum", pt: "Gratuito, exceto exposições especiais. Fechado à quinta; ao sábado, domingo e feriados abre até às 21h.", en: "Free, except special exhibitions. Closed Thursdays; open until 21:00 on weekends and public holidays." },
    { id: "hkg-mplus", n: "M+", lat: 22.3017, lng: 114.16, price: 190, h: [[[0, 2, 3, 4, 6], "10:00", "18:00"], [[5], "10:00", "22:00"]], url: "https://www.mplus.org.hk", pt: "Fechado à segunda. Arte, design e arquitetura dos séculos XX e XXI, a 10–15 minutos a pé da estação Kowloon.", en: "Closed Mondays. 20th- and 21st-century art, design and architecture, a 10–15 minute walk from Kowloon station." },
    { id: "hkg-man-mo-m", n: "Templo Man Mo", lat: 22.284, lng: 114.1503, price: 0, h: [[ALL, "08:00", "18:00"]], url: "https://www.tungwah.org.hk", pt: "Gratuito. Nos dias 1 e 15 do mês lunar abre às 7h.", en: "Free. Opens at 7:00 on the 1st and 15th of each lunar month." }
  ],
  bkk: [
    { id: "bkk-palace", n: "Grande Palácio e Wat Phra Kaew", lat: 13.75, lng: 100.4913, price: 500, h: [[ALL, "08:30", "15:30"]], url: "https://www.royalgrandpalace.th", pt: "Bilhetes à venda das 8h30 às 15h30; incluem o Museu de Têxteis Rainha Sirikit. Mangas e calças compridas ou saia abaixo do joelho.", en: "Tickets sold 8:30–15:30; they include the Queen Sirikit Museum of Textiles. Sleeves and long trousers or a skirt below the knee." },
    { id: "bkk-watpho", n: "Wat Pho", lat: 13.7465, lng: 100.493, price: 300, h: [[ALL, "08:00", "19:30"]], url: "https://www.watpho.com", pt: "Crianças até 1,20 m não pagam. Massagem tailandesa na escola do templo: 340 THB por 30 minutos.", en: "Children under 1.20 m go free. Thai massage at the temple school: THB 340 for 30 minutes." },
    { id: "bkk-jim", n: "Casa de Jim Thompson", lat: 13.7492, lng: 100.5283, price: 250, h: [[ALL, "10:00", "17:00"]], url: "https://jimthompsonhouse.org", pt: "A casa só se visita com guia (cinco línguas); última visita às 17h. Ignore quem diga à porta que hoje está fechado.", en: "The house can only be visited with a guide (five languages); last tour at 17:00. Ignore anyone outside saying it's closed today." }
  ],
  dps: [
    { id: "dps-monkey-m", n: "Floresta Sagrada dos Macacos (Sacred Monkey Forest Sanctuary)", lat: -8.5188, lng: 115.2584, price: 130000, h: [[ALL, "09:00", "18:00"]], url: "https://monkeyforestubud.com/visit/", pt: "Última entrada às 17h; o bilhete vale o dia todo. Cacifos na entrada; sem comida nem sacos de plástico. Danças ao sábado e domingo às 11h e 16h.", en: "Last entry 17:00; the ticket is valid all day. Lockers in the lobby; no food or plastic bags. Dances on Saturdays and Sundays at 11:00 and 16:00." }
  ],
  wdh: [
    { id: "wdh-imm-m", n: "Independence Memorial Museum", lat: -22.5688, lng: 17.0881, price: 0, h: [[[1, 2, 3, 4, 5], "09:00", "16:30"]], url: "https://www.museums.com.na/museums/windhoek/independence-museum", pt: "Entrada gratuita; o elevador de vidro exterior tem vista sobre a cidade. Restaurante no 4.º piso.", en: "Free entry; the outside glass lift has views over the city. Restaurant on the 4th floor." },
    { id: "wdh-transnamib-m", n: "TransNamib Museum", lat: -22.5594, lng: 17.081, price: 5, h: [[[1, 2, 3, 4, 5], "08:00", "13:00"], [[1, 2, 3, 4, 5], "14:00", "17:00"]], url: "https://windhoekcc.org.na/tour_attractions.php", pt: "No 1.º piso da estação; fecha ao almoço e ao fim de semana.", en: "On the station's 1st floor; closed at lunchtime and at weekends." }
  ],
  tyo: [
    { id: "tyo-tocho-m", n: "Miradouros do Governo Metropolitano de Tóquio", lat: 35.6896, lng: 139.6917, price: 0, h: [[ALL, "09:30", "22:00"]], url: "https://www.gotokyo.org/en/tourists/info/observatory.html", pt: "Gratuito, última entrada às 21h30. O miradouro sul fecha na 1.ª e 3.ª terça do mês; o norte na 2.ª e 4.ª segunda.", en: "Free, last entry 21:30. The south deck closes on the 1st and 3rd Tuesday of the month; the north deck on the 2nd and 4th Monday." },
    { id: "tyo-east-gardens", n: "Jardins Orientais do Palácio Imperial", lat: 35.6852, lng: 139.759, price: 0, h: [[[0, 2, 3, 4, 6], "09:00", "16:30"]], url: "https://visit-chiyoda.tokyo/app/en/spot/detail/416", pt: "Horário de outubro; de novembro a fevereiro fecha às 16h e de 15 de abril a agosto às 18h. Fechado à segunda e à sexta. Última entrada 30 min antes.", en: "October hours; November–February it closes at 16:00 and from 15 April to August at 18:00. Closed Mondays and Fridays. Last entry 30 min before closing." },
    { id: "tyo-meiji-m", n: "Santuário Meiji Jingu", lat: 35.6764, lng: 139.6993, price: 0, h: [[ALL, "05:40", "16:40"]], url: "https://www.meijijingu.or.jp/en/visit/", pt: "Gratuito, do nascer ao pôr do sol: horário de outubro. Em novembro abre às 6h10 e fecha às 16h10; em junho fecha às 18h30.", en: "Free, sunrise to sunset: October hours. In November it opens at 6:10 and closes at 16:10; in June it closes at 18:30." },
    { id: "tyo-tnm", n: "Museu Nacional de Tóquio", lat: 35.7188, lng: 139.7765, price: 1000, h: [[NO_MON, "09:30", "17:00"]], url: "https://www.gotokyo.org/en/spot/123/index.html", pt: "O museu mais antigo do Japão, no parque de Ueno, com mais de 110 000 peças. Fechado à segunda; última entrada 30 min antes.", en: "Japan's oldest museum, in Ueno Park, with over 110,000 objects. Closed Mondays; last entry 30 min before closing." }
  ],
  hij: [
    { id: "hij-museum-m", n: "Museu Memorial da Paz de Hiroxima", lat: 34.3916, lng: 132.4521, price: 200, h: [[ALL, "07:30", "19:00"]], book: true, url: "https://dive-hiroshima.com/en/explore/2675", pt: "De março a novembro; de dezembro a fevereiro fecha às 18h e em agosto às 20h. As faixas das 7h30–8h30 e do fim da tarde só com reserva online; fecha a 30 e 31 de dezembro.", en: "March–November; December–February it closes at 18:00 and in August at 20:00. The 7:30–8:30 and late-afternoon slots are online booking only; closed 30–31 December." },
    { id: "hij-shukkeien-m", n: "Jardim Shukkeien", lat: 34.4007, lng: 132.4675, price: 350, h: [[ALL, "09:00", "17:00"]], url: "https://dive-hiroshima.com/en/explore/306", pt: "De 16 de setembro a 15 de março; no resto do ano fecha às 18h. Última entrada 30 min antes; fechado de 29 a 31 de dezembro.", en: "16 September to 15 March; the rest of the year it closes at 18:00. Last entry 30 min before closing; closed 29–31 December." },
    { id: "hij-castle-m", n: "Castelo de Hiroshima (Ninomaru)", lat: 34.4027, lng: 132.4594, price: 0, h: [[ALL, "09:00", "16:30"]], url: "https://dive-hiroshima.com/en/explore/1173", pt: "A torre principal está fechada desde março de 2026. O Ninomaru é gratuito; de abril a setembro fecha às 17h30.", en: "The main keep has been closed since March 2026. The Ninomaru is free; April–September it closes at 17:30." },
    { id: "hij-itsukushima-m", n: "Santuário de Itsukushima", lat: 34.2959, lng: 132.3198, price: 300, h: [[ALL, "06:30", "17:30"]], url: "https://www.itsukushimajinja.jp/en/admission.html", pt: "Horário de 15 de outubro a 30 de novembro; de março a 14 de outubro fecha às 18h, em dezembro às 17h. Some ¥100 de taxa de visitante da ilha.", en: "Hours from 15 October to 30 November; March to 14 October it closes at 18:00, in December at 17:00. Add the island's ¥100 visitor tax." }
  ],
  kyo: [
    { id: "kyo-nijo-m", n: "Castelo Nijo e Palácio Ninomaru", lat: 35.0142, lng: 135.7482, price: 1300, h: [[ALL, "08:45", "17:00"]], url: "https://nijo-jocastle.city.kyoto.lg.jp/?lang=en", pt: "Última entrada às 16h. O Palácio Ninomaru fecha às terças em janeiro, julho, agosto e dezembro; o castelo fecha de 29 a 31 de dezembro.", en: "Last entry 16:00. Ninomaru Palace closes on Tuesdays in January, July, August and December; the castle closes 29–31 December." },
    { id: "kyo-kinkakuji", n: "Kinkaku-ji (Pavilhão Dourado)", lat: 35.0394, lng: 135.7292, price: 500, h: [[ALL, "09:00", "17:00"]], url: "https://www.shokoku-ji.jp/en/kinkakuji/access/", pt: "Aberto todo o ano. Fica fora do roteiro, no norte da cidade: autocarros municipais 12, 59, 205 ou M1 até Kinkakuji-michi.", en: "Open all year. Off the route, in the north of the city: city buses 12, 59, 205 or M1 to Kinkakuji-michi." }
  ],
  osa: [
    { id: "osa-castle-m", n: "Torre principal do Castelo de Osaka", lat: 34.6873, lng: 135.5262, price: 1200, h: [[ALL, "09:00", "18:00"]], url: "https://www.osakacastle.net/", pt: "Última entrada às 17h30. Museu em oito pisos e miradouro no 8.º; fechado de 28 de dezembro a 1 de janeiro. Grátis até ao 3.º ciclo.", en: "Last entry 17:30. An eight-floor museum with an 8th-floor viewing deck; closed 28 December–1 January. Free for junior-high age and under." },
    { id: "osa-tsutenkaku", n: "Tsutenkaku (miradouro geral)", lat: 34.6525, lng: 135.5063, price: 1500, h: [[ALL, "09:00", "21:45"]], url: "https://www.tsutenkaku.co.jp/", pt: "Última entrada às 21h15. Toque na planta dos pés do Billiken, no miradouro, para dar sorte.", en: "Last entry 21:15. Touch the soles of the Billiken statue on the deck for luck." },
    { id: "osa-kuchu-teien", n: "Umeda Sky Building: Kuchu Teien", lat: 34.7053, lng: 135.4903, price: 2000, h: [[ALL, "09:30", "22:30"]], url: "https://www.skybldg.co.jp/en/", pt: "Última entrada às 22h. Pisos 39 e 40 e terraço ao ar livre; em dias de eventos especiais é preciso bilhete próprio.", en: "Last entry 22:00. Floors 39–40 and an open-air rooftop; on special event days a separate ticket is needed." },
    { id: "osa-shitennoji-m", n: "Templo Shitennoji (recinto interior)", lat: 34.6536, lng: 135.5164, price: 300, h: [[ALL, "08:30", "16:30"]], url: "https://osaka-info.jp/experience/en/osaka/spot/286", pt: "Horário de abril a setembro; de outubro a março fecha às 16h. O jardim Honbo custa outros 300 ienes.", en: "April–September hours; October–March it closes at 16:00. The Honbo garden is another ¥300." }
  ],
  nyc: [
    { id: "ny-911m", n: "Museu Memorial do 11 de Setembro", lat: 40.7116, lng: -74.0133, price: 36, h: [[ALL, "09:00", "19:00"]], book: true, url: "https://www.911memorial.org", pt: "Bilhete com hora marcada; à segunda à tarde há entrada gratuita limitada (bilhetes online a partir das 7h).", en: "Timed tickets; free limited entry on Monday afternoons (tickets online from 7am)." },
    { id: "ny-met", n: "Metropolitan Museum of Art", lat: 40.7794, lng: -73.9632, price: 30, h: [[[0, 1, 2, 4], "10:00", "17:00"], [[5, 6], "10:00", "21:00"]], url: "https://www.metmuseum.org", pt: "Fechado à quarta. Um dos maiores museus do mundo: escolha duas ou três alas.", en: "Closed Wednesdays. One of the world's largest museums: pick two or three wings." },
    { id: "ny-moma", n: "MoMA", lat: 40.7614, lng: -73.9776, price: 30, h: [[ALL, "10:30", "17:30"]], url: "https://www.moma.org", pt: "Van Gogh, Picasso, Warhol. Primeira sexta-feira do mês à noite gratuita para residentes; reserve online.", en: "Van Gogh, Picasso, Warhol. Book online to skip the queue." },
    { id: "ny-liberty", n: "Estátua da Liberdade e Ellis Island", lat: 40.7033, lng: -74.017, price: 25, h: [[ALL, "09:00", "16:00"]], book: true, url: "https://www.statueofliberty.org", pt: "Ferry oficial Statue City Cruises desde Battery Park; o acesso à coroa esgota com meses.", en: "Official Statue City Cruises ferry from Battery Park; crown access sells out months ahead." },
    { id: "ny-top", n: "Top of the Rock", lat: 40.7593, lng: -73.9794, price: 44, h: [[ALL, "09:00", "24:00"]], url: "https://www.rockefellercenter.com/attractions/top-of-the-rock-observation-deck/", pt: "A melhor vista com o Empire State e o Central Park na mesma fotografia.", en: "The best view with the Empire State and Central Park in one shot." }
  ],
  was: [
    { id: "dc-nmah", n: "Museu Nacional de História Natural", lat: 38.8913, lng: -77.0261, price: 0, h: [[ALL, "10:00", "17:30"]], url: "https://naturalhistory.si.edu", pt: "Gratuito. O diamante Hope e a sala dos dinossauros.", en: "Free. The Hope Diamond and the dinosaur hall." },
    { id: "dc-nasm", n: "Museu Nacional do Ar e do Espaço", lat: 38.8882, lng: -77.0199, price: 0, h: [[ALL, "10:00", "17:30"]], book: true, url: "https://airandspace.si.edu", pt: "Gratuito com bilhete por hora marcada, reservado online.", en: "Free with a timed pass booked online." },
    { id: "dc-nmaahc", n: "Museu Nacional de História e Cultura Afro-Americana", lat: 38.8911, lng: -77.0326, price: 0, h: [[ALL, "10:00", "17:30"]], book: true, url: "https://nmaahc.si.edu", pt: "Gratuito; os passes com hora marcada esgotam cedo.", en: "Free; timed passes go early." },
    { id: "dc-nga", n: "National Gallery of Art", lat: 38.8913, lng: -77.02, price: 0, h: [[ALL, "10:00", "17:00"]], url: "https://www.nga.gov", pt: "Gratuito. O único Leonardo da Vinci das Américas.", en: "Free. The only Leonardo da Vinci in the Americas." },
    { id: "dc-capitol-m", n: "Visita ao Capitólio", lat: 38.8899, lng: -77.0091, price: 0, h: [[[1, 2, 3, 4, 5, 6], "08:30", "16:30"]], book: true, url: "https://www.visitthecapitol.gov", pt: "Gratuita, com reserva; fechada ao domingo.", en: "Free, with booking; closed Sundays." }
  ],
  sfo: [
    { id: "sf-alcatraz", n: "Alcatraz", lat: 37.8267, lng: -122.4233, price: 47, h: [[ALL, "08:40", "18:30"]], book: true, url: "https://www.cityexperiences.com/san-francisco/city-cruises/alcatraz/", pt: "Ferry desde o Pier 33; esgota com semanas. Conte 3 horas no total.", en: "Ferry from Pier 33; sells out weeks ahead. Allow 3 hours in total." },
    { id: "sf-sfmoma", n: "SFMOMA", lat: 37.7857, lng: -122.4011, price: 30, h: [[[0, 1, 4, 5, 6], "10:00", "17:00"]], url: "https://www.sfmoma.org", pt: "Fechado à terça e quarta. O átrio e algumas galerias do rés-do-chão são gratuitos.", en: "Closed Tuesdays and Wednesdays. The atrium and some ground-floor galleries are free." },
    { id: "sf-cablecar-m", n: "Cable Car Museum", lat: 37.7946, lng: -122.4115, price: 0, h: [[ALL, "10:00", "17:00"]], url: "https://www.cablecarmuseum.org", pt: "Gratuito: veja as rodas gigantes que puxam os cabos dos cable cars.", en: "Free: see the giant wheels that pull the cable car cables." },
    { id: "sf-exploratorium", n: "Exploratorium", lat: 37.8015, lng: -122.3975, price: 40, h: [[[0, 2, 3, 4, 5, 6], "10:00", "17:00"]], url: "https://www.exploratorium.edu", pt: "Ciência para mexer, no Pier 15. Fechado à segunda.", en: "Hands-on science on Pier 15. Closed Mondays." }
  ],
  chi: [
    { id: "chi-artm", n: "Art Institute of Chicago", lat: 41.8796, lng: -87.6237, price: 32, h: [[[0, 1, 4, 5, 6], "11:00", "17:00"]], url: "https://www.artic.edu", pt: "Fechado à terça e quarta; quinta até às 20h.", en: "Closed Tuesdays and Wednesdays; Thursdays until 8pm." },
    { id: "chi-skydeck", n: "Skydeck (Willis Tower)", lat: 41.8789, lng: -87.6359, price: 33, h: [[ALL, "09:00", "21:00"]], book: true, url: "https://theskydeck.com", pt: "Reserve hora para evitar filas; as varandas de vidro têm fila própria.", en: "Book a time to avoid queues; the glass ledges have their own line." },
    { id: "chi-cac", n: "Passeio de barco do Chicago Architecture Center", lat: 41.8881, lng: -87.6237, price: 55, h: [[ALL, "10:00", "18:00"]], book: true, url: "https://www.architecture.org", pt: "De abril a novembro; 75–90 minutos no rio.", en: "April to November; 75–90 minutes on the river." },
    { id: "chi-field", n: "Field Museum", lat: 41.8663, lng: -87.617, price: 30, h: [[ALL, "09:00", "17:00"]], url: "https://www.fieldmuseum.org", pt: "Sue, o T. rex mais completo do mundo.", en: "Sue, the world's most complete T. rex." }
  ],
  bos: [
    { id: "bos-mfa", n: "Museum of Fine Arts", lat: 42.3394, lng: -71.0942, price: 30, h: [[[0, 1, 3, 4, 5, 6], "10:00", "17:00"]], url: "https://www.mfa.org", pt: "Fechado à terça. Uma das maiores coleções de arte dos EUA.", en: "Closed Tuesdays. One of the largest art collections in the US." },
    { id: "bos-gardner", n: "Isabella Stewart Gardner Museum", lat: 42.3384, lng: -71.0991, price: 22, h: [[[0, 1, 3, 4, 5, 6], "11:00", "17:00"]], book: true, url: "https://www.gardnermuseum.org", pt: "Um palácio veneziano com pátio coberto; famoso pelo maior roubo de arte da história.", en: "A Venetian palace with a glass-roofed courtyard; famous for history's biggest art theft." },
    { id: "bos-revere", n: "Paul Revere House", lat: 42.3637, lng: -71.0537, price: 6, h: [[ALL, "10:00", "17:15"]], url: "https://www.paulreverehouse.org", pt: "A casa mais antiga do centro de Boston (c. 1680).", en: "Downtown Boston's oldest house (c. 1680)." },
    { id: "bos-tea", n: "Boston Tea Party Ships & Museum", lat: 42.3522, lng: -71.0513, price: 40, h: [[ALL, "10:00", "17:00"]], url: "https://www.bostonteapartyship.com", pt: "Recriação com atores; atire chá ao mar como em 1773.", en: "Re-enactment with actors; throw tea overboard as in 1773." }
  ],
  mia: [
    { id: "mia-perez", n: "Pérez Art Museum Miami (PAMM)", lat: 25.7859, lng: -80.1866, price: 18, h: [[[0, 1, 4, 5, 6], "11:00", "18:00"]], url: "https://www.pamm.org", pt: "Arte contemporânea sobre a baía; jardins suspensos e esplanada.", en: "Contemporary art on the bay; hanging gardens and terrace." },
    { id: "mia-vizcaya-m", n: "Vizcaya Museum & Gardens", lat: 25.7444, lng: -80.2105, price: 25, h: [[[0, 1, 3, 4, 5, 6], "09:30", "16:30"]], book: true, url: "https://vizcaya.org", pt: "Fechado à terça. Reserve hora online.", en: "Closed Tuesdays. Book a time online." },
    { id: "mia-wynwood-m", n: "Wynwood Walls", lat: 25.8011, lng: -80.1994, price: 12, h: [[ALL, "11:00", "19:00"]], url: "https://thewynwoodwalls.com", pt: "O recinto dos murais; as ruas à volta são gratuitas.", en: "The mural enclosure; the surrounding streets are free." },
    { id: "mia-wolfsonian", n: "The Wolfsonian–FIU", lat: 25.7799, lng: -80.1334, price: 15, h: [[[0, 4, 5, 6], "10:00", "18:00"]], url: "https://wolfsonian.org", pt: "Design e Art Déco em South Beach; abre de quinta a domingo.", en: "Design and Art Deco in South Beach; open Thursday to Sunday." }
  ],
  lax: [
    { id: "lax-broad", n: "The Broad", lat: 34.0544, lng: -118.2506, price: 0, h: [[[0, 6], "10:00", "18:00"], [[2, 3, 5], "11:00", "17:00"], [[4], "11:00", "20:00"]], book: true, url: "https://www.thebroad.org", pt: "Gratuito com reserva de hora; fecha à segunda.", en: "Free with a timed reservation; closed Mondays." },
    { id: "lax-griffith-o", n: "Griffith Observatory", lat: 34.1184, lng: -118.3004, price: 0, h: [[[2, 3, 4, 5], "12:00", "22:00"], [[0, 6], "10:00", "22:00"]], url: "https://griffithobservatory.org", pt: "Entrada gratuita; o planetário é pago. Fecha à segunda.", en: "Free entry; the planetarium is paid. Closed Mondays." },
    { id: "lax-getty", n: "Getty Center", lat: 34.078, lng: -118.4741, price: 0, h: [[[0, 2, 3, 4, 5], "10:00", "17:30"], [[6], "10:00", "20:00"]], book: true, url: "https://www.getty.edu", pt: "Gratuito com reserva; estacionamento pago. Fecha à segunda.", en: "Free with reservation; paid parking. Closed Mondays." },
    { id: "lax-lacma", n: "LACMA", lat: 34.0639, lng: -118.3592, price: 28, h: [[[1, 2, 4], "10:00", "18:00"], [[5], "10:00", "20:00"], [[0, 6], "10:00", "19:00"]], url: "https://www.lacma.org", pt: "As «Urban Light», 202 candeeiros antigos à porta, são gratuitas a qualquer hora.", en: "«Urban Light», 202 vintage streetlamps at the entrance, is free at any time." }
  ],
  las: [
    { id: "las-neon-m", n: "The Neon Museum", lat: 36.1771, lng: -115.1353, price: 30, h: [[ALL, "16:00", "23:00"]], book: true, url: "https://www.neonmuseum.org", pt: "Visitas com hora marcada; à noite os letreiros acendem-se.", en: "Timed visits; at night the signs light up." },
    { id: "las-mob", n: "The Mob Museum", lat: 36.1728, lng: -115.1411, price: 35, h: [[ALL, "09:00", "21:00"]], url: "https://themobmuseum.org", pt: "A história da máfia num antigo tribunal federal, perto da Fremont Street.", en: "The story of the mob in a former federal courthouse near Fremont Street." },
    { id: "las-eiffel", n: "Eiffel Tower Viewing Deck", lat: 36.1125, lng: -115.1707, price: 30, h: [[ALL, "12:00", "24:00"]], url: "https://www.caesars.com/paris-las-vegas", pt: "À noite custa mais; a melhor vista das fontes do Bellagio.", en: "Costs more at night; the best view of the Bellagio fountains." }
  ],
  msy: [
    { id: "msy-ww2", n: "The National WWII Museum", lat: 29.943, lng: -90.0705, price: 35, h: [[ALL, "09:00", "17:00"]], url: "https://www.nationalww2museum.org", pt: "Um dos museus mais bem avaliados dos EUA; reserve meio dia.", en: "One of the top-rated museums in the US; allow half a day." },
    { id: "msy-cabildo", n: "The Cabildo (Louisiana State Museum)", lat: 29.9575, lng: -90.0638, price: 10, h: [[[2, 3, 4, 5, 6, 0], "10:00", "16:30"]], url: "https://louisianastatemuseum.org", pt: "Onde se assinou a compra da Luisiana, em 1803; fecha à segunda.", en: "Where the Louisiana Purchase was signed in 1803; closed Mondays." },
    { id: "msy-preservation", n: "Preservation Hall", lat: 29.9581, lng: -90.065, price: 30, h: [[ALL, "17:00", "23:00"]], book: true, url: "https://www.preservationhall.com", pt: "Concertos de 45 minutos de jazz tradicional; compre bilhete com antecedência.", en: "45-minute traditional jazz sets; buy tickets ahead." }
  ],
  mco: [
    { id: "mco-morse", n: "Morse Museum of American Art", lat: 28.5996, lng: -81.3502, price: 8, h: [[[2, 3, 4, 5, 6], "09:30", "16:00"], [[0], "13:00", "16:00"]], url: "https://www.morsemuseum.org", pt: "A capela Tiffany e vitrais de Louis Comfort Tiffany; fecha à segunda.", en: "The Tiffany Chapel and Louis Comfort Tiffany glass; closed Mondays." },
    { id: "mco-boat-m", n: "Scenic Boat Tour", lat: 28.5996, lng: -81.3433, price: 20, h: [[ALL, "10:00", "16:00"]], url: "https://www.scenicboattours.com", pt: "Sai de hora a hora; pague em dinheiro ou cartão no cais.", en: "Leaves on the hour; pay by cash or card at the dock." },
    { id: "mco-wheel", n: "The Wheel at ICON Park", lat: 28.4433, lng: -81.4686, price: 30, h: [[ALL, "12:00", "22:00"]], url: "https://iconparkorlando.com", pt: "Uma volta de cerca de 20 minutos em cabines com ar condicionado.", en: "A ride of about 20 minutes in air-conditioned capsules." }
  ],
  yyz: [
    { id: "yyz-cn-m", n: "CN Tower", lat: 43.6426, lng: -79.3871, price: 45, h: [[ALL, "10:00", "21:30"]], book: true, url: "https://www.cntower.ca", pt: "Bilhete com hora online é mais barato; o EdgeWalk é à parte.", en: "Timed online tickets are cheaper; EdgeWalk is separate." },
    { id: "yyz-rom-m", n: "Royal Ontario Museum", lat: 43.6677, lng: -79.3948, price: 26, h: [[ALL, "10:00", "17:30"]], url: "https://www.rom.on.ca", pt: "Dinossauros, Egito e arte das Primeiras Nações.", en: "Dinosaurs, Egypt and First Nations art." },
    { id: "yyz-ago", n: "Art Gallery of Ontario", lat: 43.6536, lng: -79.3925, price: 30, h: [[[2, 4, 6, 0], "10:30", "17:00"], [[3, 5], "10:30", "21:00"]], url: "https://ago.ca", pt: "Gratuito às quartas à noite (18h–21h). A escadaria de Frank Gehry merece a visita. Fecha à segunda.", en: "Free on Wednesday evenings (6–9 pm). Frank Gehry's staircase is worth it. Closed Mondays." },
    { id: "yyz-stlawrence-m", n: "St. Lawrence Market", lat: 43.6487, lng: -79.3716, price: 0, h: [[[2, 3, 4, 5], "09:00", "19:00"], [[6], "07:00", "17:00"]], url: "https://www.stlawrencemarket.com", pt: "Fecha ao domingo e à segunda.", en: "Closed Sundays and Mondays." }
  ],
  mex: [
    { id: "mex-antro-m", n: "Museo Nacional de Antropología", lat: 19.426, lng: -99.1863, price: 100, h: [[[2, 3, 4, 5, 6, 0], "09:00", "18:00"]], url: "https://www.mna.inah.gob.mx", pt: "Reserve pelo menos 2 horas; fecha à segunda.", en: "Allow at least 2 hours; closed Mondays." },
    { id: "mex-templo-m", n: "Templo Mayor", lat: 19.4351, lng: -99.1314, price: 100, h: [[[2, 3, 4, 5, 6, 0], "09:00", "17:00"]], url: "https://www.templomayor.inah.gob.mx", pt: "Ruínas e museu; fecha à segunda.", en: "Ruins and museum; closed Mondays." },
    { id: "mex-bellas-m", n: "Palacio de Bellas Artes", lat: 19.4352, lng: -99.1412, price: 90, h: [[[2, 3, 4, 5, 6, 0], "10:00", "18:00"]], url: "https://museopalaciodebellasartes.gob.mx", pt: "Murais de Rivera, Orozco e Siqueiros; gratuito ao domingo.", en: "Murals by Rivera, Orozco and Siqueiros; free on Sundays." },
    { id: "mex-frida-m", n: "Museo Frida Kahlo (Casa Azul)", lat: 19.3551, lng: -99.1625, price: 320, h: [[[2, 4, 5, 6, 0], "10:00", "18:00"], [[3], "11:00", "18:00"]], book: true, url: "https://www.museofridakahlo.org.mx", pt: "Só com bilhete online; esgota com dias de avanço. Fecha à segunda.", en: "Online tickets only; sells out days ahead. Closed Mondays." }
  ],
  rio: [
    { id: "rio-cristo-m", n: "Cristo Redentor (Trem do Corcovado)", lat: -22.9519, lng: -43.2105, price: 100, h: [[ALL, "08:00", "19:00"]], book: true, url: "https://www.tremdocorcovado.rio", pt: "Bilhete do comboio com hora; vá de manhã cedo.", en: "Timed train ticket; go early in the morning." },
    { id: "rio-pao-m", n: "Bondinho Pão de Açúcar", lat: -22.9493, lng: -43.1546, price: 180, h: [[ALL, "08:00", "21:00"]], url: "https://bondinho.com.br", pt: "Compre online para evitar a fila; o pôr do sol é a hora mais concorrida.", en: "Buy online to skip the queue; sunset is the busiest time." },
    { id: "rio-amanha-m", n: "Museu do Amanhã", lat: -22.8944, lng: -43.1794, price: 30, h: [[[2, 3, 4, 5, 6, 0], "10:00", "18:00"]], url: "https://museudoamanha.org.br", pt: "Gratuito às terças; fecha à segunda.", en: "Free on Tuesdays; closed Mondays." },
    { id: "rio-theatro-m", n: "Theatro Municipal", lat: -22.909, lng: -43.1765, price: 40, h: [[[2, 3, 4, 5, 6], "10:00", "16:00"]], url: "https://theatromunicipal.rj.gov.br", pt: "Visitas guiadas de 1 hora de terça a sábado.", en: "One-hour guided tours Tuesday to Saturday." }
  ],
  bue: [
    { id: "bue-colon-m", n: "Teatro Colón", lat: -34.6011, lng: -58.3832, price: 40000, h: [[ALL, "09:00", "17:00"]], book: true, url: "https://teatrocolon.org.ar", pt: "Visitas guiadas de 50 minutos; preço em pesos, muda muitas vezes.", en: "50-minute guided tours; peso price changes often." },
    { id: "bue-recoleta-m", n: "Cementerio de la Recoleta", lat: -34.5875, lng: -58.3934, price: 14000, h: [[ALL, "08:00", "17:00"]], url: "https://buenosaires.gob.ar/cementeriorecoleta", pt: "Entrada paga para estrangeiros; visitas guiadas gratuitas em espanhol e inglês.", en: "Paid entry for foreigners; free guided tours in Spanish and English." },
    { id: "bue-malba", n: "MALBA", lat: -34.5774, lng: -58.4035, price: 15000, h: [[[0, 1, 4, 5, 6], "12:00", "20:00"], [[3], "12:00", "21:00"]], url: "https://www.malba.org.ar", pt: "Arte latino-americana com Frida Kahlo e Xul Solar; fecha à terça.", en: "Latin American art with Frida Kahlo and Xul Solar; closed Tuesdays." },
    { id: "bue-mnba", n: "Museo Nacional de Bellas Artes", lat: -34.5838, lng: -58.393, price: 0, h: [[[2, 3, 4, 5], "11:00", "20:00"], [[0, 6], "10:00", "20:00"]], url: "https://www.bellasartes.gob.ar", pt: "Gratuito; fecha à segunda.", en: "Free; closed Mondays." }
  ],
  rak: [
    { id: "rak-medersa-m", n: "Medersa Ben Youssef", lat: 31.6318, lng: -7.9862, price: 50, h: [[ALL, "09:00", "19:00"]], url: "https://www.google.com/maps/search/?api=1&query=Medersa%20Ben%20Youssef", pt: "A escola corânica de 1565; chegue cedo para o pátio vazio.", en: "The 1565 Koranic school; come early for an empty courtyard." },
    { id: "rak-bahia-m", n: "Palais de la Bahia", lat: 31.6216, lng: -7.9831, price: 100, h: [[ALL, "09:00", "17:00"]], url: "https://www.google.com/maps/search/?api=1&query=Palais%20de%20la%20Bahia", pt: "Bilhete à entrada; muito cheio a meio da manhã.", en: "Tickets at the door; very busy mid-morning." },
    { id: "rak-saadian-m", n: "Tombeaux Saadiens", lat: 31.6173, lng: -7.9886, price: 100, h: [[ALL, "09:00", "17:00"]], url: "https://www.google.com/maps/search/?api=1&query=Tombeaux%20Saadiens", pt: "Fila curta para ver a Sala das Doze Colunas.", en: "A short queue to see the Hall of Twelve Columns." },
    { id: "rak-majorelle-m", n: "Jardin Majorelle e Museu YSL", lat: 31.6417, lng: -8.0033, price: 170, h: [[ALL, "08:00", "18:00"]], book: true, url: "https://www.jardinmajorelle.com", pt: "Só com bilhete online e hora marcada; o museu YSL é bilhete à parte.", en: "Online timed tickets only; the YSL museum is a separate ticket." }
  ],
  cas: [
    { id: "cas-hassan-m", n: "Mesquita Hassan II (visita guiada)", lat: 33.6086, lng: -7.6326, price: 140, h: [[[0, 1, 2, 3, 4, 6], "09:00", "15:00"]], book: true, url: "https://www.google.com/maps/search/?api=1&query=Mesquita%20Hassan%20II%20%28visita%20guiada%29", pt: "Visitas guiadas de hora a hora; à sexta só de tarde ou sem visitas.", en: "Hourly guided tours; on Fridays afternoon only or none." },
    { id: "cas-villa-m", n: "Villa des Arts", lat: 33.5888, lng: -7.6348, price: 0, h: [[[2, 3, 4, 5, 6], "10:00", "18:00"]], url: "https://www.google.com/maps/search/?api=1&query=Villa%20des%20Arts", pt: "Arte moderna marroquina numa villa Art Déco de 1934.", en: "Moroccan modern art in a 1934 Art Deco villa." }
  ],
  cpt: [
    { id: "cpt-cableway-m", n: "Table Mountain Aerial Cableway", lat: -33.948, lng: 18.4031, price: 450, h: [[ALL, "08:00", "19:00"]], book: true, url: "https://www.tablemountain.net", pt: "Confirme no site no próprio dia: fecha com vento ou nuvens.", en: "Check the website on the day: it closes in wind or cloud." },
    { id: "cpt-robben-m", n: "Robben Island Museum", lat: -33.9068, lng: 18.4192, price: 600, h: [[ALL, "09:00", "15:00"]], book: true, url: "https://www.robben-island.org.za", pt: "Barco e visita de 3,5 horas com antigos presos políticos; reserve com dias de avanço.", en: "Boat and 3.5-hour tour led by former political prisoners; book days ahead." },
    { id: "cpt-zeitz", n: "Zeitz MOCAA", lat: -33.9085, lng: 18.4224, price: 300, h: [[[0, 2, 3, 4, 5, 6], "10:00", "18:00"]], url: "https://zeitzmocaa.museum", pt: "Arte contemporânea africana num antigo silo de cereais; fecha à segunda.", en: "Contemporary African art in a former grain silo; closed Mondays." },
    { id: "cpt-district6-m", n: "District Six Museum", lat: -33.9282, lng: 18.4237, price: 100, h: [[[1, 2, 3, 4, 5, 6], "09:00", "16:00"]], url: "https://www.districtsix.co.za", pt: "A memória do bairro destruído pelo apartheid; fecha ao domingo.", en: "The memory of the neighbourhood destroyed by apartheid; closed Sundays." }
  ],
  zan: [
    { id: "zan-cathedral-m", n: "Catedral Anglicana e Mercado de Escravos", lat: -6.1661, lng: 39.1924, price: 20000, h: [[ALL, "08:00", "18:00"]], url: "https://www.google.com/maps/search/?api=1&query=Catedral%20Anglicana%20e%20Mercado%20de%20Escravos", pt: "Inclui guia, as câmaras subterrâneas e o museu da escravatura.", en: "Includes a guide, the underground chambers and the slavery museum." },
    { id: "zan-palace-m", n: "Palace Museum", lat: -6.1594, lng: 39.1906, price: 10000, h: [[ALL, "09:00", "18:00"]], url: "https://www.google.com/maps/search/?api=1&query=Palace%20Museum", pt: "O palácio dos sultões, com mobiliário e o túmulo dos governantes no jardim.", en: "The sultans' palace, with furniture and the rulers' tombs in the garden." }
  ],
  tun: [
    { id: "tun-bardo-m", n: "Museu Nacional do Bardo", lat: 36.8094, lng: 10.134, price: 13, h: [[[0, 2, 3, 4, 5, 6], "09:30", "17:00"]], url: "https://www.google.com/maps/search/?api=1&query=Museu%20Nacional%20do%20Bardo", pt: "Fecha à segunda; leve passaporte para o controlo à entrada.", en: "Closed Mondays; bring your passport for the entrance check." },
    { id: "tun-carthage-m", n: "Sítio arqueológico de Cartago", lat: 36.8528, lng: 10.3233, price: 12, h: [[ALL, "08:30", "17:00"]], url: "https://www.google.com/maps/search/?api=1&query=S%C3%ADtio%20arqueol%C3%B3gico%20de%20Cartago", pt: "Um bilhete serve para vários lugares: termas, Byrsa e o tofet.", en: "One ticket covers several sites: the baths, Byrsa and the tophet." }
  ],
  add: [
    { id: "add-museum-m", n: "Museu Nacional da Etiópia", lat: 9.0386, lng: 38.7614, price: 300, h: [[ALL, "08:30", "17:00"]], url: "https://www.google.com/maps/search/?api=1&query=Museu%20Nacional%20da%20Eti%C3%B3pia", pt: "A sala de Lucy fica na cave.", en: "Lucy's room is in the basement." },
    { id: "add-unity-m", n: "Unity Park", lat: 9.02, lng: 38.7636, price: 1500, h: [[[0, 2, 3, 4, 5, 6], "09:00", "17:00"]], url: "https://www.google.com/maps/search/?api=1&query=Unity%20Park", pt: "Preço para estrangeiros; bilhetes à entrada ou online.", en: "Foreigner price; tickets at the gate or online." },
    { id: "add-ethnological", n: "Museu Etnológico", lat: 9.0459, lng: 38.7618, price: 300, h: [[ALL, "08:30", "17:00"]], url: "https://www.google.com/maps/search/?api=1&query=Museu%20Etnol%C3%B3gico", pt: "No antigo palácio de Haile Selassie, dentro da universidade, com o quarto do imperador.", en: "In Haile Selassie's former palace on the university campus, with the emperor's bedroom." }
  ],
  nbo: [
    { id: "nbo-sheldrick-m", n: "Sheldrick Wildlife Trust", lat: -1.3762, lng: 36.7747, price: 2000, h: [[ALL, "11:00", "12:00"]], book: true, url: "https://www.sheldrickwildlifetrust.org", pt: "Só uma hora por dia e com reserva online; o preço é em xelins para residentes e em dólares para estrangeiros.", en: "One hour a day only, booked online; prices are in shillings for residents and dollars for visitors." },
    { id: "nbo-giraffe-m", n: "Giraffe Centre", lat: -1.3762, lng: 36.7448, price: 1500, h: [[ALL, "09:00", "17:00"]], url: "https://www.giraffecenter.org", pt: "Leve trocos; dá-se comida às girafas na plataforma.", en: "Bring change; you feed the giraffes from the platform." },
    { id: "nbo-national-m", n: "Nairobi National Museum", lat: -1.2742, lng: 36.8146, price: 1200, h: [[ALL, "08:30", "17:30"]], url: "https://museums.or.ke", pt: "Bilhete combinado com o parque das serpentes.", en: "Combined ticket with the snake park." },
    { id: "nbo-karen-m", n: "Karen Blixen Museum", lat: -1.3505, lng: 36.7125, price: 1200, h: [[ALL, "08:30", "18:00"]], url: "https://museums.or.ke", pt: "Visita guiada curta pela casa e o jardim.", en: "A short guided visit of the house and garden." }
  ],
  lad: [
    { id: "lad-fortaleza-m", n: "Fortaleza de São Miguel", lat: -8.81, lng: 13.2223, price: 1000, h: [[[2, 3, 4, 5, 6, 0], "09:00", "17:00"]], url: "https://www.google.com/maps/search/?api=1&query=Fortaleza%20de%20S%C3%A3o%20Miguel", pt: "Museu Nacional de História Militar; fecha à segunda.", en: "National Museum of Military History; closed Mondays." },
    { id: "lad-memorial-m", n: "Memorial Dr. António Agostinho Neto", lat: -8.8352, lng: 13.2246, price: 1000, h: [[[2, 3, 4, 5, 6, 0], "09:00", "18:00"]], url: "https://www.google.com/maps/search/?api=1&query=Memorial%20Dr.%20Ant%C3%B3nio%20Agostinho%20Neto", pt: "Elevador até ao miradouro da torre; fecha à segunda.", en: "Lift to the tower lookout; closed Mondays." },
    { id: "lad-escravatura-m", n: "Museu Nacional da Escravatura", lat: -8.99, lng: 13.109, price: 500, h: [[[2, 3, 4, 5, 6], "09:00", "17:00"]], url: "https://www.google.com/maps/search/?api=1&query=Museu%20Nacional%20da%20Escravatura", pt: "Na capela do Morro da Cruz, onde se batizavam os escravizados antes do embarque.", en: "In the Morro da Cruz chapel, where enslaved people were baptised before shipment." },
    { id: "lad-antropologia-m", n: "Museu Nacional de Antropologia", lat: -8.8143, lng: 13.2364, price: 500, h: [[[2, 3, 4, 5, 6], "09:00", "17:00"]], url: "https://www.google.com/maps/search/?api=1&query=Museu%20Nacional%20de%20Antropologia", pt: "Máscaras, instrumentos e objetos dos povos de Angola, na Baixa.", en: "Masks, instruments and objects from Angola's peoples, in the Baixa." }
  ],
  acc: [
    { id: "acc-nkrumah-m", n: "Kwame Nkrumah Memorial Park", lat: 5.5446, lng: -0.2023, price: 150, h: [[ALL, "09:00", "17:00"]], url: "https://www.google.com/maps/search/?api=1&query=Kwame%20Nkrumah%20Memorial%20Park", pt: "Mausoléu, museu e jardins; preço para estrangeiros.", en: "Mausoleum, museum and gardens; foreigner price." },
    { id: "acc-museum-m", n: "Museu Nacional do Gana", lat: 5.5604, lng: -0.2034, price: 100, h: [[[2, 3, 4, 5, 6, 0], "09:00", "17:00"]], url: "https://www.google.com/maps/search/?api=1&query=Museu%20Nacional%20do%20Gana", pt: "Reaberto após renovação, com arte e história ganense.", en: "Reopened after renovation, with Ghanaian art and history." }
  ],
  kgl: [
    { id: "kgl-memorial-m", n: "Kigali Genocide Memorial", lat: -1.9306, lng: 30.0607, price: 0, h: [[ALL, "08:00", "17:00"]], url: "https://kgm.rw", pt: "Entrada gratuita; o guia áudio é pago. No último sábado do mês abre depois do Umuganda.", en: "Free entry; the audio guide is paid. On the last Saturday of the month it opens after Umuganda." },
    { id: "kgl-inema-m", n: "Inema Arts Center", lat: -1.954, lng: 30.089, price: 0, h: [[ALL, "09:00", "18:00"]], url: "https://www.google.com/maps/search/?api=1&query=Inema%20Arts%20Center", pt: "Galeria gratuita com obras à venda.", en: "Free gallery with works for sale." },
    { id: "kgl-palace-m", n: "Presidential Palace Museum", lat: -1.9705, lng: 30.1412, price: 10000, h: [[ALL, "08:00", "17:00"]], url: "https://www.google.com/maps/search/?api=1&query=Presidential%20Palace%20Museum", pt: "Preço para estrangeiros; inclui os destroços do avião.", en: "Foreigner price; includes the plane wreckage." }
  ],
  dkr: [
    { id: "dkr-goree-m", n: "Ilha de Gorée e Casa dos Escravos", lat: 14.667, lng: -17.3986, price: 5200, h: [[[0, 2, 3, 4, 5, 6], "10:00", "18:00"]], url: "https://www.google.com/maps/search/?api=1&query=Ilha%20de%20Gor%C3%A9e%20e%20Casa%20dos%20Escravos", pt: "O preço inclui a chaloupe de ida e volta para estrangeiros; a Casa dos Escravos fecha à segunda.", en: "Price includes the return ferry for foreigners; the House of Slaves closes on Mondays." },
    { id: "dkr-mcn-m", n: "Museu das Civilizações Negras", lat: 14.6703, lng: -17.4351, price: 3000, h: [[[2, 3, 4, 5, 6, 0], "10:00", "19:00"]], url: "https://www.google.com/maps/search/?api=1&query=Museu%20das%20Civiliza%C3%A7%C3%B5es%20Negras", pt: "Fecha à segunda.", en: "Closed Mondays." },
    { id: "dkr-renaissance-m", n: "Monumento da Renascença Africana", lat: 14.7222, lng: -17.495, price: 6500, h: [[ALL, "10:00", "19:00"]], url: "https://www.google.com/maps/search/?api=1&query=Monumento%20da%20Renascen%C3%A7a%20Africana", pt: "Elevador até à cabeça da estátua; muitos degraus até à entrada.", en: "Lift up to the statue's head; many steps to the entrance." }
  ]
};

/** Está aberto agora? (hora local da cidade) */
export function openNow(m: Museum, tz: string, at = new Date()): { open: boolean; today: [string, string] | null } {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(at);
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.find((p) => p.type === "weekday")!.value);
  const hm = `${parts.find((p) => p.type === "hour")!.value.replace("24", "00")}:${parts.find((p) => p.type === "minute")!.value}`;
  const block = m.h.find(([d]) => d.includes(wd));
  if (!block) return { open: false, today: null };
  return { open: hm >= block[1] && hm < block[2], today: [block[1], block[2]] };
}
