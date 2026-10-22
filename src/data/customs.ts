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
  ],
  AE: [
    c("👋", ["Cumprimentar", "Aperto de mão entre homens; com mulheres, espere que ela estenda a mão primeiro. «As-salamu alaykum» é sempre bem recebido."], ["Greetings", "Handshakes between men; with women, wait for her to offer her hand. «As-salamu alaykum» is always welcome."]),
    c("🕌", ["Oração", "Cinco vezes por dia ouve-se o adhan. Não passe à frente de quem reza e baixe o volume."], ["Prayer", "Five times a day you'll hear the adhan. Don't walk in front of someone praying and keep the volume down."]),
    c("🌙", ["Ramadão", "No mês do jejum, durante o dia não se come nem bebe em público. Ao pôr do sol, o iftar enche as ruas e tendas."], ["Ramadan", "In the month of fasting, don't eat or drink in public in daytime. At sunset, iftar fills the streets and tents."]),
    c("☕", ["Hospitalidade", "Café com cardamomo (gahwa) e tâmaras são oferecidos aos convidados. Aceite com a mão direita; abane a chávena para dizer «chega»."], ["Hospitality", "Cardamom coffee (gahwa) and dates are offered to guests. Take them with your right hand; shake the cup to say «enough»."]),
    c("📅", ["Semana", "Fim de semana ao sábado e domingo; sexta-feira tem a oração do meio-dia, e muitas lojas abrem mais tarde."], ["The week", "The weekend is Saturday and Sunday; Friday has midday prayers, and many shops open later."]),
    c("🗣", ["Frases úteis", "Shukran (obrigado) · Min fadlak (por favor) · Kam? (quanto?) · Yalla (vamos)."], ["Useful phrases", "Shukran (thank you) · Min fadlak (please) · Kam? (how much?) · Yalla (let's go)."])
  ],
  QA: [
    c("👋", ["Cumprimentar", "Aperto de mão entre homens; com mulheres, espere que ela estenda a mão. Use a mão direita para dar e receber."], ["Greetings", "Handshakes between men; with women, wait for her to offer her hand. Use your right hand to give and receive."]),
    c("🦅", ["Falcoaria", "O falcão é símbolo nacional: há um hospital e um souk só de falcões ao lado do Souq Waqif."], ["Falconry", "The falcon is a national symbol: there's a falcon hospital and souk next to Souq Waqif."]),
    c("🌙", ["Ramadão", "Durante o dia não se come nem bebe em público; à noite há tendas de iftar e o souk fica cheio até tarde."], ["Ramadan", "No eating or drinking in public in daytime; at night there are iftar tents and the souk stays busy late."]),
    c("📅", ["Semana", "Fim de semana à sexta e sábado. À sexta de manhã muita coisa fecha para a oração."], ["The week", "The weekend is Friday and Saturday. Much closes on Friday morning for prayers."]),
    c("🗣", ["Frases úteis", "Shukran (obrigado) · Marhaba (olá) · Inshallah (se Deus quiser) · Ma'a salama (adeus)."], ["Useful phrases", "Shukran (thank you) · Marhaba (hello) · Inshallah (God willing) · Ma'a salama (goodbye)."])
  ],
  SA: [
    c("👋", ["Cumprimentar", "Aperto de mão entre homens, às vezes com beijos no rosto entre amigos. Com mulheres, espere que ela tome a iniciativa."], ["Greetings", "Handshakes between men, sometimes cheek kisses among friends. With women, let her take the lead."]),
    c("🕌", ["Horas de oração", "Algumas lojas fecham uns minutos em cada oração. Planeie compras e refeições à volta delas (há apps com horários)."], ["Prayer times", "Some shops close for a few minutes at each prayer. Plan shopping and meals around them (apps show the times)."]),
    c("🌙", ["Ramadão", "Jejum do nascer ao pôr do sol: não coma em público durante o dia. As noites são animadas até de madrugada."], ["Ramadan", "Fasting from dawn to sunset: don't eat in public in daytime. Nights are lively until the early hours."]),
    c("☕", ["Café e tâmaras", "O gahwa com cardamomo é oferecido em casas, lojas e até hotéis. Aceite pelo menos uma chávena."], ["Coffee and dates", "Cardamom gahwa is offered in homes, shops and even hotels. Accept at least one cup."]),
    c("📅", ["Semana", "Fim de semana à sexta e sábado. Na Riyadh Season (outono e inverno) há concertos e festivais quase todas as noites."], ["The week", "The weekend is Friday and Saturday. During Riyadh Season (autumn and winter) there are concerts and festivals almost every night."]),
    c("🗣", ["Frases úteis", "Shukran (obrigado) · Afwan (de nada) · Kam? (quanto?) · Ma'a salama (adeus)."], ["Useful phrases", "Shukran (thank you) · Afwan (you're welcome) · Kam? (how much?) · Ma'a salama (goodbye)."])
  ],
  EG: [
    c("👋", ["Cumprimentar", "Os egípcios são calorosos e conversadores. Aperto de mão entre homens; com mulheres, espere que ela estenda a mão."], ["Greetings", "Egyptians are warm and chatty. Handshakes between men; with women, wait for her to offer her hand."]),
    c("💵", ["Baksheesh", "Pequenas gorjetas fazem parte do dia: casas de banho, guardas que abrem portas, quem ajuda com fotos. Tenha notas pequenas."], ["Baksheesh", "Small tips are part of daily life: toilets, guards who open doors, anyone who helps with photos. Carry small notes."]),
    c("🤝", ["Negociar", "Nos bazares o primeiro preço é só o início. Sorria, ofereça um terço e encontre-se a meio."], ["Haggling", "In bazaars the first price is just the start. Smile, offer a third and meet in the middle."]),
    c("🌙", ["Ramadão", "Muitos jejuam; os restaurantes turísticos abrem, mas evite comer na rua durante o dia. As noites enchem-se de lanternas."], ["Ramadan", "Many fast; tourist restaurants stay open, but avoid eating in the street in daytime. Nights fill with lanterns."]),
    c("🗣", ["Frases úteis", "Shukran (obrigado) · La, shukran (não, obrigado) · Bikam? (quanto?) · Yalla (vamos)."], ["Useful phrases", "Shukran (thank you) · La, shukran (no, thank you) · Bikam? (how much?) · Yalla (let's go)."])
  ],
  JO: [
    c("👋", ["Hospitalidade", "«Ahlan wa sahlan» (bem-vindo) ouve-se em todo o lado. Convites para chá são sinceros e frequentes."], ["Hospitality", "«Ahlan wa sahlan» (welcome) is heard everywhere. Invitations for tea are sincere and frequent."]),
    c("☕", ["Café beduíno", "Café amargo com cardamomo em chávenas pequenas: abane a chávena para dizer que chega."], ["Bedouin coffee", "Bitter cardamom coffee in small cups: shake the cup to say you've had enough."]),
    c("🌙", ["Ramadão", "Não coma nem beba em público durante o dia; ao pôr do sol, o iftar junta famílias inteiras."], ["Ramadan", "Don't eat or drink in public in daytime; at sunset, iftar brings whole families together."]),
    c("📅", ["Semana", "Fim de semana à sexta e sábado. À sexta de manhã a baixa está calma; reanima depois da oração."], ["The week", "The weekend is Friday and Saturday. Downtown is quiet on Friday morning and livens up after prayers."]),
    c("🗣", ["Frases úteis", "Shukran (obrigado) · Marhaba (olá) · Kam? (quanto?) · Yalla (vamos)."], ["Useful phrases", "Shukran (thank you) · Marhaba (hello) · Kam? (how much?) · Yalla (let's go)."])
  ],
  OM: [
    c("👋", ["Cumprimentar", "Os omanis são reservados e muito educados. Aperto de mão suave entre homens; com mulheres, espere que ela estenda a mão."], ["Greetings", "Omanis are reserved and very polite. A gentle handshake between men; with women, wait for her to offer her hand."]),
    c("👘", ["Roupa tradicional", "Os homens usam a dishdasha branca e o kumma bordado; é a roupa do dia a dia, não um traje para turistas."], ["Traditional dress", "Men wear the white dishdasha and embroidered kumma cap; it's everyday wear, not a costume."]),
    c("☕", ["Kahwa e halwa", "Café com cardamomo e o doce halwa são a forma de receber. Aceite com a mão direita."], ["Kahwa and halwa", "Cardamom coffee and halwa sweet are how guests are welcomed. Accept with your right hand."]),
    c("📅", ["Semana", "Fim de semana à sexta e sábado. O souk de Mutrah fecha ao início da tarde e reabre ao fim do dia."], ["The week", "The weekend is Friday and Saturday. Mutrah souk closes in the early afternoon and reopens in the evening."]),
    c("🗣", ["Frases úteis", "Shukran (obrigado) · Marhaba (olá) · Kam? (quanto?) · Ma'a salama (adeus)."], ["Useful phrases", "Shukran (thank you) · Marhaba (hello) · Kam? (how much?) · Ma'a salama (goodbye)."])
  ],
  DE: [
    c("👋", ["Cumprimentar", "Aperto de mão e «Guten Tag»; trate por «Sie» quem não conhece. Pontualidade conta."], ["Greetings", "A handshake and «Guten Tag»; use the formal «Sie» with strangers. Punctuality matters."]),
    c("🍽", ["Horários", "Almoço entre o meio-dia e as 14h, jantar a partir das 18h30. Muitas cozinhas fecham por volta das 22h."], ["Meal times", "Lunch noon–14:00, dinner from 18:30. Many kitchens close around 22:00."]),
    c("💶", ["Dinheiro e gorjetas", "Ainda se usa muito dinheiro. Gorjeta de 5–10%, dita ao pagar («Machen Sie 20»)."], ["Cash and tipping", "Cash is still common. Tip 5–10%, said when paying («Machen Sie 20»)."]),
    c("🤫", ["Domingo e silêncio", "Lojas fechadas ao domingo e horas de silêncio à noite; separe o lixo e devolva as garrafas com depósito (Pfand)."], ["Sundays and quiet", "Shops shut on Sundays and quiet hours at night; sort your rubbish and return deposit bottles (Pfand)."]),
    c("🚦", ["Regras na rua", "Não atravesse com o sinal vermelho, mesmo sem carros, e nunca ande na ciclovia."], ["Street rules", "Don't cross on red even with no cars, and never walk in the bike lane."]),
    c("🗣", ["Frases úteis", "Danke · Bitte · Entschuldigung · Sprechen Sie Englisch? · Die Rechnung, bitte."], ["Useful phrases", "Danke (thanks) · Bitte (please) · Entschuldigung (sorry) · Sprechen Sie Englisch? · Die Rechnung, bitte (the bill)."])
  ],
  AT: [
    c("👋", ["Cumprimentar", "«Grüß Gott» ou «Servus»; títulos académicos usam-se mesmo fora do trabalho («Herr Doktor»)."], ["Greetings", "«Grüß Gott» or «Servus»; academic titles are used even outside work («Herr Doktor»)."]),
    c("☕", ["Café", "Peça uma «Melange»; no café vienense não há pressa e ninguém o apressa."], ["Coffee", "Order a «Melange»; in a Viennese café there's no rush and nobody hurries you."]),
    c("💶", ["Gorjetas", "Arredonde 5–10% e diga o total ao pagar."], ["Tipping", "Round up 5–10% and say the total when paying."]),
    c("🎼", ["Música", "Concertos baratos de pé na Ópera e no Musikverein; vista-se de forma cuidada para a ópera."], ["Music", "Cheap standing tickets at the Opera and Musikverein; dress smartly for the opera."]),
    c("🗣", ["Frases úteis", "Danke · Bitte · Entschuldigung · Zahlen, bitte (a conta)."], ["Useful phrases", "Danke · Bitte · Entschuldigung · Zahlen, bitte (the bill)."])
  ],
  US: [
    c("👋", ["Cumprimentar", "Um aperto de mão e um «How are you?» que não espera resposta longa: responda «Good, thanks!»."], ["Greetings", "A handshake and a «How are you?» that doesn't expect a long answer: reply «Good, thanks!»."]),
    c("💵", ["Gorjetas", "Fazem parte do salário: 18–22% à mesa, 1–2 USD por bebida, 15–20% no táxi. Os preços não incluem imposto."], ["Tipping", "It's part of the wage: 18–22% at table, USD 1–2 per drink, 15–20% in taxis. Prices exclude tax."]),
    c("🍽", ["Refeições", "Jantar cedo (18h–20h) e doses grandes; pedir para levar o resto («a box») é normal."], ["Meals", "Early dinners (6–8 pm) and big portions; asking to take leftovers home («a box») is normal."]),
    c("🍺", ["Álcool", "Só a partir dos 21 anos e com documento; beber na rua é proibido na maioria das cidades."], ["Alcohol", "Only from 21 with ID; drinking in the street is banned in most cities."]),
    c("🚶", ["Na rua", "Fila organizada para tudo, espaço pessoal amplo e simpatia com estranhos — o «small talk» é normal."], ["In the street", "Orderly queues for everything, generous personal space and friendliness with strangers — small talk is normal."]),
    c("🗣", ["Frases úteis", "Check, please (a conta) · Restroom (casa de banho) · Excuse me · To go (para levar)."], ["Useful phrases", "Check, please · Restroom · Excuse me · To go (takeaway)."])
  ],
  CZ: [
    c("👋", ["Cumprimentar", "«Dobrý den» ao entrar numa loja e «Na shledanou» ao sair."], ["Greetings", "«Dobrý den» when entering a shop and «Na shledanou» when leaving."]),
    c("🍺", ["Cerveja", "O país que mais cerveja bebe por pessoa; muitas vezes é mais barata do que a água."], ["Beer", "The world's biggest beer drinkers per person; it's often cheaper than water."]),
    c("💶", ["Coroas, não euros", "A moeda é a coroa (CZK). Pagar em euros sai caro; recuse a conversão no terminal."], ["Crowns, not euros", "The currency is the crown (CZK). Paying in euros costs more; decline conversion at the terminal."]),
    c("🍽", ["Gorjetas", "Cerca de 10%, dito ao pagar; confirme se o serviço já vem na conta."], ["Tipping", "About 10%, said when paying; check whether service is already included."]),
    c("🗣", ["Frases úteis", "Děkuji (obrigado) · Prosím (por favor) · Promiňte (desculpe) · Účet, prosím (a conta)."], ["Useful phrases", "Děkuji (thank you) · Prosím (please) · Promiňte (sorry) · Účet, prosím (the bill)."])
  ],
  SG: [
    c("👋", ["Cumprimentar", "Aperto de mão leve; com muçulmanos, espere que a outra pessoa estenda a mão primeiro."], ["Greetings", "A light handshake; with Muslims, wait for the other person to offer their hand first."]),
    c("🍜", ["Comer fora", "Os hawker centres são o coração da cidade: comida de todas as culturas, barata e limpa."], ["Eating out", "Hawker centres are the city's heart: food from every culture, cheap and clean."]),
    c("💳", ["Pagar", "Sem gorjetas. Contactless em quase tudo; nos hawkers às vezes só dinheiro ou PayNow."], ["Paying", "No tipping. Contactless almost everywhere; hawker stalls sometimes cash or PayNow only."]),
    c("⚖️", ["Regras", "Sem lixo no chão, sem comer no MRT, sem pastilha elástica e fila para tudo — as multas são reais."], ["Rules", "No litter, no eating on the MRT, no chewing gum and queue for everything — the fines are real."]),
    c("🎉", ["Festas", "Ano Novo Chinês, Hari Raya, Deepavali e Natal: as ruas iluminam-se para todas as religiões."], ["Festivals", "Chinese New Year, Hari Raya, Deepavali and Christmas: the streets light up for every faith."])
  ],
  CA: [
    c("👋", ["Cumprimentar", "Aperto de mão e muita cortesia: «sorry» e «thank you» ouvem-se a toda a hora."], ["Greetings", "A handshake and lots of courtesy: «sorry» and «thank you» are heard all the time."]),
    c("💵", ["Gorjetas", "15–20% à mesa e no táxi; os preços não incluem os 13% de imposto em Ontário."], ["Tipping", "15–20% at table and in taxis; prices exclude Ontario's 13% tax."]),
    c("🇫🇷", ["Duas línguas", "O país é oficialmente bilingue: os rótulos e as placas aparecem em inglês e francês."], ["Two languages", "The country is officially bilingual: labels and signs appear in English and French."]),
    c("🍺", ["Álcool", "Só a partir dos 19 anos em Ontário e vendido em lojas próprias (LCBO) ou supermercados autorizados."], ["Alcohol", "Only from 19 in Ontario, sold at dedicated stores (LCBO) or licensed supermarkets."]),
    c("🗣", ["Frases úteis", "Washroom (casa de banho) · Double-double (café com natas e açúcar) · Eh? (não é?)."], ["Useful phrases", "Washroom · Double-double (coffee with cream and sugar) · Eh? (right?)."])
  ],
  MX: [
    c("👋", ["Cumprimentar", "Aperto de mão e um beijo na face entre conhecidos; diga «buenos días» ao entrar."], ["Greetings", "A handshake and one cheek kiss among acquaintances; say «buenos días» when entering."]),
    c("🍽", ["Horários", "Pequeno-almoço farto, a «comida» principal entre as 14h e as 16h e jantar ligeiro tarde."], ["Meal times", "A hearty breakfast, the main «comida» between 2 and 4 pm and a light, late dinner."]),
    c("💵", ["Gorjetas", "10–15% nos restaurantes, umas moedas aos arrumadores e aos que embalam as compras."], ["Tipping", "10–15% in restaurants, a few coins for parking attendants and grocery packers."]),
    c("🌶", ["Picante", "«¿Pica?» é a pergunta certa: os molhos verdes nem sempre são os mais suaves."], ["Spice", "«¿Pica?» (is it hot?) is the right question: green salsas aren't always the mildest."]),
    c("💀", ["Dia de Muertos", "A 1 e 2 de novembro, altares, flores cempasúchil e desfiles: celebra-se a memória, não o medo."], ["Day of the Dead", "On 1–2 November, altars, marigolds and parades: it celebrates memory, not fear."]),
    c("🗣", ["Frases úteis", "Por favor · Gracias · ¿Cuánto cuesta? · La cuenta, por favor · ¡Provecho! (bom apetite)."], ["Useful phrases", "Por favor · Gracias · ¿Cuánto cuesta? (how much?) · La cuenta, por favor · ¡Provecho! (enjoy your meal)."])
  ],
  BR: [
    c("👋", ["Cumprimentar", "Um ou dois beijinhos e abraços até com quem se acabou de conhecer; os brasileiros são calorosos."], ["Greetings", "One or two cheek kisses and hugs even with new acquaintances; Brazilians are warm."]),
    c("💵", ["Gorjetas", "Os 10% de serviço já vêm na conta; nos táxis arredonde."], ["Tipping", "The 10% service charge is already on the bill; round up in taxis."]),
    c("⏰", ["Horas", "A pontualidade é flexível em encontros sociais; nos negócios e nos passeios marcados chegue a horas."], ["Time", "Punctuality is relaxed socially; for business and booked tours be on time."]),
    c("🏖", ["Praia", "A praia é a sala de estar da cidade: alugue cadeira e guarda-sol na barraca e pague no fim."], ["The beach", "The beach is the city's living room: rent a chair and umbrella from a stand and pay at the end."]),
    c("🗣", ["Frases úteis", "Tudo bem? · Obrigado/obrigada · Quanto custa? · A conta, por favor. O português do Brasil é diferente, mas todos se entendem."], ["Useful phrases", "Tudo bem? (how are you?) · Obrigado/obrigada (thanks) · Quanto custa? · A conta, por favor (the bill)."])
  ],
  AR: [
    c("👋", ["Cumprimentar", "Um beijo na face direita, mesmo entre homens que se conhecem."], ["Greetings", "One kiss on the right cheek, even between men who know each other."]),
    c("🍽", ["Horários", "Almoço às 13h–15h e jantar a partir das 21h30; muitos restaurantes enchem só às 23h."], ["Meal times", "Lunch 1–3 pm and dinner from 9:30 pm; many restaurants fill only at 11 pm."]),
    c("🧉", ["Mate", "A infusão partilhada: se lhe oferecerem, beba e devolva ao «cebador»; dizer «gracias» significa que não quer mais."], ["Mate", "The shared infusion: if offered, drink and hand it back to the «cebador»; saying «gracias» means you're done."]),
    c("💵", ["Gorjetas e dinheiro", "10% nos restaurantes, em dinheiro. A inflação é alta: os preços mudam com frequência."], ["Tipping and money", "10% in restaurants, in cash. Inflation is high: prices change often."]),
    c("🗣", ["Frases úteis", "Che (ei, amigo) · Dale (combinado) · ¿Cuánto sale? · La cuenta, por favor. Aqui diz-se «vos» em vez de «tú»."], ["Useful phrases", "Che (hey, mate) · Dale (OK) · ¿Cuánto sale? (how much?) · La cuenta, por favor. People say «vos» instead of «tú»."])
  ],
  MA: [
    c("👋", ["Cumprimentar", "«Salam alaykum» com a mão no peito; entre homens, aperto de mão e beijos na face entre amigos."], ["Greetings", "«Salam alaykum» with a hand on the heart; handshakes between men, cheek kisses among friends."]),
    c("🍵", ["Chá", "Recusar o chá de hortelã é descortês: aceite pelo menos um copo."], ["Tea", "Refusing mint tea is impolite: accept at least one glass."]),
    c("🛍", ["Regatear", "Nos souks o preço é uma conversa: sorria, faça uma contraproposta e esteja pronto a sair."], ["Haggling", "In the souks the price is a conversation: smile, counter-offer and be ready to walk away."]),
    c("🕌", ["Religião", "Sexta-feira ao meio-dia é a oração principal; no Ramadão evite comer em público durante o dia."], ["Religion", "Friday noon is the main prayer; during Ramadan avoid eating in public by day."]),
    c("🗣", ["Frases úteis", "Salam · Shukran (obrigado) · La, shukran (não, obrigado) · Bshhal? (quanto custa?). Fala-se também francês."], ["Useful phrases", "Salam · Shukran (thanks) · La, shukran (no, thanks) · Bshhal? (how much?). French is widely spoken."])
  ],
  ZA: [
    c("🌈", ["Nação arco-íris", "Onze línguas oficiais e muitas culturas; «Howzit?» é o olá de todos."], ["Rainbow nation", "Eleven official languages and many cultures; «Howzit?» is everyone's hello."]),
    c("🔥", ["Braai", "O churrasco é ritual nacional, sobretudo ao fim de semana e a 24 de setembro, o Dia da Herança."], ["Braai", "Barbecue is a national ritual, especially at weekends and on 24 September, Heritage Day."]),
    c("💵", ["Gorjetas", "10–15% nos restaurantes; os «car guards» que vigiam o carro esperam umas moedas."], ["Tipping", "10–15% in restaurants; the «car guards» watching your car expect a few coins."]),
    c("⏰", ["«Now now»", "«Just now» pode querer dizer daqui a bocado ou nunca; «now now» é mesmo já."], ["«Now now»", "«Just now» can mean in a while or never; «now now» means right away."]),
    c("🗣", ["Frases úteis", "Howzit (olá) · Lekker (ótimo) · Robot (semáforo) · Sharp (está bem)."], ["Useful phrases", "Howzit (hello) · Lekker (great) · Robot (traffic light) · Sharp (OK)."])
  ],
  TZ: [
    c("👋", ["Cumprimentar", "Cumprimentar é importante: «Jambo» ou «Mambo?» e perguntar como está antes de qualquer pedido."], ["Greetings", "Greetings matter: «Jambo» or «Mambo?» and ask how someone is before any request."]),
    c("🐢", ["Pole pole", "«Devagar, devagar»: o ritmo é tranquilo, a paciência é bem-vista."], ["Pole pole", "«Slowly, slowly»: the pace is relaxed and patience is appreciated."]),
    c("🤚", ["Mão direita", "Dê e receba dinheiro e comida com a mão direita."], ["Right hand", "Give and receive money and food with your right hand."]),
    c("📷", ["Fotografias", "Peça sempre antes de fotografar pessoas, sobretudo mulheres e os masai."], ["Photos", "Always ask before photographing people, especially women and Maasai."]),
    c("🗣", ["Frases úteis", "Jambo · Asante (obrigado) · Hakuna matata (sem problema) · Bei gani? (quanto custa?)."], ["Useful phrases", "Jambo · Asante (thanks) · Hakuna matata (no problem) · Bei gani? (how much?)."])
  ],
  TN: [
    c("👋", ["Cumprimentar", "«Aslema» ou «Bonjour»; aperto de mão e beijos na face entre amigos."], ["Greetings", "«Aslema» or «Bonjour»; handshakes and cheek kisses among friends."]),
    c("☕", ["Cafés", "Os cafés são o ponto de encontro dos homens; as mulheres preferem os salões de chá e as esplanadas."], ["Cafés", "Cafés are where men meet; women tend to prefer tea rooms and terraces."]),
    c("🌶", ["Harissa", "A pasta de malagueta vai em quase tudo; peça «sans piment» se quiser sem picante."], ["Harissa", "The chilli paste goes in almost everything; ask «sans piment» if you want it mild."]),
    c("💶", ["Gorjetas", "10% nos restaurantes e arredondar nos táxis."], ["Tipping", "10% in restaurants and round up in taxis."]),
    c("🗣", ["Frases úteis", "Aslema · Yaishek (obrigado) · Kaddesh? (quanto?) · Merci. O francês é muito falado."], ["Useful phrases", "Aslema · Yaishek (thanks) · Kaddesh? (how much?) · Merci. French is widely spoken."])
  ],
  ET: [
    c("📅", ["Outro calendário", "A Etiópia tem 13 meses e conta os anos com 7–8 anos de diferença; as horas começam às 6h da manhã."], ["Another calendar", "Ethiopia has 13 months and counts years 7–8 behind; hours start at 6 am."]),
    c("☕", ["O café nasceu aqui", "A cerimónia do café é uma honra: aceite as três rondas se tiver tempo."], ["Coffee was born here", "The coffee ceremony is an honour: accept all three rounds if you have time."]),
    c("🍽", ["Gursha", "Dar comida à boca de um convidado é sinal de amizade; come-se com a mão direita."], ["Gursha", "Feeding a guest by hand is a sign of friendship; eat with your right hand."]),
    c("⛪", ["Jejum", "Às quartas e sextas muitos ortodoxos não comem carne: é o melhor dia para pratos vegetarianos."], ["Fasting", "On Wednesdays and Fridays many Orthodox Christians eat no meat: the best day for vegetarian dishes."]),
    c("🗣", ["Frases úteis", "Selam (olá) · Ameseginalehu (obrigado) · Sint new? (quanto custa?)."], ["Useful phrases", "Selam (hello) · Ameseginalehu (thank you) · Sint new? (how much?)."])
  ],
  KE: [
    c("👋", ["Cumprimentar", "«Jambo» para turistas, «Sasa?» entre jovens; aperto de mão longo e caloroso."], ["Greetings", "«Jambo» for tourists, «Sasa?» among young people; a long, warm handshake."]),
    c("📱", ["M-Pesa", "O dinheiro móvel nasceu aqui em 2007 e paga quase tudo, até bancas de fruta."], ["M-Pesa", "Mobile money was born here in 2007 and pays for almost everything, even fruit stalls."]),
    c("🏃", ["Corredores", "O país dos campeões de fundo: de madrugada vê-se gente a treinar em todo o lado."], ["Runners", "The land of distance champions: at dawn people are training everywhere."]),
    c("🦁", ["Safari", "Fale baixo nos parques, não saia do carro e não dê comida aos animais."], ["Safari", "Speak softly in the parks, stay in the vehicle and never feed animals."]),
    c("🗣", ["Frases úteis", "Habari? (como está?) · Asante (obrigado) · Pole (desculpe) · Ngapi? (quanto?)."], ["Useful phrases", "Habari? (how are you?) · Asante (thanks) · Pole (sorry) · Ngapi? (how much?)."])
  ],
  AO: [
    c("👋", ["Cumprimentar", "Aperto de mão e um «Bom dia» a todos; entre amigos, um abraço e o «Tás bom?»."], ["Greetings", "A handshake and «Bom dia» to everyone; among friends, a hug and «Tás bom?»."]),
    c("🎶", ["Música", "Semba, kizomba e kuduro nasceram aqui; dança-se em casamentos, festas e ao domingo."], ["Music", "Semba, kizomba and kuduro were born here; people dance at weddings, parties and on Sundays."]),
    c("🗣", ["Português de Angola", "Muitas palavras vêm do kimbundu: «kumbu» (dinheiro), «bué» (muito), «candongueiro» (táxi coletivo)."], ["Angolan Portuguese", "Many words come from Kimbundu: «kumbu» (money), «bué» (a lot), «candongueiro» (shared minibus)."]),
    c("🍽", ["Refeições", "O almoço de domingo em família é sagrado, com funge, muamba e calulu."], ["Meals", "Family Sunday lunch is sacred, with funge, muamba and calulu."]),
    c("🎉", ["Festas", "O Carnaval de Luanda desfila na Marginal; a 11 de novembro celebra-se a independência."], ["Festivals", "Luanda's Carnival parades along the Marginal; independence is celebrated on 11 November."])
  ],
  GH: [
    c("👋", ["Cumprimentar", "Cumprimente da direita para a esquerda numa sala e use sempre a mão direita."], ["Greetings", "Greet a room from right to left and always use your right hand."]),
    c("🤝", ["O estalido", "O aperto de mão ganense acaba com um estalido dos dedos."], ["The snap", "The Ghanaian handshake ends with a finger snap."]),
    c("👕", ["Sexta-feira africana", "Às sextas muita gente veste tecidos wax e kente no trabalho."], ["African Friday", "On Fridays many people wear wax-print and kente to work."]),
    c("🏛", ["Akwaaba", "«Bem-vindo» ouve-se em todo o lado; a hospitalidade é motivo de orgulho."], ["Akwaaba", "«Welcome» is heard everywhere; hospitality is a source of pride."]),
    c("🗣", ["Frases úteis", "Akwaaba (bem-vindo) · Medaase (obrigado) · Ete sen? (como está?) · Chale (amigo)."], ["Useful phrases", "Akwaaba (welcome) · Medaase (thank you) · Ete sen? (how are you?) · Chale (mate)."])
  ],
  RW: [
    c("👋", ["Cumprimentar", "«Muraho» com aperto de mão; entre amigos, um abraço de lado três vezes."], ["Greetings", "«Muraho» with a handshake; among friends, a side hug three times."]),
    c("🧹", ["Umuganda", "No último sábado do mês de manhã há trabalho comunitário: tudo para até às 11h."], ["Umuganda", "On the last Saturday morning of the month there's community work: everything pauses until 11 am."]),
    c("🕯", ["Memória", "Abril marca o Kwibuka, a comemoração do genocídio de 1994: é um período de luto e discrição."], ["Remembrance", "April marks Kwibuka, the commemoration of the 1994 genocide: a time of mourning and restraint."]),
    c("♻️", ["Cidade limpa", "Sacos de plástico proibidos e ruas impecáveis; não deite lixo no chão."], ["A clean city", "Plastic bags banned and spotless streets; never litter."]),
    c("🗣", ["Frases úteis", "Muraho (olá) · Murakoze (obrigado) · Amakuru? (como está?). Inglês e francês também se falam."], ["Useful phrases", "Muraho (hello) · Murakoze (thank you) · Amakuru? (how are you?). English and French are also spoken."])
  ],
  SN: [
    c("🤝", ["Teranga", "A hospitalidade senegalesa: quem visita é convidado a comer e a beber chá attaya."], ["Teranga", "Senegalese hospitality: visitors are invited to eat and drink attaya tea."]),
    c("👋", ["Cumprimentar", "«Salaam aleekum», aperto de mão longo e perguntas sobre a família."], ["Greetings", "«Salaam aleekum», a long handshake and questions about the family."]),
    c("🍽", ["À mesa", "Come-se de uma travessa comum com a mão direita; os melhores pedaços vão para o convidado."], ["At the table", "Meals are shared from one platter with the right hand; the best pieces go to the guest."]),
    c("🤼", ["Luta senegalesa", "A «laamb» enche estádios ao domingo, com tambores e rituais antes do combate."], ["Senegalese wrestling", "«Laamb» fills stadiums on Sundays, with drums and rituals before the bout."]),
    c("🗣", ["Frases úteis", "Nanga def? (como está?) · Jërëjëf (obrigado) · Ñaata la? (quanto?). Fala-se francês."], ["Useful phrases", "Nanga def? (how are you?) · Jërëjëf (thank you) · Ñaata la? (how much?). French is spoken."])
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
  ist: [c("🌉", ["Entre dois continentes", "Lado europeu e lado asiático: muitos istambulitas atravessam o Bósforo de ferry todos os dias."], ["Between two continents", "European and Asian sides: many Istanbulites cross the Bosphorus by ferry every day."]), c("🐈", ["Os gatos de Istambul", "Os gatos de rua são cuidados por todos os bairros: comedouros e casinhas em cada esquina."], ["Istanbul's cats", "Street cats are cared for by every neighbourhood: food bowls and little houses on every corner."])],
  dxb: [c("🌍", ["Uma cidade de 200 nacionalidades", "Quase 9 em cada 10 habitantes vêm de fora: Karama e Deira são o Sul da Ásia, Satwa as Filipinas, Al Fahidi o Dubai antigo."], ["A city of 200 nationalities", "Nearly 9 in 10 residents come from abroad: Karama and Deira feel South Asian, Satwa Filipino, Al Fahidi old Dubai."]), c("🛍", ["Cultura dos centros comerciais", "Com o calor, a vida social faz-se nos malls: famílias, cafés e até pistas de esqui."], ["Mall culture", "In the heat, social life happens in malls: families, cafés and even ski slopes."])],
  auh: [c("🏛", ["A capital tranquila", "Mais calma e verde do que o Dubai, com a cultura emirati no centro: Qasr Al Hosn, falcoaria e as tradições beduínas."], ["The calm capital", "Calmer and greener than Dubai, with Emirati culture at its heart: Qasr Al Hosn, falconry and Bedouin traditions."])],
  doh: [c("⚽", ["Cidade do desporto", "Herança do Mundial de 2022: estádios, o Museu Olímpico 3-2-1 e grandes eventos todo o ano."], ["Sports city", "The 2022 World Cup legacy: stadiums, the 3-2-1 Olympic Museum and big events all year."])],
  ruh: [c("🎤", ["A cidade que se abriu", "Concertos, cinemas e a Riyadh Season mudaram a vida noturna. Muitos jovens: mais de metade da população tem menos de 30 anos."], ["A city opening up", "Concerts, cinemas and Riyadh Season have changed nightlife. Very young: over half the population is under 30."])],
  jed: [c("🌊", ["A porta de Meca", "Durante séculos, peregrinos de todo o mundo chegaram por Jedá: a cidade mais aberta e cosmopolita do reino."], ["The gateway to Makkah", "For centuries pilgrims from around the world arrived through Jeddah: the kingdom's most open, cosmopolitan city."])],
  cai: [c("🗣", ["Cairenses", "Humor rápido, trânsito caótico e cafés ahwa onde se joga dominó e gamão até tarde."], ["Cairenes", "Quick humour, chaotic traffic and ahwa cafés where dominoes and backgammon run late."]), c("⛪", ["Cairo copta", "Uma das comunidades cristãs mais antigas do mundo: a Igreja Suspensa e o bairro copta em Old Cairo."], ["Coptic Cairo", "One of the world's oldest Christian communities: the Hanging Church and the Coptic quarter in Old Cairo."])],
  amm: [c("⛰", ["A cidade das sete colinas", "Cada «jabal» tem o seu ritmo: Jabal Amman para cafés, Al-Weibdeh para artistas, a baixa para souks."], ["The city of seven hills", "Each «jabal» has its own pace: Jabal Amman for cafés, Al-Weibdeh for artists, downtown for souks."])],
  mct: [c("⚓", ["Marinheiros e incenso", "Omã comerciou incenso e navegou do Índico a Zanzibar: a mistura vê-se no souk e na comida."], ["Sailors and frankincense", "Oman traded frankincense and sailed from the Indian Ocean to Zanzibar: the mix shows in the souk and the food."])],
  fra: [c("🏦", ["Mainhattan", "Sede do Banco Central Europeu e da bolsa alemã: de dia fatos, ao fim da tarde todos à beira do rio."], ["Mainhattan", "Home of the European Central Bank and the German stock exchange: suits by day, everyone by the river in the evening."]), c("🍏", ["Apfelwein", "A sidra local bebe-se em tabernas com mesas corridas; partilhar mesa com desconhecidos é normal."], ["Apfelwein", "The local cider is drunk in taverns with long tables; sharing with strangers is normal."])],
  ber: [c("🧱", ["Cidade das memórias", "Linhas de pedras no chão marcam onde passava o Muro; as «Stolpersteine» douradas lembram vítimas do nazismo."], ["A city of memory", "Lines of cobbles mark where the Wall ran; golden «Stolpersteine» remember Nazi victims."]), c("🎧", ["Noite de Berlim", "Clubes que abrem ao sábado e fecham na segunda; à porta, seja discreto e não tire fotos lá dentro."], ["Berlin nights", "Clubs that open on Saturday and close on Monday; be low-key at the door and take no photos inside."])],
  muc: [c("🍺", ["Cultura da cerveja", "Nos jardins de cerveja pode levar a sua comida para as mesas sem toalha. Brinde olhando nos olhos: «Prost!»"], ["Beer culture", "In beer gardens you may bring your own food to the tables without cloths. Toast with eye contact: «Prost!»"]), c("👗", ["Tracht", "Lederhosen e dirndl não são só traje turístico: vestem-se em festas, casamentos e na Oktoberfest."], ["Tracht", "Lederhosen and dirndls aren't just for tourists: locals wear them to fêtes, weddings and Oktoberfest."])],
  vie: [c("☕", ["Café vienense", "Pode ficar horas com um só café; o empregado («Herr Ober») traz sempre um copo de água."], ["Viennese cafés", "You can stay for hours over one coffee; the waiter («Herr Ober») always brings a glass of water."]), c("🎻", ["Bailes", "De novembro a fevereiro há centenas de bailes de valsa, do baile da Ópera aos bailes dos cafés."], ["Balls", "From November to February there are hundreds of waltz balls, from the Opera Ball to the coffee-house balls."])],
  prg: [c("🍺", ["Cerveja na mesa", "Um copo vazio é substituído sem perguntar; pouse o porta-copos por cima quando não quiser mais."], ["Beer at the table", "An empty glass is replaced without asking; put the beer mat on top when you've had enough."]), c("🏰", ["Cidade das cem torres", "O centro escapou às bombas da guerra: gótico, barroco e arte nova lado a lado."], ["City of a hundred spires", "The centre escaped wartime bombing: Gothic, baroque and art nouveau side by side."])],
  sin: [c("🍜", ["Hawker centres", "Marque a mesa com um pacote de lenços («chope»), devolva o tabuleiro e respeite as mesas de halal."], ["Hawker centres", "Reserve a table with a tissue packet («chope»), return your tray and keep halal tables separate."]), c("🌏", ["Quatro línguas", "Inglês, mandarim, malaio e tâmil são oficiais; o «Singlish» mistura todas («can or not?», «lah»)."], ["Four languages", "English, Mandarin, Malay and Tamil are official; «Singlish» mixes them all («can or not?», «lah»)."])],
  nyc: [c("🗽", ["A cidade das cidades", "Mais de 800 línguas faladas: em 10 minutos de metro passa da Chinatown à Little Italy e ao bairro judeu ortodoxo."], ["A city of cities", "Over 800 languages spoken: ten subway minutes take you from Chinatown to Little Italy and an Orthodox Jewish neighbourhood."]),
    c("🚶", ["Ritmo nova-iorquino", "No passeio anda-se depressa e pela direita; pare encostado aos prédios para ver o mapa."], ["New York pace", "Sidewalks move fast and keep right; step aside against the buildings to check your map."])],
  was: [c("🏛", ["Capital política", "Fatos ao almoço e protestos no Mall: é normal cruzar com uma manifestação ou uma comitiva oficial."], ["The political capital", "Suits at lunch and protests on the Mall: it's normal to pass a demonstration or a motorcade."]),
    c("🎟", ["Museus gratuitos", "Todos os museus Smithsonian e o zoo são gratuitos — uma tradição desde 1846."], ["Free museums", "All Smithsonian museums and the zoo are free — a tradition since 1846."])],
  sfo: [c("🌈", ["Abertura e inovação", "Berço do movimento LGBT (Castro) e de Silicon Valley: casas vitorianas ao lado de sedes tecnológicas."], ["Openness and innovation", "Birthplace of the LGBT movement (the Castro) and Silicon Valley: Victorian houses beside tech headquarters."]),
    c("🌫", ["O nevoeiro tem nome", "Os locais chamam «Karl» ao nevoeiro que entra pela Golden Gate ao fim da tarde."], ["The fog has a name", "Locals call the fog that rolls through the Golden Gate in the afternoon «Karl»."])],
  chi: [c("🏙", ["Cidade da arquitetura", "Aqui nasceu o arranha-céus, depois do incêndio de 1871. Os locais adoram falar dos seus prédios."], ["City of architecture", "The skyscraper was born here after the 1871 fire. Locals love talking about their buildings."]),
    c("🌭", ["Regras do hot dog", "Pôr ketchup num cachorro à Chicago é quase uma ofensa."], ["Hot dog rules", "Putting ketchup on a Chicago dog is almost an insult."])],
  bos: [c("🎓", ["Cidade universitária", "Harvard, MIT e mais de 30 universidades: em setembro a cidade enche-se de estudantes."], ["A university city", "Harvard, MIT and over 30 universities: in September the city fills with students."]),
    c("⚾", ["Desporto é religião", "Red Sox, Celtics, Patriots e Bruins — use o boné certo e não fale bem de Nova Iorque."], ["Sport is religion", "Red Sox, Celtics, Patriots and Bruins — wear the right cap and don't praise New York."])],
  mia: [c("🇨🇺", ["Miami latina", "Mais de metade da cidade fala espanhol em casa; na Little Havana ouve-se mais espanhol do que inglês."], ["Latin Miami", "More than half the city speaks Spanish at home; in Little Havana you'll hear more Spanish than English."]),
    c("🏖", ["Vida de praia", "Pequeno-almoço ao nascer do sol, praia de manhã e jantar tarde — a cidade aquece à noite."], ["Beach life", "Breakfast at sunrise, beach in the morning and late dinners — the city heats up at night."])],
  lax: [c("🎬", ["Cidade do cinema", "Muitos dos empregados de mesa são atores à espera da grande oportunidade; os estúdios ficam em Burbank e Culver City."], ["Movie town", "Many waiters are actors awaiting their big break; the studios are in Burbank and Culver City."]),
    c("🌮", ["Los Angeles latina", "Quase metade da cidade é latina: as melhores comidas mexicana e salvadorenha dos EUA estão aqui."], ["Latino LA", "Nearly half the city is Latino: the best Mexican and Salvadoran food in the US is here."])],
  las: [c("🎰", ["Regras do casino", "Só a partir dos 21 anos; não fotografe as mesas de jogo e dê gorjeta ao croupier quando ganhar."], ["Casino rules", "Only from 21; don't photograph gaming tables and tip the dealer when you win."]),
    c("🕐", ["Cidade sem relógios", "Os casinos não têm janelas nem relógios e a Strip funciona 24 horas por dia."], ["A city without clocks", "Casinos have no windows or clocks, and the Strip runs 24 hours a day."])],
  msy: [c("🎭", ["Mardi Gras", "Desfiles de carnaval durante semanas até à Terça-feira Gorda; apanhe os colares lançados dos carros."], ["Mardi Gras", "Carnival parades for weeks until Fat Tuesday; catch the beads thrown from the floats."]),
    c("🎺", ["Cultura crioula", "Herança francesa, espanhola, africana e caribenha: o jazz nasceu aqui, na Congo Square."], ["Creole culture", "French, Spanish, African and Caribbean heritage: jazz was born here, in Congo Square."])],
  mco: [c("🎢", ["Capital dos parques", "Mais de 70 milhões de visitantes por ano; a cidade vive ao ritmo dos parques temáticos."], ["Theme park capital", "Over 70 million visitors a year; the city runs on theme park time."]),
    c("🇵🇷", ["Comunidade porto-riquenha", "Uma das maiores do país continental: procure mofongo e lechón nos restaurantes do leste."], ["Puerto Rican community", "One of the largest on the mainland: look for mofongo and lechón in east-side restaurants."])],
  yyz: [c("🌍", ["A cidade mais diversa", "Mais de metade dos habitantes nasceu fora do Canadá; bairros grego, português, indiano e coreano."], ["The most diverse city", "Over half the residents were born outside Canada; Greek, Portuguese, Indian and Korean neighbourhoods."]),
    c("🇵🇹", ["Little Portugal", "Na Dundas West há padarias portuguesas, galos de Barcelos e festas dos santos em junho."], ["Little Portugal", "On Dundas West you'll find Portuguese bakeries, Barcelos roosters and saints' festivals in June."])],
  mex: [c("🏛", ["Cidade sobre um lago", "A cidade foi construída sobre o lago de Tenochtitlan e afunda alguns centímetros por ano: repare nas igrejas inclinadas."], ["A city on a lake", "The city was built on Tenochtitlan's lake and sinks a few centimetres a year: notice the tilted churches."]),
    c("🛍", ["Mercados", "Cada bairro tem o seu mercado coberto com comida barata; o de San Juan e o de Coyoacán são os mais conhecidos."], ["Markets", "Every neighbourhood has a covered market with cheap food; San Juan and Coyoacán are the best known."])],
  rio: [c("🥁", ["Carnaval e samba", "Os ensaios das escolas de samba começam meses antes do Carnaval e são abertos ao público."], ["Carnival and samba", "Samba school rehearsals start months before Carnival and are open to the public."]),
    c("🏐", ["Cultura de praia", "Futevólei, frescobol e o mergulho ao fim do dia; cada posto de praia tem a sua tribo."], ["Beach culture", "Footvolley, paddleball and a sunset swim; every lifeguard post has its own tribe."])],
  bue: [c("💃", ["Tango", "O tango nasceu nos bairros do porto; as milongas são bailes onde se dança até de madrugada."], ["Tango", "Tango was born in the port districts; milongas are dances that go on till dawn."]),
    c("☕", ["Cafés notáveis", "A cidade protege dezenas de «bares notables» históricos; tomar um cortado e ler o jornal é ritual."], ["Notable cafés", "The city protects dozens of historic «bares notables»; a cortado and the newspaper is a ritual."])],
  rak: [c("🎭", ["Contadores de histórias", "A Jemaa el-Fna é Património Oral da UNESCO: contadores, músicos e curandeiros mantêm tradições de séculos."], ["Storytellers", "Jemaa el-Fna is UNESCO Oral Heritage: storytellers, musicians and healers keep centuries-old traditions alive."]),
    c("🏠", ["Riads", "Atrás das paredes cegas escondem-se pátios com fontes e laranjeiras: muitos são hoje casas de hóspedes."], ["Riads", "Behind blank walls hide courtyards with fountains and orange trees: many are now guesthouses."])],
  cas: [c("🏙", ["A capital económica", "A maior cidade do Magrebe vive mais depressa: negócios, Art Déco e surf na mesma tarde."], ["The economic capital", "The Maghreb's largest city moves faster: business, Art Deco and surfing in one afternoon."]),
    c("🎬", ["O filme", "«Casablanca» de 1942 foi filmado em Hollywood, mas o Rick's Café recriou o bar em 2004."], ["The film", "The 1942 «Casablanca» was shot in Hollywood, but Rick's Café recreated the bar in 2004."])],
  cpt: [c("🕌", ["Cultura malaia do Cabo", "Descendentes de escravos e exilados do sudeste asiático, com a sua cozinha e as mesquitas do Bo-Kaap."], ["Cape Malay culture", "Descendants of enslaved people and exiles from Southeast Asia, with their cuisine and the Bo-Kaap mosques."]),
    c("🎺", ["Kaapse Klopse", "A 2 de janeiro, trupes de músicos com fatos brilhantes desfilam pelo centro."], ["Kaapse Klopse", "On 2 January, troupes of musicians in shiny suits parade through the centre."])],
  zan: [c("🚪", ["Portas de Zanzibar", "As portas de madeira esculpida mostram o estatuto da família: as indianas têm pregos de latão, as árabes têm versos do Corão."], ["Zanzibar doors", "Carved wooden doors show the family's status: Indian ones have brass studs, Arab ones carry Koranic verses."]),
    c("🎤", ["Freddie Mercury", "O cantor dos Queen nasceu em Stone Town em 1946; há um pequeno museu na casa da família."], ["Freddie Mercury", "Queen's singer was born in Stone Town in 1946; there's a small museum in the family home."])],
  tun: [c("🏺", ["Três mil anos", "Fenícios, romanos, árabes, otomanos e franceses deixaram marcas a poucos quilómetros uns dos outros."], ["Three thousand years", "Phoenicians, Romans, Arabs, Ottomans and the French left their mark within a few kilometres."]),
    c("🔵", ["Azul de Sidi Bou Said", "Desde 1915 as portas e janelas da aldeia são obrigatoriamente azuis e as paredes brancas."], ["Sidi Bou Said blue", "Since 1915 the village's doors and windows must be blue and the walls white."])],
  add: [c("🌍", ["Capital de África", "Sede da União Africana e de dezenas de embaixadas: ouve-se amárico, oromo, inglês e francês."], ["Africa's capital", "Home to the African Union and dozens of embassies: you'll hear Amharic, Oromo, English and French."]),
    c("🏃", ["Corrida", "A Great Ethiopian Run de novembro junta dezenas de milhares de corredores de verde."], ["Running", "November's Great Ethiopian Run brings together tens of thousands of runners in green."])],
  nbo: [c("🌳", ["Cidade verde ao sol", "A única capital do mundo com um parque nacional de leões e rinocerontes dentro dos limites."], ["Green city in the sun", "The only capital in the world with a national park of lions and rhinos inside its limits."]),
    c("🚐", ["Matatus", "Os miniautocarros pintados com grafítis e música alta são arte de rua em movimento."], ["Matatus", "Minibuses painted with graffiti and blasting music are moving street art."])],
  lad: [c("🌊", ["Vida na Ilha", "Ao fim de semana, Luanda vai para a Ilha e para o Mussulo: praia, peixe grelhado e música até tarde."], ["Island life", "At weekends Luanda heads to the Ilha and Mussulo: beach, grilled fish and music until late."]),
    c("🛺", ["Candongueiros", "Os miniautocarros azuis e brancos com cobradores a gritar os destinos são o transporte de quase todos."], ["Candongueiros", "Blue-and-white minibuses with conductors shouting destinations are how almost everyone gets around."])],
  acc: [c("⚰️", ["Caixões de fantasia", "Os artesãos ga fazem caixões em forma de peixe, avião ou garrafa: celebram a vida de quem parte."], ["Fantasy coffins", "Ga craftsmen make coffins shaped like fish, planes or bottles: they celebrate the life of the departed."]),
    c("🎶", ["Afrobeats", "Acra é uma das capitais da música africana; dezembro é a época dos concertos e do regresso da diáspora."], ["Afrobeats", "Accra is one of the capitals of African music; December is the season of concerts and the diaspora's return."])],
  kgl: [c("🏍", ["Mota-táxi", "As motas com coletes numerados levam um passageiro com capacete por toda a cidade."], ["Moto taxis", "Motorbikes with numbered vests carry one helmeted passenger all over the city."]),
    c("🌱", ["País das mil colinas", "A cidade espalha-se por colinas verdes: as distâncias a pé são curtas, mas sobe-se muito."], ["Land of a thousand hills", "The city spreads over green hills: walking distances are short, but there's lots of climbing."])],
  dkr: [c("🕌", ["Confrarias", "Os mourides e outras confrarias sufis marcam a vida da cidade; o café Touba nasceu delas."], ["Brotherhoods", "The Mourides and other Sufi brotherhoods shape city life; Touba coffee comes from them."]),
    c("🚌", ["Car rapide", "Os velhos autocarros pintados à mão com as palavras «Alhamdoulilah» são um ícone, embora estejam a ser substituídos."], ["Car rapide", "The old hand-painted buses inscribed «Alhamdoulilah» are an icon, though they are being replaced."])]
};
