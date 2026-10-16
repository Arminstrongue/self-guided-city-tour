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
  bir: [
    { id: "thinktank", n: "Thinktank Science Museum", lat: 52.4826, lng: -1.8862, price: 16, h: [[ALL, "10:00", "17:00"]], url: "https://www.birminghammuseums.org.uk", pt: "Museu de ciência interativo em Eastside.", en: "Hands-on science museum in Eastside." },
    { id: "barber", n: "Barber Institute of Fine Arts", lat: 52.4508, lng: -1.9293, price: 0, h: [[[1, 2, 3, 4, 5], "10:00", "17:00"], [[0, 6], "11:00", "17:00"]], url: "https://barber.org.uk", pt: "Gratuito: Monet, Van Gogh e Rubens na universidade.", en: "Free: Monet, Van Gogh and Rubens at the university." },
    { id: "cadbury-m", n: "Cadbury World", lat: 52.4285, lng: -1.9314, price: 23, h: [[ALL, "10:00", "17:00"]], book: true, url: "https://www.cadburyworld.co.uk", pt: "Reserve com antecedência; horários variam por época.", en: "Book ahead; hours vary by season." }
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
