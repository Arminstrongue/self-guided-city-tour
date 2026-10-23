/**
 * Momentos: o que fazer e sentir em cada cidade, não só o que ver. Curadoria própria, com a hora certa para cada um.
 * Texto em português e inglês (os outros idiomas mostram o inglês).
 */
import type { Hobby } from "@/lib/explore";

export type When = "sunset" | "morning" | "night" | "weekend" | "day";
export const WHEN_ICON: Record<When, string> = { sunset: "🌅", morning: "☀️", night: "🌙", weekend: "📅", day: "🕐" };
export type Moment = { id: string; icon: string; when: When; h: Hobby[]; lat: number; lng: number; pt: [string, string]; en: [string, string] };

const m = (id: string, icon: string, when: When, h: Hobby[], lat: number, lng: number, pt: [string, string], en: [string, string]): Moment => ({ id, icon, when, h, lat, lng, pt, en });

export const MOMENTS: Record<string, Moment[]> = {
  lis: [
    m("sra-monte", "🌅", "sunset", ["photo"], 38.7193, -9.1325, ["Pôr do sol na Senhora do Monte", "O miradouro mais alto da cidade: Castelo, Baixa e o rio a ficarem dourados."], ["Sunset at Senhora do Monte", "The city's highest viewpoint: castle, Baixa and river turning gold."]),
    m("fado", "🎵", "night", ["music", "night"], 38.7114, -9.1297, ["Fado ao vivo em Alfama", "Casas de fado pequenas nas ruelas de Alfama. Silêncio quando a fadista canta."], ["Live fado in Alfama", "Small fado houses in Alfama's lanes. Silence when the singer starts."]),
    m("lxfactory", "🎨", "weekend", ["art", "shopping", "food"], 38.7036, -9.1789, ["LX Factory ao domingo", "Antiga fábrica com livrarias, arte urbana, restaurantes e mercado ao domingo."], ["LX Factory on Sunday", "A former factory with bookshops, street art, restaurants and a Sunday market."]),
    m("timeout", "🍜", "day", ["food"], 38.7068, -9.146, ["Provar Lisboa num só sítio", "No Mercado da Ribeira (Time Out Market): bifanas, pastéis e peixe dos melhores chefs."], ["Taste Lisbon in one place", "At Mercado da Ribeira (Time Out Market): bifanas, custard tarts and seafood from top chefs."]),
    m("ladra", "🧺", "morning", ["shopping", "history"], 38.7149, -9.1263, ["Feira da Ladra (terça e sábado)", "A feira da ladra de velharias atrás de São Vicente: azulejos, discos e achados."], ["Feira da Ladra flea market (Tue & Sat)", "The flea market behind São Vicente: tiles, records and odd finds."]),
    m("oceanario", "🧸", "day", ["family", "nature"], 38.7635, -9.0938, ["Oceanário com as crianças", "Um dos maiores aquários da Europa, no Parque das Nações. Perto do aeroporto."], ["The Oceanarium with kids", "One of Europe's largest aquariums, at Parque das Nações. Close to the airport."])
  ],
  opo: [
    m("morro", "🌅", "sunset", ["photo"], 41.1376, -8.6093, ["Pôr do sol no Jardim do Morro", "Do lado de Gaia, com a Ribeira e a ponte em frente. O momento mais concorrido do Porto."], ["Sunset at Jardim do Morro", "On the Gaia side, facing Ribeira and the bridge. Porto's favourite moment."]),
    m("bolhao", "🧺", "morning", ["food", "shopping"], 41.1497, -8.6058, ["Mercado do Bolhão de manhã", "Peixe, flores, queijos e sandes de presunto no mercado renovado."], ["Bolhão market in the morning", "Fish, flowers, cheese and ham rolls in the restored market."]),
    m("caves", "🍷", "day", ["food", "history"], 41.1374, -8.6146, ["Caves de vinho do Porto", "Visita com prova nas caves de Gaia, à beira do Douro."], ["Port wine cellars", "A tour and tasting in the Gaia lodges by the Douro."]),
    m("galerias", "🌙", "night", ["night", "music"], 41.1471, -8.6146, ["Noite nas Galerias de Paris", "A rua dos bares do Porto: cheia de gente nas noites de sexta e sábado."], ["A night on Galerias de Paris", "Porto's bar street, packed on Friday and Saturday nights."]),
    m("matosinhos", "🐟", "day", ["food", "nature"], 41.1767, -8.6908, ["Peixe grelhado em Matosinhos", "Praia larga e as grelhas na rua à hora de almoço. De metro desde a Trindade."], ["Grilled fish in Matosinhos", "A wide beach and street grills at lunchtime. Metro from Trindade."]),
    m("serralves", "🌿", "day", ["art", "nature", "family"], 41.1597, -8.6598, ["Parque de Serralves", "Arte contemporânea e um parque enorme com o passeio nas copas das árvores."], ["Serralves park", "Contemporary art and a huge park with a treetop walk."])
  ],
  mad: [
    m("debod", "🌅", "sunset", ["photo", "history"], 40.424, -3.7177, ["Pôr do sol no Templo de Debod", "Um templo egípcio verdadeiro, refletido na água ao fim do dia."], ["Sunset at the Temple of Debod", "A real Egyptian temple reflected in the water at dusk."]),
    m("rastro", "🧺", "weekend", ["shopping"], 40.4087, -3.7078, ["El Rastro ao domingo", "O mercado de rua mais famoso de Madrid, domingo de manhã, na La Latina."], ["El Rastro on Sunday", "Madrid's famous street market, Sunday mornings in La Latina."]),
    m("sangines", "🍫", "night", ["food", "night"], 40.417, -3.7069, ["Churros na San Ginés", "Chocolate quente e churros desde 1894, perto de Sol. Ótimo depois da noite."], ["Churros at San Ginés", "Hot chocolate and churros since 1894, near Sol. Perfect after a night out."]),
    m("retiro-barcos", "🧸", "day", ["family", "nature"], 40.418, -3.6835, ["Barcos no lago do Retiro", "Alugar um barco a remos no Estanque Grande, ao pé do monumento."], ["Rowing boats in the Retiro", "Hire a rowing boat on the Estanque Grande by the monument."]),
    m("bernabeu", "⚽", "day", ["sport"], 40.4531, -3.6883, ["Estádio Santiago Bernabéu", "Visita ao estádio e museu do Real Madrid, ou um jogo se houver."], ["Santiago Bernabéu stadium", "Tour Real Madrid's stadium and museum, or catch a match."]),
    m("cavabaja", "🍷", "night", ["food", "night"], 40.412, -3.7095, ["Tapas na Cava Baja", "A rua das tapas da La Latina: de bar em bar, como os madrilenos."], ["Tapas on Cava Baja", "La Latina's tapas street: bar to bar, the Madrid way."])
  ],
  bcn: [
    m("bunkers", "🌅", "sunset", ["photo"], 41.419, 2.162, ["Pôr do sol nos Bunkers del Carmel", "A vista de 360° sobre toda Barcelona e o mar."], ["Sunset at the Bunkers del Carmel", "A 360° view over all of Barcelona and the sea."]),
    m("magica", "✨", "night", ["family", "music"], 41.3711, 2.1517, ["Font Màgica de Montjuïc", "Espetáculo de água, luz e música ao anoitecer em dias marcados. Confirme o horário."], ["Magic Fountain of Montjuïc", "A water, light and music show at dusk on set days. Check the schedule."]),
    m("barceloneta", "🏖", "day", ["nature", "photo"], 41.3784, 2.1925, ["Praia da Barceloneta", "Areia a 15 minutos a pé da cidade velha. Paella com vista para o mar."], ["Barceloneta beach", "Sand 15 minutes' walk from the old town. Paella with a sea view."]),
    m("campnou", "⚽", "day", ["sport"], 41.3809, 2.1228, ["Spotify Camp Nou", "O estádio do Barça: museu, visita ou jogo."], ["Spotify Camp Nou", "Barça's stadium: museum, tour or a match."]),
    m("born", "🍷", "night", ["food", "night"], 41.3851, 2.1823, ["Vermute e tapas no Born", "Ruas estreitas, bares pequenos e vermute ao fim da tarde."], ["Vermouth and tapas in El Born", "Narrow streets, tiny bars and early-evening vermouth."]),
    m("ciutadella", "🧸", "day", ["family", "nature"], 41.3881, 2.1873, ["Parc de la Ciutadella", "Barcos no lago, a cascata monumental e espaço para as crianças correrem."], ["Parc de la Ciutadella", "Boats on the lake, the grand cascade and room for kids to run."])
  ],
  par: [
    m("sacrecoeur", "🌅", "sunset", ["photo"], 48.8867, 2.3431, ["Pôr do sol no Sacré-Cœur", "Paris inteira aos pés de Montmartre, com músicos na escadaria."], ["Sunset at Sacré-Cœur", "All of Paris below Montmartre, with musicians on the steps."]),
    m("eiffel-sparkle", "✨", "night", ["photo", "family"], 48.8556, 2.2986, ["A Torre Eiffel a cintilar", "Piquenique no Champ de Mars: depois de escurecer, a torre cintila 5 minutos a cada hora."], ["The Eiffel Tower sparkling", "Picnic on the Champ de Mars: after dark the tower sparkles for 5 minutes every hour."]),
    m("cler", "🥐", "morning", ["food"], 48.8566, 2.3058, ["Pequeno-almoço na Rue Cler", "Croissants, queijos e fruta na rua pedonal de mercado."], ["Breakfast on Rue Cler", "Croissants, cheese and fruit on the pedestrian market street."]),
    m("seine", "⛴", "night", ["photo"], 48.8593, 2.2932, ["Cruzeiro no Sena ao anoitecer", "Uma hora de barco com os monumentos iluminados."], ["Seine cruise at dusk", "An hour on the river with the monuments lit up."]),
    m("luxembourg", "🧸", "day", ["family", "nature"], 48.8462, 2.3372, ["Veleiros no Jardin du Luxembourg", "As crianças alugam pequenos veleiros no lago, como há cem anos."], ["Sailboats in the Luxembourg Gardens", "Kids rent little sailboats on the pond, as they have for a century."]),
    m("marais", "🛍", "weekend", ["shopping", "food", "art"], 48.859, 2.362, ["Domingo no Marais", "Lojas abertas ao domingo, falafel na Rue des Rosiers e a Place des Vosges."], ["Sunday in the Marais", "Shops open on Sundays, falafel on Rue des Rosiers and Place des Vosges."])
  ],
  lon: [
    m("primrose", "🌅", "sunset", ["photo", "nature"], 51.5394, -0.1609, ["Pôr do sol em Primrose Hill", "O horizonte de Londres inteiro a partir da colina do Regent's Park."], ["Sunset on Primrose Hill", "The whole London skyline from the hill by Regent's Park."]),
    m("borough", "🍜", "day", ["food"], 51.5055, -0.091, ["Almoço no Borough Market", "O mercado de comida mais famoso de Londres, junto à London Bridge."], ["Lunch at Borough Market", "London's most famous food market, by London Bridge."]),
    m("columbia", "🌸", "weekend", ["photo", "shopping"], 51.5294, -0.0696, ["Columbia Road ao domingo", "O mercado das flores de East London, só ao domingo de manhã."], ["Columbia Road on Sunday", "East London's flower market, Sunday mornings only."]),
    m("westend", "🎭", "night", ["music", "art", "night"], 51.5117, -0.13, ["Um musical no West End", "Bilhetes de última hora no quiosque TKTS de Leicester Square."], ["A West End musical", "Last-minute tickets at the TKTS booth in Leicester Square."]),
    m("skygarden", "📷", "day", ["photo"], 51.5112, -0.0835, ["Sky Garden (grátis)", "Jardim no 35.º andar com vista sobre a City. Reserve online com antecedência."], ["Sky Garden (free)", "A 35th-floor garden over the City. Book online in advance."]),
    m("serpentine", "🧸", "day", ["family", "nature"], 51.5052, -0.165, ["Gaivotas no Serpentine", "Barcos a pedal no lago do Hyde Park e o parque infantil Princess Diana."], ["Pedalos on the Serpentine", "Pedal boats on Hyde Park's lake and the Princess Diana playground."])
  ],
  rom: [
    m("aranci", "🌅", "sunset", ["photo"], 41.8846, 12.4797, ["Pôr do sol no Giardino degli Aranci", "Laranjeiras no Aventino e a cúpula de São Pedro ao fundo."], ["Sunset at the Orange Garden", "Orange trees on the Aventine and St Peter's dome in the distance."]),
    m("buco", "🔑", "day", ["photo", "history"], 41.8829, 12.4797, ["A fechadura do Aventino", "Espreite pelo buraco da fechadura dos Cavaleiros de Malta: São Pedro emoldurado."], ["The Aventine keyhole", "Peek through the Knights of Malta keyhole: St Peter's perfectly framed."]),
    m("campo", "🧺", "morning", ["food", "shopping"], 41.8956, 12.4722, ["Mercado do Campo de' Fiori", "Fruta, especiarias e flores de manhã, de segunda a sábado."], ["Campo de' Fiori market", "Fruit, spices and flowers in the morning, Monday to Saturday."]),
    m("trastevere", "🍝", "night", ["food", "night"], 41.8894, 12.47, ["Jantar em Trastevere", "Cacio e pepe numa trattoria e um passeio pelas ruelas iluminadas."], ["Dinner in Trastevere", "Cacio e pepe in a trattoria and a stroll through lamplit lanes."]),
    m("trevi-noite", "✨", "night", ["photo"], 41.9009, 12.4833, ["Fontana di Trevi à noite", "Mais tarde há menos gente. Atire uma moeda para voltar a Roma."], ["Trevi Fountain at night", "Fewer people late in the evening. Toss a coin to come back to Rome."]),
    m("borghese", "🧸", "day", ["family", "nature"], 41.9142, 12.4923, ["Bicicletas na Villa Borghese", "Alugue uma bicicleta ou um carrinho familiar no parque sobre a Piazza del Popolo."], ["Bikes in Villa Borghese", "Rent a bike or family surrey in the park above Piazza del Popolo."])
  ],
  ams: [
    m("ndsm", "⛴", "sunset", ["photo", "art"], 52.401, 4.893, ["Ferry grátis para o NDSM", "Atravesse o IJ desde a estação central ao fim do dia: estaleiro, arte urbana e vista."], ["Free ferry to NDSM", "Cross the IJ from Central Station at dusk: shipyard, street art and views."]),
    m("cuyp", "🧇", "day", ["food", "shopping"], 52.3557, 4.8946, ["Stroopwafel no Albert Cuyp", "O mercado de rua de De Pijp, de segunda a sábado."], ["Stroopwafel at Albert Cuyp", "De Pijp's street market, Monday to Saturday."]),
    m("vondel", "🌿", "day", ["nature", "family"], 52.358, 4.8686, ["Vondelpark", "O grande parque da cidade: bicicletas, lagos e parques infantis."], ["Vondelpark", "The city's great park: bikes, ponds and playgrounds."]),
    m("canal-night", "✨", "night", ["photo"], 52.3738, 4.891, ["Canais ao anoitecer", "Passeio de barco quando as pontes se iluminam."], ["Canals at dusk", "A boat ride as the bridges light up."]),
    m("concertgebouw", "🎵", "day", ["music"], 52.3563, 4.8789, ["Concertgebouw", "Uma das melhores salas de concerto do mundo. Veja a agenda de concertos curtos."], ["Concertgebouw", "One of the world's best concert halls. Check for short lunchtime concerts."]),
    m("adam", "🎡", "day", ["family", "photo"], 52.3842, 4.902, ["Baloiço no A'DAM Lookout", "Baloiçar sobre o vazio no topo da torre, com Amesterdão aos pés."], ["Swing at A'DAM Lookout", "Swing over the edge at the top of the tower, Amsterdam below."])
  ],
  edi: [
    m("calton", "🌅", "sunset", ["photo"], 55.9553, -3.1828, ["Pôr do sol em Calton Hill", "Castelo, Old Town e o mar a partir da colina dos monumentos."], ["Sunset on Calton Hill", "Castle, Old Town and the sea from the hill of monuments."]),
    m("arthur", "⛰", "morning", ["nature", "photo"], 55.9442, -3.1618, ["Subir ao Arthur's Seat", "Um vulcão extinto no meio da cidade: cerca de 45 minutos até ao topo."], ["Climb Arthur's Seat", "An extinct volcano in the city: about 45 minutes to the top."]),
    m("folk", "🎻", "night", ["music", "night"], 55.9459, -3.1908, ["Música folk ao vivo", "Sessões tradicionais todas as noites nos pubs perto da Forrest Road."], ["Live folk music", "Traditional sessions every night in pubs near Forrest Road."]),
    m("victoria", "🛍", "day", ["photo", "shopping"], 55.948, -3.1937, ["Victoria Street e Grassmarket", "A rua curva e colorida que inspirou o Diagon Alley."], ["Victoria Street and Grassmarket", "The curving, colourful street said to inspire Diagon Alley."]),
    m("dean", "📷", "day", ["photo", "nature"], 55.9523, -3.2152, ["Dean Village", "Uma aldeia de moinhos à beira do rio, a 10 minutos de Princes Street."], ["Dean Village", "A riverside mill village 10 minutes from Princes Street."]),
    m("camera", "🧸", "day", ["family"], 55.9491, -3.1958, ["Camera Obscura", "Ilusões óticas em cinco andares, ao lado do castelo."], ["Camera Obscura", "Five floors of optical illusions next to the castle."])
  ],
  man: [
    m("nq-art", "🎨", "day", ["art", "photo"], 53.484, -2.236, ["Arte urbana no Northern Quarter", "Murais enormes, lojas de discos e cafés independentes."], ["Street art in the Northern Quarter", "Huge murals, record shops and independent cafés."]),
    m("mackie", "🍜", "day", ["food"], 53.488, -2.2405, ["Mackie Mayor", "Antigo mercado vitoriano com bancas de comida e mesas partilhadas."], ["Mackie Mayor", "A Victorian market hall with food stalls and shared tables."]),
    m("oldtrafford", "⚽", "day", ["sport"], 53.4631, -2.2913, ["Old Trafford", "Visita ao estádio e museu do Manchester United, ou um jogo."], ["Old Trafford", "Tour Manchester United's stadium and museum, or catch a game."]),
    m("bandwall", "🎵", "night", ["music", "night"], 53.4855, -2.234, ["Música ao vivo no Band on the Wall", "Sala histórica de concertos: jazz, soul e música do mundo."], ["Live music at Band on the Wall", "A historic venue for jazz, soul and world music."]),
    m("sim", "🧸", "day", ["family", "history"], 53.4771, -2.2546, ["Science and Industry Museum", "Máquinas a vapor e experiências para crianças. Entrada gratuita."], ["Science and Industry Museum", "Steam engines and hands-on science for kids. Free entry."]),
    m("castlefield", "🌅", "sunset", ["photo", "history"], 53.4747, -2.254, ["Canais de Castlefield ao fim do dia", "Viadutos de ferro, barcos e bares à beira do canal."], ["Castlefield canals at dusk", "Iron viaducts, narrowboats and canalside bars."])
  ],
  gla: [
    m("murals", "🎨", "day", ["art", "photo"], 55.8597, -4.2487, ["Mural Trail", "Murais gigantes espalhados pelo centro. Siga o mapa oficial."], ["Mural Trail", "Giant murals across the centre. Follow the official map."]),
    m("kingtuts", "🎸", "night", ["music", "night"], 55.8628, -4.265, ["Concerto no King Tut's", "A sala pequena onde os Oasis foram descobertos."], ["A gig at King Tut's", "The small venue where Oasis were discovered."]),
    m("kelvingrove", "🎨", "day", ["art", "family"], 55.8686, -4.2906, ["Kelvingrove Art Gallery", "Dalí, armaduras e um órgão monumental. Entrada gratuita."], ["Kelvingrove Art Gallery", "Dalí, armour and a grand organ. Free entry."]),
    m("necropolis", "🌅", "sunset", ["history", "photo"], 55.8628, -4.2311, ["Necrópole ao pôr do sol", "Cemitério vitoriano na colina, com vista sobre a catedral."], ["The Necropolis at sunset", "A Victorian hilltop cemetery overlooking the cathedral."]),
    m("barras", "🧺", "weekend", ["shopping"], 55.8546, -4.2366, ["The Barras ao fim de semana", "O mercado de rua histórico de East End."], ["The Barras at the weekend", "The East End's historic street market."]),
    m("science", "🧸", "day", ["family"], 55.8588, -4.294, ["Glasgow Science Centre", "Ciência interativa e planetário à beira do Clyde."], ["Glasgow Science Centre", "Hands-on science and a planetarium on the Clyde."])
  ],
  liv: [
    m("cavern", "🎸", "night", ["music", "night"], 53.4065, -2.9877, ["Música ao vivo no Cavern Club", "Onde os Beatles tocaram quase 300 vezes. Concertos todos os dias."], ["Live music at the Cavern Club", "Where the Beatles played nearly 300 times. Gigs every day."]),
    m("dock", "🌅", "sunset", ["photo", "history"], 53.4004, -2.9925, ["Royal Albert Dock ao pôr do sol", "Armazéns de tijolo, água e o céu do Mersey."], ["Royal Albert Dock at sunset", "Brick warehouses, water and the Mersey sky."]),
    m("anfield", "⚽", "day", ["sport"], 53.4308, -2.9608, ["Anfield", "Visita ao estádio do Liverpool FC e ao 'This is Anfield'."], ["Anfield", "Tour Liverpool FC's stadium and touch 'This is Anfield'."]),
    m("baltic", "🍜", "night", ["food", "night"], 53.3971, -2.9837, ["Baltic Market", "Comida de rua num armazém do Baltic Triangle."], ["Baltic Market", "Street food in a Baltic Triangle warehouse."]),
    m("sefton", "🌿", "day", ["nature", "family"], 53.3812, -2.9381, ["Sefton Park e o Palm House", "Lagos, relva e uma estufa vitoriana."], ["Sefton Park and the Palm House", "Lakes, lawns and a Victorian glasshouse."]),
    m("mol", "🧸", "day", ["family", "history"], 53.4038, -2.9953, ["Museum of Liverpool", "A história da cidade, dos Beatles ao porto. Entrada gratuita."], ["Museum of Liverpool", "The city's story, from the Beatles to the docks. Free entry."])
  ],
  bir: [
    m("gasstreet", "🌅", "sunset", ["photo"], 52.4776, -1.9075, ["Gas Street Basin ao fim do dia", "Birmingham tem mais canais do que Veneza. Barcos coloridos e bares."], ["Gas Street Basin at dusk", "Birmingham has more canals than Venice. Colourful narrowboats and bars."]),
    m("bullring", "🛍", "day", ["shopping", "food"], 52.4775, -1.8936, ["Bullring e os mercados", "O centro comercial do touro e os mercados tradicionais ao lado."], ["Bullring and the markets", "The bull-statue mall and the traditional markets next door."]),
    m("digbeth", "🍜", "night", ["food", "night", "art"], 52.475, -1.883, ["Digbeth: comida de rua e arte", "Armazéns, murais e mercados noturnos de comida ao fim de semana."], ["Digbeth: street food and art", "Warehouses, murals and weekend night food markets."]),
    m("cadbury", "🍫", "day", ["family", "food"], 52.4296, -1.9325, ["Cadbury World", "A fábrica de chocolate com provas. Reserve antes."], ["Cadbury World", "The chocolate factory with tastings. Book ahead."]),
    m("library", "📷", "day", ["photo", "art"], 52.4796, -1.9083, ["Terraço da Library of Birmingham", "Jardim secreto no 7.º andar da biblioteca, grátis."], ["Library of Birmingham terrace", "A secret 7th-floor garden at the library, free."]),
    m("jq", "💍", "day", ["history", "shopping"], 52.488, -1.912, ["Jewellery Quarter", "Bairro de ourives com oficinas-museu e cafés."], ["Jewellery Quarter", "A goldsmiths' quarter with workshop museums and cafés."])
  ],
  ist: [
    m("galata", "🌅", "sunset", ["photo", "history"], 41.0256, 28.9742, ["Pôr do sol na Torre de Gálata", "Os minaretes da cidade velha recortados no céu dourado."], ["Sunset at Galata Tower", "The old city's minarets against a golden sky."]),
    m("ferry", "⛴", "day", ["photo"], 41.0175, 28.9706, ["Ferry no Bósforo", "Eminönü → Üsküdar com chá e simit: da Europa à Ásia por pouco dinheiro."], ["Bosphorus ferry", "Eminönü → Üsküdar with tea and simit: Europe to Asia for pocket change."]),
    m("balik", "🐟", "day", ["food"], 41.017, 28.97, ["Balık ekmek em Eminönü", "Sandes de peixe grelhado nos barcos junto à ponte de Gálata."], ["Balık ekmek at Eminönü", "Grilled fish sandwiches from boats by the Galata Bridge."]),
    m("kadikoy", "🌙", "night", ["food", "night"], 40.9905, 29.0262, ["Noite em Kadıköy", "O lado asiático: mercado, meyhanes e cafés cheios de estudantes."], ["Evening in Kadıköy", "The Asian side: market, meyhanes and student cafés."]),
    m("bazar", "🛍", "day", ["shopping", "history"], 41.0107, 28.9681, ["Grande Bazar", "Mais de 4 mil lojas debaixo de abóbadas pintadas. Negocie com um sorriso."], ["Grand Bazaar", "Over 4,000 shops under painted vaults. Bargain with a smile."]),
    m("gulhane", "🧸", "day", ["family", "nature"], 41.013, 28.981, ["Parque Gülhane", "Jardins do antigo palácio, com chá e vista para o Bósforo."], ["Gülhane Park", "The old palace gardens, with tea and Bosphorus views."])
  ],
  dxb: [
    m("fountain", "⛲", "night", ["photo", "family", "music"], 25.1955, 55.2758, ["Espetáculo da Fonte do Dubai", "À noite, a cada 30 minutos, a fonte dança ao som de música aos pés do Burj Khalifa. Grátis; veja da ponte de Souk Al Bahar."], ["Dubai Fountain show", "Every 30 minutes in the evening the fountain dances to music at the foot of the Burj Khalifa. Free; watch from the Souk Al Bahar bridge."]),
    m("abra-sunset", "🌅", "sunset", ["photo", "history"], 25.2630, 55.2970, ["Pôr do sol de abra no Creek", "Um barco de madeira por 1 AED entre Bur Dubai e Deira, com as luzes dos souks a acender."], ["Sunset abra on the Creek", "A wooden boat for 1 AED between Bur Dubai and Deira, as the souk lights come on."]),
    m("desert", "🐪", "day", ["nature", "photo"], 24.9900, 55.6000, ["Deserto ao fim da tarde", "Dunas vermelhas a 45 minutos da cidade: safari em 4x4, camelos e jantar beduíno. Reserve com operador licenciado."], ["Desert in the late afternoon", "Red dunes 45 minutes from the city: 4x4 safari, camels and a Bedouin dinner. Book a licensed operator."]),
    m("arabian-tea", "🍵", "day", ["food", "history"], 25.2637, 55.2995, ["Pequeno-almoço emirati em Al Fahidi", "Chá com cardamomo, luqaimat (bolinhos com tâmara) e balaleet num pátio de casa antiga."], ["Emirati breakfast in Al Fahidi", "Cardamom tea, luqaimat (date-syrup dumplings) and balaleet in an old house courtyard."]),
    m("jbr-beach", "🏖", "morning", ["nature", "family"], 25.0790, 55.1340, ["Praia de manhã em JBR", "Água morna e areia fina com o skyline atrás, antes do calor apertar."], ["Morning at JBR beach", "Warm water and fine sand with the skyline behind, before the heat builds."]),
    m("mall-aquarium", "🧸", "day", ["family"], 25.1975, 55.2796, ["Aquário do Dubai Mall", "O tanque gigante vê-se de graça do corredor do centro comercial; o túnel é pago."], ["Dubai Mall Aquarium", "The giant tank is free to see from the mall corridor; the tunnel is paid."])
  ],
  auh: [
    m("mosque-dusk", "🌅", "sunset", ["photo", "history"], 24.4128, 54.4750, ["A Grande Mesquita ao anoitecer", "O mármore branco muda de cor com a luz e os espelhos de água refletem as cúpulas. Reserve a entrada gratuita."], ["The Grand Mosque at dusk", "The white marble changes colour with the light and the pools reflect the domes. Book the free entry."]),
    m("corniche-bike", "🚲", "morning", ["sport", "nature"], 24.4780, 54.3330, ["Corniche de bicicleta", "Bicicletas partilhadas ao longo de 8 km de praia e jardins, de manhã cedo."], ["Corniche by bike", "Shared bikes along 8 km of beach and gardens, early in the morning."]),
    m("mangroves", "🛶", "morning", ["nature", "photo"], 24.4500, 54.4000, ["Caiaque nos mangais", "Remar entre mangais no Parque Nacional de Eastern Mangroves, com garças e caranguejos."], ["Kayak the mangroves", "Paddle through the mangroves of Eastern Mangroves National Park, with herons and crabs."]),
    m("louvre-light", "🎨", "day", ["art", "photo"], 24.5337, 54.3983, ["Chuva de luz no Louvre", "A luz que passa pela cúpula rendada e o mar à volta das galerias."], ["Rain of light at the Louvre", "Sunlight filtering through the lace dome and the sea around the galleries."]),
    m("mina-market", "🧺", "morning", ["food", "shopping"], 24.5230, 54.3800, ["Mercado do peixe de Mina Zayed", "Peixe do Golfo, tâmaras e especiarias; escolha o peixe e grelham-no ali."], ["Mina Zayed fish market", "Gulf fish, dates and spices; pick a fish and they'll grill it on the spot."]),
    m("yas", "🎢", "day", ["family", "sport"], 24.4840, 54.6070, ["Yas Island", "Ferrari World, Warner Bros. World e o circuito de F1, perto do aeroporto."], ["Yas Island", "Ferrari World, Warner Bros. World and the F1 circuit, close to the airport."])
  ],
  doh: [
    m("souq-night", "🌙", "night", ["food", "shopping", "night"], 25.2867, 51.5330, ["Noite no Souq Waqif", "Esplanadas com shisha, grelhados e o mercado dos falcões iluminado."], ["Evening at Souq Waqif", "Shisha terraces, grills and the lit-up falcon market."]),
    m("mia-sunset", "🌅", "sunset", ["photo"], 25.2955, 51.5390, ["Pôr do sol no MIA Park", "As torres de West Bay acendem-se do outro lado da baía."], ["Sunset at MIA Park", "West Bay's towers light up across the bay."]),
    m("dhow", "⛵", "sunset", ["photo", "history"], 25.2960, 51.5300, ["Passeio de dhow", "Uma volta de barco de madeira pela baía de Doha, com os barqueiros da Corniche."], ["Dhow cruise", "A wooden boat ride around Doha Bay with the Corniche boatmen."]),
    m("karak", "☕", "day", ["food"], 25.2867, 51.5330, ["Karak e chapati", "Chá com leite e especiarias, a bebida da cidade, com pão chapati quente."], ["Karak and chapati", "Spiced milky tea, the city's drink, with hot chapati bread."]),
    m("katara-beach", "🏖", "morning", ["nature", "family"], 25.3600, 51.5260, ["Praia de Katara", "Praia calma no bairro cultural, com desportos náuticos."], ["Katara beach", "A calm beach in the cultural village, with water sports."]),
    m("3-2-1", "⚽", "day", ["sport", "family"], 25.2620, 51.4500, ["Museu Olímpico 3-2-1", "Museu interativo do desporto junto ao Estádio Internacional Khalifa."], ["3-2-1 Olympic Museum", "An interactive sports museum next to Khalifa International Stadium."])
  ],
  ruh: [
    m("bujairi-night", "🌙", "night", ["food", "history", "night"], 24.7360, 46.5770, ["Jantar em Bujairi Terrace", "Restaurantes com vista para as ruínas iluminadas de At-Turaif."], ["Dinner at Bujairi Terrace", "Restaurants overlooking the floodlit ruins of At-Turaif."]),
    m("skybridge", "🌅", "sunset", ["photo"], 24.7113, 46.6744, ["Pôr do sol na Sky Bridge", "A 300 m de altura, a cidade inteira a ficar dourada."], ["Sunset on the Sky Bridge", "300 m up, the whole city turning gold."]),
    m("wadi-hanifah", "🌴", "sunset", ["nature", "sport"], 24.6600, 46.6000, ["Wadi Hanifah", "O vale verde que atravessa a cidade, com trilhos, palmeiras e lagos, perto de Diriyah."], ["Wadi Hanifah", "The green valley crossing the city, with trails, palm trees and lakes, near Diriyah."]),
    m("souq-zal", "🧺", "day", ["shopping", "history"], 24.6310, 46.7160, ["Souq Al Zal", "Tapetes, bisht, incenso e antiguidades; leilões ao fim da tarde."], ["Souq Al Zal", "Rugs, bisht cloaks, incense and antiques; auctions in the late afternoon."]),
    m("kabsa", "🍛", "day", ["food"], 24.6900, 46.6850, ["Kabsa e café árabe", "O prato nacional de arroz com especiarias e carne, e café com cardamomo e tâmaras."], ["Kabsa and Arabic coffee", "The national dish of spiced rice and meat, with cardamom coffee and dates."]),
    m("boulevard", "🎡", "night", ["family", "night", "music"], 24.7700, 46.6000, ["Boulevard City", "Zona de espetáculos, restaurantes e luzes, cheia na época da Riyadh Season."], ["Boulevard City", "Shows, restaurants and lights, packed during Riyadh Season."])
  ],
  jed: [
    m("balad-night", "🌙", "night", ["history", "photo"], 21.4847, 39.1870, ["Al-Balad à noite", "As casas de coral iluminadas e os cafés de rua quando o calor baixa."], ["Al-Balad at night", "Floodlit coral houses and street cafés once the heat drops."]),
    m("fountain-night", "⛲", "night", ["photo", "family"], 21.5133, 39.1530, ["Fonte do Rei Fahd", "O jato mais alto do mundo, iluminado sobre o Mar Vermelho."], ["King Fahd's Fountain", "The world's tallest jet, lit up over the Red Sea."]),
    m("redsea-sunset", "🌅", "sunset", ["photo", "nature"], 21.5536, 39.1313, ["Pôr do sol na mesquita flutuante", "O sol a cair no Mar Vermelho atrás da mesquita Al Rahma."], ["Sunset at the floating mosque", "The sun dropping into the Red Sea behind Al Rahma Mosque."]),
    m("fish-market", "🐟", "morning", ["food"], 21.4900, 39.1700, ["Mercado do peixe", "O Bangala: peixe do Mar Vermelho de manhã cedo, com restaurantes que o grelham."], ["Fish market", "The Bangala: Red Sea fish early in the morning, with restaurants that grill it."]),
    m("snorkel", "🤿", "morning", ["nature", "sport"], 21.7500, 39.0900, ["Recife no Mar Vermelho", "Corais e peixes a poucos metros da costa norte, em clubes de praia."], ["Red Sea reef", "Coral and fish a few metres off the north coast, at beach clubs."]),
    m("art-promenade", "🎨", "day", ["art"], 21.5200, 39.1500, ["Esculturas da Corniche", "Obras de Henry Moore, Joan Miró e outros, ao ar livre ao longo do mar."], ["Corniche sculptures", "Works by Henry Moore, Joan Miró and others, outdoors along the sea."])
  ],
  cai: [
    m("pyramids-sunrise", "☀️", "morning", ["photo", "history"], 29.9792, 31.1342, ["Pirâmides à abertura", "Chegue às 7h: menos calor, menos gente e a melhor luz no planalto."], ["Pyramids at opening time", "Arrive at 7 am: less heat, fewer people and the best light on the plateau."]),
    m("nile-felucca", "⛵", "sunset", ["photo", "nature"], 30.0400, 31.2280, ["Felucca no Nilo", "Uma hora de barco à vela ao pôr do sol, a partir da Corniche. Combine o preço antes."], ["Felucca on the Nile", "An hour on a sailing boat at sunset from the Corniche. Agree the price first."]),
    m("fishawy", "☕", "night", ["food", "history", "night"], 30.0477, 31.2623, ["Chá no El Fishawy", "O café aberto há mais de 200 anos no Khan el-Khalili: chá de menta e karkadé."], ["Tea at El Fishawy", "The café open for over 200 years in Khan el-Khalili: mint tea and karkadé."]),
    m("koshari", "🍲", "day", ["food"], 30.0500, 31.2400, ["Koshari na baixa", "Arroz, lentilhas, massa e molho de tomate picante: o prato de rua do Cairo."], ["Koshari downtown", "Rice, lentils, pasta and spicy tomato sauce: Cairo's street dish."]),
    m("azhar-park", "🌳", "sunset", ["nature", "family", "photo"], 30.0400, 31.2650, ["Parque Al-Azhar", "Jardins no alto, com vista para os minaretes e a Cidadela ao pôr do sol."], ["Al-Azhar Park", "Hilltop gardens with views of the minarets and the Citadel at sunset."]),
    m("tanoura", "💃", "night", ["music", "art"], 30.0460, 31.2620, ["Espetáculo de tanoura", "Dança sufi rodopiante no Palácio de Al-Ghouri (algumas noites por semana)."], ["Tanoura show", "Whirling Sufi dance at Al-Ghouri Palace (some evenings each week)."])
  ],
  amm: [
    m("citadel-sunset", "🌅", "sunset", ["photo", "history"], 31.9547, 35.9343, ["Pôr do sol na Cidadela", "A cidade branca a ficar rosada e o chamamento para a oração a ecoar pelas colinas."], ["Sunset at the Citadel", "The white city turning pink and the call to prayer echoing across the hills."]),
    m("hashem", "🧆", "day", ["food"], 31.9520, 35.9330, ["Falafel no Hashem", "O restaurante de rua mais famoso da baixa: falafel, homus e chá de menta."], ["Falafel at Hashem", "Downtown's most famous street restaurant: falafel, hummus and mint tea."]),
    m("knafeh", "🍰", "night", ["food", "night"], 31.9515, 35.9335, ["Knafeh na Habibah", "Doce quente de queijo e calda, comido de pé na rua."], ["Knafeh at Habibah", "Hot cheese-and-syrup pastry, eaten standing in the street."]),
    m("rainbow-night", "🌙", "night", ["night", "music"], 31.9497, 35.9245, ["Noite na Rainbow Street", "Terraços, cafés e música nos telhados de Jabal Amman."], ["Evening on Rainbow Street", "Terraces, cafés and rooftop music in Jabal Amman."]),
    m("weibdeh", "🎨", "day", ["art", "history"], 31.9590, 35.9270, ["Jabal al-Weibdeh e Darat al Funun", "O bairro dos artistas: casas antigas de pedra, galerias e cafés com vista para a Cidadela."], ["Jabal al-Weibdeh and Darat al Funun", "The artists' quarter: old stone houses, galleries and cafés facing the Citadel."]),
    m("souk-jara", "🧺", "weekend", ["shopping", "art"], 31.9495, 35.9255, ["Souk Jara (verão, sexta)", "Mercado de artesanato e comida de rua em Jabal Amman às sextas-feiras."], ["Souk Jara (summer Fridays)", "A craft and street-food market in Jabal Amman on Fridays."])
  ],
  mct: [
    m("mutrah-sunset", "🌅", "sunset", ["photo"], 23.6158, 58.5636, ["Pôr do sol na Corniche de Mutrah", "Os barcos, as montanhas escuras e o incenso no ar quando o souk reabre."], ["Sunset on Mutrah Corniche", "The boats, the dark mountains and incense in the air as the souk reopens."]),
    m("frankincense", "🪔", "day", ["shopping", "history"], 23.6158, 58.5636, ["Incenso no souk", "Resina de olíbano de Dhofar, queimadores e prata omani no souk coberto."], ["Frankincense in the souk", "Dhofar frankincense resin, burners and Omani silver in the covered souk."]),
    m("halwa", "🍬", "day", ["food"], 23.6150, 58.5640, ["Halwa omani e kahwa", "O doce de açafrão e água de rosas com café de cardamomo: a hospitalidade omani."], ["Omani halwa and kahwa", "The saffron and rosewater sweet with cardamom coffee: Omani hospitality."]),
    m("dolphins", "🐬", "morning", ["nature", "family"], 23.5900, 58.6100, ["Golfinhos ao amanhecer", "Barcos saem da marina de Mascate para ver golfinhos de manhã cedo."], ["Dolphins at dawn", "Boats leave Muscat marina early to watch dolphins."]),
    m("qurum-beach", "🏖", "morning", ["nature", "sport"], 23.6200, 58.4800, ["Praia de Qurum", "Areia larga e passeio, perto da ópera; ótimo de manhã ou ao fim da tarde."], ["Qurum beach", "A wide beach and promenade near the opera; great early or late in the day."]),
    m("riyam", "📸", "day", ["photo", "history"], 23.6140, 58.5850, ["Miradouro de Riyam", "O queimador de incenso gigante no alto e a vista sobre Mutrah e a baía."], ["Riyam viewpoint", "The giant incense burner on the hill and the view over Mutrah and the bay."])
  ],
  fra: [
    m("steg-sunset", "🌅", "sunset", ["photo"], 50.1087, 8.6834, ["Pôr do sol no Eiserner Steg", "Os arranha-céus de «Mainhattan» a acender as luzes sobre o rio Meno."], ["Sunset on the Eiserner Steg", "The «Mainhattan» skyline lighting up over the river Main."]),
    m("apfelwein", "🍏", "night", ["food", "night"], 50.1037, 8.6878, ["Noite de Apfelwein", "Mesas corridas em Alt-Sachsenhausen, com o jarro azul «Bembel» e Handkäs."], ["Apfelwein night", "Long tables in Alt-Sachsenhausen, with the blue «Bembel» jug and Handkäs."]),
    m("kleinmarkthalle", "🥨", "morning", ["food", "shopping"], 50.1129, 8.6837, ["Manhã na Kleinmarkthalle", "O mercado coberto: salsichas da Frau Schreiber, queijos e o terraço de vinhos."], ["Morning at the Kleinmarkthalle", "The covered market: Frau Schreiber's sausages, cheeses and the wine terrace."]),
    m("mainufer", "🚲", "day", ["nature", "sport"], 50.1035, 8.6800, ["Bicicleta à beira do Meno", "Margens largas e relvadas, com museus de um lado e skyline do outro."], ["Cycling the Main riverbanks", "Wide grassy banks, museums on one side and the skyline on the other."]),
    m("palmengarten", "🌿", "day", ["nature", "family"], 50.1225, 8.6566, ["Palmengarten", "Estufas tropicais e jardins centenários, a dez minutos do centro."], ["Palmengarten", "Tropical glasshouses and century-old gardens, ten minutes from the centre."])
  ],
  ber: [
    m("reichstag-dusk", "🌅", "sunset", ["photo", "history"], 52.5186, 13.3762, ["Pôr do sol na cúpula do Reichstag", "A rampa em espiral sobre o parlamento, com a cidade inteira à volta (reserva gratuita)."], ["Sunset in the Reichstag dome", "The spiral ramp above parliament, with the whole city around you (free booking)."]),
    m("mauerpark", "🎤", "weekend", ["music", "shopping"], 52.5435, 13.4024, ["Domingo no Mauerpark", "Mercado de pulgas e karaoke ao ar livre no anfiteatro, onde passava o Muro."], ["Sunday at Mauerpark", "Flea market and open-air karaoke in the amphitheatre where the Wall ran."]),
    m("tempelhof", "🪁", "day", ["nature", "sport", "family"], 52.4733, 13.4019, ["Pistas do Tempelhof", "Um aeroporto transformado em parque: pedalar ou andar de kite na pista."], ["Tempelhof runways", "An airport turned park: cycle or kite along the runway."]),
    m("kreuzberg-night", "🌙", "night", ["night", "food"], 52.4990, 13.4180, ["Noite em Kreuzberg", "Bares, döner e o canal Landwehr: a Berlim descontraída."], ["Evening in Kreuzberg", "Bars, döner and the Landwehr canal: laid-back Berlin."]),
    m("wall-memorial", "🧱", "day", ["history"], 52.5352, 13.3903, ["Memorial do Muro na Bernauer Straße", "O único troço com a «faixa da morte» conservada; gratuito e ao ar livre."], ["Berlin Wall Memorial, Bernauer Straße", "The only stretch with the «death strip» preserved; free and outdoors."])
  ],
  muc: [
    m("glockenspiel", "🔔", "day", ["music", "family"], 48.1374, 11.5755, ["Glockenspiel na Marienplatz", "Às 11h e 12h os bonecos dançam o Schäffler e encenam um torneio real."], ["Glockenspiel at Marienplatz", "At 11:00 and 12:00 the figures dance the coopers' dance and stage a royal joust."]),
    m("biergarten", "🍺", "day", ["food", "night"], 48.1527, 11.5920, ["Jardim de cerveja da Torre Chinesa", "Sete mil lugares à sombra dos castanheiros no Jardim Inglês; pode levar a sua comida."], ["Chinese Tower beer garden", "Seven thousand seats under the chestnut trees in the English Garden; you may bring your own food."]),
    m("eisbach", "🏄", "day", ["sport", "photo"], 48.1436, 11.588, ["Surfistas do Eisbach", "Surf em pleno centro da cidade, todo o ano, na onda do rio junto à Haus der Kunst."], ["Eisbach surfers", "Year-round surfing in the city centre, on the river wave by the Haus der Kunst."]),
    m("olympia-sunset", "🌅", "sunset", ["photo", "nature"], 48.1694, 11.5517, ["Pôr do sol na colina olímpica", "Vista sobre o parque e, em dias limpos, os Alpes no horizonte."], ["Sunset on Olympic Hill", "Views over the park and, on clear days, the Alps on the horizon."]),
    m("weisswurst", "🥨", "morning", ["food"], 48.1351, 11.5763, ["Pequeno-almoço bávaro", "Weißwurst, pretzel e cerveja de trigo antes do meio-dia, como manda a tradição."], ["Bavarian breakfast", "Weißwurst, pretzel and wheat beer before noon, as tradition demands."])
  ],
  vie: [
    m("kaffeehaus", "☕", "morning", ["food", "history"], 48.2104, 16.3655, ["Manhã num café vienense", "Melange e jornais num Kaffeehaus, Património Imaterial da UNESCO (Café Central, Hawelka)."], ["Morning in a Viennese café", "A melange and newspapers in a Kaffeehaus, UNESCO intangible heritage (Café Central, Hawelka)."]),
    m("oper-standing", "🎻", "night", ["music"], 48.2038, 16.3688, ["Ópera de pé", "Lugares de pé na Ópera Estatal vendidos no próprio dia por poucos euros."], ["Standing at the opera", "Standing places at the State Opera sold on the day for a few euros."]),
    m("prater", "🎡", "day", ["family", "photo"], 48.2166, 16.3958, ["Roda Gigante do Prater", "A roda de 1897, com vista sobre a cidade e o parque de diversões."], ["Prater Giant Wheel", "The 1897 wheel, with views over the city and the funfair."]),
    m("gloriette", "🌅", "sunset", ["photo", "nature"], 48.1784, 16.3088, ["Pôr do sol na Gloriette", "Do alto dos jardins de Schönbrunn, a cidade a dourar."], ["Sunset at the Gloriette", "From the top of the Schönbrunn gardens, the city turning gold."]),
    m("heuriger", "🍷", "night", ["food", "night"], 48.2580, 16.3420, ["Heuriger em Grinzing", "Tabernas de vinho novo nas vinhas dentro da cidade, com petiscos e música."], ["Heuriger in Grinzing", "New-wine taverns among the city's own vineyards, with snacks and music."])
  ],
  prg: [
    m("bridge-dawn", "☀️", "morning", ["photo", "history"], 50.0865, 14.4114, ["Ponte Carlos ao nascer do sol", "Às 7h a ponte é sua: estátuas, névoa e o castelo ao fundo."], ["Charles Bridge at sunrise", "At 7am the bridge is yours: statues, mist and the castle beyond."]),
    m("letna", "🍺", "sunset", ["photo", "food"], 50.0952, 14.4183, ["Pôr do sol em Letná", "O jardim de cerveja com vista para as pontes do Vltava."], ["Sunset at Letná", "The beer garden overlooking the bridges of the Vltava."]),
    m("orloj", "⏰", "day", ["history", "family"], 50.087, 14.4208, ["Relógio Astronómico à hora certa", "Os apóstolos desfilam e a Morte toca o sino, de hora a hora até às 23h."], ["Astronomical Clock on the hour", "The apostles parade and Death rings the bell, hourly until 23:00."]),
    m("petrin", "🚠", "day", ["nature", "family"], 50.0835, 14.3951, ["Funicular e colina de Petřín", "Jardins, o labirinto de espelhos e uma mini Torre Eiffel."], ["Petřín funicular and hill", "Gardens, the mirror maze and a mini Eiffel Tower."]),
    m("pivo", "🍻", "night", ["food", "night"], 50.0818, 14.4185, ["Cervejaria tradicional", "Pilsner de pressão e pratos checos em salas de 500 anos (U Fleků, U Medvídků)."], ["Traditional beer hall", "Draught Pilsner and Czech dishes in 500-year-old halls (U Fleků, U Medvídků)."])
  ],
  sin: [
    m("rhapsody", "✨", "night", ["photo", "music", "family"], 1.2816, 103.8636, ["Garden Rhapsody", "As Supertrees acendem-se ao som de música às 19h45 e 20h45. Grátis; deite-se no chão para ver."], ["Garden Rhapsody", "The Supertrees light up to music at 19:45 and 20:45. Free; lie on the ground to watch."]),
    m("spectra", "💦", "night", ["photo", "music"], 1.2839, 103.8590, ["Spectra na baía", "Espetáculo de água e luz em frente ao Marina Bay Sands, gratuito, às 20h e 21h."], ["Spectra on the bay", "Free water-and-light show in front of Marina Bay Sands at 20:00 and 21:00."]),
    m("hawker", "🍜", "day", ["food"], 1.2803, 103.8448, ["Almoço num hawker centre", "Comida com estrela Michelin por 5 dólares; marque a mesa com um pacote de lenços, como os locais."], ["Lunch at a hawker centre", "Michelin-listed food for 5 dollars; reserve your table with a tissue packet, like locals."]),
    m("jewel", "🌧", "day", ["photo", "family"], 1.3602, 103.9898, ["Rain Vortex da Jewel", "A maior cascata interior do mundo, no aeroporto; de noite tem espetáculo de luz."], ["Jewel's Rain Vortex", "The world's tallest indoor waterfall, at the airport; light shows at night."]),
    m("haji-lane", "🎨", "day", ["art", "shopping"], 1.3007, 103.8588, ["Murais da Haji Lane", "A ruela mais colorida, com lojas independentes e cafés."], ["Haji Lane murals", "The most colourful lane, with indie shops and cafés."])
  ],
  nyc: [
    m("ny-ferry", "⛴", "sunset", ["photo", "budget"], 40.7014, -74.0132, ["Ferry de Staten Island ao pôr do sol", "Gratuito, 25 minutos para cada lado, a passar ao lado da Estátua da Liberdade."], ["Staten Island Ferry at sunset", "Free, 25 minutes each way, sailing right past the Statue of Liberty."]),
    m("ny-jazz", "🎷", "night", ["music", "night"], 40.7359, -74.0011, ["Jazz no Village", "Clubes míticos como o Village Vanguard e o Smalls, com sessões até de madrugada."], ["Jazz in the Village", "Legendary clubs like the Village Vanguard and Smalls, with sets until the small hours."]),
    m("ny-pizza", "🍕", "day", ["food", "budget"], 40.7302, -73.9893, ["Fatia de pizza nova-iorquina", "Uma fatia dobrada ao meio, comida de pé, por poucos dólares."], ["A New York slice", "A slice folded in half and eaten standing up, for a few dollars."]),
    m("ny-broadway", "🎭", "night", ["music", "art"], 40.759, -73.9845, ["Um musical na Broadway", "Bilhetes do próprio dia com desconto na TKTS ou nas lotarias digitais dos teatros."], ["A Broadway musical", "Same-day discount tickets at TKTS or the theatres' digital lotteries."]),
    m("ny-dumbo", "📷", "morning", ["photo", "architecture"], 40.7033, -73.9881, ["Manhattan Bridge vista de DUMBO", "A fotografia clássica na Washington Street, cedo, antes da multidão."], ["Manhattan Bridge from DUMBO", "The classic photo on Washington Street, early, before the crowds."]),
    m("ny-met", "🏛", "day", ["art", "history"], 40.7794, -73.9632, ["Metropolitan Museum", "Do Egito aos impressionistas; o terraço do telhado abre de abril a outubro."], ["The Met", "From Egypt to the Impressionists; the roof garden opens April to October."])
  ],
  was: [
    m("dc-monuments-night", "🌙", "night", ["photo", "history"], 38.8893, -77.0502, ["Monumentos à noite", "O Lincoln e o Jefferson iluminados, sem multidões e com o Potomac ao lado."], ["Monuments by night", "The Lincoln and Jefferson memorials lit up, without crowds and beside the Potomac."]),
    m("dc-cherry", "🌸", "morning", ["nature", "photo"], 38.8814, -77.0365, ["Cerejeiras do Tidal Basin", "No fim de março e início de abril, as cerejeiras oferecidas pelo Japão florescem à volta do lago."], ["Tidal Basin cherry blossoms", "In late March and early April, the cherry trees gifted by Japan bloom around the basin."]),
    m("dc-airspace", "🚀", "day", ["family", "history"], 38.8882, -77.0199, ["Museu do Ar e do Espaço", "O avião dos irmãos Wright e a cápsula da Apollo 11. Gratuito, com bilhete por hora."], ["Air and Space Museum", "The Wright brothers' plane and the Apollo 11 capsule. Free, with a timed pass."]),
    m("dc-eastern", "🧺", "weekend", ["food", "shopping"], 38.8865, -76.9963, ["Eastern Market ao fim de semana", "O mercado de 1873 em Capitol Hill, com bancas de artesãos e panquecas de mirtilo."], ["Eastern Market at the weekend", "The 1873 market on Capitol Hill, with craft stalls and blueberry pancakes."]),
    m("dc-wharf", "⛵", "sunset", ["food", "night"], 38.8798, -77.0247, ["The Wharf", "O cais renovado com restaurantes de marisco, música ao vivo e o mercado de peixe mais antigo dos EUA."], ["The Wharf", "The revamped waterfront with seafood restaurants, live music and the oldest fish market in the US."])
  ],
  sfo: [
    m("sf-cablecar", "🚋", "morning", ["history", "photo"], 37.7849, -122.4078, ["Cable car da Powell-Hyde", "Viaje de pé no estribo pelas colinas até à baía; apanhe-o cedo para evitar a fila."], ["Powell-Hyde cable car", "Ride on the running board over the hills to the bay; catch it early to skip the queue."]),
    m("sf-crissy", "🌅", "sunset", ["nature", "photo"], 37.8039, -122.4655, ["Crissy Field ao pôr do sol", "A praia com a Golden Gate de um lado e Alcatraz do outro."], ["Crissy Field at sunset", "The beach with the Golden Gate on one side and Alcatraz on the other."]),
    m("sf-mission", "🌯", "day", ["food", "art"], 37.7599, -122.4148, ["Burrito e murais em Mission", "O burrito à San Francisco e os murais da Balmy Alley."], ["Burrito and murals in the Mission", "The Mission-style burrito and the murals of Balmy Alley."]),
    m("sf-coit", "🗼", "day", ["photo", "art"], 37.8024, -122.4058, ["Coit Tower e escadas de Filbert", "Murais dos anos 30 na torre e a descida pelas escadas entre jardins."], ["Coit Tower and the Filbert Steps", "1930s murals in the tower and the walk down the garden-lined steps."]),
    m("sf-painted", "🏠", "day", ["architecture", "photo"], 37.7762, -122.4328, ["Painted Ladies", "As casas vitorianas coloridas diante do horizonte da cidade, no Alamo Square."], ["Painted Ladies", "The colourful Victorian houses against the skyline, at Alamo Square."])
  ],
  chi: [
    m("chi-boat", "🛥", "day", ["architecture", "history"], 41.8881, -87.6237, ["Passeio de barco de arquitetura", "90 minutos no rio entre arranha-céus, com guias da Chicago Architecture Center."], ["Architecture boat tour", "90 minutes on the river among skyscrapers, with Chicago Architecture Center guides."]),
    m("chi-blues", "🎸", "night", ["music", "night"], 41.8768, -87.6266, ["Blues ao vivo", "Clubes como o Buddy Guy's Legends e o Kingston Mines, todas as noites."], ["Live blues", "Clubs like Buddy Guy's Legends and Kingston Mines, every night."]),
    m("chi-deepdish", "🍕", "day", ["food"], 41.8925, -87.6268, ["Pizza deep-dish", "A pizza de massa alta da cidade; conte com 40 minutos de forno."], ["Deep-dish pizza", "The city's thick-crust pizza; allow 40 minutes in the oven."]),
    m("chi-lakefront", "🚲", "morning", ["nature", "sport"], 41.9002, -87.6197, ["Lakefront Trail", "Ciclovia e passeio de 29 km ao longo do lago Michigan, com praias urbanas."], ["Lakefront Trail", "An 18-mile path along Lake Michigan, with city beaches."]),
    m("chi-chinatown", "🥟", "day", ["food", "budget"], 41.8527, -87.6324, ["Chinatown e o Riverwalk do Ping Tom", "Dim sum e o parque junto ao rio, com táxi aquático de volta ao centro."], ["Chinatown and Ping Tom Park", "Dim sum and the riverside park, with a water taxi back downtown."])
  ],
  bos: [
    m("bos-freedom", "🧭", "morning", ["history"], 42.355, -71.0656, ["Freedom Trail completo", "Siga a linha de tijolos vermelhos: 4 km e 16 locais da Revolução."], ["The full Freedom Trail", "Follow the red-brick line: 2.5 miles and 16 sites of the Revolution."]),
    m("bos-fenway", "⚾", "night", ["sport", "family"], 42.3467, -71.0972, ["Jogo no Fenway Park", "O estádio de basebol mais antigo da liga, com o muro verde «Green Monster»."], ["A game at Fenway Park", "The league's oldest ballpark, with the «Green Monster» wall."]),
    m("bos-lobster", "🦞", "day", ["food"], 42.3633, -71.0526, ["Lobster roll e ostras", "No North End e nos restaurantes do porto; a sopa de amêijoa aquece no inverno."], ["Lobster rolls and oysters", "In the North End and harbour restaurants; clam chowder warms you in winter."]),
    m("bos-harbor", "🌅", "sunset", ["photo", "nature"], 42.3542, -71.0446, ["Harborwalk ao pôr do sol", "O passeio à beira do porto entre o Seaport e o aquário."], ["Harborwalk at sunset", "The waterfront walk between the Seaport and the aquarium."]),
    m("bos-library", "📚", "day", ["architecture", "art", "budget"], 42.3493, -71.0782, ["Biblioteca Pública de Boston", "A sala de leitura Bates Hall e o pátio renascentista, gratuitos."], ["Boston Public Library", "The Bates Hall reading room and the Renaissance courtyard, free."])
  ],
  mia: [
    m("mia-sunrise", "🌅", "morning", ["beach", "photo"], 25.7802, -80.1306, ["Nascer do sol em South Beach", "O sol nasce sobre o Atlântico; a praia ainda é dos corredores e das gaivotas."], ["Sunrise on South Beach", "The sun rises over the Atlantic; the beach still belongs to joggers and gulls."]),
    m("mia-cuban", "☕", "day", ["food", "music"], 25.7655, -80.2192, ["Café cubano na Calle Ocho", "Cafecito na janela de um café da Little Havana e dominó no Parque Máximo Gómez."], ["Cuban coffee on Calle Ocho", "A cafecito at a Little Havana coffee window and dominoes at Máximo Gómez Park."]),
    m("mia-deco-night", "🌙", "night", ["night", "architecture"], 25.7815, -80.1305, ["Néon Art Déco à noite", "Ocean Drive acende-se em néon; passeie, mas confirme os preços antes de se sentar."], ["Art Deco neon by night", "Ocean Drive lights up in neon; stroll, but check prices before sitting down."]),
    m("mia-vizcaya", "🏛", "day", ["history", "architecture"], 25.7444, -80.2105, ["Vizcaya", "Uma villa italiana de 1916 com jardins sobre a baía de Biscayne."], ["Vizcaya", "A 1916 Italianate villa with gardens on Biscayne Bay."]),
    m("mia-kayak", "🛶", "day", ["nature", "adventure"], 25.7701, -80.1351, ["Caiaque ou paddle na baía", "Saídas de South Pointe com água calma e, às vezes, manatins."], ["Kayak or paddleboard on the bay", "Trips from South Pointe on calm water and, sometimes, manatees."])
  ],
  lax: [
    m("lax-griffith-sunset", "🌅", "sunset", ["photo", "nature"], 34.1184, -118.3004, ["Pôr do sol no Observatório Griffith", "A cidade acende-se até ao mar; fique para os telescópios públicos gratuitos."], ["Sunset at Griffith Observatory", "The city lights up all the way to the sea; stay for the free public telescopes."]),
    m("lax-tacos", "🌮", "night", ["food", "budget"], 34.0407, -118.2468, ["Tacos de rua em Downtown", "Bancas de tacos al pastor e de birria abrem ao fim da tarde perto do Fashion District."], ["Street tacos downtown", "Al pastor and birria stands open in the evening near the Fashion District."]),
    m("lax-venice", "🛹", "day", ["beach", "sport", "art"], 33.985, -118.4725, ["Venice Beach e o skate park", "Murais, ginásio ao ar livre de Muscle Beach e skaters à beira-mar."], ["Venice Beach and the skate park", "Murals, the Muscle Beach outdoor gym and skaters by the sea."]),
    m("lax-hollywood-bowl", "🎵", "night", ["music"], 34.1122, -118.3391, ["Concerto no Hollywood Bowl", "O anfiteatro ao ar livre de 1922; leve piquenique, de junho a setembro."], ["A concert at the Hollywood Bowl", "The 1922 open-air amphitheatre; bring a picnic, June to September."]),
    m("lax-getty", "🏛", "day", ["art", "architecture"], 34.078, -118.4741, ["Getty Center", "Arte europeia, jardins e vista do Pacífico; entrada gratuita, estacionamento pago."], ["The Getty Center", "European art, gardens and Pacific views; free entry, paid parking."])
  ],
  las: [
    m("las-fountains-night", "🌙", "night", ["night", "music", "photo"], 36.1126, -115.1767, ["Fontes do Bellagio à noite", "O espetáculo é a cada 15 minutos depois das 20h; veja da ponte pedonal."], ["Bellagio fountains at night", "Shows run every 15 minutes after 8 pm; watch from the footbridge."]),
    m("las-neon", "💡", "night", ["history", "photo"], 36.1771, -115.1353, ["Neon Museum", "O cemitério dos letreiros antigos de Las Vegas, aceso à noite (visita paga com hora)."], ["The Neon Museum", "The boneyard of old Las Vegas signs, lit at night (paid timed tour)."]),
    m("las-redrock", "🏜", "morning", ["nature", "adventure"], 36.1357, -115.4277, ["Red Rock Canyon de manhã", "Rochas vermelhas a 30 minutos da Strip; vá cedo e leve muita água."], ["Red Rock Canyon in the morning", "Red rocks 30 minutes from the Strip; go early and carry plenty of water."]),
    m("las-buffet", "🍽", "day", ["food"], 36.1162, -115.1745, ["Um buffet de Las Vegas", "Os buffets dos grandes casinos são uma instituição; ao almoço é mais barato."], ["A Las Vegas buffet", "The big casino buffets are an institution; lunch is cheaper."]),
    m("las-show", "🎭", "night", ["music", "night"], 36.1212, -115.1697, ["Um espetáculo na Strip", "Cirque du Soleil, magia ou concertos na Sphere; bilhetes com desconto no próprio dia."], ["A show on the Strip", "Cirque du Soleil, magic or concerts at the Sphere; same-day discount tickets."])
  ],
  msy: [
    m("msy-jazz", "🎺", "night", ["music", "night"], 29.964, -90.0577, ["Jazz ao vivo na Frenchmen", "Entre de clube em clube; muitos não cobram entrada, mas pedem uma bebida."], ["Live jazz on Frenchmen", "Hop from club to club; many charge no cover but expect a drink."]),
    m("msy-beignets", "☕", "morning", ["food", "cafe"], 29.9575, -90.0618, ["Beignets ao amanhecer", "Café du Monde abre cedo; antes das 8h não há fila."], ["Beignets at dawn", "Café du Monde opens early; before 8 am there's no queue."]),
    m("msy-steamboat", "🚢", "day", ["history", "music"], 29.9555, -90.0621, ["Barco a vapor no Mississippi", "O Natchez sai do cais com órgão a vapor e jazz a bordo."], ["Steamboat on the Mississippi", "The Natchez leaves the riverfront with a steam calliope and jazz on board."]),
    m("msy-po-boy", "🥖", "day", ["food", "budget"], 29.9622, -90.0544, ["Po'boy e gumbo", "Sandes de camarão frito e o guisado crioulo num bar de bairro."], ["Po'boy and gumbo", "Fried shrimp sandwiches and Creole stew at a neighbourhood joint."]),
    m("msy-second-line", "🎉", "weekend", ["music", "festival"], 29.9667, -90.0731, ["Second line de domingo", "Desfiles de bandas de metais pelos bairros, quase todos os domingos de setembro a junho."], ["Sunday second line", "Brass-band parades through the neighbourhoods, most Sundays from September to June."])
  ],
  mco: [
    m("mco-eola-sunset", "🌅", "sunset", ["photo", "nature"], 28.5434, -81.3727, ["Pôr do sol no Lago Eola", "A fonte acende-se em cores e o horizonte reflete-se no lago."], ["Sunset at Lake Eola", "The fountain lights up in colours and the skyline reflects on the lake."]),
    m("mco-farmers", "🧺", "weekend", ["food", "shopping"], 28.5434, -81.3727, ["Mercado de domingo no Lago Eola", "Produtores, comida de rua e música todos os domingos de manhã."], ["Sunday market at Lake Eola", "Growers, street food and music every Sunday morning."]),
    m("mco-springs", "🐢", "day", ["nature", "family"], 28.7106, -81.4581, ["Nascentes de Wekiwa", "Água a 22 °C todo o ano para nadar ou ir de caiaque entre tartarugas."], ["Wekiwa Springs", "Water at 72 °F all year to swim or kayak among turtles."]),
    m("mco-disney-fireworks", "🎆", "night", ["family", "night"], 28.37, -81.5194, ["Fogo de artifício visto de Disney Springs", "Do cais vê-se o fogo dos parques ao longe, sem bilhete."], ["Fireworks from Disney Springs", "From the waterfront you can see the parks' fireworks in the distance, no ticket needed."]),
    m("mco-gators", "🐊", "day", ["nature", "adventure"], 28.3608, -81.4073, ["Passeio de hidroplanador nos pântanos", "Aligátores e aves no lago Tohopekaliga, a sul da cidade (pago)."], ["Airboat ride in the swamps", "Alligators and birds on Lake Tohopekaliga, south of the city (paid)."])
  ],
  yyz: [
    m("yyz-islands", "⛴", "day", ["nature", "photo", "family"], 43.6214, -79.3789, ["Ferry para as Toronto Islands", "Dez minutos de barco para praias, bicicletas e a vista mais bonita do horizonte."], ["Ferry to the Toronto Islands", "Ten minutes by boat to beaches, bikes and the finest skyline view."]),
    m("yyz-peameal", "🥪", "morning", ["food"], 43.6487, -79.3716, ["Peameal bacon no St. Lawrence", "A sanduíche típica de Toronto, ao pequeno-almoço no mercado (terça a sábado)."], ["Peameal bacon at St. Lawrence", "Toronto's signature sandwich, for breakfast at the market (Tuesday to Saturday)."]),
    m("yyz-hockey", "🏒", "night", ["sport"], 43.6435, -79.3791, ["Hóquei no gelo com os Maple Leafs", "De outubro a abril; os bilhetes são caros, mas um bar à volta da arena também serve."], ["Ice hockey with the Maple Leafs", "October to April; tickets are pricey, but a bar near the arena works too."]),
    m("yyz-niagara", "💧", "day", ["nature", "adventure"], 43.0896, -79.0849, ["Cataratas do Niágara", "A 1h30 de comboio GO ou autocarro; o barco até às quedas é obrigatório."], ["Niagara Falls", "90 minutes by GO train or coach; the boat to the falls is a must."]),
    m("yyz-kensington-sunday", "🎨", "weekend", ["art", "music", "food"], 43.6545, -79.4005, ["Pedestrian Sundays em Kensington", "No último domingo do mês, de maio a outubro, as ruas fecham aos carros."], ["Pedestrian Sundays in Kensington", "On the last Sunday of the month, May to October, the streets close to cars."])
  ],
  mex: [
    m("mex-xochimilco", "🛶", "weekend", ["music", "nature", "food"], 19.2575, -99.1036, ["Trajineras em Xochimilco", "Barcos coloridos nos canais astecas com mariachis a bordo; melhor em grupo."], ["Trajineras in Xochimilco", "Colourful boats on Aztec canals with mariachis on board; best in a group."]),
    m("mex-mariachi", "🎺", "night", ["music", "night"], 19.4405, -99.1394, ["Mariachis na Praça Garibaldi", "Grupos de mariachi tocam por pedido ao fim da noite; vá e volte de táxi."], ["Mariachis at Plaza Garibaldi", "Mariachi bands play on request late into the night; go and return by taxi."]),
    m("mex-tacos", "🌮", "night", ["food", "budget"], 19.4334, -99.1402, ["Tacos al pastor", "O taco da cidade, do espeto com ananás; as taquerias enchem depois das 21h."], ["Tacos al pastor", "The city's taco, carved from the spit with pineapple; taquerías fill up after 9 pm."]),
    m("mex-frida", "🎨", "day", ["art", "history"], 19.3551, -99.1625, ["Casa Azul de Frida Kahlo", "A casa-museu em Coyoacán; os bilhetes esgotam, compre online com dias de avanço."], ["Frida Kahlo's Blue House", "The house museum in Coyoacán; tickets sell out, buy online days ahead."]),
    m("mex-teotihuacan", "🏛", "morning", ["history", "adventure"], 19.6925, -98.8438, ["Pirâmides de Teotihuacan", "A Pirâmide do Sol a uma hora da cidade; chegue à abertura, antes do calor."], ["The pyramids of Teotihuacan", "The Pyramid of the Sun an hour from the city; arrive at opening, before the heat."])
  ],
  rio: [
    m("rio-arpoador", "🌅", "sunset", ["photo", "beach"], -22.9886, -43.1915, ["Pôr do sol no Arpoador", "Os cariocas aplaudem o sol a desaparecer atrás do morro Dois Irmãos."], ["Sunset at Arpoador", "Locals applaud as the sun sinks behind the Dois Irmãos peaks."]),
    m("rio-samba", "🎵", "night", ["music", "night"], -22.9129, -43.1808, ["Samba na Lapa", "Rodas de samba ao vivo nas casas da Lapa; à sexta é a noite mais animada."], ["Samba in Lapa", "Live samba circles in Lapa's venues; Friday is the liveliest night."]),
    m("rio-maracana", "⚽", "night", ["sport"], -22.9122, -43.2302, ["Futebol no Maracanã", "Um jogo do Flamengo ou do Fluminense é uma festa; compre bilhetes oficiais."], ["Football at the Maracanã", "A Flamengo or Fluminense match is a party; buy official tickets."]),
    m("rio-santa-teresa", "🚋", "day", ["art", "history"], -22.9206, -43.1866, ["Bondinho de Santa Teresa", "O elétrico amarelo sobe aos Arcos até ao bairro dos artistas."], ["The Santa Teresa tram", "The yellow tram climbs over the Arches to the artists' quarter."]),
    m("rio-acai", "🥥", "day", ["food", "beach"], -22.9838, -43.2047, ["Açaí e água de coco em Ipanema", "Na areia ou num quiosque do calçadão, entre o posto 9 e o Leblon."], ["Açaí and coconut water in Ipanema", "On the sand or at a promenade kiosk, between Posto 9 and Leblon."])
  ],
  bue: [
    m("bue-milonga", "💃", "night", ["music", "night"], -34.5988, -58.4355, ["Uma milonga de tango", "Os bailes de tango começam tarde; há aulas para iniciantes antes, perto das 20h."], ["A tango milonga", "Tango dances start late; beginners' classes come first, around 8 pm."]),
    m("bue-asado", "🥩", "night", ["food"], -34.5885, -58.4302, ["Asado numa parrilla de Palermo", "Bife de chorizo, morcela e malbec; jantar antes das 21h é cedo demais."], ["Asado at a Palermo parrilla", "Bife de chorizo, blood sausage and malbec; dinner before 9 pm is too early."]),
    m("bue-feria", "🧺", "weekend", ["shopping", "music"], -34.6205, -58.3717, ["Feira de San Telmo ao domingo", "Antiguidades e artesanato pela rua Defensa, com tango improvisado na praça."], ["San Telmo fair on Sunday", "Antiques and crafts along Defensa street, with impromptu tango on the square."]),
    m("bue-ateneo", "📚", "day", ["art", "architecture"], -34.5959, -58.3943, ["Livraria El Ateneo Grand Splendid", "Um teatro de 1919 transformado numa das livrarias mais bonitas do mundo."], ["El Ateneo Grand Splendid", "A 1919 theatre turned into one of the world's most beautiful bookshops."]),
    m("bue-puerto-madero", "🌅", "sunset", ["photo", "architecture"], -34.6083, -58.3633, ["Pôr do sol em Puerto Madero", "A Puente de la Mujer de Calatrava e as docas de tijolo ao entardecer."], ["Sunset in Puerto Madero", "Calatrava's Puente de la Mujer and the brick docks at dusk."])
  ],
  rak: [
    m("rak-rooftop", "🌅", "sunset", ["photo", "food"], 31.6258, -7.9891, ["Pôr do sol num terraço sobre a Jemaa el-Fna", "Chá de hortelã enquanto o chamamento à oração ecoa e os grelhados se acendem lá em baixo."], ["Sunset on a rooftop over Jemaa el-Fna", "Mint tea as the call to prayer echoes and the grills light up below."]),
    m("rak-hammam", "🧖", "day", ["wellness"], 31.6295, -7.9878, ["Hammam tradicional", "Banho de vapor, sabão preto e esfoliação com luva kessa, num hammam de bairro ou de riad."], ["A traditional hammam", "Steam, black soap and a kessa-glove scrub, at a neighbourhood or riad hammam."]),
    m("rak-agafay", "🐪", "sunset", ["adventure", "nature"], 31.4533, -8.1789, ["Deserto de Agafay", "Pedras e dunas a 40 minutos da cidade, com o Atlas ao fundo e jantar sob as estrelas."], ["Agafay desert", "Stony dunes 40 minutes from the city, with the Atlas behind and dinner under the stars."]),
    m("rak-atlas", "⛰", "morning", ["nature", "adventure"], 31.1367, -7.9196, ["Dia no Alto Atlas (Imlil)", "Aldeias berberes, socalcos de nogueiras e caminhadas à sombra do Toubkal."], ["A day in the High Atlas (Imlil)", "Berber villages, walnut terraces and walks below Toubkal."]),
    m("rak-cooking", "🍲", "day", ["food"], 31.6318, -7.9862, ["Aula de cozinha marroquina", "Compre no souk e aprenda a fazer tajine, pão e saladas num riad."], ["Moroccan cooking class", "Shop in the souk and learn tagine, bread and salads in a riad."])
  ],
  cas: [
    m("cas-hassan-sunset", "🌅", "sunset", ["photo", "architecture"], 33.6086, -7.6326, ["Pôr do sol na Mesquita Hassan II", "O minarete fica dourado e o Atlântico bate na esplanada de mármore."], ["Sunset at the Hassan II Mosque", "The minaret turns gold as the Atlantic breaks against the marble esplanade."]),
    m("cas-ricks", "🎹", "night", ["music", "food", "night"], 33.6052, -7.6177, ["Rick's Café", "O bar inspirado no filme «Casablanca», com piano ao vivo, junto à medina."], ["Rick's Café", "The bar inspired by the film «Casablanca», with live piano, by the medina."]),
    m("cas-fish", "🐟", "day", ["food"], 33.5953, -7.6157, ["Peixe no Mercado Central", "Escolha o peixe nas bancas e coma-o grelhado nos restaurantes ao lado."], ["Fish at the Central Market", "Pick your fish at the stalls and eat it grilled next door."]),
    m("cas-pastries", "🍪", "morning", ["food", "cafe"], 33.5772, -7.604, ["Bolos marroquinos no Habous", "Cornos de gazela e chebakia na pastelaria Bennis, com chá de hortelã."], ["Moroccan pastries in the Habous", "Gazelle horns and chebakia at Bennis, with mint tea."]),
    m("cas-corniche-walk", "🌊", "sunset", ["beach", "sport"], 33.594, -7.672, ["Passeio na Corniche", "Corredores, surfistas e cafés de praia de Ain Diab ao entardecer."], ["A walk on the Corniche", "Joggers, surfers and Ain Diab's beach cafés at dusk."])
  ],
  cpt: [
    m("cpt-lionshead", "🌅", "sunset", ["nature", "adventure", "photo"], -33.9353, 18.3891, ["Pôr do sol no Lion's Head", "Subida de 1h30 com correntes no fim; desça com lanterna e em grupo."], ["Sunset on Lion's Head", "A 90-minute climb with chains near the top; come down with a torch and in a group."]),
    m("cpt-penguins", "🐧", "day", ["nature", "family"], -34.1972, 18.4515, ["Pinguins de Boulders Beach", "Uma colónia de pinguins-africanos numa praia de rochedos, em Simon's Town."], ["Penguins at Boulders Beach", "A colony of African penguins on a boulder beach in Simon's Town."]),
    m("cpt-capepoint", "🧭", "day", ["nature", "adventure"], -34.3568, 18.4975, ["Cabo da Boa Esperança", "O farol, as falésias e a estrada de Chapman's Peak a caminho."], ["Cape of Good Hope", "The lighthouse, the cliffs and the Chapman's Peak drive on the way."]),
    m("cpt-wine", "🍷", "day", ["wine", "food"], -34.0246, 18.4239, ["Vinho em Constantia", "As quintas mais antigas do hemisfério sul, a 20 minutos da cidade."], ["Wine in Constantia", "The southern hemisphere's oldest wine estates, 20 minutes from the city."]),
    m("cpt-noongun", "💥", "day", ["history", "photo"], -33.9139, 18.4097, ["O canhão do meio-dia em Signal Hill", "Todos os dias, exceto domingo, dispara-se o canhão das 12h como desde 1806."], ["The Noon Gun on Signal Hill", "Every day except Sunday the noon cannon fires, as it has since 1806."])
  ],
  zan: [
    m("zan-dhow", "⛵", "sunset", ["photo", "nature"], -6.1617, 39.188, ["Pôr do sol num dhow", "Um barco tradicional à vela ao largo de Stone Town, quando o sol cai no mar."], ["Sunset on a dhow", "A traditional sailing boat off Stone Town as the sun sinks into the sea."]),
    m("zan-nightmarket", "🍢", "night", ["food", "budget"], -6.1617, 39.188, ["Mercado noturno de Forodhani", "Espetadas de marisco, «pizza de Zanzibar» e sumo de cana com gengibre."], ["Forodhani night market", "Seafood skewers, «Zanzibar pizza» and ginger sugar-cane juice."]),
    m("zan-spice", "🌿", "morning", ["food", "nature"], -6.0833, 39.25, ["Passeio das especiarias", "Cravinho, canela, noz-moscada e baunilha nas plantações do interior da ilha."], ["Spice tour", "Cloves, cinnamon, nutmeg and vanilla in the island's inland plantations."]),
    m("zan-jozani", "🐒", "day", ["nature", "family"], -6.2519, 39.4089, ["Floresta de Jozani", "O único lugar do mundo com o macaco-colobo-vermelho de Zanzibar."], ["Jozani Forest", "The only place in the world with the Zanzibar red colobus monkey."]),
    m("zan-taarab", "🎵", "night", ["music"], -6.1627, 39.1886, ["Música taarab", "A música swahili de cordas e poesia, em concertos no Forte Antigo e no Dhow Countries Music Academy."], ["Taarab music", "Swahili music of strings and poetry, in concerts at the Old Fort and the Dhow Countries Music Academy."])
  ],
  tun: [
    m("tun-nattes", "🌅", "sunset", ["photo", "cafe"], 36.8706, 10.3424, ["Chá de pinhões no Café des Nattes", "No alto de Sidi Bou Said, sobre os telhados brancos e o golfo de Tunes."], ["Pine-nut tea at Café des Nattes", "Atop Sidi Bou Said, over the white rooftops and the Gulf of Tunis."]),
    m("tun-carthage", "🏛", "day", ["history"], 36.8528, 10.3233, ["Ruínas de Cartago", "As termas de Antonino à beira-mar e a colina de Byrsa, onde Roma destruiu Cartago."], ["The ruins of Carthage", "The seaside Antonine Baths and Byrsa Hill, where Rome destroyed Carthage."]),
    m("tun-cafe-medina", "☕", "day", ["cafe", "history"], 36.7985, 10.1712, ["Café na medina", "Um café turco ou chá num café tradicional sob as abóbadas, com narguilés à volta."], ["Coffee in the medina", "A Turkish coffee or tea in a vaulted traditional café, with water pipes all around."]),
    m("tun-marsa", "🏖", "weekend", ["beach", "food"], 36.8781, 10.3247, ["Praia e brik em La Marsa", "A praia dos tunisinos ao fim de semana, com brik e sorvetes na marginal."], ["Beach and brik in La Marsa", "Where Tunisians go to the beach at weekends, with brik and ice cream on the seafront."]),
    m("tun-malouf", "🎵", "night", ["music"], 36.7998, 10.1806, ["Malouf ao vivo", "A música arábico-andaluza tunisina em casas da medina e no Teatro Municipal."], ["Live malouf", "Tunisian Arab-Andalusian music in medina houses and at the Municipal Theatre."])
  ],
  add: [
    m("add-coffee", "☕", "day", ["food", "cafe"], 9.0349, 38.7509, ["Cerimónia do café", "Grãos torrados à sua frente, incenso e três rondas de café servidas numa jebena."], ["The coffee ceremony", "Beans roasted in front of you, incense and three rounds of coffee from a jebena."]),
    m("add-dance", "💃", "night", ["music", "food", "night"], 8.9946, 38.7889, ["Jantar com danças tradicionais", "Injera, tibs e o «eskista», a dança dos ombros, num restaurante cultural."], ["Dinner with traditional dance", "Injera, tibs and «eskista», the shoulder dance, at a cultural restaurant."]),
    m("add-entoto-hike", "🌲", "morning", ["nature", "sport"], 9.0822, 38.7649, ["Caminhada em Entoto", "Ar fresco a 3.000 metros, eucaliptos e os corredores de fundo a treinar ao amanhecer."], ["A walk on Entoto", "Fresh air at 3,000 metres, eucalyptus and long-distance runners training at dawn."]),
    m("add-meskel", "🎉", "day", ["festival", "history"], 9.0105, 38.7613, ["Meskel e Timkat", "As grandes festas ortodoxas: a fogueira de Meskel em setembro e a Epifania de Timkat em janeiro."], ["Meskel and Timkat", "The great Orthodox festivals: the Meskel bonfire in September and Timkat Epiphany in January."]),
    m("add-jazz", "🎷", "night", ["music"], 9.0105, 38.7613, ["Ethio-jazz ao vivo", "O som de Mulatu Astatke em clubes de jazz da cidade, ao fim de semana."], ["Live Ethio-jazz", "The sound of Mulatu Astatke in the city's jazz clubs at weekends."])
  ],
  nbo: [
    m("nbo-safari", "🦁", "morning", ["nature", "adventure"], -1.3733, 36.8589, ["Safari no Parque Nacional de Nairobi", "Leões, girafas e rinocerontes com os arranha-céus ao fundo; saia às 6h."], ["Safari in Nairobi National Park", "Lions, giraffes and rhinos with skyscrapers in the background; leave at 6 am."]),
    m("nbo-nyamachoma", "🍖", "night", ["food"], -1.2921, 36.8219, ["Nyama choma", "Carne grelhada com kachumbari e ugali, a refeição de fim de semana dos quenianos."], ["Nyama choma", "Grilled meat with kachumbari and ugali, Kenya's weekend meal."]),
    m("nbo-karura", "🌳", "day", ["nature", "sport"], -1.2427, 36.8338, ["Floresta de Karura", "Trilhos, uma cascata e grutas numa floresta urbana protegida."], ["Karura Forest", "Trails, a waterfall and caves in a protected urban forest."]),
    m("nbo-maasai", "🛍", "weekend", ["shopping"], -1.2833, 36.8172, ["Maasai Market", "Mercado itinerante de artesanato: contas, cestos e tecidos shuka; o local muda conforme o dia."], ["Maasai Market", "A roving craft market of beads, baskets and shuka cloth; the location changes by day."]),
    m("nbo-coffee", "☕", "day", ["cafe", "food"], -1.2634, 36.8027, ["Café queniano", "Prove os cafés AA de Nyeri e Kiambu nas torrefações de Westlands."], ["Kenyan coffee", "Taste AA coffees from Nyeri and Kiambu at Westlands roasters."])
  ],
  lad: [
    m("lad-sunset", "🌅", "sunset", ["photo", "beach"], -8.792, 13.229, ["Pôr do sol na Ilha", "O sol cai no Atlântico enquanto se acendem as esplanadas da Ilha de Luanda."], ["Sunset on the Ilha", "The sun sets into the Atlantic as the Ilha's terraces light up."]),
    m("lad-semba", "💃", "night", ["music", "night"], -8.81, 13.235, ["Semba e kizomba ao vivo", "Noites de música angolana e dança em clubes e restaurantes da cidade."], ["Live semba and kizomba", "Nights of Angolan music and dance in the city's clubs and restaurants."]),
    m("lad-mussulo", "🏝", "weekend", ["beach", "nature"], -8.9333, 13.0833, ["Fim de semana no Mussulo", "Barco para a restinga de praias calmas e areia branca, a sul da cidade."], ["A weekend on Mussulo", "A boat to the sand spit of calm beaches and white sand south of the city."]),
    m("lad-benfica", "🧺", "day", ["shopping", "art"], -8.9452, 13.1938, ["Mercado de artesanato do Benfica", "Máscaras, esculturas em madeira, pinturas e tecidos de todo o país."], ["Benfica craft market", "Masks, wood carvings, paintings and fabrics from across the country."]),
    m("lad-muamba", "🍲", "day", ["food"], -8.8137, 13.2311, ["Muamba de galinha", "O prato nacional, com óleo de palma, quiabos e funge, num restaurante tradicional."], ["Chicken muamba", "The national dish, with palm oil, okra and funge, at a traditional restaurant."])
  ],
  acc: [
    m("acc-highlife", "🎵", "night", ["music", "night"], 5.5605, -0.1835, ["Highlife ao vivo", "Bandas de highlife e afrobeats nos bares de Osu ao fim de semana."], ["Live highlife", "Highlife and Afrobeats bands in Osu's bars at weekends."]),
    m("acc-waakye", "🍛", "morning", ["food", "budget"], 5.556, -0.182, ["Waakye ao pequeno-almoço", "Arroz e feijão com shito, ovo e esparguete, numa banca de rua."], ["Waakye for breakfast", "Rice and beans with shito, egg and spaghetti from a street stall."]),
    m("acc-chalewote", "🎨", "day", ["art", "festival"], 5.5341, -0.2128, ["Festival Chale Wote", "Em agosto, Jamestown enche-se de arte de rua, música e performances."], ["Chale Wote festival", "In August, Jamestown fills with street art, music and performance."]),
    m("acc-aburi", "🌿", "day", ["nature"], 5.8499, -0.1786, ["Jardins Botânicos de Aburi", "Jardins de 1890 nas colinas frescas a norte, com vista para a planície de Acra."], ["Aburi Botanical Gardens", "1890 gardens in the cool hills to the north, overlooking the Accra plain."]),
    m("acc-sunset-jt", "🌅", "sunset", ["photo", "history"], 5.5341, -0.2128, ["Pôr do sol no farol de Jamestown", "Do alto do farol vê-se o porto de pesca e as canoas a regressar."], ["Sunset at Jamestown lighthouse", "From the lighthouse you see the fishing harbour and canoes coming home."])
  ],
  kgl: [
    m("kgl-umuganda", "🧹", "weekend", ["history"], -1.9536, 30.0605, ["Umuganda", "No último sábado do mês, das 8h às 11h, o país faz trabalho comunitário: lojas e transportes param."], ["Umuganda", "On the last Saturday of the month, 8 to 11 am, the country does community work: shops and transport pause."]),
    m("kgl-carfree", "🚲", "weekend", ["sport", "family"], -1.9536, 30.0605, ["Domingo sem carros", "No 1.º e 3.º domingo de manhã, avenidas fechadas para correr, pedalar e fazer aeróbica."], ["Car-free Sunday", "On the 1st and 3rd Sunday mornings, avenues close for running, cycling and aerobics."]),
    m("kgl-coffee", "☕", "day", ["cafe", "food"], -1.9535, 30.0927, ["Café ruandês", "Prova de cafés de alta altitude em torrefações como a Question Coffee, que apoia produtoras."], ["Rwandan coffee", "Taste high-altitude coffees at roasters such as Question Coffee, which supports women growers."]),
    m("kgl-mtkigali", "⛰", "morning", ["nature", "sport"], -1.9867, 30.0347, ["Subida ao Monte Kigali", "Trilho até ao miradouro sobre as colinas da cidade das mil colinas."], ["Climbing Mount Kigali", "A trail to the lookout over the city of a thousand hills."]),
    m("kgl-nyamirambo-dinner", "🍢", "night", ["food", "night"], -1.9795, 30.043, ["Brochettes em Nyamirambo", "Espetadas de cabra e banana-pão grelhada nas esplanadas animadas à noite."], ["Brochettes in Nyamirambo", "Goat skewers and grilled plantain on the lively terraces at night."])
  ],
  dkr: [
    m("dkr-lacrose", "🩷", "day", ["nature", "photo"], 14.8392, -17.2342, ["Lago Rosa (Retba)", "O lago cor-de-rosa onde se apanha sal à mão, a uma hora de Dacar."], ["Lac Rose (Retba)", "The pink lake where salt is gathered by hand, an hour from Dakar."]),
    m("dkr-mbalax", "🥁", "night", ["music", "night"], 14.6928, -17.4467, ["Mbalax ao vivo", "A música de tambores sabar de Youssou N'Dour, em clubes de Dacar ao fim de semana."], ["Live mbalax", "The sabar-drum music of Youssou N'Dour, in Dakar clubs at weekends."]),
    m("dkr-ngor", "🏄", "day", ["beach", "sport"], 14.7536, -17.5139, ["Surf e piroga em Ngor", "Ondas para todos os níveis e a ilha de Ngor a cinco minutos de piroga."], ["Surf and pirogue at Ngor", "Waves for every level and Ngor Island five minutes away by pirogue."]),
    m("dkr-thieb", "🍲", "day", ["food"], 14.6694, -17.4275, ["Thiéboudienne ao almoço", "O prato nacional de arroz, peixe e legumes, tradicionalmente partilhado numa travessa."], ["Thiéboudienne for lunch", "The national dish of rice, fish and vegetables, traditionally shared from one platter."]),
    m("dkr-corniche-sunset", "🌅", "sunset", ["sport", "photo"], 14.6936, -17.4728, ["Pôr do sol na Corniche Ouest", "Ginásios ao ar livre e lutadores a treinar à beira do Atlântico."], ["Sunset on the Corniche Ouest", "Outdoor gyms and wrestlers training by the Atlantic."])
  ]
};

