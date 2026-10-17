/**
 * Nomes das paragens fora do português. Os nomes em cities.ts estão em português
 * ("Coliseu", "Torre de Belém", "A e B"); nos outros idiomas mostramos o nome internacional.
 */
const EN: Record<string, string> = {
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
  cistern: "Basilica Cistern", "grand-bazaar": "Grand Bazaar", topkapi: "Topkapı Palace", uskudar: "Bosphorus ferry & Üsküdar"
};

export function stopName(s: { id: string; n: string }, locale: string): string {
  if (locale === "pt") return s.n;
  return EN[s.id] ?? s.n.replace(/ e /g, " & ");
}
