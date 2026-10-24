/** Páginas informativas: Sobre nós, Apoio, Viajar com menos impacto e Contactos (pt e en; os outros idiomas mostram o inglês). */
export type InfoDoc = "about" | "support" | "eco" | "contact";
type Block = { h: string; p?: string[]; li?: string[]; qa?: [string, string][] };
export type Info = { title: string; lead: string; blocks: Block[] };

type Ctx = { company: string; support: string; hello: string; cities: number; langs: number; nipc: string };

export function infoPT(doc: InfoDoc, c: Ctx): Info {
  if (doc === "contact") return {
    title: "Contactos",
    lead: `Escreva-nos para ${c.hello}. Respondemos por email, normalmente no mesmo dia útil.`,
    blocks: [
      { h: "Viajantes", p: [`Dúvidas sobre um roteiro, um pagamento ou o acesso: ${c.support}. Veja primeiro a página Apoio, com as perguntas mais frequentes.`, "Respondemos em até 48 horas úteis (segunda a sexta-feira, exceto feriados em Portugal).",
        "Indique o email que usou na compra e a cidade. Nunca nos envie dados completos de cartão nem palavras-passe."] },
      { h: "Negócios e parceiros", p: [`Restaurantes, cafés, lojas, alojamentos, guias e parceiros comerciais: ${c.hello}. Para se registar diretamente, use as páginas Negócios, Guias ou Parceiros comerciais no fundo de cada página.`] },
      { h: "Imprensa e parcerias", p: [`Pedidos de imprensa, cidades e turismo, aeroportos e companhias aéreas: ${c.hello}.`] },
      { h: "Empresa", li: [c.company, `NIPC ${c.nipc}`, "Registada em Lisboa, Portugal"] }
    ]
  };
  if (doc === "about") return {
    title: "Sobre nós",
    lead: "A VOYBU é o seu self guided tour: o acompanhante de viagem que lhe diz o que fazer a seguir, como lá chegar e o que fazer se o plano mudar.",
    blocks: [
      { h: "Porque existimos", p: [
        "Numa escala, num fim de semana ou num dia livre numa cidade nova, o tempo é curto e a informação está espalhada. A VOYBU junta num só sítio o roteiro, os transportes mais baratos, a hora a que tem de voltar e o essencial da viagem.",
        "O nosso objetivo é simples: que saiba sempre qual é o seu próximo passo, perceba porquê e tenha uma alternativa se algo mudar."
      ] },
      { h: "O que fazemos", li: [
        `Roteiros a pé em ${c.cities} cidades, com áudio-guia em ${c.langs} idiomas.`,
        "Roteiros que se ajustam ao seu tempo: ao voo, ao comboio, ao navio ou à hora a que quer voltar ao hotel.",
        "Os transportes mais baratos em cada cidade, as regras para sair do aeroporto numa escala e os contactos de emergência.",
        "Funciona sem internet depois de descarregar a cidade."
      ] },
      { h: "Como trabalhamos", li: [
        "Dizemos de onde vem cada informação: indicada por si, da sua reserva, atualizada a uma hora concreta ou uma estimativa.",
        "Os viajantes podem reportar um problema em cada paragem, e a nossa equipa revê cada relato.",
        "Os negócios parceiros aparecem sempre marcados como publicidade.",
        "Paga uma vez por cidade, sem subscrição."
      ] },
      { h: "Quem somos", p: [
        `A VOYBU é uma marca da ${c.company}, empresa portuguesa constituída em outubro de 2026.`,
        `Para parcerias, imprensa ou outros assuntos: ${c.hello}.`
      ] }
    ]
  };
  if (doc === "support") return {
    title: "Apoio",
    lead: `Estamos aqui para ajudar. Veja as perguntas frequentes ou escreva-nos para ${c.support} — respondemos em até 48 horas úteis.`,
    blocks: [
      { h: "Perguntas frequentes", qa: [
        ["Paguei e não vejo o meu roteiro.", "Abra o link que recebeu no email de compra, ou entre na app com o mesmo email ou conta que usou ao pagar. Os roteiros comprados ficam em Minha viagem."],
        ["Comprei noutro telemóvel. Como abro aqui?", "Entre com a mesma conta ou com o mesmo email da compra. Recebe um link de acesso, sem palavra-passe."],
        ["O roteiro funciona sem internet?", "Sim. Antes de sair, toque em \"Descarregar para offline\" na cidade e use \"Pronto para sair?\" para confirmar que fotos, áudio e mapa ficaram guardados."],
        ["O áudio-guia não fala ou fala noutra língua.", "O áudio usa a voz do seu telemóvel. Sem internet, adicione a voz do seu idioma nas definições de texto para voz do telemóvel."],
        ["Uma paragem está fechada ou a informação está errada.", "Use \"Reportar um problema\" nessa paragem. A nossa equipa revê cada relato e, quando várias pessoas reportam o mesmo, avisamos os outros viajantes."],
        ["Posso pedir reembolso?", "Ao comprar, pede acesso imediato ao roteiro e, por isso, perde o direito de livre resolução de 14 dias (veja os Termos). Se um problema técnico do nosso lado o impediu de usar o roteiro, escreva-nos com o email da compra, a cidade e o que aconteceu (uma captura de ecrã ajuda). Respondemos em até 48 horas úteis e, se o problema for nosso, devolvemos o valor no mesmo meio de pagamento — o banco pode demorar 5 a 10 dias a mostrá-lo."],
        ["Fiz um pedido de reserva a um negócio. Está confirmado?", "Ainda não. O pedido vai por email para o negócio, que confirma diretamente consigo. A VOYBU não cobra nada por estes pedidos."]
      ] },
      { h: "Contacto", p: [
        `Email: ${c.support}.`,
        "Indique o email que usou na compra e a cidade. Nunca nos envie dados completos de cartão nem palavras-passe."
      ] },
      { h: "Negócios, guias e parceiros comerciais", p: [
        "Se tem um negócio, veja a página Negócios. Se é guia, veja Guias. Se quer angariar negócios e ganhar comissão, veja Parceiros comerciais. Encontra as três no fundo de cada página."
      ] }
    ]
  };
  return {
    title: "Viajar com menos impacto",
    lead: "Conhecer uma cidade a pé é a forma mais leve de a visitar. A VOYBU foi pensada para isso.",
    blocks: [
      { h: "O que a VOYBU já faz", li: [
        "Os roteiros são feitos para andar a pé, com transportes públicos só onde fazem falta.",
        "Mostramos o passe ou bilhete de transporte público mais barato em cada cidade, para não precisar de táxi.",
        "Bilhetes, reservas e roteiros ficam no telemóvel: não precisa de imprimir nada.",
        "Os negócios em destaque nas paragens são locais, perto do seu caminho."
      ] },
      { h: "Dicas para a sua visita", li: [
        "Leve uma garrafa reutilizável. Em muitas cidades a água da torneira é potável (veja \"Bom saber\" de cada cidade).",
        "Prefira metro, elétrico, autocarro ou comboio para o aeroporto quando o tempo o permitir.",
        "Coma e compre em negócios locais: o dinheiro fica na cidade que está a visitar.",
        "Respeite os moradores: fale baixo em zonas residenciais e siga as regras de fotografia em locais religiosos.",
        "Fique nos caminhos marcados em parques e zonas naturais."
      ] },
      { h: "O que queremos melhorar", p: [
        "Queremos mostrar, em cada roteiro, quanto do percurso é feito a pé e em transporte público, e destacar parceiros com práticas sustentáveis. Se tem sugestões, escreva-nos para " + c.hello + "."
      ] }
    ]
  };
}

