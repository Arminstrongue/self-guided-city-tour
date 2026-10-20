/**
 * Segurança por cidade: números de emergência por país, burlas e riscos comuns (biblioteca única
 * traduzida em 9 línguas, reutilizável em qualquer cidade nova), zonas de atenção e frase de ajuda.
 * Para abrir uma cidade nova basta escolher as chaves de alerta e os nomes dos sítios.
 */
import type { Locale } from "@/i18n/dictionaries";

export type AlertKey =
  | "pickpocket" | "snatch" | "petition" | "bracelet" | "rose" | "cups" | "ring" | "stain" | "drugs"
  | "couvert" | "menu" | "taxi" | "bar" | "shoeshine" | "shop" | "photo" | "helpers" | "atm"
  | "fakepolice" | "lefttraffic" | "bikelane" | "heat" | "dress" | "camel" | "law";

export type NumK = "sos" | "police" | "ambulance" | "fire" | "health" | "nonurgent";
export type CountrySafety = { nums: { k: NumK; n: string }[]; help: { lang: string; text: string }; pharmacy: string };
export type CitySafety = { alerts: AlertKey[]; hot: string[]; night: string[]; tp?: string };

const HELP = {
  pt: { lang: "pt-PT", text: "Socorro! Preciso de ajuda. Por favor, chame a polícia ou uma ambulância." },
  es: { lang: "es-ES", text: "¡Socorro! Necesito ayuda. Por favor, llame a la policía o a una ambulancia." },
  fr: { lang: "fr-FR", text: "Au secours ! J'ai besoin d'aide. Appelez la police ou une ambulance, s'il vous plaît." },
  it: { lang: "it-IT", text: "Aiuto! Ho bisogno di aiuto. Per favore, chiami la polizia o un'ambulanza." },
  nl: { lang: "nl-NL", text: "Help! Ik heb hulp nodig. Bel alstublieft de politie of een ambulance." },
  tr: { lang: "tr-TR", text: "İmdat! Yardıma ihtiyacım var. Lütfen polisi ya da ambulansı arayın." },
  en: { lang: "en-GB", text: "Help! I need help. Please call the police or an ambulance." },
  ar: { lang: "ar", text: "النجدة! أحتاج إلى مساعدة. من فضلك اتصل بالشرطة أو الإسعاف." }
};

export const COUNTRY_SAFETY: Record<string, CountrySafety> = {
  PT: { nums: [{ k: "sos", n: "112" }, { k: "health", n: "808 24 24 24" }], help: HELP.pt, pharmacy: "Farmácia ✚" },
  ES: { nums: [{ k: "sos", n: "112" }, { k: "police", n: "091" }], help: HELP.es, pharmacy: "Farmacia ✚" },
  FR: { nums: [{ k: "sos", n: "112" }, { k: "police", n: "17" }, { k: "ambulance", n: "15" }, { k: "fire", n: "18" }], help: HELP.fr, pharmacy: "Pharmacie ✚" },
  IT: { nums: [{ k: "sos", n: "112" }, { k: "police", n: "113" }, { k: "ambulance", n: "118" }, { k: "fire", n: "115" }], help: HELP.it, pharmacy: "Farmacia ✚" },
  NL: { nums: [{ k: "sos", n: "112" }, { k: "nonurgent", n: "0900 8844" }], help: HELP.nl, pharmacy: "Apotheek ✚" },
  TR: { nums: [{ k: "sos", n: "112" }, { k: "police", n: "155" }], help: HELP.tr, pharmacy: "Eczane (E)" },
  GB: { nums: [{ k: "sos", n: "999" }, { k: "nonurgent", n: "101" }, { k: "health", n: "111" }], help: HELP.en, pharmacy: "Pharmacy / Chemist" },
  AE: { nums: [{ k: "police", n: "999" }, { k: "ambulance", n: "998" }, { k: "fire", n: "997" }, { k: "nonurgent", n: "901" }], help: HELP.ar, pharmacy: "صيدلية · Pharmacy" },
  QA: { nums: [{ k: "sos", n: "999" }], help: HELP.ar, pharmacy: "صيدلية · Pharmacy" },
  SA: { nums: [{ k: "sos", n: "911" }, { k: "police", n: "999" }, { k: "ambulance", n: "997" }, { k: "fire", n: "998" }], help: HELP.ar, pharmacy: "صيدلية · Pharmacy" },
  EG: { nums: [{ k: "police", n: "122" }, { k: "ambulance", n: "123" }, { k: "fire", n: "180" }, { k: "nonurgent", n: "126" }], help: HELP.ar, pharmacy: "صيدلية · Pharmacy" },
  JO: { nums: [{ k: "sos", n: "911" }], help: HELP.ar, pharmacy: "صيدلية · Pharmacy" },
  OM: { nums: [{ k: "sos", n: "9999" }], help: HELP.ar, pharmacy: "صيدلية · Pharmacy" }
};

const UK: AlertKey[] = ["lefttraffic", "pickpocket", "snatch"];

