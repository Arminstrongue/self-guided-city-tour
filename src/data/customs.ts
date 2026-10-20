/**
 * Costumes e comunidades: como se vive cada país e cada cidade (gorjetas, cumprimentos, horários, etiqueta, festas).
 * Português e inglês; os outros idiomas mostram o inglês.
 */
export type Custom = { icon: string; pt: [string, string]; en: [string, string] };
const c = (icon: string, pt: [string, string], en: [string, string]): Custom => ({ icon, pt, en });

export const COUNTRY_CUSTOMS: Record<string, Custom[]> = {
  PT: [
    c("👋", ["Cumprimentar", "Dois beijinhos entre conhecidos; aperto de mão no primeiro encontro. «Bom dia» ao entrar numa loja."], ["Greetings", "Two cheek kisses among friends; a handshake on first meeting. Say «bom dia» when entering a shop."]),
    c("🍽", ["Horários das refeições", "Almoço entre as 12h30 e as 14h30, jantar a partir das 20h. O couvert (pão, azeitonas) é pago se lhe tocar."], ["Meal times", "Lunch 12:30–14:30, dinner from 20:00. The couvert (bread, olives) is charged if you eat it."]),
    c("💶", ["Gorjetas", "Não são obrigatórias. Arredondar ou deixar 5–10 % num restaurante é simpático."], ["Tipping", "Not expected. Rounding up or leaving 5–10% in restaurants is appreciated."]),
    c("☕", ["Café à portuguesa", "«Uma bica» em Lisboa, «um cimbalino» no Porto: um expresso tomado ao balcão, rápido e barato."], ["Coffee, Portuguese style", "«Uma bica» in Lisbon, «um cimbalino» in Porto: an espresso at the counter, quick and cheap."]),
    c("🎉", ["Festas", "Junho é o mês dos Santos Populares: sardinhas, manjericos e arraiais nas ruas (Santo António em Lisboa, São João no Porto)."], ["Festivals", "June brings the Santos Populares: sardines, basil pots and street parties (St Anthony in Lisbon, St John in Porto)."]),
    c("🗣", ["Frases úteis", "Obrigado/obrigada · Desculpe · Fala inglês? · A conta, por favor."], ["Useful phrases", "Obrigado/obrigada (thank you) · Desculpe (sorry) · Fala inglês? · A conta, por favor (the bill)."])
  ],
  ES: [
    c("👋", ["Cumprimentar", "Dois beijos (direita primeiro) entre conhecidos. «Hola» e «buenas» a toda a gente."], ["Greetings", "Two kisses (right cheek first) among friends. «Hola» and «buenas» to everyone."]),
    c("🍽", ["Horários", "Almoço entre as 14h e as 16h, jantar depois das 21h. Muitas lojas pequenas fecham à hora da sesta."], ["Meal times", "Lunch 14:00–16:00, dinner after 21:00. Many small shops close for the siesta."]),
    c("🍷", ["Tapas", "De bar em bar: uma caña (cerveja pequena) e uma tapa em cada um. Pedir ao balcão é normal."], ["Tapas", "Bar-hopping: a caña (small beer) and a tapa at each. Ordering at the bar is normal."]),
    c("💶", ["Gorjetas", "Opcionais: deixar o troco ou 5–10 % em restaurantes."], ["Tipping", "Optional: leave the change or 5–10% in restaurants."]),
    c("🎉", ["Festas", "Madrid: San Isidro em maio. Barcelona: La Mercè em setembro e Sant Joan em junho, com fogueiras e fogo de artifício."], ["Festivals", "Madrid: San Isidro in May. Barcelona: La Mercè in September and Sant Joan in June, with bonfires and fireworks."]),
    c("🗣", ["Frases úteis", "Gracias · Perdón · ¿Habla inglés? · La cuenta, por favor. Em Barcelona também se fala catalão: «bon dia», «gràcies»."], ["Useful phrases", "Gracias · Perdón · ¿Habla inglés? · La cuenta, por favor. Barcelona also speaks Catalan: «bon dia», «gràcies»."])
  ],
  FR: [
    c("👋", ["Cumprimentar", "Diga sempre «Bonjour, madame/monsieur» ao entrar numa loja ou café: é falta de educação não o fazer."], ["Greetings", "Always say «Bonjour, madame/monsieur» when entering a shop or café: skipping it is rude."]),
    c("🍽", ["Horários", "Almoço das 12h às 14h, jantar a partir das 19h30. Fora disso, muitas cozinhas estão fechadas."], ["Meal times", "Lunch 12:00–14:00, dinner from 19:30. Outside these hours many kitchens are closed."]),
    c("💶", ["Gorjetas", "O serviço já está incluído («service compris»). Deixar umas moedas é um gesto simpático."], ["Tipping", "Service is included («service compris»). Leaving a few coins is a nice gesture."]),
    c("🥖", ["Pequenos prazeres", "Uma baguete «tradition» quente, um café na esplanada virada para a rua, piquenique à beira do Sena."], ["Small pleasures", "A warm «tradition» baguette, a coffee on a street-facing terrace, a picnic by the Seine."]),
    c("🎉", ["Festas", "14 de julho (fogo de artifício na Torre Eiffel), Fête de la Musique a 21 de junho, Nuit Blanche em outubro."], ["Festivals", "14 July (Eiffel Tower fireworks), Fête de la Musique on 21 June, Nuit Blanche in October."]),
    c("🗣", ["Frases úteis", "Merci · Pardon · Vous parlez anglais ? · L'addition, s'il vous plaît."], ["Useful phrases", "Merci · Pardon · Vous parlez anglais ? · L'addition, s'il vous plaît."])
  ],
  IT: [
    c("👋", ["Cumprimentar", "«Buongiorno» até ao fim da tarde, «buonasera» depois. Dois beijos entre amigos."], ["Greetings", "«Buongiorno» until late afternoon, «buonasera» after. Two kisses among friends."]),
    c("☕", ["Café", "Cappuccino só de manhã. Ao balcão é mais barato do que sentado à mesa."], ["Coffee", "Cappuccino only in the morning. Standing at the bar is cheaper than sitting down."]),
    c("⛪", ["Igrejas", "Ombros e joelhos cobertos para entrar (São Pedro e as basílicas verificam à porta)."], ["Churches", "Cover shoulders and knees to enter (St Peter's and the basilicas check at the door)."]),
    c("💶", ["Gorjetas e coperto", "O «coperto» (pão e mesa) aparece na conta. Gorjeta opcional: arredondar."], ["Tipping and coperto", "The «coperto» (bread and table) is on the bill. Tipping is optional: round up."]),
    c("🍦", ["Rituais", "O aperitivo ao fim da tarde (spritz com petiscos) e a «passeggiata», o passeio antes do jantar."], ["Rituals", "Early-evening aperitivo (spritz with snacks) and the «passeggiata», the stroll before dinner."]),
    c("🗣", ["Frases úteis", "Grazie · Scusi · Parla inglese? · Il conto, per favore."], ["Useful phrases", "Grazie · Scusi · Parla inglese? · Il conto, per favore."])
  ],
  NL: [
    c("🚲", ["Bicicletas", "As ciclovias são vermelhas e sagradas: não ande nelas a pé e olhe sempre antes de atravessar."], ["Bikes", "Bike lanes are red and sacred: don't walk in them and always look before crossing."]),
    c("👋", ["Cumprimentar", "Diretos e simpáticos. Três beijos entre amigos; aperto de mão no primeiro encontro."], ["Greetings", "Direct and friendly. Three kisses among friends; a handshake on first meeting."]),
    c("💳", ["Pagamentos", "Cartão em quase todo o lado; alguns sítios não aceitam dinheiro."], ["Payments", "Cards almost everywhere; some places don't take cash."]),
    c("💶", ["Gorjetas", "Opcionais: arredondar ou 5–10 % se o serviço foi bom."], ["Tipping", "Optional: round up or 5–10% for good service."]),
    c("🎉", ["Festas", "Dia do Rei (27 de abril): a cidade veste-se de laranja, com mercados de rua e barcos nos canais."], ["Festivals", "King's Day (27 April): the city turns orange, with street markets and boats on the canals."]),
    c("🗣", ["Frases úteis", "Dank je wel · Sorry · Quase toda a gente fala inglês."], ["Useful phrases", "Dank je wel (thank you) · Sorry · Almost everyone speaks English."])
  ],
  GB: [
    c("🚶", ["Filas e escadas", "Respeite sempre a fila. Nas escadas rolantes, fique à direita e deixe a esquerda livre."], ["Queues and escalators", "Always respect the queue. On escalators, stand on the right and keep the left free."]),
    c("🍺", ["Pub", "Pede-se e paga-se ao balcão; não há serviço à mesa. Rondas («rounds») entre amigos."], ["The pub", "Order and pay at the bar; no table service. Friends buy drinks in «rounds»."]),
    c("💷", ["Gorjetas", "10–12,5 % em restaurantes, muitas vezes já na conta («service charge»). No pub não é costume."], ["Tipping", "10–12.5% in restaurants, often already on the bill («service charge»). Not expected in pubs."]),
    c("☕", ["Chá e conversa", "«Cheers» serve para obrigado e adeus. Falar do tempo é a melhor forma de começar uma conversa."], ["Tea and small talk", "«Cheers» means thanks and bye. The weather is the best way to start a conversation."]),
    c("⚽", ["Futebol", "Em dia de jogo, a cidade muda: pubs cheios e cachecóis. Seja neutro nos dérbis."], ["Football", "On match days the city changes: packed pubs and scarves. Stay neutral at derbies."]),
    c("🗣", ["Frases úteis", "Cheers · Sorry · Could I get…? · «Mate», «love» e «pet» são formas carinhosas, não falta de respeito."], ["Useful phrases", "Cheers · Sorry · Could I get…? · «Mate», «love» and «pet» are friendly, not disrespectful."])
  ],
  TR: [
    c("🕌", ["Mesquitas", "Tire os sapatos, ombros e joelhos cobertos; as mulheres cobrem o cabelo. Evite as horas de oração."], ["Mosques", "Remove shoes, cover shoulders and knees; women cover their hair. Avoid prayer times."]),
    c("🍵", ["Chá", "O çay é oferecido em lojas e casas: aceitar é um gesto de simpatia, não um compromisso de compra."], ["Tea", "Çay is offered in shops and homes: accepting is friendly, not a promise to buy."]),
    c("🤝", ["Negociar", "No Grande Bazar e nos mercados, negociar faz parte. Nas lojas com preço marcado, não."], ["Bargaining", "In the Grand Bazaar and markets, haggling is expected. Not in shops with fixed prices."]),
    c("💶", ["Gorjetas", "5–10 % em restaurantes; arredondar no táxi."], ["Tipping", "5–10% in restaurants; round up in taxis."]),
    c("🌙", ["Ramadão", "Durante o Ramadão, coma com discrição durante o dia. Ao pôr do sol, o iftar enche as praças."], ["Ramadan", "During Ramadan, eat discreetly in daytime. At sunset, iftar fills the squares."]),
    c("🗣", ["Frases úteis", "Merhaba (olá) · Teşekkürler (obrigado) · Lütfen (por favor) · Hesap, lütfen (a conta)."], ["Useful phrases", "Merhaba (hello) · Teşekkürler (thank you) · Lütfen (please) · Hesap, lütfen (the bill)."])
  ]
};