export function infoEN(doc: InfoDoc, c: Ctx): Info {
  if (doc === "contact") return {
    title: "Contact",
    lead: `Email us at ${c.hello}. We reply by email, usually within one working day.`,
    blocks: [
      { h: "Travellers", p: [`Questions about a route, a payment or access: ${c.support}. Check the Support page first for the most common questions.`, "We reply within 48 business hours (Monday to Friday, excluding public holidays in Portugal).",
        "Include the email you used to buy and the city. Never send us full card details or passwords."] },
      { h: "Businesses and partners", p: [`Restaurants, cafés, shops, accommodation, guides and sales partners: ${c.hello}. To sign up directly, use the Businesses, Guides or Sales partners pages at the bottom of every page.`] },
      { h: "Press and partnerships", p: [`Press, cities and tourism boards, airports and airlines: ${c.hello}.`] },
      { h: "Company", li: [c.company, `NIPC ${c.nipc}`, "Registered in Lisbon, Portugal"] }
    ]
  };
  if (doc === "about") return {
    title: "About us",
    lead: "VOYBU is your self-guided tour: the travel companion that tells you what to do next, how to get there and what to do if your plans change.",
    blocks: [
      { h: "Why we exist", p: [
        "On a layover, a weekend or a free day in a new city, time is short and information is scattered. VOYBU brings together your route, the cheapest transport, the time you need to head back and your trip essentials.",
        "Our aim is simple: that you always know your next step, understand why, and have an alternative if something changes."
      ] },
      { h: "What we do", li: [
        `Walking routes in ${c.cities} cities, with an audio guide in ${c.langs} languages.`,
        "Routes that fit your time: your flight, train, ship or the time you want to be back at the hotel.",
        "The cheapest transport in each city, the rules for leaving the airport on a layover, and emergency contacts.",
        "Works offline once you've downloaded the city."
      ] },
      { h: "How we work", li: [
        "We tell you where each piece of information comes from: entered by you, from your booking, updated at a given time, or an estimate.",
        "Travellers can report a problem at every stop, and our team reviews every report.",
        "Partner businesses are always marked as advertising.",
        "You pay once per city, with no subscription."
      ] },
      { h: "Who we are", p: [
        `VOYBU is a brand of ${c.company}, a Portuguese company founded in October 2026.`,
        `For partnerships, press or anything else: ${c.hello}.`
      ] }
    ]
  };
  if (doc === "support") return {
    title: "Support",
    lead: `We're here to help. Check the common questions below or email us at ${c.support} — we reply within 48 business hours.`,
    blocks: [
      { h: "Common questions", qa: [
        ["I paid but can't see my route.", "Open the link in your purchase email, or sign in with the same email or account you used to pay. Purchased routes are in My Trip."],
        ["I bought on another phone. How do I open it here?", "Sign in with the same account or the same email used at purchase. You'll get a sign-in link, no password needed."],
        ["Does the route work offline?", "Yes. Before you go out, tap \"Download for offline\" in the city and use \"Ready to go out?\" to check that photos, audio and the map are saved."],
        ["The audio guide is silent or speaks another language.", "The audio uses your phone's voice. To use it offline, add your language's voice in your phone's text-to-speech settings."],
        ["A stop is closed or the information is wrong.", "Use \"Report a problem\" at that stop. Our team reviews every report, and when several people report the same thing we warn other travellers."],
        ["Can I get a refund?", "When you buy, you ask for immediate access to the route and therefore lose the 14-day right of withdrawal (see the Terms). If a technical problem on our side stopped you from using the route, email us with your purchase email, the city and what happened (a screenshot helps). We reply within 48 business hours and, if the problem was ours, refund you to the same payment method — your bank may take 5 to 10 days to show it."],
        ["I sent a booking request to a business. Is it confirmed?", "Not yet. The request goes by email to the business, which confirms directly with you. VOYBU charges nothing for these requests."]
      ] },
      { h: "Contact", p: [
        `Email: ${c.support}.`,
        "Include the email you used to buy and the city. Never send us full card details or passwords."
      ] },
      { h: "Businesses, guides and sales partners", p: [
        "If you run a business, see Businesses. If you're a guide, see Guides. If you want to sign up businesses and earn commission, see Sales partners. All three are linked at the bottom of every page."
      ] }
    ]
  };
  return {
    title: "Travel lighter",
    lead: "Exploring a city on foot is the lightest way to see it. VOYBU is built around that.",
    blocks: [
      { h: "What VOYBU already does", li: [
        "Routes are designed for walking, with public transport only where you need it.",
        "We show the cheapest public transport pass or ticket in each city, so you don't need a taxi.",
        "Tickets, bookings and routes stay on your phone: no need to print anything.",
        "The businesses featured at stops are local, close to your way."
      ] },
      { h: "Tips for your visit", li: [
        "Carry a refillable bottle. In many cities tap water is safe to drink (see each city's \"Good to know\").",
        "Take the metro, tram, bus or train to the airport when you have time.",
        "Eat and shop at local businesses: your money stays in the city you're visiting.",
        "Respect residents: keep noise down in residential areas and follow photography rules at religious sites.",
        "Stay on marked paths in parks and natural areas."
      ] },
      { h: "What we want to improve", p: [
        "We want to show, on each route, how much of it is on foot and by public transport, and to highlight partners with sustainable practices. If you have ideas, email us at " + c.hello + "."
      ] }
    ]
  };
}