export const CITY_SAFETY: Record<string, CitySafety> = {
  lis: { alerts: ["pickpocket", "drugs", "couvert", "menu", "taxi"], hot: ["Tram 28", "Rua Augusta", "Rossio", "Miradouro de Santa Luzia", "Metro (linha vermelha)"], night: ["Bairro Alto", "Cais do Sodré", "Martim Moniz"], tp: "Esquadra de Turismo · Palácio Foz, Praça dos Restauradores" },
  opo: { alerts: ["pickpocket", "couvert", "menu", "petition"], hot: ["Ribeira", "Estação de São Bento", "Rua de Santa Catarina", "Ponte Luís I"], night: ["Ribeira", "Batalha"], tp: "Esquadra de Turismo · Rua Clube dos Fenianos 11" },
  mad: { alerts: ["pickpocket", "petition", "rose", "fakepolice", "atm"], hot: ["Puerta del Sol", "Gran Vía", "Metro (línea 8, aeropuerto)", "El Rastro"], night: ["Lavapiés", "Sol"], tp: "SATE · Calle Leganitos 19" },
  bcn: { alerts: ["pickpocket", "snatch", "stain", "cups", "petition", "fakepolice"], hot: ["La Rambla", "Metro L3", "Sagrada Família", "Park Güell", "Barceloneta"], night: ["El Raval", "Barceloneta (praia)"], tp: "Mossos d'Esquadra · La Rambla 43" },
  par: { alerts: ["pickpocket", "snatch", "bracelet", "petition", "ring", "cups", "taxi"], hot: ["Tour Eiffel", "Sacré-Cœur", "Louvre", "Métro ligne 1", "RER B"], night: ["Gare du Nord", "Châtelet-Les Halles", "Barbès"] },
  rom: { alerts: ["pickpocket", "photo", "rose", "bracelet", "menu", "taxi"], hot: ["Termini", "Bus 64 / 40", "Metro A", "Fontana di Trevi", "Colosseo"], night: ["Termini / Esquilino"] },
  ams: { alerts: ["bikelane", "pickpocket", "drugs", "fakepolice"], hot: ["Centraal Station", "Dam", "Tram 2 / 12", "De Wallen"], night: ["De Wallen", "Zeedijk"] },
  ist: { alerts: ["bar", "shoeshine", "shop", "taxi", "atm", "pickpocket"], hot: ["Sultanahmet", "Kapalıçarşı", "İstiklal Caddesi", "Taksim", "Tramvay T1"], night: ["Tarlabaşı"], tp: "Turizm Polisi · Yerebatan Cad. 6, Sultanahmet" },
  lon: { alerts: ["lefttraffic", "snatch", "pickpocket", "cups", "taxi"], hot: ["Oxford Street", "Westminster Bridge", "Leicester Square", "Covent Garden", "Camden", "Piccadilly line"], night: ["Leicester Square", "Soho"] },
  edi: { alerts: UK, hot: ["Royal Mile", "Princes Street", "Waverley"], night: ["Cowgate", "Grassmarket"] },
  man: { alerts: UK, hot: ["Piccadilly Gardens", "Arndale", "Piccadilly station"], night: ["Piccadilly Gardens"] },
  gla: { alerts: UK, hot: ["Buchanan Street", "Central Station", "Argyle Street"], night: ["Argyle Street", "Trongate"] },
  liv: { alerts: UK, hot: ["Lime Street", "Mathew Street", "Albert Dock"], night: ["Concert Square"] },
  bir: { alerts: UK, hot: ["New Street", "Bullring", "Broad Street"], night: ["Broad Street"] },
  dxb: { alerts: ["heat", "law", "dress", "taxi"], hot: ["Gold Souk", "Spice Souk", "Dubai Mall"], night: [], tp: "Dubai Police · 901 · app Dubai Police" },
  auh: { alerts: ["heat", "law", "dress", "taxi"], hot: ["Sheikh Zayed Grand Mosque", "Corniche"], night: [] },
  doh: { alerts: ["heat", "law", "dress", "taxi"], hot: ["Souq Waqif", "Corniche"], night: [] },
  ruh: { alerts: ["heat", "law", "dress", "taxi"], hot: ["Al Zal Souq", "Batha"], night: [] },
  jed: { alerts: ["heat", "law", "dress", "taxi"], hot: ["Al-Balad", "Souq Al Alawi"], night: [] },
  cai: { alerts: ["camel", "shop", "helpers", "taxi", "heat", "pickpocket"], hot: ["Giza plateau", "Khan el-Khalili", "Tahrir Square", "Metro"], night: [], tp: "Tourist Police · 126" },
  amm: { alerts: ["taxi", "dress", "shop", "pickpocket"], hot: ["Downtown (Al-Balad)", "Roman Theatre"], night: [] },
  mct: { alerts: ["heat", "dress", "law", "taxi"], hot: ["Mutrah Souq", "Corniche"], night: [] }
};