/** Comunidades e identidade de cada cidade (para "seguir" e conhecer os seus costumes). */
export const CITY_COMMUNITIES: Record<string, Custom[]> = {
  lis: [c("🎶", ["Alfama e o fado", "Bairro de pescadores e fadistas; as festas de Santo António em junho são a alma da cidade."], ["Alfama and fado", "A neighbourhood of fishermen and fado singers; the St Anthony festivities in June are the city's soul."]), c("🌍", ["Lisboa multicultural", "Comunidades cabo-verdiana, angolana, brasileira e indiana: experimente a cachupa ou a moamba no Intendente e no Martim Moniz."], ["Multicultural Lisbon", "Cape Verdean, Angolan, Brazilian and Indian communities: try cachupa or moamba in Intendente and Martim Moniz."])],
  opo: [c("🔵", ["Tripeiros", "Os portuenses chamam-se «tripeiros» com orgulho. O FC Porto e as francesinhas são religião."], ["Tripeiros", "Porto locals proudly call themselves «tripeiros». FC Porto and francesinhas are a religion."]), c("🎆", ["São João", "Na noite de 23 de junho, a cidade inteira sai à rua com martelinhos de plástico e balões de papel."], ["São João", "On the night of 23 June the whole city takes to the streets with plastic hammers and paper lanterns."])],
  mad: [c("🌃", ["Madrileños", "A vida faz-se na rua e tarde: terraços cheios até à meia-noite, mesmo à semana."], ["Madrileños", "Life happens outdoors and late: terraces full until midnight, even on weekdays."]), c("🌈", ["Chueca e Lavapiés", "Chueca é o bairro LGBTQ+; Lavapiés, o mais multicultural, com cozinha de todo o mundo."], ["Chueca and Lavapiés", "Chueca is the LGBTQ+ quarter; Lavapiés is the most multicultural, with food from everywhere."])],
  bcn: [c("🟡", ["Identidade catalã", "Castells (torres humanas) e a sardana nas festas. Use «bon dia» e «gràcies»."], ["Catalan identity", "Castells (human towers) and the sardana at festivals. Try «bon dia» and «gràcies»."]), c("🔵", ["Barça", "«Més que un club»: em dia de jogo, o bairro de Les Corts enche-se de azul-grená."], ["Barça", "«Més que un club»: on match days Les Corts fills with blue and claret."])],
  par: [c("🎨", ["Montmartre e Belleville", "Artistas em Montmartre; Belleville, bairro de comunidades chinesa, magrebina e africana, com arte urbana."], ["Montmartre and Belleville", "Artists in Montmartre; Belleville, home to Chinese, North African and African communities, with street art."]), c("🇵🇹", ["Comunidade portuguesa", "Uma das maiores do mundo: cafés e mercearias portuguesas em Champigny e Saint-Denis."], ["Portuguese community", "One of the world's largest: Portuguese cafés and grocers in Champigny and Saint-Denis."])],
  lon: [c("🌍", ["A cidade de todas as comunidades", "Brick Lane (bengali), Chinatown, Southall (Punjabi), Brixton (caribenha) e Stockwell, o «pequeno Portugal»."], ["A city of every community", "Brick Lane (Bengali), Chinatown, Southall (Punjabi), Brixton (Caribbean) and Stockwell, «Little Portugal»."]), c("🎭", ["Carnaval de Notting Hill", "No fim de semana de agosto, o maior carnaval de rua da Europa, com música caribenha."], ["Notting Hill Carnival", "On the August bank holiday weekend, Europe's biggest street carnival with Caribbean music."])],
  rom: [c("🏛", ["Romani di Roma", "Trastevere e Testaccio guardam a Roma popular: cozinha romana (carbonara, cacio e pepe) e a AS Roma."], ["Romani di Roma", "Trastevere and Testaccio keep popular Rome alive: Roman cooking (carbonara, cacio e pepe) and AS Roma."]), c("✝️", ["Vaticano", "Ao domingo ao meio-dia, o Papa reza o Angelus da janela, na Praça de São Pedro."], ["The Vatican", "On Sundays at noon the Pope leads the Angelus from his window over St Peter's Square."])],
  ams: [c("🌷", ["Amsterdammers", "Tolerantes e diretos. Os «gezellig» cafés castanhos são o centro da vida de bairro."], ["Amsterdammers", "Tolerant and direct. Cosy «gezellig» brown cafés are the heart of neighbourhood life."]), c("🌍", ["Comunidades", "Surinamesa e indonésia: experimente roti e rijsttafel em De Pijp e Oost."], ["Communities", "Surinamese and Indonesian: try roti and rijsttafel in De Pijp and Oost."])],
  edi: [c("🏴", ["Escoceses", "Kilts em casamentos, gaita de foles na Royal Mile e o orgulho da língua e da história."], ["Scots", "Kilts at weddings, bagpipes on the Royal Mile and pride in language and history."]), c("🎭", ["Festivais de agosto", "O Fringe transforma a cidade no maior festival de artes do mundo."], ["August festivals", "The Fringe turns the city into the world's biggest arts festival."])],
  man: [c("🐝", ["Mancunians", "A abelha é o símbolo da cidade trabalhadora. Simpáticos e diretos: «alright, love?»."], ["Mancunians", "The worker bee is the city's symbol. Friendly and direct: «alright, love?»."]), c("🌍", ["Comunidades", "Curry Mile (Wilmslow Road), Chinatown e uma forte comunidade estudantil e portuguesa."], ["Communities", "Curry Mile (Wilmslow Road), Chinatown and big student and Portuguese communities."]), c("⚽", ["United e City", "A cidade divide-se entre vermelho e azul-celeste. Em dia de dérbi, escolha a neutralidade."], ["United and City", "The city splits red and sky blue. On derby day, choose neutrality."])],
  gla: [c("🎸", ["Glaswegians", "Calorosos e com humor seco. Cidade da música ao vivo, distinguida pela UNESCO."], ["Glaswegians", "Warm, with dry humour. A UNESCO City of Music with gigs every night."]), c("⚽", ["Old Firm", "Celtic e Rangers: uma rivalidade com história. Evite cores de clubes em dia de jogo."], ["Old Firm", "Celtic and Rangers: a rivalry with history. Avoid club colours on match day."])],
  liv: [c("🎵", ["Scousers", "Cidade dos Beatles, com sotaque inconfundível e humor sem filtros."], ["Scousers", "The Beatles' city, with an unmistakable accent and unfiltered humour."]), c("🔴", ["Futebol", "Liverpool e Everton: em Anfield, cante «You'll Never Walk Alone» com toda a gente."], ["Football", "Liverpool and Everton: at Anfield, sing «You'll Never Walk Alone» with everyone."])],
  bir: [c("🌍", ["Brummies", "Uma das cidades mais diversas do Reino Unido: o «Balti Triangle» nasceu aqui."], ["Brummies", "One of the UK's most diverse cities: the «Balti Triangle» was born here."]), c("🎸", ["Música", "Berço do heavy metal (Black Sabbath) e de Peaky Blinders."], ["Music", "Birthplace of heavy metal (Black Sabbath) and Peaky Blinders."])],
  ist: [c("🌉", ["Entre dois continentes", "Lado europeu e lado asiático: muitos istambulitas atravessam o Bósforo de ferry todos os dias."], ["Between two continents", "European and Asian sides: many Istanbulites cross the Bosphorus by ferry every day."]), c("🐈", ["Os gatos de Istambul", "Os gatos de rua são cuidados por todos os bairros: comedouros e casinhas em cada esquina."], ["Istanbul's cats", "Street cats are cared for by every neighbourhood: food bowls and little houses on every corner."])]
};
