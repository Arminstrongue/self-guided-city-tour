/**
 * Nomes das paragens fora do português. Os nomes em cities.ts estão em português
 * ("Coliseu", "Torre de Belém", "A e B"); nos outros idiomas mostramos o nome internacional.
 */
const EN: Record<string, string> = {
  "rak-koutoubia": "Koutoubia Mosque", "rak-jemaa": "Jemaa el-Fna Square", "rak-souks": "Souks & Ben Youssef Madrasa", "rak-bahia": "Bahia Palace", "rak-saadian": "Saadian Tombs & Kasbah", "rak-majorelle": "Majorelle Garden & Yves Saint Laurent Museum",
  "cas-unite": "Mohammed V Square & Art Deco centre", "cas-sacrecoeur": "Sacré-Cœur Cathedral & Arab League Park", "cas-habous": "Habous Quarter", "cas-medina": "Old Medina & Skala", "cas-hassan": "Hassan II Mosque", "cas-corniche": "Ain Diab Corniche",
  "cpt-castle": "Castle of Good Hope & District Six", "cpt-kirstenbosch": "Kirstenbosch Botanical Garden",
  "znz-forodhani": "Forodhani Gardens", "znz-fort": "Old Fort", "znz-palace": "House of Wonders & Sultan's Palace", "znz-cathedral": "Anglican Cathedral & former Slave Market", "znz-darajani": "Darajani Market", "znz-prison": "Prison Island (Changuu)",
  "tun-bourguiba": "Avenue Habib Bourguiba", "tun-zitouna": "Zitouna Mosque & souks", "tun-bardo": "Bardo Museum", "tun-sidibou": "Sidi Bou Said & Carthage",
  "add-unity": "Unity Park (National Palace)", "add-trinity": "Holy Trinity Cathedral", "add-museum": "National Museum (Lucy)", "add-piazza": "Piazza & Tomoca coffee", "add-entoto": "Mount Entoto & Entoto Park",
  "nbo-museum": "Nairobi National Museum", "nbo-kicc": "KICC & city centre", "nbo-sheldrick": "Sheldrick Elephant Orphanage", "nbo-karen": "Karen Blixen Museum",
  "lad-marginal": "Luanda Marginal", "lad-baixa": "Baixa: Nazaré Church & Iron Palace", "lad-fortaleza": "Fortress of São Miguel", "lad-memorial": "António Agostinho Neto Memorial", "lad-ilha": "Ilha de Luanda", "lad-lua": "Miradouro da Lua",
  "acc-nkrumah": "Kwame Nkrumah Memorial Park", "acc-jamestown": "Jamestown & the lighthouse", "acc-makola": "Makola Market", "acc-independence": "Independence Square (Black Star Square)", "acc-osu": "Osu & Oxford Street", "acc-labadi": "Labadi Beach",
  "kgl-memorial": "Kigali Genocide Memorial", "kgl-kimironko": "Kimironko Market", "kgl-palace": "Presidential Palace Museum (Kanombe)",
  "dkr-plateau": "Independence Square", "dkr-kermel": "Kermel Market", "dkr-goree": "Gorée Island", "dkr-mcn": "Museum of Black Civilisations", "dkr-renaissance": "African Renaissance Monument", "dkr-almadies": "Pointe des Almadies & Ngor",
  "la-olvera": "Olvera Street & Union Station", "la-gcm": "Grand Central Market & Angels Flight", "la-disney": "Walt Disney Concert Hall & The Broad", "la-hollywood": "Hollywood Walk of Fame", "la-griffith": "Griffith Observatory", "la-santamonica": "Santa Monica Pier & Venice",
  "lv-sign": "Welcome to Fabulous Las Vegas sign", "lv-bellagio": "Bellagio Fountains", "lv-caesars": "Caesars Palace & Forum Shops", "lv-venetian": "The Venetian & Sphere",
  "nola-jackson": "Jackson Square & St. Louis Cathedral", "nola-cafe": "Café du Monde & French Market", "nola-bourbon": "Bourbon Street & Preservation Hall", "nola-garden": "St. Charles Streetcar & Garden District",
  "orl-eola": "Lake Eola", "orl-idrive": "ICON Park & International Drive",
  "to-nathan": "Nathan Phillips Square & City Hall", "to-kensington": "Kensington Market & Chinatown", "to-rom": "Royal Ontario Museum & Yorkville",
  "mx-zocalo": "Zócalo & Metropolitan Cathedral", "mx-madero": "Calle Madero & House of Tiles", "mx-bellas": "Palacio de Bellas Artes & Alameda", "mx-antropologia": "National Museum of Anthropology", "mx-condesa": "Condesa & Roma",
  "rio-selaron": "Selarón Steps", "rio-arcos": "Lapa Arches", "rio-theatro": "Theatro Municipal & Cinelândia", "rio-amanha": "Museum of Tomorrow & Praça Mauá", "rio-cristo": "Christ the Redeemer", "rio-pao": "Sugarloaf Mountain",
  "ba-mayo": "Plaza de Mayo & Casa Rosada", "ba-tortoni": "Avenida de Mayo & Café Tortoni", "ba-obelisco": "Obelisco & Teatro Colón", "ba-santelmo": "San Telmo & Plaza Dorrego", "ba-boca": "La Boca & Caminito", "ba-recoleta": "Recoleta Cemetery",
  "ny-911": "9/11 Memorial & One World Trade", "ny-wall": "Wall Street & Charging Bull", "ny-brooklyn": "Brooklyn Bridge", "ny-chinatown": "Chinatown & Little Italy",
  "ny-rock": "Rockefeller Center & St Patrick's Cathedral", "ny-highline": "High Line & Chelsea Market",
  "dc-capitol": "US Capitol", "dc-library": "Library of Congress", "dc-mall": "National Mall & Smithsonian museums", "dc-monument": "Washington Monument",
  "dc-lincoln": "WWII Memorial & Lincoln Memorial", "dc-whitehouse": "White House & Lafayette Square",
  "sf-union": "Union Square & cable cars", "sf-northbeach": "North Beach & Washington Square", "sf-wharf": "Fisherman's Wharf & Pier 39", "sf-goldengate": "Golden Gate Bridge",
  "chi-bean": "Millennium Park & Cloud Gate", "chi-mile": "Magnificent Mile & Water Tower",
  "bos-common": "Boston Common & Public Garden", "bos-faneuil": "Faneuil Hall & Quincy Market", "bos-northend": "North End & Paul Revere House",
  se: "Lisbon Cathedral", "santa-luzia": "Santa Luzia Viewpoint", graca: "Graça Viewpoint",
  carmo: "Largo do Carmo & Chiado", jeronimos: "Jerónimos & Pastéis de Belém", "torre-belem": "Belém Tower",
  clerigos: "Clérigos Tower & Lello Bookshop", "sao-bento": "São Bento Station", "se-porto": "Porto Cathedral",
  "ponte-luis": "Luís I Bridge & Serra do Pilar", "palacio-real": "Royal Palace & Almudena", debod: "Temple of Debod",
  prado: "Prado Museum", retiro: "Retiro Park", rambla: "La Rambla & Boqueria", gotic: "Gothic Quarter & Cathedral",
  batllo: "Casa Batlló & La Pedrera", "pont-neuf": "Pont Neuf & Sainte-Chapelle", concorde: "Concorde & Champs-Élysées",
  eiffel: "Trocadéro & Eiffel Tower", montmartre: "Montmartre & Sacré-Cœur", westminster: "Westminster & Big Ben",
  trafalgar: "Trafalgar Square & National Gallery", "st-pauls": "St Paul's & Tate Modern", coliseu: "Colosseum",
  foruns: "Imperial Forums", panteao: "Pantheon", trevi: "Trevi Fountain", spagna: "Spanish Steps",
  "sao-pedro-vat": "St Peter's Square", centraal: "Centraal & Damrak", dam: "Dam Square", "nove-ruas": "Nine Streets",
  "anne-frank": "Anne Frank House & Westerkerk", rijksmuseum: "Rijksmuseum & Museumplein",
  scott: "Princes Street Gardens & Scott Monument", "st-giles": "Royal Mile & St Giles' Cathedral", castle: "Edinburgh Castle",
  "victoria-st": "Victoria Street & Grassmarket", holyrood: "Holyrood & Arthur's Seat",
  "cathedral-m": "Cathedral & National Football Museum", "albert-sq": "Albert Square & Central Library",
  necropolis: "Cathedral & Necropolis", merchant: "Merchant City & murals", buchanan: "Buchanan Street & The Lighthouse",
  "uni-gla": "University of Glasgow", "pier-head": "Pier Head & Three Graces", cavern: "Mathew Street & Cavern Club",
  bullring: "Bullring & St Martin's", "gas-street": "Brindleyplace & Gas Street Basin", cadbury: "Cadbury World & Bournville",
  taksim: "Taksim Square", istiklal: "İstiklal Avenue", galata: "Galata Tower", "galata-bridge": "Galata Bridge",
  spice: "Spice Bazaar", "hagia-sophia": "Hagia Sophia", "blue-mosque": "Blue Mosque & Hippodrome",
  cistern: "Basilica Cistern", "grand-bazaar": "Grand Bazaar", topkapi: "Topkapı Palace", uskudar: "Bosphorus ferry & Üsküdar",
  // Médio Oriente
  "abra": "Creek abra & Spice Souk", "gold-souk": "Gold Souk", "museum-future": "Museum of the Future", "burj-khalifa": "Burj Khalifa, Dubai Mall & Fountain",
  marina: "Dubai Marina & JBR Beach", "grand-mosque": "Sheikh Zayed Grand Mosque", "emirates-palace": "Emirates Palace & Etihad Towers",
  "corniche-auh": "Abu Dhabi Corniche", "nmoq": "National Museum of Qatar", mia: "Museum of Islamic Art & MIA Park", "corniche-doh": "Corniche & dhows",
  katara: "Katara Cultural Village", kafd: "KAFD (Financial District)", kingdom: "Kingdom Centre & Sky Bridge", masmak: "Al Masmak Fort & Souq Al Zal",
  "national-museum-ruh": "National Museum of Saudi Arabia", murabba: "Murabba Palace", diriyah: "Diriyah: At-Turaif & Bujairi",
  "al-balad": "Al-Balad & Nassif House", matbouli: "Matbouli House", "corniche-jed": "Corniche & King Fahd's Fountain", "al-rahma": "Al Rahma «Floating» Mosque",
  gem: "Grand Egyptian Museum (GEM)", pyramids: "Pyramids of Giza", sphinx: "Sphinx & Valley Temple", "egyptian-museum": "Egyptian Museum (Tahrir)",
  khan: "Khan el-Khalili & Al-Muizz Street", "citadel-cai": "Saladin Citadel & Muhammad Ali Mosque", citadel: "Amman Citadel", "roman-theatre": "Roman Theatre",
  "downtown-amm": "Downtown (Al-Balad) & souks", "abdullah-mosque": "King Abdullah I Mosque", "grand-mosque-mct": "Sultan Qaboos Grand Mosque",
  mutrah: "Mutrah Corniche & Souq", "al-alam": "Al Alam Palace & Old Muscat", "national-museum-om": "National Museum of Oman",
  // Alemanha, Áustria, Chéquia e Singapura
  hauptwache: "Hauptwache & Zeil", "dom-fra": "Cathedral & New Old Town", museumsufer: "Museumsufer & Städel",
  brandenburger: "Brandenburg Gate", holocaust: "Holocaust Memorial", museumsinsel: "Museum Island & Cathedral", alexanderplatz: "Alexanderplatz & TV Tower",
  marienplatz: "Marienplatz & Glockenspiel", residenz: "Residenz & Odeonsplatz", "englischer-garten": "English Garden & Eisbach", olympiapark: "Olympic Park & BMW Welt",
  stephansdom: "St Stephen's Cathedral", graben: "Graben & Kohlmarkt", hofburg: "Hofburg & Michaelerplatz", oper: "State Opera & Albertina", schoenbrunn: "Schönbrunn Palace",
  hrad: "Prague Castle & St Vitus", "karluv-most": "Charles Bridge", staromestske: "Old Town Square & Astronomical Clock", josefov: "Jewish Quarter (Josefov)", vaclavske: "Wenceslas Square",
  padang: "National Gallery & Padang", mbs: "Helix Bridge & Marina Bay Sands", chinatown: "Chinatown & Buddha Tooth Relic Temple", "kampong-glam": "Kampong Glam & Sultan Mosque",
  "dps-palace": "Ubud Palace (Puri Saren Agung)", "dps-market": "Ubud Art Market", "dps-monkey": "Sacred Monkey Forest Sanctuary", "dps-saraswati": "Taman Saraswati Temple", "dps-lukisan": "Puri Lukisan Museum", "dps-campuhan": "Campuhan Ridge Walk", "dps-tegallalang": "Tegallalang Rice Terraces",
  "bkk-grand-palace": "Grand Palace & Wat Phra Kaew", "bkk-wat-pho": "Wat Pho (Reclining Buddha)", "bkk-wat-arun": "Wat Arun (Temple of Dawn)", "bkk-wat-traimit": "Wat Traimit (Golden Buddha)", "bkk-lumphini": "Lumphini Park", "bkk-jim-thompson": "Jim Thompson House",
  "hkg-statue-square": "Statue Square & Court of Final Appeal", "hkg-man-mo": "Man Mo Temple", "hkg-tst": "Star Ferry & Clock Tower", "hkg-temple-street": "Temple Street Night Market",
  "dar-museum": "National Museum & Botanical Garden", "dar-askari": "Askari Monument", "dar-stjoseph": "St Joseph's Cathedral", "dar-azania": "Azania Front Lutheran Church", "dar-fish": "Kivukoni Fish Market", "dar-kariakoo": "Kariakoo Market",
  "dub-gpo": "General Post Office & O'Connell Street", "dub-hapenny": "Ha'penny Bridge & Temple Bar", "dub-trinity": "Trinity College & Book of Kells", "dub-stpatricks": "St Patrick's Cathedral", "dub-christchurch": "Christ Church Cathedral", "dub-kilmainham": "Kilmainham Gaol",
  "fnc-se": "Funchal Cathedral", "fnc-municipio": "Municipal Square & Colégio Church", "fnc-lavradores": "Farmers' Market (Mercado dos Lavradores)", "fnc-santa-maria": "Old Town & Rua de Santa Maria", "fnc-sao-tiago": "São Tiago Fort", "fnc-monte": "Monte: church & wicker toboggans", "fnc-botanico": "Madeira Botanical Garden",
  "ath-syntagma": "Syntagma Square & Parliament", "ath-plaka": "Plaka & Anafiotika", "ath-museum": "Acropolis Museum", "ath-acropolis": "Acropolis & Parthenon", "ath-agora": "Ancient Agora & Temple of Hephaestus", "ath-monastiraki": "Monastiraki", "ath-lycabettus": "Mount Lycabettus",
  "brn-bundeshaus": "Federal Palace (Bundeshaus)", "brn-zytglogge": "Zytglogge Clock Tower", "brn-einsteinhaus": "Einstein House", "brn-muenster": "Bern Minster",
  "brn-baerenpark": "BärenPark (Bear Park)", "brn-rosengarten": "Rose Garden (Rosengarten)", "brn-paulklee": "Zentrum Paul Klee",
  "zrh-bahnhofstrasse": "Bahnhofstrasse", "zrh-lindenhof": "Lindenhof", "zrh-stpeter": "St Peter's Church", "zrh-fraumuenster": "Fraumünster (Chagall windows)",
  "zrh-buerkliplatz": "Bürkliplatz & Lake Zurich", "zrh-grossmuenster": "Grossmünster", "zrh-niederdorf": "Niederdorf", "zrh-polyterrasse": "Polyterrasse & ETH"
};