/** Agenda de eventos da cidade (quando não há API de eventos configurada, ou para ver mais). */
export const AGENDA: Record<string, string> = {
  lis: "https://www.timeout.com/lisbon/things-to-do", opo: "https://www.timeout.com/porto/things-to-do", mad: "https://www.timeout.com/madrid/things-to-do",
  bcn: "https://www.timeout.com/barcelona/things-to-do", par: "https://www.timeout.com/paris/en/things-to-do", lon: "https://www.timeout.com/london/things-to-do",
  rom: "https://www.timeout.com/rome/things-to-do", ams: "https://www.timeout.com/amsterdam/things-to-do", edi: "https://www.timeout.com/edinburgh/things-to-do",
  man: "https://www.timeout.com/manchester/things-to-do", gla: "https://www.timeout.com/glasgow/things-to-do", liv: "https://www.timeout.com/liverpool/things-to-do",
  bir: "https://www.timeout.com/birmingham/things-to-do", ist: "https://www.timeout.com/istanbul/things-to-do",
  dxb: "https://www.timeoutdubai.com/things-to-do", auh: "https://www.timeoutabudhabi.com/things-to-do", doh: "https://www.timeoutdoha.com/things-to-do",
  ruh: "https://www.timeoutriyadh.com/things-to-do", jed: "https://www.visitsaudi.com/en/jeddah", cai: "https://www.cairo360.com",
  amm: "https://www.visitjordan.com", mct: "https://www.experienceoman.om",
  fra: "https://www.frankfurt-tourismus.de/en", ber: "https://www.timeout.com/berlin/things-to-do", muc: "https://www.timeout.com/munich/things-to-do",
  vie: "https://www.timeout.com/vienna/things-to-do", prg: "https://www.timeout.com/prague/things-to-do", sin: "https://www.timeout.com/singapore/things-to-do",
  nyc: "https://www.timeout.com/newyork/things-to-do", was: "https://washington.org/events", sfo: "https://www.timeout.com/san-francisco/things-to-do",
  chi: "https://www.timeout.com/chicago/things-to-do", bos: "https://www.meetboston.com/events", mia: "https://www.timeout.com/miami/things-to-do",
  lax: "https://www.timeout.com/los-angeles/things-to-do", las: "https://www.timeout.com/las-vegas/things-to-do", msy: "https://www.neworleans.com/events/",
  mco: "https://www.visitorlando.com/events/", yyz: "https://www.timeout.com/toronto/things-to-do", mex: "https://www.timeout.com/mexico-city/things-to-do",
  rio: "https://www.timeout.com/rio-de-janeiro/things-to-do", bue: "https://www.timeout.com/buenos-aires/things-to-do",
  rak: "https://allevents.in/marrakech", cas: "https://allevents.in/casablanca", cpt: "https://www.capetown.travel/events/", zan: "https://allevents.in/zanzibar",
  tun: "https://allevents.in/tunis", add: "https://allevents.in/addis-ababa", nbo: "https://allevents.in/nairobi", lad: "https://allevents.in/luanda",
  acc: "https://allevents.in/accra", kgl: "https://allevents.in/kigali", dkr: "https://allevents.in/dakar"
};

/**
 * Dias da semana em que o momento acontece (0 = domingo … 6 = sábado), lidos do próprio texto inglês
 * ("Tue & Sat", "on Sunday", "Monday to Saturday", "Friday and Saturday nights"). null = qualquer dia.
 * Serve para nunca marcar "Agora" num dia em que o cartão diz que não há.
 */
export function momentDays(m: Pick<Moment, "when" | "en">): number[] | null {
  const t = `${m.en[0]} ${m.en[1]}`.toLowerCase();
  const D: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  const range = t.match(/\b(mon|tue|wed|thu|fri|sat|sun)[a-z]* to (mon|tue|wed|thu|fri|sat|sun)[a-z]*/);
  if (range) {
    const out: number[] = []; let d = D[range[1]];
    for (let i = 0; i < 7; i++) { out.push(d); if (d === D[range[2]]) break; d = (d + 1) % 7; }
    return out;
  }
  const found = [...t.matchAll(/\b(mon|tue|wed|thu|fri|sat|sun)(day|days|s)?\b/g)].map((x) => D[x[1]]);
  if (found.length) return [...new Set(found)].sort();
  if (m.when === "weekend") return [6, 0];
  return null;
}
