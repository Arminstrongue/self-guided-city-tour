/**
 * Guia prático por cidade (conteúdo geral; preços aproximados em moeda local, outubro de 2026).
 * Textos em PT e EN; ES, FR e DE usam o inglês até haver tradução.
 */
export type Tip = { k: "bag" | "sim" | "pay" | "tip" | "water" | "safety" | "plug" | "toilet" | "dress"; pt: string; en: string };
export type Food = { n: string; p: number; pt: string; en: string };
export type Practical = { emergency: string; tips: Tip[]; food: Food[] };

const EU_SIM: Tip = { k: "sim", pt: "Com cartão SIM da UE não paga roaming. De fora da UE, um eSIM de dados para 1 dia custa pouco; os aeroportos e muitos cafés têm Wi‑Fi grátis.", en: "EU SIM cards roam at no extra cost. From outside the EU, a 1‑day data eSIM is cheap; airports and many cafés have free Wi‑Fi." };
const PLUG_EU: Tip = { k: "plug", pt: "Tomadas tipo C/F, 230 V.", en: "Type C/F sockets, 230 V." };
const BAG: Tip = { k: "bag", pt: "Deixe a bagagem no depósito do aeroporto ou num guarda-bagagem parceiro da rota (marcado com ★). Leve só o essencial e o passaporte.", en: "Leave luggage at the airport left-luggage desk or a partner storage point on the route (marked ★). Carry only essentials and your passport." };
const TOILET: Tip = { k: "toilet", pt: "Casas de banho em estações, centros comerciais e museus; num café, peça uma bebida.", en: "Toilets in stations, shopping centres and museums; in a café, buy a drink first." };

const UK_SIM: Tip = { k: "sim", pt: "O Reino Unido não faz parte do roaming da UE: confirme o tarifário ou use um eSIM. Wi‑Fi grátis no aeroporto e em muitos cafés.", en: "The UK is outside EU roaming: check your plan or use an eSIM. Free Wi‑Fi at the airport and many cafés." };
const UK_PAY: Tip = { k: "pay", pt: "Quase tudo aceita cartão contactless, incluindo autocarros e comboios.", en: "Almost everything takes contactless, including buses and trains." };
const UK_TIP: Tip = { k: "tip", pt: "Muitos restaurantes juntam 10–12,5% de serviço; confirme na conta. Nos pubs não se deixa gorjeta ao balcão.", en: "Many restaurants add 10–12.5% service; check the bill. No tipping at the bar in pubs." };
const UK_WATER: Tip = { k: "water", pt: "A água da torneira é potável; peça \"tap water\", é grátis.", en: "Tap water is safe; ask for \"tap water\", it's free." };
const UK_PLUG: Tip = { k: "plug", pt: "Tomadas tipo G, 230 V: precisa de adaptador.", en: "Type G sockets, 230 V: you need an adapter." };
const ukSafety = (pt: string, en: string): Tip => ({ k: "safety", pt: `Trânsito pela esquerda: olhe para a direita ao atravessar. ${pt}`, en: `Traffic drives on the left: look right when crossing. ${en}` });
const uk = (safety: Tip, food: Food[], extra: Tip[] = []): Practical => ({ emergency: "999 / 112", tips: [BAG, UK_SIM, UK_PAY, UK_TIP, UK_WATER, safety, UK_PLUG, TOILET, ...extra], food });

/* ---------- Médio Oriente ---------- */
const ME_SIM: Tip = { k: "sim", pt: "Fora do roaming da UE: use um eSIM de dados ou o Wi‑Fi grátis do aeroporto, dos centros comerciais e do metro.", en: "Outside EU roaming: use a data eSIM or the free Wi‑Fi at the airport, malls and metro." };
const G_PLUG: Tip = { k: "plug", pt: "Tomadas tipo G (britânicas), 230 V: leve adaptador.", en: "Type G (British) sockets, 230 V: bring an adapter." };
const G_TOILET: Tip = { k: "toilet", pt: "Casas de banho limpas e gratuitas em centros comerciais, estações de metro e mesquitas (zona de abluções à parte).", en: "Clean, free toilets in malls, metro stations and by mosques (separate ablution areas)." };
const ME_DRESS: Tip = { k: "dress", pt: "Ombros e joelhos cobertos em mesquitas, souks e edifícios públicos; as mulheres cobrem o cabelo nas mesquitas (muitas emprestam abaya e lenço). Descalce-se à entrada.", en: "Cover shoulders and knees in mosques, souks and public buildings; women cover their hair in mosques (many lend an abaya and scarf). Take shoes off at the door." };
const RAMADAN = " Durante o Ramadão não coma, beba nem fume em público durante o dia; muitos sítios mudam de horário.";
const RAMADAN_EN = " During Ramadan don't eat, drink or smoke in public in daytime; many places change hours.";
const gulfSafety = (pt: string, en: string): Tip => ({ k: "safety", pt: `Cidade muito segura. Beba muita água e evite andar ao sol entre as 11h e as 16h no verão.${RAMADAN} ${pt}`, en: `A very safe city. Drink plenty of water and avoid walking in the sun between 11:00 and 16:00 in summer.${RAMADAN_EN} ${en}` });
const GULF_PAY: Tip = { k: "pay", pt: "Cartão e contactless aceites quase em todo o lado, incluindo táxis e metro. Leve algum dinheiro para souks e barcos.", en: "Cards and contactless work almost everywhere, including taxis and the metro. Carry a little cash for souks and boats." };
const GULF_WATER: Tip = { k: "water", pt: "A água da torneira é dessalinizada e segura, mas quase todos bebem engarrafada; é barata em qualquer loja.", en: "Tap water is desalinated and safe, but most people drink bottled; it's cheap in any shop." };
const meBag = (pt: string, en: string): Tip => ({ k: "bag", pt: `${BAG.pt} ${pt}`.trim(), en: `${BAG.en} ${en}`.trim() });

/* ---------- Estados Unidos ---------- */
const US_SIM: Tip = { k: "sim", pt: "Fora do roaming da UE: um eSIM de dados dos EUA é barato e funciona logo. Wi‑Fi grátis nos aeroportos, cafés e museus.", en: "Outside EU roaming: a US data eSIM is cheap and works straight away. Free Wi‑Fi at airports, cafés and museums." };
const US_PAY: Tip = { k: "pay", pt: "Contactless aceite em quase todo o lado, incluindo metro e autocarros (OMNY, Clipper, Ventra…). Os preços não incluem o imposto sobre vendas (6–10%), somado na caixa.", en: "Contactless works almost everywhere, including subways and buses (OMNY, Clipper, Ventra…). Prices exclude sales tax (6–10%), added at the till." };
const US_TIP: Tip = { k: "tip", pt: "Gorjeta esperada: 18–22% nos restaurantes com serviço à mesa, 1–2 USD por bebida no bar e 15–20% em táxis. No balcão é opcional.", en: "Tipping is expected: 18–22% at table-service restaurants, USD 1–2 per drink at bars and 15–20% for taxis. Optional at counters." };
const US_WATER: Tip = { k: "water", pt: "A água da torneira é potável e os restaurantes servem-na gratuitamente com gelo.", en: "Tap water is safe and restaurants serve it free with ice." };
const US_PLUG: Tip = { k: "plug", pt: "Tomadas tipo A/B, 120 V: precisa de adaptador; confirme que o carregador aceita 100–240 V.", en: "Type A/B sockets, 120 V: you need an adapter; check your charger accepts 100–240 V." };
const US_TOILET: Tip = { k: "toilet", pt: "Casas de banho públicas são raras: use as de museus, centros comerciais, hotéis, bibliotecas e cafés de cadeia.", en: "Public toilets are rare: use those in museums, malls, hotels, libraries and chain cafés." };
const usSafety = (pt: string, en: string): Tip => ({ k: "safety", pt: `Atravesse só nas passadeiras e com o sinal do peão. ${pt}`, en: `Cross only at crosswalks with the walk signal. ${en}` });
const us = (safety: Tip, food: Food[], extra: Tip[] = []): Practical => ({ emergency: "911", tips: [BAG, US_SIM, US_PAY, US_TIP, US_WATER, safety, US_PLUG, US_TOILET, ...extra], food });

/* ---------- Canadá e América Latina ---------- */
const CA_PAY: Tip = { k: "pay", pt: "Contactless em quase tudo, incluindo o metro e o UP Express (PRESTO ou cartão bancário). Os preços não incluem impostos (13% em Ontário).", en: "Contactless almost everywhere, including the subway and UP Express (PRESTO or bank card). Prices exclude tax (13% in Ontario)." };
const CA_TIP: Tip = { k: "tip", pt: "Gorjeta esperada: 15–20% à mesa e no táxi, 1–2 CAD por bebida.", en: "Tipping is expected: 15–20% at table and in taxis, CAD 1–2 per drink." };
const LAT_SIM: Tip = { k: "sim", pt: "Fora do roaming da UE: compre um eSIM antes de viajar ou um cartão pré-pago numa loja oficial da operadora (leve o passaporte).", en: "Outside EU roaming: buy an eSIM before you travel or a prepaid SIM at an official carrier shop (bring your passport)." };
const LAT_WATER: Tip = { k: "water", pt: "Não beba água da torneira: use garrafa ou água filtrada, também para lavar os dentes. O gelo dos restaurantes é normalmente de água purificada.", en: "Don't drink tap water: use bottled or filtered water, also for brushing teeth. Restaurant ice is usually purified." };
const LAT_TOILET: Tip = { k: "toilet", pt: "Casas de banho em centros comerciais, museus e cafés; nalgumas públicas paga-se pouco e o papel vai no cesto, não na sanita.", en: "Toilets in malls, museums and cafés; some public ones charge a little and paper goes in the bin, not the bowl." };
const latSafety = (pt: string, en: string): Tip => ({ k: "safety", pt: `Guarde o telemóvel ao andar na rua e use táxis de app ou autorizados. ${pt}`, en: `Keep your phone away while walking and use app or authorised taxis. ${en}` });
const lat = (emergency: string, sim: Tip, pay: Tip, tip: Tip, safety: Tip, plug: Tip, food: Food[], extra: Tip[] = []): Practical => ({ emergency, tips: [BAG, sim, pay, tip, LAT_WATER, safety, plug, LAT_TOILET, ...extra], food });

