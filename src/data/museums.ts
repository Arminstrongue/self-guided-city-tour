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
