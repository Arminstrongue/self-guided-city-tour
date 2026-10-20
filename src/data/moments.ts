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
  amm: "https://www.visitjordan.com", mct: "https://www.experienceoman.om"
};