/* ---------- África ---------- */
const AF_WATER: Tip = { k: "water", pt: "Beba água engarrafada ou filtrada e evite gelo de origem duvidosa; confirme que a garrafa vem selada.", en: "Drink bottled or filtered water and avoid ice of doubtful origin; check that bottles are sealed." };
const AF_CASH: Tip = { k: "pay", pt: "Cartão nos hotéis, centros comerciais e restaurantes maiores; dinheiro local nos mercados, táxis e bancas. Levante em multibancos dentro de bancos ou centros comerciais.", en: "Cards at hotels, malls and bigger restaurants; local cash for markets, taxis and stalls. Withdraw at ATMs inside banks or malls." };
const afSafety = (pt: string, en: string): Tip => ({ k: "safety", pt: `Use táxis de app ou do hotel, guarde o telemóvel na rua e evite andar a pé depois do anoitecer em zonas vazias. ${pt}`, en: `Use app or hotel taxis, keep your phone away in the street and avoid walking after dark in empty areas. ${en}` });
const plug = (pt: string, en: string): Tip => ({ k: "plug", pt, en });
const tip = (pt: string, en: string): Tip => ({ k: "tip", pt, en });
const af = (emergency: string, pay: Tip, t: Tip, safety: Tip, p: Tip, food: Food[], extra: Tip[] = [], water: Tip = AF_WATER): Practical => ({ emergency, tips: [BAG, LAT_SIM, pay, t, water, safety, p, LAT_TOILET, ...extra], food });
const MA_DRESS: Tip = { k: "dress", pt: "Ombros e joelhos cobertos na medina e nos monumentos; os não muçulmanos não entram nas mesquitas, exceto onde há visitas (Hassan II).", en: "Cover shoulders and knees in the medina and at monuments; non-Muslims may not enter mosques, except where tours exist (Hassan II)." };
const MA_TIP = tip("Gorjeta de 10% nos restaurantes e umas moedas a guias, arrumadores e a quem posa para fotos. Regateie nos souks: comece em metade do preço.", "Tip 10% in restaurants and a few coins to guides, parking attendants and anyone posing for photos. Haggle in the souks: start at half the price.");
const MA_PAY: Tip = { k: "pay", pt: "Dirham (MAD) em dinheiro para souks, petits taxis e bancas; cartão nos riads e restaurantes maiores. Exija o taxímetro no petit taxi.", en: "Dirhams (MAD) in cash for souks, petit taxis and stalls; cards at riads and bigger restaurants. Insist on the meter in petit taxis." };

/* ---------- Alemanha e Áustria ---------- */
const DE_PAY: Tip = { k: "pay", pt: "Cartão e contactless são aceites cada vez mais, mas padarias, bancas e algumas tabernas ainda só aceitam dinheiro: leve algum.", en: "Cards and contactless are increasingly accepted, but bakeries, stalls and some taverns are still cash-only: carry some." };
const DE_TIP: Tip = { k: "tip", pt: "Arredonde 5–10% e diga o total ao pagar, em vez de deixar dinheiro na mesa.", en: "Round up 5–10% and tell the server the total when paying, rather than leaving money on the table." };
const DE_WATER: Tip = { k: "water", pt: "A água da torneira é potável, mas nos restaurantes serve-se água engarrafada (paga). Garrafas de plástico têm depósito (Pfand): devolva-as no supermercado.", en: "Tap water is safe, but restaurants serve bottled water (paid). Plastic bottles carry a deposit (Pfand): return them at supermarkets." };
const DE_SAFETY = (pt: string, en: string): Tip => ({ k: "safety", pt: `Cidade segura. Não ande nas ciclovias e valide o bilhete antes de entrar: os revisores multam em 60 €. ${pt}`, en: `A safe city. Keep out of bike lanes and validate your ticket before boarding: inspectors fine €60. ${en}` });
const DE_TOILET: Tip = { k: "toilet", pt: "Casas de banho em estações (muitas vezes a 0,50–1 €), centros comerciais e museus.", en: "Toilets in stations (often €0.50–1), shopping centres and museums." };
const DE_SUNDAY: Tip = { k: "bag", pt: "Ao domingo quase todas as lojas fecham; as das estações e do aeroporto ficam abertas.", en: "Almost all shops close on Sundays; those in stations and at the airport stay open." };