export function stopName(s: { id: string; n: string }, locale: string): string {
  if (locale === "pt") return s.n;
  return EN[s.id] ?? s.n.replace(/ e /g, " & ");
}

/** Indicações de linhas e percursos (escritas em português em cities.ts) em inglês para os outros idiomas. */
const LINE_EN: [RegExp, string][] = [
  [/Paragem /g, "Stop "], [/Pelos souks/g, "Through the souks"], [/Pelas ruelas/g, "Through the lanes"], [/Pelo boulevard/g, "Along the boulevard"], [/Pela rua /g, "Along "],
  [/ e Darling/g, " and Darling"], [/Barco desde a praia de/g, "Boat from the beach at"], [/Barco para/g, "Boat to"], [/ para o aeroporto/g, " to the airport"], [/táxi para/g, "taxi to"],
  [/Chaloupe de regresso → a pé/g, "Ferry back → on foot"], [/Chaloupe do porto de Dakar/g, "Ferry from Dakar port"], [/Mota-táxi ou táxi/g, "Moto taxi or taxi"], [/Metro ligeiro/g, "Light rail"],
  [/Táxi amarelo/g, "Yellow taxi"], [/pela Estrada de Samba/g, "via Estrada de Samba"], [/Táxi do aeroporto/g, "Airport taxi"], [/Comboio de/g, "Train from"],
  [/Pela ponte pedonal/g, "Over the footbridge"], [/Táxi autorizado/g, "Authorised taxi"], [/Desde /g, "From "], [/Trem do Corcovado/g, "Corcovado train"],
  [/Linha Prata/g, "Silver Line"], [/Linha Laranja/g, "Orange Line"], [/Elétrico F \(elétricos históricos\)/g, "F-line streetcar (historic)"], [/grátis desde o aeroporto/g, "free from the airport"],
  [/autocarro do terminal/g, "terminal shuttle"], [/Pelo Reflecting Pool/g, "Along the Reflecting Pool"], [/Pela 5\.ª Avenida/g, "Along Fifth Avenue"], [/Porta do Dragão/g, "Dragon Gate"],
  [/A subir pela/g, "Uphill along"], [/Pelo passeio marítimo/g, "Along the seafront"],
  [/A pé até /g, "Walk to "], [/ferry para /g, "ferry to "], [/Abra \(barco tradicional\)/g, "Abra (traditional boat)"], [/em dinheiro/g, "cash"],
  [/Linha Vermelha/g, "Red Line"], [/Linha Verde/g, "Green Line"], [/Linha Azul/g, "Blue Line"], [/Linha Amarela/g, "Yellow Line"], [/Linha Dourada/g, "Gold Line"],
  [/Metro Vermelha/g, "Metro Red"], [/\bVermelha\b/g, "Red"], [/\bVerde\b/g, "Green"], [/\bAzul\b/g, "Blue"], [/Aeroporto/g, "Airport"],
  [/Autocarro/g, "Bus"], [/autocarro/g, "bus"], [/Comboio/g, "Train"], [/Elétrico/g, "Tram"], [/Escadas a descer/g, "Steps down"], [/A subir/g, "Uphill"],
  [/Beira-rio/g, "Riverside"], [/Pela Corniche/g, "Along the Corniche"], [/Pelo parque/g, "Through the park"], [/Pelo planalto/g, "Across the plateau"],
  [/Tabuleiro inferior/g, "Lower deck"], [/Tabuleiro superior/g, "Upper deck"], [/Passeio marítimo/g, "Seafront"], [/7\.º Círculo/g, "7th Circle"],
  [/Táxi/g, "Taxi"], [/táxi/g, "taxi"], [/ até /g, " to "], [/ a pé/g, " on foot"], [/Pela /g, "Along "], [/Pelo /g, "Through the "]
];
export function lineText(line: string | undefined, locale: string): string {
  if (!line || locale === "pt") return line ?? "";
  return LINE_EN.reduce((s, [re, to]) => s.replace(re, to), line);
}
