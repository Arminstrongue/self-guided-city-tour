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
    ] }
};