export const PRACTICAL: Record<string, Practical> = {
  ist: { emergency: "112", tips: [
    { k: "bag", pt: `${BAG.pt} Voa com a Turkish Airlines? Pergunte no balcão Touristanbul do aeroporto se a visita gratuita para passageiros em trânsito cabe no seu horário.`, en: `${BAG.en} Flying Turkish Airlines? Ask at the airport's Touristanbul desk whether the free transit tour fits your schedule.` },
    { k: "sim", pt: "A Turquia não faz parte do roaming da UE: use um eSIM de dados ou o Wi‑Fi grátis do aeroporto.", en: "Türkiye is outside EU roaming: use a data eSIM or the airport's free Wi‑Fi." },
    { k: "pay", pt: "Cartão aceite quase em todo o lado, mas bazares, bancas e máquinas do Istanbulkart pedem muitas vezes dinheiro em liras. Evite trocar dinheiro no aeroporto.", en: "Cards work almost everywhere, but bazaars, stalls and Istanbulkart machines often need lira cash. Avoid changing money at the airport." },
    { k: "tip", pt: "Gorjeta de 5–10% nos restaurantes.", en: "Tip 5–10% in restaurants." },
    { k: "water", pt: "Beba água engarrafada; a da torneira não é recomendada para beber.", en: "Drink bottled water; tap water isn't recommended for drinking." },
    { k: "dress", pt: "Nas mesquitas: ombros e joelhos cobertos, sapatos descalçados à entrada, e as mulheres cobrem o cabelo (há lenços à entrada). Não visite durante as orações.", en: "In mosques: cover shoulders and knees, take shoes off at the door, and women cover their hair (scarves are provided). Avoid prayer times." },
    { k: "safety", pt: "Desconfie de convites para bares e de engraxadores que \"deixam cair\" a escova. Nos táxis, use o taxímetro ou a app BiTaksi.", en: "Beware of bar invitations and shoe-shiners who \"drop\" their brush. In taxis, insist on the meter or use the BiTaksi app." },
    PLUG_EU,
    { k: "toilet", pt: "Há casas de banho públicas junto às mesquitas e estações, muitas vezes com uma pequena taxa: tenha moedas.", en: "Public toilets near mosques and stations often charge a small fee: keep some coins." }],
    food: [
      { n: "Simit", p: 25, pt: "Rosca de sésamo vendida nas carrinhas vermelhas.", en: "Sesame bread ring from the red street carts." },
      { n: "Balık ekmek", p: 300, pt: "Sandes de peixe grelhado junto à Ponte de Gálata, em Eminönü.", en: "Grilled fish sandwich by the Galata Bridge in Eminönü." },
      { n: "Döner", p: 250, pt: "Em pão ou wrap (dürüm), em qualquer bairro.", en: "In bread or a wrap (dürüm), in any neighbourhood." },
      { n: "Çay", p: 40, pt: "Chá turco em copo de vidro, a bebida de todos os momentos.", en: "Turkish tea in a tulip glass, drunk all day." }
    ] },
  edi: uk(ukSafety("A Royal Mile e Calton Hill têm ruas inclinadas e calçada; o tempo muda depressa, leve um casaco.", "The Royal Mile and Calton Hill are steep and cobbled; the weather changes fast, bring a jacket."), [
    { n: "Scotch pie", p: 3, pt: "Tarte de carne picante, em padarias como a Greggs ou talhos.", en: "Spiced meat pie from bakeries and butchers." },
    { n: "Haggis, neeps & tatties", p: 12, pt: "O prato escocês, num pub da Old Town.", en: "The Scottish classic, in an Old Town pub." },
    { n: "Fish supper", p: 11, pt: "Peixe frito com batatas, num \"chippy\".", en: "Fish and chips from a \"chippy\"." }
  ]),
  man: uk(ukSafety("Os autocarros \"Free Bus\" do centro são gratuitos; nos outros paga com contactless.", "The city-centre \"Free Bus\" is free; pay contactless on other buses."), [
    { n: "Pie & peas", p: 7, pt: "Tarte salgada com ervilhas, num pub ou mercado.", en: "Savoury pie with peas, in a pub or market." },
    { n: "Curry", p: 10, pt: "Caril no Curry Mile (Wilmslow Road) ou no Northern Quarter.", en: "Curry on the Curry Mile (Wilmslow Road) or in the Northern Quarter." },
    { n: "Meal deal", p: 5, pt: "Sandes, snack e bebida no supermercado.", en: "Sandwich, snack and drink from a supermarket." }
  ]),
  gla: uk(ukSafety("O Airport Express de ida e volta (17,50 £) sai mais barato do que duas viagens simples.", "A return Airport Express ticket (£17.50) is cheaper than two singles."), [
    { n: "Scotch pie", p: 3, pt: "O lanche clássico escocês.", en: "The classic Scottish snack." },
    { n: "Fish supper", p: 10, pt: "Peixe frito com batatas, num \"chippy\".", en: "Fish and chips from a \"chippy\"." },
    { n: "Irn-Bru", p: 1.5, pt: "O refrigerante laranja que os escoceses bebem mais do que Coca-Cola.", en: "The orange soda Scots drink more than cola." }
  ]),
  liv: uk(ukSafety("O centro, as docas e o Cavern Quarter fazem-se a pé em poucos minutos.", "The centre, docks and Cavern Quarter are a few minutes apart on foot."), [
    { n: "Scouse", p: 9, pt: "Guisado de carne e batata que deu nome aos habitantes.", en: "The meat-and-potato stew that gave locals their nickname." },
    { n: "Fish & chips", p: 11, pt: "Num \"chippy\" perto das docas.", en: "From a chippy near the docks." },
    { n: "Meal deal", p: 5, pt: "Sandes, snack e bebida no supermercado.", en: "Sandwich, snack and drink from a supermarket." }
  ]),
  bir: uk(ukSafety("Os canais são planos e bons para caminhar; cuidado com as bicicletas nos caminhos de sirga.", "The canals are flat and great for walking; watch for bikes on the towpaths."), [
    { n: "Balti", p: 12, pt: "Caril criado em Birmingham, servido na panela onde é cozinhado.", en: "Curry invented in Birmingham, served in the pan it's cooked in." },
    { n: "Pork pie", p: 3, pt: "Tarte fria de porco, no mercado do Bullring.", en: "Cold pork pie from the Bullring market." },
    { n: "Meal deal", p: 5, pt: "Sandes, snack e bebida no supermercado.", en: "Sandwich, snack and drink from a supermarket." }
  ]),
  lis: { emergency: "112", tips: [BAG, EU_SIM,
    { k: "pay", pt: "Cartão contactless aceite quase em todo o lado; tenha algumas moedas para cafés pequenos.", en: "Contactless cards are accepted almost everywhere; keep some coins for small cafés." },
    { k: "tip", pt: "Gorjeta opcional: arredondar ou 5–10% à mesa.", en: "Tipping is optional: round up or 5–10% at table." },
    { k: "water", pt: "A água da torneira é potável.", en: "Tap water is safe to drink." },
    { k: "safety", pt: "Cuidado com carteiristas no elétrico 28 e na Baixa. A calçada escorrega com chuva.", en: "Watch for pickpockets on tram 28 and in the Baixa. Cobbles are slippery when wet." },
    PLUG_EU, TOILET],
    food: [
      { n: "Pastel de nata", p: 1.5, pt: "Em qualquer pastelaria; os de Belém são os mais famosos.", en: "At any pastry shop; Belém's are the most famous." },
      { n: "Bifana", p: 3.5, pt: "Sandes de porco marinado, ao balcão.", en: "Marinated pork sandwich, eaten at the counter." },
      { n: "Prato do dia", p: 11, pt: "Menu de almoço nas tascas: prato, bebida e café.", en: "Lunch special in local tascas: main, drink and coffee." }
    ] },
  opo: { emergency: "112", tips: [BAG, EU_SIM,
    { k: "pay", pt: "Cartão contactless aceite quase em todo o lado.", en: "Contactless cards are accepted almost everywhere." },
    { k: "tip", pt: "Gorjeta opcional: arredondar ou 5–10%.", en: "Tipping is optional: round up or 5–10%." },
    { k: "water", pt: "A água da torneira é potável.", en: "Tap water is safe to drink." },
    { k: "safety", pt: "Ruas muito inclinadas e calçada escorregadia: calçado confortável.", en: "Very steep streets and slippery cobbles: wear comfortable shoes." },
    PLUG_EU, TOILET],
    food: [
      { n: "Francesinha", p: 13, pt: "Sandes com molho picante, prato típico e farto.", en: "Hearty sandwich in a spicy sauce, the local classic." },
      { n: "Bifana", p: 3.5, pt: "Sandes de porco ao balcão.", en: "Pork sandwich at the counter." },
      { n: "Prato do dia", p: 10, pt: "Menu de almoço completo nas tascas.", en: "Full lunch menu in local tascas." }
    ] },
  mad: { emergency: "112", tips: [BAG, EU_SIM,
    { k: "pay", pt: "Cartão contactless aceite em quase todo o lado.", en: "Contactless cards are accepted almost everywhere." },
    { k: "tip", pt: "Gorjeta opcional; deixar alguns trocos é habitual.", en: "Tipping is optional; leaving small change is common." },
    { k: "water", pt: "A água da torneira é potável e boa.", en: "Tap water is safe and good." },
    { k: "safety", pt: "Atenção a carteiristas na Puerta del Sol e no metro.", en: "Watch for pickpockets at Puerta del Sol and on the metro." },
    PLUG_EU, TOILET],
    food: [
      { n: "Bocadillo de calamares", p: 5, pt: "Sandes de lulas fritas, junto à Plaza Mayor.", en: "Fried squid sandwich, near Plaza Mayor." },
      { n: "Menú del día", p: 14, pt: "Almoço de dois pratos, bebida e sobremesa (dias úteis).", en: "Two-course lunch with drink and dessert (weekdays)." },
      { n: "Churros con chocolate", p: 5, pt: "O lanche clássico de Madrid.", en: "Madrid's classic snack." }
    ] },
  bcn: { emergency: "112", tips: [BAG, EU_SIM,
    { k: "pay", pt: "Cartão contactless aceite em quase todo o lado.", en: "Contactless cards are accepted almost everywhere." },
    { k: "tip", pt: "Gorjeta opcional; deixar alguns trocos é habitual.", en: "Tipping is optional; small change is common." },
    { k: "water", pt: "A água da torneira é potável, mas sabe a cloro; muitos preferem engarrafada.", en: "Tap water is safe but tastes of chlorine; many prefer bottled." },
    { k: "safety", pt: "La Rambla e o metro são as zonas com mais carteiristas: mochila à frente.", en: "La Rambla and the metro are pickpocket hotspots: wear your bag in front." },
    PLUG_EU, TOILET],
    food: [
      { n: "Menú del día", p: 15, pt: "Almoço completo em dias úteis.", en: "Full weekday lunch." },
      { n: "Bocadillo", p: 5, pt: "Sandes de presunto ou tortilha.", en: "Ham or tortilla sandwich." },
      { n: "Tapas no mercado", p: 8, pt: "Na Boqueria, coma ao balcão em vez de comprar à entrada.", en: "At the Boqueria, eat at a counter rather than buying at the entrance." }
    ] },
  par: { emergency: "112", tips: [BAG, EU_SIM,
    { k: "pay", pt: "Cartão contactless aceite em quase todo o lado; o metro também aceita cartão bancário.", en: "Contactless cards are accepted almost everywhere, including on the metro." },
    { k: "tip", pt: "O serviço já está incluído; arredonde se gostou.", en: "Service is included; round up if you liked it." },
    { k: "water", pt: "A água da torneira é potável e há fontes públicas gratuitas.", en: "Tap water is safe and there are free public fountains." },
    { k: "safety", pt: "Carteiristas no metro (linha 1), na Torre Eiffel e no Sacré-Cœur; recuse pulseiras e petições na rua.", en: "Pickpockets on metro line 1, at the Eiffel Tower and Sacré-Cœur; decline bracelets and street petitions." },
    PLUG_EU, { k: "toilet", pt: "Sanitários públicos automáticos gratuitos nas ruas e nos jardins.", en: "Free automatic public toilets in streets and parks." }],
    food: [
      { n: "Jambon-beurre", p: 5, pt: "A sandes de presunto e manteiga de qualquer boulangerie.", en: "Ham-and-butter baguette from any bakery." },
      { n: "Formule boulangerie", p: 10, pt: "Sandes, bebida e sobremesa na padaria.", en: "Sandwich, drink and dessert deal at a bakery." },
      { n: "Crêpe", p: 5, pt: "Nas bancas de rua, doce ou salgada.", en: "From street stands, sweet or savoury." }
    ] },
  lon: { emergency: "999 / 112", tips: [BAG,
    { k: "sim", pt: "O Reino Unido não faz parte do roaming da UE: confirme o tarifário ou use um eSIM. Wi‑Fi grátis no aeroporto e em muitos cafés.", en: "The UK is outside EU roaming: check your plan or use an eSIM. Free Wi‑Fi at the airport and many cafés." },
    { k: "pay", pt: "Quase tudo é sem dinheiro. Use o mesmo cartão contactless em todas as viagens para ter o teto diário.", en: "Almost everything is cashless. Use the same contactless card on every journey to get the daily cap." },
    { k: "tip", pt: "Muitos restaurantes juntam 12,5% de serviço; confirme na conta.", en: "Many restaurants add 12.5% service; check the bill." },
    { k: "water", pt: "A água da torneira é potável; peça \"tap water\", é grátis.", en: "Tap water is safe; ask for \"tap water\", it's free." },
    { k: "safety", pt: "Atenção ao trânsito pela esquerda ao atravessar. Carteiristas em Westminster e no West End.", en: "Traffic drives on the left: look right when crossing. Pickpockets at Westminster and in the West End." },
    { k: "plug", pt: "Tomadas tipo G, 230 V: precisa de adaptador.", en: "Type G sockets, 230 V: you need an adapter." }, TOILET],
    food: [
      { n: "Meal deal", p: 5, pt: "Sandes, snack e bebida no supermercado.", en: "Sandwich, snack and drink from a supermarket." },
      { n: "Fish & chips", p: 15, pt: "O clássico, num pub ou take-away.", en: "The classic, at a pub or takeaway." },
      { n: "Pie & mash", p: 9, pt: "Tarte salgada com puré, barata e farta.", en: "Savoury pie with mash, cheap and filling." }
    ] },
  rom: { emergency: "112", tips: [BAG, EU_SIM,
    { k: "pay", pt: "Cartão aceite na maioria dos sítios; tenha moedas para o café ao balcão.", en: "Cards are accepted in most places; keep coins for coffee at the bar." },
    { k: "tip", pt: "O \"coperto\" (serviço de mesa) costuma vir na conta; gorjeta opcional.", en: "A \"coperto\" cover charge is often on the bill; tipping is optional." },
    { k: "water", pt: "Encha a garrafa nos \"nasoni\", as fontes públicas gratuitas.", en: "Refill your bottle at the free \"nasoni\" public fountains." },
    { k: "safety", pt: "Carteiristas em Termini, no autocarro 64 e na Fontana di Trevi. Ombros e joelhos cobertos para entrar nas igrejas.", en: "Pickpockets at Termini, on bus 64 and at the Trevi Fountain. Cover shoulders and knees to enter churches." },
    PLUG_EU, TOILET],
    food: [
      { n: "Pizza al taglio", p: 4, pt: "Pizza ao peso, para comer na rua.", en: "Pizza by the slice, sold by weight." },
      { n: "Supplì", p: 2.5, pt: "Bolinho de arroz frito com mozzarella.", en: "Fried rice ball with mozzarella." },
      { n: "Cornetto e cappuccino", p: 3, pt: "Ao balcão é mais barato do que sentado.", en: "Cheaper standing at the bar than seated." }
    ] },
  ams: { emergency: "112", tips: [BAG, EU_SIM,
    { k: "pay", pt: "Muitos sítios só aceitam cartão; o metro e o tram aceitam contactless.", en: "Many places are card-only; metro and trams take contactless." },
    { k: "tip", pt: "Gorjeta opcional: arredondar ou 5–10%.", en: "Tipping is optional: round up or 5–10%." },
    { k: "water", pt: "A água da torneira é potável.", en: "Tap water is safe to drink." },
    { k: "safety", pt: "Não caminhe nas ciclovias (vermelhas): as bicicletas não param.", en: "Don't walk in the red bike lanes: cyclists won't stop." },
    PLUG_EU, TOILET],
    food: [
      { n: "Kroket", p: 3, pt: "Croquete quente, em snack-bars e máquinas de parede.", en: "Hot croquette from snack bars and wall vending machines." },
      { n: "Haring", p: 4, pt: "Arenque cru com cebola, nas bancas de peixe.", en: "Raw herring with onion, from fish stalls." },
      { n: "Stroopwafel", p: 3, pt: "Bolacha de caramelo feita na hora.", en: "Freshly made caramel waffle." }
    ] },
  dxb: { emergency: "999 (polícia) · 998 (ambulância)", tips: [
    meBag("No DXB há depósito de bagagem nos terminais 1 e 3.", "DXB has left-luggage desks in Terminals 1 and 3."), ME_SIM, GULF_PAY,
    { k: "tip", pt: "Muitos restaurantes já incluem serviço; senão, 10% é o habitual. Arredonde nos táxis.", en: "Many restaurants include service; otherwise 10% is usual. Round up in taxis." },
    GULF_WATER, ME_DRESS, gulfSafety("No metro há carruagem só para mulheres e crianças e a classe Gold: não entre por engano, há multa.", "The metro has a women-and-children carriage and Gold Class: don't board by mistake, there are fines."), G_PLUG, G_TOILET],
    food: [
      { n: "Shawarma", p: 10, pt: "Em pão árabe, nas bancas de Deira e Karama.", en: "In flatbread from the stalls of Deira and Karama." },
      { n: "Luqaimat", p: 15, pt: "Bolinhos fritos com xarope de tâmara, o doce emirati.", en: "Fried dumplings with date syrup, the Emirati sweet." },
      { n: "Karak chai", p: 2, pt: "Chá com leite e especiarias nas cafetarias de bairro.", en: "Spiced milky tea from neighbourhood cafeterias." },
      { n: "Machboos", p: 45, pt: "Arroz com especiarias e frango ou cordeiro, o prato emirati.", en: "Spiced rice with chicken or lamb, the Emirati classic." }
    ] },
  auh: { emergency: "999 (polícia) · 998 (ambulância)", tips: [
    meBag("", ""), ME_SIM, GULF_PAY,
    { k: "tip", pt: "10% em restaurantes se o serviço não estiver incluído.", en: "10% in restaurants if service isn't included." },
    GULF_WATER, ME_DRESS, gulfSafety("As distâncias são grandes: use táxi ou app entre paragens; o autocarro custa 2–5 AED com cartão Hafilat.", "Distances are big: use taxis or apps between stops; buses cost AED 2–5 with a Hafilat card."), G_PLUG, G_TOILET],
    food: [
      { n: "Shawarma", p: 10, pt: "O lanche de rua de todos.", en: "Everyone's street snack." },
      { n: "Harees", p: 35, pt: "Trigo e carne cozidos lentamente, prato tradicional emirati.", en: "Slow-cooked wheat and meat, a traditional Emirati dish." },
      { n: "Tâmaras e gahwa", p: 0, pt: "Café com cardamomo e tâmaras, oferecidos em muitos sítios.", en: "Cardamom coffee and dates, offered in many places." }
    ] },
  doh: { emergency: "999", tips: [
    meBag("O HIA tem depósito de bagagem e o serviço Discover Qatar para passeios de escala.", "HIA has left luggage and the Discover Qatar desk for layover tours."), ME_SIM, GULF_PAY,
    { k: "tip", pt: "Serviço muitas vezes incluído; senão 10%.", en: "Service often included; otherwise 10%." },
    GULF_WATER, ME_DRESS, gulfSafety("O metro tem classe Gold e família: compre o cartão standard.", "The metro has Gold and Family classes: buy the Standard card."), G_PLUG, G_TOILET],
    food: [
      { n: "Machboos", p: 40, pt: "Arroz com especiarias e carne, o prato nacional.", en: "Spiced rice with meat, the national dish." },
      { n: "Karak", p: 2, pt: "Chá com leite e cardamomo, a bebida da cidade.", en: "Milky cardamom tea, the city's drink." },
      { n: "Balaleet", p: 25, pt: "Aletria doce com açafrão e omelete, ao pequeno-almoço.", en: "Sweet saffron vermicelli with an omelette, for breakfast." }
    ] },
  ruh: { emergency: "911 · 999 (polícia) · 997 (ambulância)", tips: [
    meBag("", ""), ME_SIM, GULF_PAY,
    { k: "tip", pt: "Opcional: 10% em restaurantes, arredondar nos táxis.", en: "Optional: 10% in restaurants, round up in taxis." },
    GULF_WATER, ME_DRESS, gulfSafety("O fim de semana é sexta e sábado; à sexta muitas lojas só abrem depois da oração do meio-dia. Durante as orações, lojas fecham alguns minutos.", "The weekend is Friday and Saturday; on Fridays many shops open only after midday prayers. Shops close for a few minutes at prayer times."), G_PLUG, G_TOILET],
    food: [
      { n: "Kabsa", p: 35, pt: "Arroz com especiarias e frango ou cordeiro, o prato nacional.", en: "Spiced rice with chicken or lamb, the national dish." },
      { n: "Café árabe e tâmaras", p: 10, pt: "Gahwa com cardamomo, servida em chávenas pequenas.", en: "Cardamom gahwa served in small cups." },
      { n: "Mutabbaq", p: 12, pt: "Massa folhada recheada de carne ou banana, nas bancas de rua.", en: "Stuffed pastry with meat or banana, from street stalls." }
    ] },
  jed: { emergency: "911 · 999 (polícia) · 997 (ambulância)", tips: [
    meBag("", ""), ME_SIM, GULF_PAY,
    { k: "tip", pt: "Opcional: 10% em restaurantes.", en: "Optional: 10% in restaurants." },
    GULF_WATER, ME_DRESS, gulfSafety("Meca está fechada a não muçulmanos: os postos de controlo na estrada não deixam passar.", "Makkah is closed to non-Muslims: road checkpoints won't let you through."), G_PLUG, G_TOILET],
    food: [
      { n: "Mutabbaq", p: 10, pt: "Massa folhada recheada, clássico de Al-Balad.", en: "Stuffed pastry, an Al-Balad classic." },
      { n: "Saleeg", p: 30, pt: "Arroz cremoso com caldo e frango, do Hejaz.", en: "Creamy rice with broth and chicken, from the Hejaz." },
      { n: "Peixe do Mar Vermelho", p: 50, pt: "Escolhido no mercado e grelhado na hora.", en: "Chosen at the market and grilled to order." }
    ] },
  cai: { emergency: "122 (polícia) · 123 (ambulância) · 126 (polícia turística)", tips: [
    meBag("", ""), ME_SIM,
    { k: "pay", pt: "Leve libras egípcias em dinheiro para entradas pequenas, gorjetas e mercados; muitos museus já só aceitam cartão. O visto à chegada paga-se em dólares, euros ou libras.", en: "Carry Egyptian pounds in cash for small fees, tips and markets; many museums now take cards only. The visa on arrival is paid in dollars, euros or pounds." },
    { k: "tip", pt: "A gorjeta (baksheesh) é esperada: 10–15% em restaurantes e notas pequenas para quem ajuda.", en: "Tipping (baksheesh) is expected: 10–15% in restaurants and small notes for anyone who helps." },
    { k: "water", pt: "Beba só água engarrafada e evite gelo e saladas cruas na rua.", en: "Drink only bottled water and avoid ice and raw salads from street stalls." },
    ME_DRESS,
    { k: "safety", pt: "Use Uber ou Careem (preço fechado). O trânsito é intenso: conte sempre com atrasos e atravesse a rua com locais. Recuse \"guias\" e lojas de papiro oferecidos na rua.", en: "Use Uber or Careem (fixed price). Traffic is heavy: always allow for delays and cross the street with locals. Turn down street \"guides\" and papyrus shops." },
    { k: "plug", pt: "Tomadas tipo C/F, 220 V.", en: "Type C/F sockets, 220 V." },
    { k: "toilet", pt: "Nos museus e cafés; leve lenços e notas pequenas para o funcionário.", en: "In museums and cafés; carry tissues and small notes for the attendant." }],
    food: [
      { n: "Koshari", p: 60, pt: "Arroz, lentilhas, massa e molho picante, em casas como o Abou Tarek.", en: "Rice, lentils, pasta and spicy sauce, at places like Abou Tarek." },
      { n: "Ful e ta'meya", p: 30, pt: "Favas estufadas e falafel de fava em pão baladi, ao pequeno-almoço.", en: "Stewed fava beans and fava falafel in baladi bread, for breakfast." },
      { n: "Chá de menta", p: 25, pt: "Nos cafés ahwa, com shisha opcional.", en: "In ahwa cafés, shisha optional." }
    ] },
  amm: { emergency: "911", tips: [
    meBag("", ""), ME_SIM,
    { k: "pay", pt: "Cartão nos hotéis e restaurantes maiores; dinheiro (dinares) na baixa, táxis e bancas.", en: "Cards in hotels and bigger restaurants; cash (dinars) downtown, in taxis and at stalls." },
    { k: "tip", pt: "10% em restaurantes; arredondar nos táxis.", en: "10% in restaurants; round up in taxis." },
    { k: "water", pt: "Prefira água engarrafada.", en: "Prefer bottled water." },
    ME_DRESS,
    { k: "safety", pt: `Cidade de colinas e escadas: calçado confortável. Nos táxis amarelos peça o taxímetro ou use Careem. Petra fica a 3 h: só numa paragem longa.${RAMADAN}`, en: `A city of hills and stairs: wear comfortable shoes. In yellow taxis ask for the meter or use Careem. Petra is 3 h away: only on a long stopover.${RAMADAN_EN}` },
    { k: "plug", pt: "Tomadas tipo C/D/F/G, 230 V: leve adaptador universal.", en: "Type C/D/F/G sockets, 230 V: bring a universal adapter." }, TOILET],
    food: [
      { n: "Falafel e homus", p: 1.5, pt: "No Hashem, na baixa, aberto quase 24 horas.", en: "At Hashem downtown, open almost round the clock." },
      { n: "Knafeh", p: 1.5, pt: "Doce de queijo quente com calda, na Habibah.", en: "Hot cheese pastry with syrup, at Habibah." },
      { n: "Mansaf", p: 8, pt: "Cordeiro com molho de iogurte jameed e arroz, o prato nacional.", en: "Lamb in jameed yoghurt sauce with rice, the national dish." }
    ] },
  mct: { emergency: "9999", tips: [
    meBag("", ""), ME_SIM, GULF_PAY,
    { k: "tip", pt: "Opcional: 10% em restaurantes.", en: "Optional: 10% in restaurants." },
    GULF_WATER, ME_DRESS, gulfSafety("A Grande Mesquita só recebe visitantes de sábado a quinta, das 8h às 11h: comece por lá. Os táxis laranja-e-branco não têm taxímetro: combine o preço ou use Otaxi.", "The Grand Mosque only admits visitors Saturday to Thursday, 8:00–11:00: start there. Orange-and-white taxis have no meter: agree the fare or use Otaxi."), G_PLUG, G_TOILET],
    food: [
      { n: "Shuwa", p: 4, pt: "Cordeiro marinado e assado lentamente em forno subterrâneo.", en: "Marinated lamb slow-cooked in an underground oven." },
      { n: "Halwa omani", p: 2, pt: "Doce de açafrão, cardamomo e água de rosas.", en: "Saffron, cardamom and rosewater sweet." },
      { n: "Kahwa", p: 0.5, pt: "Café omani com cardamomo, servido com tâmaras.", en: "Omani cardamom coffee, served with dates." }
    ] },
  /* ---------- Alemanha, Áustria, Chéquia e Singapura ---------- */
  fra: { emergency: "112 / 110", tips: [BAG, EU_SIM, DE_PAY, DE_TIP, DE_WATER, DE_SAFETY("O Bahnhofsviertel, junto à estação central, tem consumo de droga na rua: atravesse de dia e sem parar.", "The Bahnhofsviertel by the main station has open drug use: walk through by day without lingering."), PLUG_EU, DE_TOILET, DE_SUNDAY],
    food: [
      { n: "Grüne Soße", p: 12, pt: "O molho verde de sete ervas com batatas e ovos cozidos.", en: "The seven-herb green sauce with potatoes and boiled eggs." },
      { n: "Apfelwein", p: 3, pt: "Sidra seca servida no copo canelado «Gerippte», em Sachsenhausen.", en: "Dry cider in the ribbed «Gerippte» glass, in Sachsenhausen." },
      { n: "Frankfurter Würstchen", p: 5, pt: "As salsichas finas originais de Frankfurt, com mostarda e pão.", en: "The original thin Frankfurt sausages, with mustard and bread." },
      { n: "Handkäs mit Musik", p: 7, pt: "Queijo curado com cebola em vinagre, o petisco das tabernas de sidra.", en: "Tangy cheese with onion vinaigrette, the cider-tavern snack." }
    ] },
  ber: { emergency: "112 / 110", tips: [BAG, EU_SIM, DE_PAY, DE_TIP, DE_WATER, DE_SAFETY("Cuidado com o jogo das conchas na Alexanderplatz e na ponte de Warschauer Straße: é sempre um esquema.", "Watch out for shell games at Alexanderplatz and the Warschauer Straße bridge: they're always a scam."), PLUG_EU, DE_TOILET, DE_SUNDAY],
    food: [
      { n: "Currywurst", p: 4.5, pt: "Salsicha com molho de caril e ketchup, com ou sem pele (Curry 36, Konnopke's).", en: "Sausage in curry ketchup, with or without skin (Curry 36, Konnopke's)." },
      { n: "Döner Kebab", p: 7, pt: "Berlim diz ter inventado o döner em pão; filas no Mustafa's e no Rüyam.", en: "Berlin claims the döner in bread; queues at Mustafa's and Rüyam." },
      { n: "Pfannkuchen", p: 2, pt: "O «Berliner»: bola de Berlim recheada de compota.", en: "The «Berliner»: jam-filled doughnut." },
      { n: "Berliner Weisse", p: 4, pt: "Cerveja de trigo ácida, servida com xarope vermelho ou verde.", en: "Sour wheat beer, served with red or green syrup." }
    ] },
  muc: { emergency: "112 / 110", tips: [BAG, EU_SIM, DE_PAY, DE_TIP, DE_WATER, DE_SAFETY("Na Oktoberfest (fim de setembro a início de outubro) os transportes enchem e os preços sobem: reserve tudo cedo.", "During Oktoberfest (late September to early October) transport is packed and prices rise: book early."), PLUG_EU, DE_TOILET, DE_SUNDAY],
    food: [
      { n: "Weißwurst", p: 7, pt: "Salsicha branca de vitela com mostarda doce e pretzel; tradicionalmente antes do meio-dia.", en: "White veal sausage with sweet mustard and a pretzel; traditionally before noon." },
      { n: "Brezn", p: 2, pt: "O pretzel bávaro, de casca estaladiça e sal grosso.", en: "The Bavarian pretzel, crisp-crusted with coarse salt." },
      { n: "Schweinshaxe", p: 18, pt: "Joelho de porco assado com knödel, nas cervejarias.", en: "Roast pork knuckle with dumplings, in the beer halls." },
      { n: "Maß", p: 12, pt: "Caneca de um litro de cerveja num jardim de cerveja.", en: "A litre stein of beer in a beer garden." }
    ] },
  vie: { emergency: "112 / 133", tips: [BAG, EU_SIM,
    { k: "pay", pt: "Cartão aceite em quase todo o lado, mas alguns cafés tradicionais e bancas de salsichas ainda preferem dinheiro.", en: "Cards work almost everywhere, but some traditional cafés and sausage stands still prefer cash." },
    { k: "tip", pt: "Arredonde 5–10% e diga o total ao pagar («stimmt so»), em vez de deixar na mesa.", en: "Round up 5–10% and say the total when paying («stimmt so») rather than leaving it on the table." },
    { k: "water", pt: "A água da torneira vem dos Alpes e é excelente; nos cafés serve-se um copo com o café.", en: "Tap water comes from the Alps and is excellent; cafés serve a glass with your coffee." },
    { k: "safety", pt: "Cidade muito segura. Fique fora das ciclovias e atenção a carteiristas na Stephansplatz e na linha U1.", en: "A very safe city. Stay out of bike lanes and watch for pickpockets at Stephansplatz and on the U1." },
    PLUG_EU, DE_TOILET, DE_SUNDAY],
    food: [
      { n: "Wiener Schnitzel", p: 20, pt: "Escalope de vitela panado, com salada de batata e limão.", en: "Breaded veal escalope with potato salad and lemon." },
      { n: "Sachertorte", p: 8, pt: "O bolo de chocolate com compota de alperce, no Hotel Sacher ou no Demel.", en: "The chocolate cake with apricot jam, at Hotel Sacher or Demel." },
      { n: "Käsekrainer", p: 5, pt: "Salsicha com queijo de uma banca «Würstelstand», ao fim da noite.", en: "Cheese-filled sausage from a «Würstelstand», late at night." },
      { n: "Melange", p: 4.5, pt: "O café vienense com leite e espuma, num café tradicional.", en: "The Viennese coffee with milk foam, in a traditional café." }
    ] },
  prg: { emergency: "112", tips: [BAG, EU_SIM,
    { k: "pay", pt: "Pague em coroas (CZK), não em euros. Recuse sempre a «conversão para a sua moeda» no multibanco ou no terminal e evite as casas de câmbio com «0% commission».", en: "Pay in crowns (CZK), not euros. Always decline «conversion to your currency» at ATMs and card terminals, and avoid exchange offices advertising «0% commission»." },
    { k: "tip", pt: "Arredonde 10% nos restaurantes e confirme se o serviço já vem na conta.", en: "Round up 10% in restaurants and check whether service is already on the bill." },
    { k: "water", pt: "A água da torneira é potável; nos restaurantes peça «kohoutková voda».", en: "Tap water is safe; in restaurants ask for «kohoutková voda»." },
    { k: "safety", pt: "Use os multibancos de bancos (não os Euronet), apps como Bolt/Uber em vez de táxis na rua e valide sempre o bilhete — os revisores multam no ato.", en: "Use bank ATMs (not Euronet), apps like Bolt/Uber instead of street taxis, and always validate your ticket — inspectors fine on the spot." },
    PLUG_EU, TOILET],
    food: [
      { n: "Svíčková", p: 280, pt: "Lombo de vaca em molho de natas com knedlíky e arandos.", en: "Beef sirloin in cream sauce with dumplings and cranberries." },
      { n: "Pilsner", p: 70, pt: "Meio litro de cerveja de pressão, inventada em Plzeň em 1842.", en: "Half a litre of draught lager, invented in Plzeň in 1842." },
      { n: "Smažený sýr", p: 200, pt: "Queijo panado e frito com molho tártaro.", en: "Breaded fried cheese with tartar sauce." },
      { n: "Trdelník", p: 120, pt: "Massa enrolada e assada no espeto; muito turística, mas quente no inverno sabe bem.", en: "Spit-roasted rolled pastry; very touristy, but nice and warm in winter." }
    ] },
  sin: { emergency: "999 / 995", tips: [
    meBag("No aeroporto, a Jewel Changi (cascata interior e jardins) é de acesso livre e fica a pé dos terminais 1–3.", "At the airport, Jewel Changi (indoor waterfall and gardens) is free and a short walk from Terminals 1–3."),
    ME_SIM,
    { k: "pay", pt: "Contactless aceite em quase todo o lado, incluindo o MRT e os autocarros (passe o mesmo cartão à entrada e à saída). Alguns hawkers só aceitam dinheiro ou PayNow.", en: "Contactless works almost everywhere, including the MRT and buses (tap the same card in and out). Some hawker stalls take cash or PayNow only." },
    { k: "tip", pt: "Não há gorjetas: os restaurantes já cobram 10% de serviço mais IVA (os «++» da ementa).", en: "No tipping: restaurants already add 10% service plus GST (the «++» on menus)." },
    { k: "water", pt: "A água da torneira é potável. Ande com uma garrafa: o calor húmido cansa depressa.", en: "Tap water is safe. Carry a bottle: the humid heat tires you quickly." },
    { k: "safety", pt: "Uma das cidades mais seguras do mundo, mas com multas pesadas (lixo, fumar, comer no MRT, atravessar fora da passadeira). Chove quase todas as tardes: leve guarda-chuva.", en: "One of the world's safest cities, with heavy fines (litter, smoking, eating on the MRT, jaywalking). It rains most afternoons: carry an umbrella." },
    G_PLUG,
    { k: "toilet", pt: "Casas de banho gratuitas e limpas em centros comerciais e estações de MRT; nos hawker centres às vezes custam 0,10–0,20 SGD.", en: "Free, clean toilets in malls and MRT stations; at hawker centres they sometimes cost SGD 0.10–0.20." }],
    food: [
      { n: "Hainanese chicken rice", p: 5, pt: "Frango escalfado com arroz cozido no caldo, o prato nacional.", en: "Poached chicken with rice cooked in its stock, the national dish." },
      { n: "Laksa", p: 6, pt: "Sopa picante de leite de coco com massa e marisco.", en: "Spicy coconut-milk noodle soup with seafood." },
      { n: "Chilli crab", p: 90, pt: "Caranguejo em molho picante e doce, para partilhar (preço por quilo).", en: "Crab in a sweet-spicy sauce, for sharing (priced per kilo)." },
      { n: "Kaya toast", p: 4, pt: "Torrada com doce de coco e manteiga, com ovos moles e kopi.", en: "Toast with coconut jam and butter, with soft eggs and kopi." }
    ] },
  nyc: us(usSafety("O metro funciona 24 horas; à noite escolha a carruagem do condutor (ao meio do comboio).", "The subway runs 24 hours; at night ride in the conductor's car (middle of the train)."), [
    { n: "Pizza slice", p: 4, pt: "Uma fatia de pizza nova-iorquina, dobrada ao meio.", en: "A New York slice, folded in half." },
    { n: "Bagel with lox", p: 14, pt: "Bagel com queijo-creme e salmão fumado, ao pequeno-almoço.", en: "Bagel with cream cheese and smoked salmon, for breakfast." },
    { n: "Pastrami on rye", p: 28, pt: "A sandes gigante de pastrami de uma delicatessen judaica.", en: "The giant pastrami sandwich from a Jewish deli." },
    { n: "Hot dog", p: 4, pt: "Cachorro de uma carrinha de rua, com mostarda e cebola.", en: "A street-cart hot dog with mustard and onions." }
  ]),
  was: us(usSafety("Os museus Smithsonian são gratuitos mas têm controlo de segurança à entrada; leve pouca bagagem.", "Smithsonian museums are free but have security checks; carry little luggage."), [
    { n: "Half-smoke", p: 9, pt: "A salsicha fumada com chili da cidade, no Ben's Chili Bowl.", en: "The city's smoked sausage with chili, at Ben's Chili Bowl." },
    { n: "Ethiopian platter", p: 25, pt: "Washington tem uma grande comunidade etíope: injera com guisados para partilhar.", en: "Washington has a big Ethiopian community: injera with stews to share." },
    { n: "Crab cake", p: 30, pt: "Bolinho de caranguejo da baía de Chesapeake.", en: "A Chesapeake Bay crab cake." },
    { n: "Food truck lunch", p: 13, pt: "Almoço das carrinhas de comida junto ao Mall.", en: "Lunch from the food trucks by the Mall." }
  ]),
  sfo: us(usSafety("Não deixe nada visível dentro de carros e guarde o telemóvel nas ruas de Market Street e do Tenderloin.", "Leave nothing visible in cars and keep your phone away on Market Street and in the Tenderloin."), [
    { n: "Mission burrito", p: 14, pt: "O burrito gigante embrulhado em alumínio, em Mission.", en: "The giant foil-wrapped burrito, in the Mission." },
    { n: "Clam chowder in sourdough", p: 15, pt: "Sopa de amêijoa servida dentro de um pão de massa-mãe.", en: "Clam chowder served in a sourdough bread bowl." },
    { n: "Dim sum", p: 25, pt: "Em Chinatown ou no Richmond, ao almoço.", en: "In Chinatown or the Richmond, at lunchtime." },
    { n: "Irish coffee", p: 13, pt: "No Buena Vista, onde dizem que chegou aos EUA.", en: "At the Buena Vista, where it's said to have arrived in the US." }
  ], [{ k: "dress", pt: "Leve camadas: mesmo no verão o nevoeiro e o vento arrefecem muito ao fim da tarde.", en: "Bring layers: even in summer, fog and wind turn chilly in the late afternoon." }]),
  chi: us(usSafety("No inverno o vento do lago é gelado: casaco, gorro e luvas de novembro a março.", "In winter the lake wind is icy: coat, hat and gloves from November to March."), [
    { n: "Deep-dish pizza", p: 30, pt: "Pizza de massa alta para partilhar (Lou Malnati's, Giordano's).", en: "Thick-crust pizza for sharing (Lou Malnati's, Giordano's)." },
    { n: "Chicago-style hot dog", p: 7, pt: "Com mostarda, picles, tomate, pimentos e sal de aipo — nunca ketchup.", en: "With mustard, pickle, tomato, peppers and celery salt — never ketchup." },
    { n: "Italian beef", p: 13, pt: "Sandes de carne fatiada mergulhada no molho.", en: "Thin-sliced beef sandwich dipped in gravy." },
    { n: "Garrett popcorn", p: 8, pt: "A mistura de pipocas de caramelo e queijo.", en: "The caramel-and-cheese popcorn mix." }
  ]),
  bos: us(usSafety("O centro é compacto e seguro; atenção a ciclistas e ao gelo nas calçadas de tijolo no inverno.", "The centre is compact and safe; watch for cyclists and ice on the brick sidewalks in winter."), [
    { n: "Lobster roll", p: 35, pt: "Lagosta em pão de cachorro com manteiga ou maionese.", en: "Lobster in a hot-dog bun with butter or mayo." },
    { n: "Clam chowder", p: 12, pt: "A sopa cremosa de amêijoa da Nova Inglaterra.", en: "New England's creamy clam soup." },
    { n: "Cannoli", p: 6, pt: "No North End (Mike's ou Modern Pastry).", en: "In the North End (Mike's or Modern Pastry)." },
    { n: "Oysters", p: 3.5, pt: "Ostras locais, por unidade, num oyster bar.", en: "Local oysters, per piece, at an oyster bar." }
  ]),
  mia: us(usSafety("Sol forte o ano todo: protetor, água e sombra. Nas tempestades de verão, saia da praia ao primeiro trovão.", "Strong sun all year: sunscreen, water and shade. In summer storms, leave the beach at the first thunder."), [
    { n: "Cuban sandwich", p: 12, pt: "Porco assado, fiambre, queijo e picles em pão cubano prensado.", en: "Roast pork, ham, cheese and pickles in pressed Cuban bread." },
    { n: "Cafecito", p: 2, pt: "O café cubano doce e forte, numa «ventanita».", en: "Sweet, strong Cuban coffee from a «ventanita»." },
    { n: "Stone crab", p: 60, pt: "Garras de caranguejo, de outubro a maio.", en: "Stone crab claws, October to May." },
    { n: "Key lime pie", p: 9, pt: "A tarte de lima da Florida.", en: "Florida's lime pie." }
  ], [{ k: "dress", pt: "Fato de banho só na praia: na rua e nos restaurantes vista uma t-shirt.", en: "Swimwear is for the beach only: wear a T-shirt in the streets and restaurants." }]),
  lax: us(usSafety("A cidade é enorme: combine metro com Uber e evite andar a pé à noite fora das zonas turísticas.", "The city is huge: combine Metro with rideshare and avoid walking at night outside tourist areas."), [
    { n: "Tacos al pastor", p: 4, pt: "Tacos de porco marinado de uma banca de rua.", en: "Marinated pork tacos from a street stand." },
    { n: "In-N-Out Double-Double", p: 8, pt: "O hambúrguer californiano, pedido «animal style».", en: "The Californian burger, ordered «animal style»." },
    { n: "Korean BBQ", p: 35, pt: "Churrasco coreano em Koreatown.", en: "Korean barbecue in Koreatown." },
    { n: "Açaí bowl", p: 13, pt: "Taça de açaí com fruta, na praia.", en: "Açaí bowl with fruit, by the beach." }
  ]),
  las: us(usSafety("Faz mais de 40 °C no verão: beba água, ande pelos casinos com ar condicionado e confirme a conta no bar.", "It tops 104 °F in summer: drink water, walk through air-conditioned casinos and check your bar tab."), [
    { n: "Buffet", p: 60, pt: "Buffet de um grande casino ao jantar.", en: "A big-casino buffet at dinner." },
    { n: "Shrimp cocktail", p: 6, pt: "O clássico cocktail de camarão do Golden Gate, na Fremont.", en: "The classic shrimp cocktail at the Golden Gate on Fremont." },
    { n: "Steak", p: 70, pt: "Bife num steakhouse da Strip.", en: "Steak at a Strip steakhouse." },
    { n: "Frozen margarita", p: 20, pt: "A margarita gelada em copo gigante.", en: "The frozen margarita in a giant cup." }
  ]),
  msy: us(usSafety("Beber na rua é permitido, mas só em copo de plástico; à noite ande em grupo e fique nas ruas com gente.", "Street drinking is allowed, but only from plastic cups; at night walk in groups and stay on busy streets."), [
    { n: "Beignets", p: 5, pt: "Três beignets com açúcar em pó.", en: "Three beignets dusted with sugar." },
    { n: "Gumbo", p: 12, pt: "O guisado crioulo com quiabo, frango e chouriço andouille.", en: "Creole stew with okra, chicken and andouille sausage." },
    { n: "Po'boy", p: 14, pt: "Sandes de camarão ou ostra frita em pão francês.", en: "Fried shrimp or oyster sandwich on French bread." },
    { n: "Muffuletta", p: 15, pt: "A sandes siciliana de salada de azeitona da Central Grocery.", en: "The Sicilian olive-salad sandwich from Central Grocery." }
  ], [{ k: "dress", pt: "No verão o calor húmido é forte: roupa leve, chapéu e guarda-chuva para as trovoadas da tarde.", en: "Summer is hot and humid: light clothes, a hat and an umbrella for afternoon storms." }]),
  mco: us(usSafety("A cidade é pensada para o carro: use Uber entre zonas e beba muita água nos parques.", "The city is built for cars: use rideshare between areas and drink plenty of water in the parks."), [
    { n: "Cuban sandwich", p: 12, pt: "A sandes cubana, herança de Tampa e Miami.", en: "The Cuban sandwich, a Tampa and Miami heritage." },
    { n: "Key lime pie", p: 8, pt: "A tarte de lima da Florida.", en: "Florida's lime pie." },
    { n: "Gator bites", p: 14, pt: "Pedaços de aligátor fritos, para provar.", en: "Fried alligator bites, for the curious." },
    { n: "Pho", p: 15, pt: "Sopa vietnamita no Mills 50, o bairro asiático.", en: "Vietnamese soup in Mills 50, the Asian district." }
  ]),
  yyz: { emergency: "911", tips: [BAG, US_SIM, CA_PAY, CA_TIP, US_WATER, usSafety("Cidade segura; no inverno, use o PATH, a rede subterrânea do centro, para fugir do frio.", "A safe city; in winter, use PATH, the downtown underground network, to escape the cold."), US_PLUG, US_TOILET], food: [
    { n: "Peameal bacon sandwich", p: 10, pt: "Lombo de porco panado em farinha de milho, no St. Lawrence.", en: "Cornmeal-crusted back bacon at St. Lawrence." },
    { n: "Poutine", p: 12, pt: "Batatas fritas com queijo e molho de carne.", en: "Fries with cheese curds and gravy." },
    { n: "Butter tart", p: 4, pt: "A tartelete canadiana de manteiga e açúcar.", en: "The Canadian butter-and-sugar tart." },
    { n: "Roti", p: 14, pt: "Roti caribenho, das comunidades de Trinidad e da Jamaica.", en: "Caribbean roti, from the Trinidadian and Jamaican communities." }
  ] },
  mex: lat("911", LAT_SIM, { k: "pay", pt: "Cartão nos restaurantes e lojas; dinheiro (pesos) nas bancas, mercados e Metro. Levante em multibancos de bancos, dentro de agências.", en: "Cards in restaurants and shops; cash (pesos) for stalls, markets and the Metro. Withdraw at bank ATMs inside branches." }, { k: "tip", pt: "Gorjeta de 10–15% nos restaurantes (a «propina»); arredonde nos táxis.", en: "Tip 10–15% in restaurants (the «propina»); round up in taxis." }, latSafety("No Metro há carruagens só para mulheres e crianças à frente. A 2.240 m de altitude, vá com calma no primeiro dia.", "The Metro has women-and-children-only cars at the front. At 7,350 ft, take it easy on day one."), { k: "plug", pt: "Tomadas tipo A/B, 127 V: precisa de adaptador.", en: "Type A/B sockets, 127 V: you need an adapter." }, [
    { n: "Tacos al pastor", p: 20, pt: "Cada taco, de uma taqueria.", en: "Per taco, at a taquería." },
    { n: "Chilaquiles", p: 120, pt: "Tortilhas fritas em molho verde ou vermelho, ao pequeno-almoço.", en: "Fried tortillas in green or red sauce, for breakfast." },
    { n: "Churros con chocolate", p: 90, pt: "Churros com chocolate quente no El Moro.", en: "Churros with hot chocolate at El Moro." },
    { n: "Mezcal", p: 120, pt: "Um mezcal de Oaxaca servido com laranja e sal de gusano.", en: "An Oaxacan mezcal served with orange and worm salt." }
  ]),
  rio: lat("190 / 192", LAT_SIM, { k: "pay", pt: "Cartão e Pix em quase todo o lado, até nas bancas da praia; o metrô aceita contactless. Leve pouco dinheiro vivo.", en: "Cards and Pix almost everywhere, even beach vendors; the Metro takes contactless. Carry little cash." }, { k: "tip", pt: "A conta já traz 10% de serviço; não é preciso deixar mais.", en: "The bill already includes 10% service; no need to leave more." }, latSafety("Na praia leve só o essencial; não use o telemóvel à beira da estrada e não suba às favelas sem guia local.", "Take only essentials to the beach; don't use your phone by the roadside and don't visit favelas without a local guide."), { k: "plug", pt: "Tomadas tipo N, 127 V no Rio: leve adaptador e confirme a voltagem.", en: "Type N sockets, 127 V in Rio: bring an adapter and check the voltage." }, [
    { n: "Feijoada", p: 70, pt: "Feijão preto com carnes, ao sábado.", en: "Black beans with pork, on Saturdays." },
    { n: "Pão de queijo", p: 8, pt: "Bolinhas de queijo para o lanche.", en: "Cheese bread puffs for a snack." },
    { n: "Açaí", p: 25, pt: "Taça de açaí gelado com granola.", en: "A bowl of frozen açaí with granola." },
    { n: "Caipirinha", p: 30, pt: "Cachaça, lima e açúcar, num quiosque da praia.", en: "Cachaça, lime and sugar at a beach kiosk." }
  ]),
  bue: lat("911 / 107", LAT_SIM, { k: "pay", pt: "Pague com cartão estrangeiro: aplica uma taxa de câmbio próxima da do mercado. O metro (Subte) e autocarros aceitam cartão SUBE ou contactless.", en: "Pay with your foreign card: it gets a rate close to the market one. The Subte and buses take a SUBE card or contactless." }, { k: "tip", pt: "Gorjeta de 10% nos restaurantes, de preferência em dinheiro; o «cubierto» (pão) é cobrado à parte.", en: "Tip 10% in restaurants, ideally in cash; the «cubierto» (bread) is charged separately." }, latSafety("Atenção ao truque da mancha na roupa e aos motociclistas que arrancam telemóveis; à noite, táxi de app.", "Watch for the stain-on-clothes trick and motorbike phone snatchers; at night, use an app taxi."), { k: "plug", pt: "Tomadas tipo I (argentinas), 220 V: leve adaptador.", en: "Type I (Argentine) sockets, 220 V: bring an adapter." }, [
    { n: "Bife de chorizo", p: 25000, pt: "O grande bife do vazio numa parrilla.", en: "The big sirloin steak at a parrilla." },
    { n: "Empanadas", p: 2500, pt: "Cada empanada de carne ou queijo.", en: "Per beef or cheese empanada." },
    { n: "Medialunas", p: 1500, pt: "Croissants doces ao pequeno-almoço com café.", en: "Sweet croissants with coffee for breakfast." },
    { n: "Malbec", p: 8000, pt: "Um copo de malbec de Mendoza.", en: "A glass of Mendoza malbec." }
  ]),
  rak: af("19 / 15", MA_PAY, MA_TIP, afSafety("Diga «não, obrigado» com firmeza aos falsos guias; as ruelas mudam de nome e o GPS falha na medina.", "Say «no, thank you» firmly to fake guides; lanes change name and GPS struggles in the medina."), plug("Tomadas tipo C/E, 220 V.", "Type C/E sockets, 220 V."), [
    { n: "Tajine", p: 80, pt: "Guisado cozinhado lentamente no prato de barro, de frango com limão ou borrego com ameixas.", en: "Slow-cooked stew in the clay dish, chicken with lemon or lamb with prunes." },
    { n: "Tanjia", p: 90, pt: "A especialidade de Marraquexe: borrego cozinhado nas cinzas do hammam.", en: "Marrakech's speciality: lamb cooked in the ashes of the hammam." },
    { n: "Sumo de laranja", p: 10, pt: "Sumo espremido na hora numa banca da Jemaa el-Fna.", en: "Fresh-squeezed juice from a Jemaa el-Fna stall." },
    { n: "Chá de hortelã", p: 15, pt: "O «whisky berbere», servido de alto e muito doce.", en: "The «Berber whisky», poured from a height and very sweet." }
  ], [MA_DRESS]),
  cas: af("19 / 15", MA_PAY, MA_TIP, afSafety("Atenção a esticões de telemóvel por motociclistas no centro.", "Watch out for phone snatching by motorcyclists downtown."), plug("Tomadas tipo C/E, 220 V.", "Type C/E sockets, 220 V."), [
    { n: "Peixe grelhado", p: 120, pt: "Peixe e marisco do dia no Mercado Central.", en: "Catch of the day and seafood at the Central Market." },
    { n: "Couscous", p: 70, pt: "Sêmola com legumes e carne, prato tradicional de sexta-feira.", en: "Semolina with vegetables and meat, the traditional Friday dish." },
    { n: "Harira", p: 15, pt: "Sopa de tomate, lentilhas e grão.", en: "Tomato, lentil and chickpea soup." },
    { n: "Pastéis Bennis", p: 25, pt: "Doces de amêndoa e mel do bairro Habous.", en: "Almond and honey pastries from the Habous quarter." }
  ], [MA_DRESS]),
  cpt: af("10111 / 112", { k: "pay", pt: "Cartão e contactless em quase todo o lado; o MyCiTi usa o cartão myconnect. Leve pouco dinheiro vivo.", en: "Cards and contactless almost everywhere; MyCiTi uses the myconnect card. Carry little cash." }, tip("Gorjeta de 10–15% nos restaurantes; dê 5–10 rand aos arrumadores de carros e aos frentistas.", "Tip 10–15% in restaurants; give 5–10 rand to car guards and petrol attendants."), afSafety("Trânsito pela esquerda. Não faça trilhos sozinho na montanha e use multibancos dentro de centros comerciais.", "Traffic drives on the left. Don't hike the mountain alone and use ATMs inside malls."), plug("Tomadas tipo M/N, 230 V: leve adaptador.", "Type M/N sockets, 230 V: bring an adapter."), [
    { n: "Bobotie", p: 140, pt: "Carne picada com especiarias e cobertura de ovo, receita malaia do Cabo.", en: "Spiced mince with an egg topping, a Cape Malay recipe." },
    { n: "Gatsby", p: 90, pt: "Sandes gigante de batatas fritas e carne para partilhar.", en: "A giant chip-and-meat sandwich to share." },
    { n: "Fish and chips", p: 120, pt: "Peixe hake frito no porto de Kalk Bay.", en: "Fried hake at Kalk Bay harbour." },
    { n: "Vinho de Stellenbosch", p: 70, pt: "Um copo de pinotage ou chenin blanc.", en: "A glass of pinotage or chenin blanc." }
  ], [], { k: "water", pt: "A água da torneira é potável na Cidade do Cabo; poupe-a, a região tem secas.", en: "Tap water is safe in Cape Town; use it sparingly, the region has droughts." }),
  zan: af("112", AF_CASH, tip("Gorjeta de 10% nos restaurantes; os preços para turistas são muitas vezes em dólares, mas pagar em xelins sai mais barato.", "Tip 10% in restaurants; tourist prices are often in dollars, but paying in shillings is cheaper."), afSafety("Trânsito pela esquerda. Desde 2024 Zanzibar exige um seguro de viagem próprio, comprado online antes de chegar.", "Traffic drives on the left. Since 2024 Zanzibar requires its own travel insurance, bought online before arrival."), plug("Tomadas tipo G (e D), 230 V: leve adaptador.", "Type G (and D) sockets, 230 V: bring an adapter."), [
    { n: "Pizza de Zanzibar", p: 6000, pt: "Massa fina recheada e frita na chapa, salgada ou de banana com Nutella.", en: "Thin dough stuffed and fried on the griddle, savoury or banana and Nutella." },
    { n: "Espetadas de marisco", p: 10000, pt: "Lagosta, polvo ou peixe grelhado no mercado de Forodhani.", en: "Grilled lobster, octopus or fish at the Forodhani market." },
    { n: "Urojo", p: 4000, pt: "A «sopa misturada» de Zanzibar, ácida e picante.", en: "Zanzibar «mix», a tangy, spicy soup." },
    { n: "Sumo de cana", p: 2000, pt: "Cana espremida com gengibre e lima.", en: "Pressed sugar cane with ginger and lime." }
  ], [{ k: "dress", pt: "Ilha muçulmana conservadora: em Stone Town cubra ombros e joelhos; fato de banho só na praia. No Ramadão não coma nem beba na rua de dia.", en: "A conservative Muslim island: in Stone Town cover shoulders and knees; swimwear only on the beach. During Ramadan don't eat or drink in the street by day." }]),
  tun: af("197 / 190", { k: "pay", pt: "O dinar (TND) só se troca dentro do país: guarde os recibos de câmbio. Dinheiro para medina, táxis e cafés.", en: "The dinar (TND) can only be exchanged inside the country: keep exchange receipts. Cash for the medina, taxis and cafés." }, tip("Gorjeta de 10% nos restaurantes e arredondar nos táxis (exija o taxímetro).", "Tip 10% in restaurants and round up in taxis (insist on the meter)."), afSafety("Os vendedores da medina podem ser insistentes: um não firme chega.", "Medina sellers can be pushy: a firm no is enough."), plug("Tomadas tipo C/E, 230 V.", "Type C/E sockets, 230 V."), [
    { n: "Brik", p: 3, pt: "Folha crocante com ovo, atum e salsa.", en: "A crisp pastry with egg, tuna and parsley." },
    { n: "Couscous de peixe", p: 25, pt: "O couscous tunisino, picante com harissa.", en: "Tunisian couscous, spicy with harissa." },
    { n: "Lablabi", p: 5, pt: "Sopa de grão com pão, cominhos e ovo, ao pequeno-almoço.", en: "Chickpea soup with bread, cumin and egg, for breakfast." },
    { n: "Chá de pinhões", p: 6, pt: "Chá de hortelã com pinhões, no Café des Nattes.", en: "Mint tea with pine nuts, at Café des Nattes." }
  ], [MA_DRESS]),
  add: af("991 / 907", AF_CASH, tip("Gorjeta de 10% nos restaurantes; muitos já incluem serviço na conta.", "Tip 10% in restaurants; many already include service."), afSafety("A cidade está a 2.355 m: beba água e vá com calma no primeiro dia. Telemóveis são roubados no Merkato e na Piazza.", "The city sits at 7,700 ft: drink water and take it easy on day one. Phones get snatched in Merkato and Piazza."), plug("Tomadas tipo C/E/F, 220 V.", "Type C/E/F sockets, 220 V."), [
    { n: "Injera e tibs", p: 450, pt: "Panqueca fermentada de teff com carne salteada; come-se com a mão direita.", en: "Fermented teff pancake with sautéed meat; eaten with the right hand." },
    { n: "Beyaynetu", p: 300, pt: "Travessa vegana de lentilhas, couve e grão, nas quartas e sextas de jejum.", en: "Vegan platter of lentils, greens and chickpeas, on Wednesday and Friday fasting days." },
    { n: "Macchiato", p: 60, pt: "O macchiato etíope, herança italiana.", en: "The Ethiopian macchiato, an Italian legacy." },
    { n: "Tej", p: 200, pt: "Hidromel tradicional de mel.", en: "Traditional honey wine." }
  ], [{ k: "dress", pt: "Nas igrejas ortodoxas descalce-se e cubra ombros e joelhos; as mulheres cobrem o cabelo.", en: "In Orthodox churches remove your shoes and cover shoulders and knees; women cover their hair." }]),
  nbo: af("999 / 112", { k: "pay", pt: "O M-Pesa é usado para quase tudo; os estrangeiros podem ativá-lo com o passaporte. Cartão nos centros comerciais e hotéis.", en: "M-Pesa is used for almost everything; visitors can activate it with a passport. Cards at malls and hotels." }, tip("Gorjeta de 10% nos restaurantes e aos guias de safari por dia.", "Tip 10% in restaurants and give safari guides a daily tip."), afSafety("Trânsito pela esquerda. Não ande a pé no centro à noite e não mostre telemóvel nem relógio.", "Traffic drives on the left. Don't walk downtown at night and don't show your phone or watch."), plug("Tomadas tipo G, 240 V: leve adaptador.", "Type G sockets, 240 V: bring an adapter."), [
    { n: "Nyama choma", p: 1200, pt: "Cabra ou vaca grelhada, com kachumbari.", en: "Grilled goat or beef with kachumbari." },
    { n: "Ugali e sukuma wiki", p: 300, pt: "Papa de milho com couve salteada.", en: "Maize porridge with sautéed greens." },
    { n: "Chapati", p: 50, pt: "Pão achatado, herança indiana da costa.", en: "Flatbread, an Indian legacy from the coast." },
    { n: "Café queniano", p: 300, pt: "Um café filtrado de grãos AA.", en: "A filter coffee of AA beans." }
  ]),
  lad: af("113 / 112", { k: "pay", pt: "O kwanza (AOA) só se usa no país; muitos sítios aceitam Multicaixa e alguns cartões estrangeiros. Leve dinheiro para mercados e táxis.", en: "The kwanza (AOA) is only used in Angola; many places take Multicaixa and some foreign cards. Carry cash for markets and taxis." }, tip("Gorjeta de 5–10% nos restaurantes; arredonde nos táxis.", "Tip 5–10% in restaurants; round up in taxis."), afSafety("Não fotografe edifícios do Estado, militares nem a polícia, e leve sempre uma cópia do passaporte. Os candongueiros são baratos mas não seguem um horário.", "Don't photograph government buildings, the military or police, and always carry a copy of your passport. Candongueiro minibuses are cheap but keep no timetable."), plug("Tomadas tipo C/F, 220 V.", "Type C/F sockets, 220 V."), [
    { n: "Muamba de galinha", p: 9000, pt: "Galinha em óleo de palma com quiabos e funge.", en: "Chicken in palm oil with okra and funge." },
    { n: "Calulu", p: 8000, pt: "Peixe seco com legumes e óleo de palma.", en: "Dried fish with vegetables and palm oil." },
    { n: "Mufete", p: 10000, pt: "Peixe grelhado com feijão de óleo de palma, banana e mandioca.", en: "Grilled fish with palm-oil beans, plantain and cassava." },
    { n: "Cuca", p: 1000, pt: "A cerveja angolana, bem gelada.", en: "Angola's beer, ice-cold." }
  ]),
  acc: af("112", { k: "pay", pt: "Mobile money (MTN MoMo) e dinheiro; cartão nos hotéis e centros comerciais. Troque só em casas de câmbio oficiais.", en: "Mobile money (MTN MoMo) and cash; cards at hotels and malls. Exchange only at official bureaus." }, tip("Gorjeta de 10% nos restaurantes, se o serviço não estiver incluído.", "Tip 10% in restaurants if service isn't included."), afSafety("Os trotros são baratos mas cheios; à noite prefira Uber ou Bolt.", "Trotro minibuses are cheap but packed; at night prefer Uber or Bolt."), plug("Tomadas tipo G (e D), 230 V: leve adaptador.", "Type G (and D) sockets, 230 V: bring an adapter."), [
    { n: "Jollof", p: 60, pt: "Arroz de tomate e especiarias, com frango.", en: "Spiced tomato rice with chicken." },
    { n: "Waakye", p: 40, pt: "Arroz e feijão com shito.", en: "Rice and beans with shito." },
    { n: "Kelewele", p: 20, pt: "Banana-pão frita com gengibre e malagueta.", en: "Fried plantain with ginger and chilli." },
    { n: "Banku e tilápia", p: 90, pt: "Massa de milho fermentado com tilápia grelhada.", en: "Fermented corn dough with grilled tilapia." }
  ]),
  kgl: af("112", AF_CASH, tip("Gorjeta de 5–10% é bem recebida; regatear é pouco comum nas lojas.", "A 5–10% tip is welcome; haggling is uncommon in shops."), afSafety("Kigali é das capitais mais seguras de África. Os sacos de plástico são proibidos e o capacete é obrigatório nas mota-táxis.", "Kigali is one of Africa's safest capitals. Plastic bags are banned and helmets are compulsory on moto taxis."), plug("Tomadas tipo C/J, 230 V.", "Type C/J sockets, 230 V."), [
    { n: "Brochettes", p: 2000, pt: "Espetadas de cabra com banana-pão.", en: "Goat skewers with plantain." },
    { n: "Isombe", p: 2500, pt: "Folhas de mandioca com amendoim.", en: "Cassava leaves with peanuts." },
    { n: "Buffet local", p: 4000, pt: "O almoço de buffet ruandês de feijão, matoke e arroz.", en: "The Rwandan lunch buffet of beans, matoke and rice." },
    { n: "Café", p: 2000, pt: "Café ruandês de altitude.", en: "High-altitude Rwandan coffee." }
  ]),
  dkr: af("17 / 18", { k: "pay", pt: "Franco CFA (XOF) em dinheiro; Wave e Orange Money muito usados. Combine o preço do táxi antes de entrar.", en: "CFA francs (XOF) in cash; Wave and Orange Money are widely used. Agree the taxi fare before getting in." }, tip("Gorjeta de 5–10% nos restaurantes; regateie nos mercados.", "Tip 5–10% in restaurants; haggle in markets."), afSafety("Vendedores e «guias» insistentes no centro e no porto de Gorée: compre bilhetes só na bilheteira.", "Pushy vendors and «guides» downtown and at the Gorée port: buy tickets only at the counter."), plug("Tomadas tipo C/D/E/K, 230 V.", "Type C/D/E/K sockets, 230 V."), [
    { n: "Thiéboudienne", p: 3000, pt: "Arroz, peixe e legumes, o prato nacional.", en: "Rice, fish and vegetables, the national dish." },
    { n: "Yassa", p: 3000, pt: "Frango ou peixe com cebola e limão.", en: "Chicken or fish with onion and lemon." },
    { n: "Bissap", p: 500, pt: "Sumo de hibisco gelado.", en: "Iced hibiscus juice." },
    { n: "Café Touba", p: 200, pt: "Café com pimenta-da-guiné, numa banca de rua.", en: "Coffee with Guinea pepper from a street stall." }
  ])
};