type T = [string, string];
export const ALERT_TEXT: Record<AlertKey, Record<Locale, T>> = {
  pickpocket: {
    pt: ["Carteiristas", "Elétricos, metro e filas cheios são o local de trabalho deles. Mala à frente e fechada; telemóvel nunca no bolso de trás."],
    en: ["Pickpockets", "Crowded trams, metros and queues are their workplace. Bag in front and zipped; phone never in a back pocket."],
    es: ["Carteristas", "Tranvías, metro y colas llenos son su lugar de trabajo. Bolso delante y cerrado; el móvil nunca en el bolsillo trasero."],
    fr: ["Pickpockets", "Trams, métro et files d'attente bondés sont leur terrain. Sac devant et fermé ; téléphone jamais dans la poche arrière."],
    de: ["Taschendiebe", "Volle Straßenbahnen, U-Bahnen und Warteschlangen sind ihr Revier. Tasche vorne und geschlossen; Handy nie in der Gesäßtasche."],
    it: ["Borseggiatori", "Tram, metro e code affollate sono il loro terreno. Borsa davanti e chiusa; telefono mai nella tasca posteriore."],
    zh: ["扒手", "拥挤的电车、地铁和排队处是扒手的地盘。包放身前并拉好拉链；手机别放后裤袋。"],
    ar: ["النشّالون", "الترام والمترو والطوابير المزدحمة هي مكان عملهم. ضع الحقيبة أمامك ومغلقة، ولا تضع الهاتف في الجيب الخلفي."],
    ja: ["スリ", "混雑したトラム、地下鉄、行列が彼らの仕事場です。バッグは体の前で閉じ、スマホは後ろポケットに入れないで。"]
  },
  snatch: {
    pt: ["Roubo de telemóvel", "Ladrões de bicicleta ou trotinete arrancam o telemóvel da mão. Afaste-se da beira do passeio quando usar o mapa."],
    en: ["Phone snatching", "Thieves on bikes or scooters grab phones from your hand. Step back from the kerb when using maps."],
    es: ["Robo de móviles", "Ladrones en bici o patinete arrancan el móvil de la mano. Apártate del bordillo al mirar el mapa."],
    fr: ["Vol de téléphone", "Des voleurs à vélo ou trottinette arrachent le téléphone de la main. Écartez-vous du bord du trottoir pour consulter la carte."],
    de: ["Handyraub", "Diebe auf Fahrrad oder Roller reißen das Handy aus der Hand. Beim Kartenlesen vom Bordstein zurücktreten."],
    it: ["Scippo del telefono", "Ladri in bici o monopattino strappano il telefono di mano. Allontanati dal bordo del marciapiede quando guardi la mappa."],
    zh: ["抢手机", "骑自行车或电动滑板车的小偷会从手中抢走手机。看地图时请远离路边。"],
    ar: ["خطف الهواتف", "لصوص على دراجات أو سكوترات يخطفون الهاتف من اليد. ابتعد عن حافة الرصيف عند استخدام الخريطة."],
    ja: ["スマホのひったくり", "自転車やスクーターの泥棒が手からスマホを奪います。地図を見るときは車道から離れて。"]
  },
  petition: {
    pt: ["Petições falsas", "Alguém com uma prancheta pede uma assinatura para uma causa e depois exige dinheiro, ou um cúmplice tira-lhe a carteira. Siga em frente."],
    en: ["Fake petitions", "Someone with a clipboard asks you to sign for a charity, then demands money, or a partner picks your pocket. Walk on."],
    es: ["Firmas falsas", "Alguien con una carpeta te pide firmar por una causa y luego exige dinero, o un cómplice te roba. Sigue andando."],
    fr: ["Fausses pétitions", "Quelqu'un avec un bloc-notes vous fait signer pour une association puis réclame de l'argent, ou un complice vous vole. Passez votre chemin."],
    de: ["Falsche Unterschriftenlisten", "Jemand mit Klemmbrett bittet um eine Unterschrift für einen guten Zweck und verlangt dann Geld, oder ein Komplize bestiehlt Sie. Weitergehen."],
    it: ["Petizioni false", "Qualcuno con una cartellina chiede una firma per beneficenza e poi pretende soldi, o un complice ti deruba. Tira dritto."],
    zh: ["假请愿签名", "有人拿着写字板请你为慈善签名，随后索要钱财，或同伙趁机偷窃。直接走开。"],
    ar: ["عرائض مزيّفة", "شخص يحمل لوحاً يطلب توقيعك لجمعية خيرية ثم يطالب بالمال، أو يسرقك شريكه. تابع طريقك."],
    ja: ["偽の署名活動", "クリップボードを持った人が慈善の署名を求め、その後お金を要求したり、仲間がスリを働きます。立ち止まらずに。"]
  },
  bracelet: {
    pt: ["Pulseiras da amizade", "Atam-lhe um fio no pulso e exigem pagamento. Mãos nos bolsos e um não firme."],
    en: ["Friendship bracelets", "A man ties a string bracelet on your wrist and demands payment. Keep your hands in your pockets and say no firmly."],
    es: ["Pulseras de la amistad", "Te atan un hilo a la muñeca y exigen dinero. Manos en los bolsillos y un no firme."],
    fr: ["Bracelets de l'amitié", "On vous noue un fil au poignet puis on exige de l'argent. Mains dans les poches et un non ferme."],
    de: ["Freundschaftsbänder", "Man knotet Ihnen ein Band ums Handgelenk und verlangt Geld. Hände in die Taschen und klar Nein sagen."],
    it: ["Braccialetti dell'amicizia", "Ti legano un filo al polso e chiedono soldi. Mani in tasca e un no deciso."],
    zh: ["友谊手绳", "有人把绳子系在你手腕上然后索要钱。把手放进口袋，坚定地说不。"],
    ar: ["أساور الصداقة", "يربط أحدهم خيطاً حول معصمك ثم يطالب بالمال. ضع يديك في جيبك وقل لا بحزم."],
    ja: ["ミサンガ詐欺", "手首にひもを巻き付けてお金を要求します。手はポケットに入れ、はっきり断って。"]
  },
  rose: {
    pt: ["Presentes grátis", "Põem-lhe na mão uma rosa, um raminho de alecrim ou um \"presente\" e depois pedem dinheiro. Não aceite."],
    en: ["Free gifts", "A rose, a sprig of rosemary or a \"gift\" is pressed into your hand, then money is demanded. Don't take it."],
    es: ["Regalos gratis", "Te ponen en la mano una rosa, una ramita de romero o un \"regalo\" y luego piden dinero. No lo aceptes."],
    fr: ["Cadeaux gratuits", "On vous met une rose, un brin de romarin ou un « cadeau » dans la main, puis on réclame de l'argent. Refusez."],
    de: ["Gratis-Geschenke", "Man drückt Ihnen eine Rose, einen Rosmarinzweig oder ein „Geschenk“ in die Hand und verlangt dann Geld. Nicht annehmen."],
    it: ["Regali gratis", "Ti mettono in mano una rosa, un rametto di rosmarino o un \"regalo\" e poi chiedono soldi. Non accettare."],
    zh: ["“免费”礼物", "有人把玫瑰、迷迭香或“礼物”塞到你手里，然后要钱。不要接。"],
    ar: ["هدايا مجانية", "يضعون في يدك وردة أو غصن إكليل الجبل أو «هدية» ثم يطلبون المال. لا تقبلها."],
    ja: ["「無料」のプレゼント", "バラやローズマリー、「プレゼント」を手に押し付けてからお金を要求します。受け取らないで。"]
  },
  cups: {
    pt: ["Jogo dos copos", "Os jogos de copos e bola na rua são viciados; quem \"ganha\" é cúmplice. Nunca jogue e vigie a mala enquanto olha."],
    en: ["Shell game", "Street games with cups and a ball are rigged; the \"winners\" are accomplices. Never play, and watch your bag while you look."],
    es: ["Trile", "Los juegos de vasos y bolita en la calle están amañados; los que \"ganan\" son cómplices. No juegues y vigila el bolso."],
    fr: ["Bonneteau", "Les jeux de gobelets dans la rue sont truqués ; les « gagnants » sont complices. Ne jouez jamais et surveillez votre sac."],
    de: ["Hütchenspiel", "Becherspiele auf der Straße sind manipuliert; die „Gewinner“ sind Komplizen. Nie mitspielen und auf die Tasche achten."],
    it: ["Gioco delle campanelle", "I giochi di bicchieri e pallina in strada sono truccati; chi \"vince\" è complice. Non giocare e tieni d'occhio la borsa."],
    zh: ["街头猜杯游戏", "街头猜杯藏球游戏都是骗局，“赢家”都是同伙。千万别玩，围观时看好包。"],
    ar: ["لعبة الأكواب", "ألعاب الأكواب والكرة في الشارع مغشوشة، و«الفائزون» شركاء. لا تلعب أبداً وانتبه لحقيبتك."],
    ja: ["カップ当てゲーム", "路上のカップとボールのゲームはいかさまで、「勝者」は仲間です。絶対に参加せず、見物中もバッグに注意。"]
  },
  ring: {
    pt: ["Anel de ouro achado", "Alguém \"encontra\" um anel aos seus pés e quer vendê-lo. É latão. Ignore e continue."],
    en: ["The found gold ring", "Someone \"finds\" a ring at your feet and offers to sell it. It's brass. Ignore it and keep walking."],
    es: ["Anillo de oro encontrado", "Alguien \"encuentra\" un anillo a tus pies y quiere vendértelo. Es latón. Ignóralo y sigue."],
    fr: ["La bague en or", "Quelqu'un « trouve » une bague à vos pieds et veut vous la vendre. C'est du laiton. Ignorez et continuez."],
    de: ["Gefundener Goldring", "Jemand „findet“ einen Ring vor Ihren Füßen und will ihn verkaufen. Es ist Messing. Ignorieren und weitergehen."],
    it: ["L'anello d'oro trovato", "Qualcuno \"trova\" un anello ai tuoi piedi e vuole vendertelo. È ottone. Ignora e prosegui."],
    zh: ["“捡到”金戒指", "有人在你脚边“捡到”戒指并想卖给你。那是黄铜。不理会，继续走。"],
    ar: ["خاتم ذهبي «مفقود»", "يدّعي أحدهم أنه وجد خاتماً عند قدميك ويعرض بيعه. إنه نحاس. تجاهله وتابع."],
    ja: ["金の指輪を「拾う」", "足元で指輪を「見つけた」と言って売りつけます。中身は真鍮。無視して進みましょう。"]
  },
  stain: {
    pt: ["Truque da nódoa", "Apontam para uma \"nódoa\" na sua roupa e ajudam a limpar enquanto um cúmplice leva a mala. Afaste-se."],
    en: ["The stain trick", "Someone points at a \"stain\" on your clothes and helps clean it while a partner takes your bag. Move away."],
    es: ["Truco de la mancha", "Te señalan una \"mancha\" en la ropa y te ayudan a limpiarla mientras un cómplice se lleva el bolso. Aléjate."],
    fr: ["La tache", "On vous signale une « tache » sur vos vêtements et on aide à nettoyer pendant qu'un complice prend votre sac. Éloignez-vous."],
    de: ["Fleck-Trick", "Man zeigt auf einen „Fleck“ an Ihrer Kleidung und hilft beim Säubern, während ein Komplize die Tasche nimmt. Gehen Sie weg."],
    it: ["Il trucco della macchia", "Ti indicano una \"macchia\" sui vestiti e aiutano a pulirla mentre un complice prende la borsa. Allontanati."],
    zh: ["污渍骗局", "有人指出你衣服上有“污渍”并帮你擦，同伙趁机拿走你的包。立即离开。"],
    ar: ["حيلة البقعة", "يشير أحدهم إلى «بقعة» على ملابسك ويساعدك في تنظيفها بينما يأخذ شريكه حقيبتك. ابتعد."],
    ja: ["汚れ詐欺", "服の「汚れ」を指摘して拭いてくれる間に、仲間がバッグを持ち去ります。すぐ離れて。"]
  },
  drugs: {
    pt: ["Oferta de droga na rua", "Homens oferecem droga em voz baixa no centro histórico. É ilegal, quase sempre falsa e pode dar problemas. Ignore."],
    en: ["Street drug offers", "Men whisper offers of drugs in the old town. It's illegal, usually fake and can lead to trouble. Just ignore them."],
    es: ["Venta de droga en la calle", "Te ofrecen droga en voz baja en el casco antiguo. Es ilegal, casi siempre falsa y trae problemas. Ignóralos."],
    fr: ["Drogue dans la rue", "Des hommes proposent de la drogue à voix basse dans le centre historique. C'est illégal, souvent faux et source d'ennuis. Ignorez."],
    de: ["Drogenangebote auf der Straße", "In der Altstadt werden leise Drogen angeboten. Illegal, meist gefälscht und riskant. Einfach ignorieren."],
    it: ["Droga offerta in strada", "Nel centro storico ti offrono droga sottovoce. È illegale, spesso falsa e porta guai. Ignora."],
    zh: ["街头兜售毒品", "老城区有人低声兜售毒品。违法、多为假货，还会惹麻烦。不要理会。"],
    ar: ["عروض مخدرات في الشارع", "يعرض رجال المخدرات همساً في البلدة القديمة. هذا غير قانوني وغالباً مزيّف ويجلب المتاعب. تجاهلهم."],
    ja: ["路上での薬物の誘い", "旧市街で小声で薬物を勧められます。違法でたいてい偽物、トラブルのもと。無視しましょう。"]
  },
  couvert: {
    pt: ["Couvert", "Pão, azeitonas e manteiga postos na mesa pagam-se se comer. Peça para levarem se não quiser."],
    en: ["Couvert", "Bread, olives and butter placed on the table are charged if you eat them. Ask them to take it away if you don't want it."],
    es: ["Cubierto (couvert)", "El pan, las aceitunas y la mantequilla que ponen en la mesa se cobran si los comes. Pide que los retiren si no los quieres."],
    fr: ["Le couvert", "Pain, olives et beurre posés sur la table sont facturés si vous y touchez. Faites-les retirer si vous n'en voulez pas."],
    de: ["Couvert", "Brot, Oliven und Butter auf dem Tisch werden berechnet, wenn Sie davon essen. Lassen Sie sie abräumen, wenn Sie nichts möchten."],
    it: ["Coperto", "Pane, olive e burro portati al tavolo si pagano se li mangi. Falli togliere se non li vuoi."],
    zh: ["餐前小食（couvert）", "桌上的面包、橄榄和黄油吃了就要付钱。不需要的话请让服务员拿走。"],
    ar: ["المقبلات (couvert)", "الخبز والزيتون والزبدة الموضوعة على الطاولة تُحتسب إن أكلت منها. اطلب رفعها إن لم تردها."],
    ja: ["お通し（couvert）", "テーブルに置かれたパン、オリーブ、バターは食べると料金がかかります。不要なら下げてもらって。"]
  },
  menu: {
    pt: ["Ementas sem preços", "Coma só onde os preços estão à vista. Angariadores à porta de restaurantes junto a monumentos costumam significar contas altas."],
    en: ["Menus without prices", "Only eat where prices are shown. Touts outside restaurants next to landmarks usually mean a big bill."],
    es: ["Cartas sin precios", "Come solo donde se vean los precios. Los captadores en la puerta de restaurantes junto a monumentos suelen significar cuentas altas."],
    fr: ["Menus sans prix", "Ne mangez que là où les prix sont affichés. Les rabatteurs devant les restaurants près des monuments annoncent souvent des additions salées."],
    de: ["Speisekarten ohne Preise", "Nur dort essen, wo Preise aushängen. Anwerber vor Restaurants an Sehenswürdigkeiten bedeuten meist hohe Rechnungen."],
    it: ["Menù senza prezzi", "Mangia solo dove i prezzi sono esposti. I buttadentro davanti ai ristoranti vicino ai monumenti di solito significano conti salati."],
    zh: ["没有价格的菜单", "只在标明价格的地方用餐。景点旁餐厅门口拉客的，账单通常很高。"],
    ar: ["قوائم بلا أسعار", "تناول الطعام فقط حيث تُعرض الأسعار. المروّجون أمام المطاعم قرب المعالم يعنون غالباً فواتير مرتفعة."],
    ja: ["値段のないメニュー", "値段が表示された店で食べましょう。名所近くの店先の客引きは高額な会計のサインです。"]
  },
  taxi: {
    pt: ["Táxis", "Use praças de táxi oficiais ou apps com preço fixo. Recuse boleias oferecidas dentro da zona de chegadas do aeroporto."],
    en: ["Taxis", "Use official taxi ranks or apps with a fixed fare. Turn down rides offered inside the airport arrivals hall."],
    es: ["Taxis", "Usa paradas oficiales o apps con precio cerrado. Rechaza viajes que te ofrezcan dentro de la zona de llegadas del aeropuerto."],
    fr: ["Taxis", "Utilisez les stations officielles ou une appli à prix fixe. Refusez les courses proposées dans le hall d'arrivée de l'aéroport."],
    de: ["Taxis", "Offizielle Taxistände oder Apps mit Festpreis nutzen. Fahrten, die in der Ankunftshalle angeboten werden, ablehnen."],
    it: ["Taxi", "Usa i posteggi ufficiali o app a tariffa fissa. Rifiuta passaggi offerti nella sala arrivi dell'aeroporto."],
    zh: ["出租车", "使用正规出租车站或固定价格的叫车应用。拒绝在机场到达大厅内主动揽客的车。"],
    ar: ["سيارات الأجرة", "استخدم مواقف الأجرة الرسمية أو تطبيقات بسعر ثابت. ارفض العروض داخل صالة الوصول في المطار."],
    ja: ["タクシー", "正規のタクシー乗り場か定額の配車アプリを使って。空港到着ロビー内の声かけは断りましょう。"]
  },
  bar: {
    pt: ["Convites para bares", "Desconhecidos simpáticos convidam para um bar ou discoteca; aparece uma conta enorme e pressão para pagar. Escolha os seus sítios."],
    en: ["Bar invitations", "Friendly strangers invite you to a bar or club; then comes a huge bill and pressure to pay. Choose your own places."],
    es: ["Invitaciones a bares", "Desconocidos simpáticos te invitan a un bar o club; llega una cuenta enorme y presión para pagar. Elige tú los sitios."],
    fr: ["Invitations dans un bar", "Des inconnus sympathiques vous invitent dans un bar ou un club ; l'addition est énorme et on vous presse de payer. Choisissez vos lieux."],
    de: ["Bar-Einladungen", "Freundliche Fremde laden in eine Bar oder einen Club ein; dann kommt eine riesige Rechnung und Druck zu zahlen. Lokale selbst wählen."],
    it: ["Inviti al bar", "Sconosciuti simpatici ti invitano in un bar o locale; arriva un conto enorme e pressioni per pagare. Scegli tu i locali."],
    zh: ["酒吧邀请", "热情的陌生人邀你去酒吧或夜店，结果账单巨大并被逼付款。自己选择去处。"],
    ar: ["دعوات إلى الحانات", "غرباء ودودون يدعونك إلى حانة أو نادٍ، ثم فاتورة ضخمة وضغط للدفع. اختر أماكنك بنفسك."],
    ja: ["バーへの誘い", "親切な見知らぬ人にバーやクラブに誘われ、高額な請求と支払いの強要を受けます。店は自分で選んで。"]
  },
  shoeshine: {
    pt: ["Escova caída", "Um engraxador deixa cair a escova; apanha-a e ele \"agradece\" com uma graxa que depois cobra. Siga em frente."],
    en: ["The dropped brush", "A shoe-shiner drops his brush; you pick it up and he \"thanks\" you with a shine he then charges for. Walk on."],
    es: ["El cepillo caído", "Un limpiabotas deja caer el cepillo; lo recoges y te \"agradece\" con una limpieza que luego cobra. Sigue andando."],
    fr: ["La brosse tombée", "Un cireur laisse tomber sa brosse ; vous la ramassez et il vous « remercie » d'un cirage qu'il fait payer. Passez votre chemin."],
    de: ["Fallengelassene Bürste", "Ein Schuhputzer lässt die Bürste fallen; Sie heben sie auf, und er „bedankt“ sich mit einer Politur, die er berechnet. Weitergehen."],
    it: ["La spazzola caduta", "Un lustrascarpe lascia cadere la spazzola; la raccogli e lui ti \"ringrazia\" con una lucidatura a pagamento. Tira dritto."],
    zh: ["掉落的刷子", "擦鞋匠故意掉下刷子，你捡起后他以擦鞋“答谢”，然后收费。直接走开。"],
    ar: ["الفرشاة الساقطة", "يُسقط ماسح الأحذية فرشاته، فتلتقطها ويشكرك بتلميع ثم يطلب ثمنه. تابع طريقك."],
    ja: ["落ちたブラシ", "靴磨きがブラシを落とし、拾うと「お礼」に靴を磨いて料金を請求します。そのまま立ち去って。"]
  },
  shop: {
    pt: ["Guias simpáticos", "Um desconhecido prestável oferece-se para mostrar a zona e acaba numa loja de tapetes ou recordações. Um não educado chega."],
    en: ["Friendly \"guides\"", "A helpful stranger offers to show you around and you end up in a carpet or souvenir shop. A polite no is enough."],
    es: ["Guías amables", "Un desconocido servicial se ofrece a enseñarte la zona y acabas en una tienda de alfombras o recuerdos. Basta un no educado."],
    fr: ["Guides trop aimables", "Un inconnu serviable propose de vous faire visiter et vous finissez dans une boutique de tapis ou de souvenirs. Un non poli suffit."],
    de: ["Hilfsbereite „Führer“", "Ein netter Fremder bietet eine Führung an, und Sie landen in einem Teppich- oder Souvenirladen. Ein höfliches Nein genügt."],
    it: ["Guide gentili", "Uno sconosciuto disponibile si offre di accompagnarti e finisci in un negozio di tappeti o souvenir. Basta un no cortese."],
    zh: ["热心“向导”", "热心的陌生人主动带你参观，最后进了地毯店或纪念品店。礼貌拒绝即可。"],
    ar: ["مرشدون ودودون", "غريب لطيف يعرض أن يريك المكان وينتهي بك في متجر سجاد أو تذكارات. يكفي رفض مهذب."],
    ja: ["親切な「ガイド」", "親切な人が案内を申し出て、最後はじゅうたん店や土産物店へ。丁寧に断ればOK。"]
  },
  photo: {
    pt: ["Fotos com figurantes", "\"Gladiadores\" e personagens posam para fotos e depois pedem gorjetas altas. Combine o preço antes ou recuse."],
    en: ["Photos with costumed people", "Costumed \"gladiators\" and characters pose for photos and then ask for big tips. Agree a price first or decline."],
    es: ["Fotos con disfraces", "\"Gladiadores\" y personajes posan para fotos y luego piden propinas altas. Acuerda el precio antes o declina."],
    fr: ["Photos avec des costumés", "Des « gladiateurs » et personnages posent pour une photo puis réclament de gros pourboires. Fixez le prix avant ou refusez."],
    de: ["Fotos mit Kostümierten", "„Gladiatoren“ und Figuren posieren für Fotos und verlangen dann hohes Trinkgeld. Preis vorher klären oder ablehnen."],
    it: ["Foto con i figuranti", "\"Gladiatori\" e personaggi posano per una foto e poi chiedono mance alte. Concorda il prezzo prima o rifiuta."],
    zh: ["与装扮者合影", "扮成“角斗士”等角色的人邀你合影，然后索要高额小费。先谈好价格或拒绝。"],
    ar: ["صور مع المتنكّرين", "«مصارعون» وشخصيات تتصوّر معك ثم تطلب إكرامية كبيرة. اتفق على السعر مسبقاً أو ارفض."],
    ja: ["コスプレ写真", "「剣闘士」やキャラクターが一緒に写真に写り、高額なチップを求めます。先に値段を決めるか断って。"]
  },
  helpers: {
    pt: ["Ajudantes nas máquinas", "Desconhecidos que \"ajudam\" nas máquinas de bilhetes podem ficar com o cartão ou vender bilhetes falsos. Compre só na máquina ou na bilheteira."],
    en: ["Ticket-machine \"helpers\"", "Strangers who \"help\" at ticket machines may keep your card or sell fake tickets. Buy only from the machine or the desk."],
    es: ["Ayudantes en las máquinas", "Desconocidos que \"ayudan\" en las máquinas de billetes pueden quedarse tu tarjeta o venderte billetes falsos. Compra solo en la máquina o taquilla."],
    fr: ["« Aide » aux automates", "Des inconnus qui « aident » aux automates de billets peuvent garder votre carte ou vendre de faux billets. Achetez seulement à l'automate ou au guichet."],
    de: ["„Helfer“ am Automaten", "Fremde, die am Ticketautomaten „helfen“, behalten mitunter die Karte oder verkaufen falsche Tickets. Nur am Automaten oder Schalter kaufen."],
    it: ["\"Aiutanti\" alle macchinette", "Sconosciuti che \"aiutano\" alle biglietterie automatiche possono tenersi la carta o vendere biglietti falsi. Compra solo alla macchinetta o allo sportello."],
    zh: ["售票机“帮手”", "在售票机旁“帮忙”的陌生人可能扣下你的卡或卖假票。只在售票机或窗口购票。"],
    ar: ["«مساعدون» عند آلات التذاكر", "غرباء «يساعدون» عند آلات التذاكر قد يحتفظون ببطاقتك أو يبيعون تذاكر مزيفة. اشترِ من الآلة أو الشباك فقط."],
    ja: ["券売機の「お手伝い」", "券売機で「手伝う」見知らぬ人がカードを持ち去ったり偽の切符を売ることがあります。券売機か窓口でだけ購入を。"]
  },
  atm: {
    pt: ["Multibancos e dinheiro", "Use caixas de bancos, não as independentes, e escolha sempre pagar na moeda local."],
    en: ["ATMs and money", "Use bank ATMs, not independent ones, and always choose to be charged in the local currency."],
    es: ["Cajeros y dinero", "Usa cajeros de bancos, no los independientes, y elige siempre pagar en la moneda local."],
    fr: ["Distributeurs et argent", "Utilisez les distributeurs des banques, pas les indépendants, et choisissez toujours d'être débité en monnaie locale."],
    de: ["Geldautomaten", "Automaten von Banken nutzen, keine unabhängigen, und immer in Landeswährung abrechnen lassen."],
    it: ["Bancomat e contanti", "Usa gli sportelli delle banche, non quelli indipendenti, e scegli sempre l'addebito in valuta locale."],
    zh: ["取款机与货币", "使用银行的取款机，不用独立运营的机器，并始终选择以当地货币结算。"],
    ar: ["الصرّافات والنقود", "استخدم صرّافات البنوك لا المستقلة، واختر دائماً الدفع بالعملة المحلية."],
    ja: ["ATMと両替", "独立系ではなく銀行のATMを使い、常に現地通貨での決済を選びましょう。"]
  },
  fakepolice: {
    pt: ["Falsa polícia", "\"Agentes\" à paisana pedem para ver a carteira. A polícia verdadeira não faz isso. Peça identificação e proponha ir a uma esquadra."],
    en: ["Fake police", "Plain-clothes \"officers\" ask to check your wallet. Real police don't. Ask for ID and offer to go to a police station."],
    es: ["Policía falsa", "\"Agentes\" de paisano piden revisar tu cartera. La policía real no lo hace. Pide identificación y ofrece ir a comisaría."],
    fr: ["Faux policiers", "Des « agents » en civil demandent à contrôler votre portefeuille. La vraie police ne le fait pas. Demandez une carte et proposez d'aller au commissariat."],
    de: ["Falsche Polizei", "„Beamte“ in Zivil wollen Ihr Portemonnaie kontrollieren. Echte Polizei tut das nicht. Ausweis verlangen und zur Wache gehen."],
    it: ["Falsa polizia", "\"Agenti\" in borghese chiedono di controllare il portafoglio. La vera polizia non lo fa. Chiedi il tesserino e proponi di andare in commissariato."],
    zh: ["假警察", "便衣“警察”要求检查你的钱包。真警察不会这样做。要求出示证件并提议去警局。"],
    ar: ["شرطة مزيّفة", "«عناصر» بملابس مدنية يطلبون تفتيش محفظتك. الشرطة الحقيقية لا تفعل ذلك. اطلب الهوية واقترح الذهاب إلى المخفر."],
    ja: ["偽警官", "私服の「警官」が財布の確認を求めます。本物の警察はそうしません。身分証を求め、警察署へ行こうと提案して。"]
  },
  lefttraffic: {
    pt: ["Trânsito pela esquerda", "Ao atravessar, olhe primeiro para a direita. Nas passadeiras está pintado \"LOOK RIGHT\"."],
    en: ["Traffic on the left", "Look right first when crossing. \"LOOK RIGHT\" is painted at many crossings."],
    es: ["Se circula por la izquierda", "Al cruzar, mira primero a la derecha. En muchos pasos de peatones pone \"LOOK RIGHT\"."],
    fr: ["Conduite à gauche", "Pour traverser, regardez d'abord à droite. « LOOK RIGHT » est peint à de nombreux passages piétons."],
    de: ["Linksverkehr", "Beim Überqueren zuerst nach rechts schauen. An vielen Übergängen steht „LOOK RIGHT“ auf der Straße."],
    it: ["Guida a sinistra", "Attraversando, guarda prima a destra. Su molte strisce è dipinto \"LOOK RIGHT\"."],
    zh: ["靠左行驶", "过马路时先看右边。许多人行横道上漆有“LOOK RIGHT”。"],
    ar: ["القيادة على اليسار", "عند العبور انظر إلى اليمين أولاً. عبارة «LOOK RIGHT» مرسومة عند كثير من المعابر."],
    ja: ["左側通行", "道を渡るときはまず右を確認。多くの横断歩道に「LOOK RIGHT」と書かれています。"]
  },
  heat: {
    pt: ["Calor extremo", "De maio a setembro passa dos 40 °C. Beba água a toda a hora, use chapéu e protetor, ande à sombra e faça as visitas ao ar livre cedo ou ao fim da tarde."],
    en: ["Extreme heat", "From May to September it tops 40 °C. Drink water constantly, wear a hat and sunscreen, stay in the shade and do outdoor visits early or late in the day."],
    es: ["Calor extremo", "De mayo a septiembre supera los 40 °C. Bebe agua sin parar, usa sombrero y protector, ve por la sombra y haz las visitas al aire libre temprano o al atardecer."],
    fr: ["Chaleur extrême", "De mai à septembre, on dépasse 40 °C. Buvez sans cesse, chapeau et crème solaire, marchez à l'ombre et faites les visites en plein air tôt ou en fin de journée."],
    de: ["Extreme Hitze", "Von Mai bis September über 40 °C. Ständig trinken, Hut und Sonnenschutz, im Schatten gehen und Besichtigungen im Freien früh oder spät am Tag machen."],
    it: ["Caldo estremo", "Da maggio a settembre si superano i 40 °C. Bevi di continuo, cappello e crema solare, cammina all'ombra e fai le visite all'aperto presto o a fine giornata."],
    zh: ["极端高温", "5月至9月气温超过40°C。随时补水，戴帽子、涂防晒，走阴凉处，户外参观安排在清晨或傍晚。"],
    ar: ["حرّ شديد", "من مايو إلى سبتمبر تتجاوز الحرارة 40 درجة. اشرب الماء باستمرار، والبس قبعة وواقياً من الشمس، وامشِ في الظل، وزر الأماكن المفتوحة صباحاً أو مساءً."],
    ja: ["猛暑", "5月から9月は40°Cを超えます。こまめに水分をとり、帽子と日焼け止めを使い、日陰を歩き、屋外の見学は朝か夕方に。"]
  },
  dress: {
    pt: ["Roupa e respeito", "Em mesquitas, souks e edifícios públicos cubra ombros e joelhos; nas mesquitas as mulheres cobrem o cabelo. Fora das praias, evite roupa muito curta ou transparente."],
    en: ["Dress and respect", "In mosques, souks and public buildings cover shoulders and knees; in mosques women cover their hair. Away from beaches, avoid very short or see-through clothes."],
    es: ["Ropa y respeto", "En mezquitas, zocos y edificios públicos cubre hombros y rodillas; en las mezquitas las mujeres se cubren el pelo. Fuera de la playa, evita ropa muy corta o transparente."],
    fr: ["Tenue et respect", "Dans les mosquées, souks et bâtiments publics, couvrez épaules et genoux ; dans les mosquées, les femmes couvrent leurs cheveux. Hors des plages, évitez les tenues très courtes ou transparentes."],
    de: ["Kleidung und Respekt", "In Moscheen, Souks und öffentlichen Gebäuden Schultern und Knie bedecken; in Moscheen bedecken Frauen das Haar. Abseits der Strände keine sehr kurze oder durchsichtige Kleidung."],
    it: ["Abbigliamento e rispetto", "In moschee, suq ed edifici pubblici copri spalle e ginocchia; nelle moschee le donne coprono i capelli. Lontano dalle spiagge evita abiti molto corti o trasparenti."],
    zh: ["着装与尊重", "在清真寺、集市和公共建筑内请遮住肩膀和膝盖；女性进入清真寺需遮盖头发。海滩以外避免过短或透明的衣服。"],
    ar: ["اللباس والاحترام", "في المساجد والأسواق والمباني العامة غطِّ الكتفين والركبتين، وتغطي النساء الشعر في المساجد. بعيداً عن الشواطئ تجنّب الملابس القصيرة جداً أو الشفافة."],
    ja: ["服装とマナー", "モスク、スーク、公共の建物では肩と膝を隠し、モスクでは女性は髪を覆います。ビーチ以外では短すぎる服や透ける服は避けて。"]
  },
  camel: {
    pt: ["Camelos e «guias» nas pirâmides", "Oferecem passeios de camelo ou cavalo «baratos» e depois exigem muito mais para o deixar descer. Combine o preço total por escrito, ou recuse com firmeza e use o autocarro do planalto."],
    en: ["Camels and «guides» at the pyramids", "They offer «cheap» camel or horse rides, then demand far more to let you off. Agree the full price in writing, or refuse firmly and use the plateau bus."],
    es: ["Camellos y «guías» en las pirámides", "Ofrecen paseos «baratos» en camello o caballo y luego exigen mucho más para dejarte bajar. Pacta el precio total por escrito, o rechaza con firmeza y usa el autobús del recinto."],
    fr: ["Chameaux et « guides » aux pyramides", "On vous propose une balade « pas chère » à dos de chameau ou de cheval, puis on exige bien plus pour vous laisser descendre. Fixez le prix total par écrit, ou refusez fermement et prenez le bus du site."],
    de: ["Kamele und „Führer“ an den Pyramiden", "Man bietet „billige“ Kamel- oder Pferderitte an und verlangt dann viel mehr fürs Absteigen. Gesamtpreis schriftlich vereinbaren oder bestimmt ablehnen und den Bus auf dem Plateau nehmen."],
    it: ["Cammelli e «guide» alle piramidi", "Offrono giri «economici» in cammello o cavallo e poi pretendono molto di più per farti scendere. Concorda il prezzo totale per iscritto, o rifiuta con decisione e usa il bus dell'area."],
    zh: ["金字塔的骆驼和“导游”", "有人提供“便宜”的骑骆驼或骑马，之后索要高价才让你下来。请书面确定总价，或坚决拒绝并乘坐景区巴士。"],
    ar: ["الجمال و«المرشدون» عند الأهرامات", "يعرضون جولة «رخيصة» على جمل أو حصان ثم يطلبون أكثر بكثير لإنزالك. اتفق على السعر الكامل كتابةً، أو ارفض بحزم واستخدم حافلة الهضبة."],
    ja: ["ピラミッドのラクダと「ガイド」", "「安い」ラクダや馬の乗り物を勧め、降ろす際に高額を要求します。総額を書面で決めるか、きっぱり断って敷地内バスを使って。"]
  },
  law: {
    pt: ["Leis rigorosas", "Sem demonstrações de afeto em público, sem álcool na rua e tolerância zero com drogas (alguns medicamentos com codeína precisam de autorização). Não fotografe pessoas sem pedir nem edifícios oficiais."],
    en: ["Strict laws", "No public displays of affection, no alcohol in the street and zero tolerance for drugs (some codeine medicines need a permit). Don't photograph people without asking, or government buildings."],
    es: ["Leyes estrictas", "Nada de muestras de afecto en público ni alcohol en la calle, y tolerancia cero con las drogas (algunos medicamentos con codeína requieren permiso). No fotografíes a personas sin pedirlo ni edificios oficiales."],
    fr: ["Lois strictes", "Pas de démonstrations d'affection en public, pas d'alcool dans la rue et tolérance zéro pour la drogue (certains médicaments à la codéine exigent une autorisation). Ne photographiez pas les gens sans demander, ni les bâtiments officiels."],
    de: ["Strenge Gesetze", "Keine Zärtlichkeiten in der Öffentlichkeit, kein Alkohol auf der Straße und null Toleranz bei Drogen (manche Medikamente mit Codein brauchen eine Genehmigung). Menschen nur mit Erlaubnis fotografieren, Regierungsgebäude gar nicht."],
    it: ["Leggi severe", "Niente effusioni in pubblico, niente alcol per strada e tolleranza zero sulle droghe (alcuni farmaci con codeina richiedono un permesso). Non fotografare persone senza chiedere né edifici governativi."],
    zh: ["法律严格", "禁止在公共场合亲密举动，禁止在街上饮酒，对毒品零容忍（部分含可待因的药物需许可）。未经允许不要拍人，也不要拍政府建筑。"],
    ar: ["قوانين صارمة", "لا مظاهر عاطفية في الأماكن العامة، ولا كحول في الشارع، وعدم تسامح مطلق مع المخدرات (بعض الأدوية التي تحتوي الكودايين تحتاج إذناً). لا تصوّر الناس دون استئذان ولا المباني الحكومية."],
    ja: ["厳しい法律", "人前での愛情表現や路上での飲酒は禁止、薬物は一切容認されません（コデイン入りの薬は許可が必要な場合あり）。人を無断で撮影したり、政府の建物を撮ったりしないで。"]
  },
  bikelane: {
    pt: ["Ciclovias", "As faixas vermelhas são das bicicletas e elas não abrandam. Olhe para os dois lados antes de sair do passeio."],
    en: ["Bike lanes", "Red-paved lanes belong to bikes, and they don't slow down. Look both ways before stepping off the pavement."],
    es: ["Carriles bici", "Los carriles rojos son para bicis y no frenan. Mira a ambos lados antes de bajar de la acera."],
    fr: ["Pistes cyclables", "Les voies rouges sont pour les vélos, qui ne ralentissent pas. Regardez des deux côtés avant de descendre du trottoir."],
    de: ["Radwege", "Rote Spuren gehören den Fahrrädern, und die bremsen nicht. Vor dem Betreten in beide Richtungen schauen."],
    it: ["Piste ciclabili", "Le corsie rosse sono per le bici, che non rallentano. Guarda da entrambi i lati prima di scendere dal marciapiede."],
    zh: ["自行车道", "红色车道属于自行车，他们不会减速。走下人行道前先看两边。"],
    ar: ["مسارات الدراجات", "المسارات الحمراء للدراجات ولا تبطئ. انظر في الاتجاهين قبل النزول عن الرصيف."],
    ja: ["自転車レーン", "赤いレーンは自転車用で、減速しません。歩道から出る前に左右を確認して。"]
  }
};

/** Segurança de uma cidade (ou null se ainda não houver dados). */
export function safetyFor(cityId: string, country: string | undefined) {
  const c = CITY_SAFETY[cityId];
  const k = country ? COUNTRY_SAFETY[country] : undefined;
  if (!c || !k) return null;
  return { ...c, ...k };
}
