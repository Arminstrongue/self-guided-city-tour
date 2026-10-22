/**
 * Textos legais (modelo). Os dados da empresa vêm das variáveis COMPANY_*.
 * IMPORTANTE: rever com um advogado antes do lançamento.
 */
import { env } from "@/lib/env";
export type LegalDoc = "terms" | "privacy" | "cookies" | "guides";
export type Section = { h: string; p: string[] };

export function company() {
  const v = (k: string, fallback: string) => process.env[k]?.trim() || fallback;
  return {
    name: v("COMPANY_NAME", "[nome da empresa — a preencher]"),
    nipc: v("COMPANY_NIPC", "[NIPC — a preencher]"),
    address: v("COMPANY_ADDRESS", "[sede — a preencher]"),
    email: v("COMPANY_EMAIL", env.contact),
    updated: "19 de outubro de 2026"
  };
}

export function legalPT(doc: LegalDoc): { title: string; sections: Section[] } {
  const c = company();
  const who = `${c.name}, NIPC ${c.nipc}, com sede em ${c.address} (contacto: ${c.email})`;
  if (doc === "terms") return {
    title: "Termos e condições",
    sections: [
      { h: "Quem somos", p: [`A VOYBU é explorada por ${who}.`] },
      { h: "O serviço", p: [
        "Vendemos acesso digital a roteiros autoguiados por cidade, com indicações de transporte, custos estimados e uma contagem até à hora recomendada de regresso ao aeroporto.",
        "O acesso a uma cidade é válido durante 48 horas; o passe de férias curtas (3 dias) é válido durante 72 horas nessa cidade; o Passe Todas as Cidades é válido durante 30 dias em todas as cidades disponíveis. A contagem começa no momento do pagamento. Os passes incluem o roteiro, o áudio-guia e as ferramentas da app; as entradas em museus e monumentos e os bilhetes de transporte não estão incluídos, salvo indicação expressa."
      ] },
      { h: "Preços e pagamento", p: ["Os preços incluem IVA à taxa aplicável. O pagamento é processado pela Stripe; não guardamos dados de cartões."] },
      { h: "Direito de livre resolução", p: [
        "O roteiro é conteúdo digital fornecido de imediato. Ao pagar, pede expressamente o acesso imediato e reconhece que perde o direito de livre resolução de 14 dias (Decreto-Lei n.º 24/2014, art.º 17.º).",
        `Se o acesso não funcionar por razões técnicas da nossa parte, contacte ${c.email} e devolvemos o valor pago.`
      ] },
      { h: "Responsabilidade do viajante", p: [
        "As horas, tarifas e tempos de percurso são indicativos e podem mudar sem aviso dos operadores. Confirme no local antes de comprar bilhetes.",
        "A decisão de sair do aeroporto e a hora de regresso são do viajante. Verifique antes que o seu passaporte e visto lhe permitem sair e voltar a entrar.",
        "Não somos responsáveis por voos perdidos, atrasos de transportes, encerramentos de monumentos ou alterações de horários de voo."
      ] },
      { h: "Ofertas de comerciantes", p: ["As ofertas apresentadas no roteiro são da responsabilidade de cada comerciante. Não somos parte na compra que fizer junto deles."] },
      { h: "Comerciantes", p: [
        "Os planos Destaque e Parceiro QR são assinaturas mensais, renováveis automaticamente e canceláveis a qualquer momento, com efeito no fim do período pago.",
        "No plano Parceiro QR, pagamos 20% do valor de cada acesso comprado através do código QR do comerciante. As comissões são pagas mensalmente.",
        "Reservamo-nos o direito de recusar ou retirar anúncios enganosos, ilegais ou contrários a estes termos."
      ] },
      { h: "Reservas com guias locais", p: [
        "Os guias apresentados na app são profissionais independentes. O contrato do passeio é celebrado diretamente entre si e o guia. A VOYBU atua apenas como intermediária: mostra os perfis, gere a reserva e recolhe o pagamento por conta do guia, através da Stripe.",
        "Ao reservar, o valor fica pré-autorizado no cartão. Só é cobrado se o guia aceitar no prazo indicado (até 48 horas); caso contrário, a pré-autorização é libertada e nada é cobrado.",
        "Se o guia cancelar ou não comparecer, devolvemos a totalidade do valor. Se for o viajante a cancelar, contacte-nos: até 24 horas antes do início devolvemos a totalidade; depois disso, o valor é devido ao guia, salvo acordo com ele.",
        "O passeio, a segurança dos participantes e o cumprimento das regras locais são da responsabilidade do guia, que deve ter a atividade registada e seguro em vigor. A fatura do passeio é emitida pelo guia. A VOYBU não é organizadora nem agência de viagens deste serviço.",
        "Por se tratar de uma atividade de lazer com data marcada, não se aplica o direito de livre resolução de 14 dias (Decreto-Lei n.º 24/2014, art.º 17.º)."
      ] },
      { h: "Reclamações e litígios", p: [
        "Pode apresentar reclamação no Livro de Reclamações Eletrónico (livroreclamacoes.pt).",
        "Em caso de litígio, pode recorrer a uma entidade de resolução alternativa de litígios de consumo (lista em consumidor.gov.pt). Aplica-se a lei portuguesa."
      ] }
    ]
  };
  if (doc === "guides") return {
    title: "Termos para guias",
    sections: [
      { h: "Quem somos e o nosso papel", p: [
        `A VOYBU é explorada por ${who}.`,
        "A plataforma é um serviço de intermediação: mostra o seu perfil a viajantes, gere pedidos de reserva e recolhe pagamentos por sua conta. O contrato de cada passeio é celebrado diretamente entre si e o viajante.",
        "Presta os passeios como profissional independente, por sua conta e risco. Não existe relação de trabalho, subordinação nem exclusividade: define o seu preço, a sua disponibilidade e aceita ou recusa cada pedido."
      ] },
      { h: "Requisitos", p: [
        "Ter 18 anos ou mais e dados de registo verdadeiros e atualizados.",
        "Ter a atividade registada nos termos da lei do país onde presta os passeios. Em Portugal, o registo no RNAAT (Decreto-Lei n.º 108/2009) e as licenças que se apliquem.",
        "Ter em vigor seguro de responsabilidade civil e de acidentes pessoais adequado à atividade, e apresentar a apólice quando pedirmos.",
        "Cumprir as suas obrigações fiscais e de segurança social e emitir ao viajante a fatura ou fatura-recibo do passeio."
      ] },
      { h: "Aprovação e perfil", p: [
        "Cada candidatura é analisada antes de o perfil ficar visível. Podemos recusar, suspender ou retirar perfis com dados falsos, avaliações consistentemente negativas, queixas fundamentadas ou violação destes termos.",
        "O conteúdo do perfil (texto, fotografia, línguas, preço e ponto de encontro) é da sua responsabilidade e tem de ser verdadeiro."
      ] },
      { h: "Reservas", p: [
        "Tem até 48 horas (ou até 1 hora antes do início, se for antes) para aceitar ou recusar cada pedido. Sem resposta, o pedido expira e o viajante não é cobrado.",
        "Ao aceitar, compromete-se a prestar o passeio na data, hora e duração reservadas. Cancelamentos repetidos ou faltas podem levar à suspensão do perfil."
      ] },
      { h: "Preços, comissão e pagamentos", p: [
        "Define o preço por hora, por grupo. O viajante paga através da Stripe e o cartão só é cobrado quando aceita o pedido.",
        "A plataforma cobra uma comissão de 20 % sobre o valor de cada reserva paga. O restante (80 %) é transferido para a sua conta Stripe Express, nos prazos da Stripe. Emitimos-lhe fatura pela comissão.",
        "Para receber, tem de concluir o registo na Stripe (identidade e conta bancária)."
      ] },
      { h: "Reembolsos e disputas", p: [
        "Se cancelar, não comparecer ou o passeio não for prestado como descrito, o viajante é reembolsado.",
        "Nesses casos, autoriza-nos a recuperar o valor transferido para a sua conta Stripe, bem como os custos de disputas de cartão que lhe sejam imputáveis."
      ] },
      { h: "Responsabilidade", p: [
        "É o único responsável pela prestação do passeio, pela segurança dos participantes durante o passeio, pelo cumprimento das regras locais e pelos danos que cause.",
        "Compromete-se a indemnizar a plataforma por reclamações de terceiros resultantes dos seus passeios.",
        "A plataforma responde apenas pelo funcionamento da app, nos limites da lei."
      ] },
      { h: "Comunicação à Autoridade Tributária (DAC7)", p: [
        "Enquanto operador de plataforma, temos de recolher e verificar os seus dados de identificação e fiscais e comunicar anualmente à Autoridade Tributária os montantes que recebeu através da plataforma (Diretiva (UE) 2021/514). Enviamos-lhe uma cópia da informação comunicada.",
        "Se não fornecer os dados pedidos depois de dois lembretes, a lei obriga-nos a suspender os pagamentos e o perfil até os receber."
      ] },
      { h: "Avaliações", p: ["Os viajantes podem avaliar o passeio depois de ele acontecer. Não é permitido pedir, oferecer ou manipular avaliações."] },
      { h: "Duração e fim", p: ["Pode deixar a plataforma a qualquer momento; as reservas já aceites devem ser cumpridas. Podemos terminar o acordo nos casos previstos acima."] },
      { h: "Lei aplicável", p: ["Aplica-se a lei portuguesa. Os litígios são resolvidos pelos tribunais portugueses competentes."] }
    ]
  };
  if (doc === "privacy") return {
    title: "Política de privacidade",
    sections: [
      { h: "Responsável pelo tratamento", p: [`${who}.`] },
      { h: "Que dados tratamos", p: [
        "Email e nome; hora e número (opcional) do próximo voo; cidade e plano comprados; dados de pagamento tratados pela Stripe (não guardamos o cartão).",
        "Se entrar com Google, Apple ou Facebook: nome e email da conta.",
        "A localização (se a ativar) e a nacionalidade indicada em \"Posso sair?\" ficam só no seu dispositivo; não as guardamos.",
        "Comerciantes: nome do negócio, contacto, redes sociais e dados de faturação.",
        "Comerciais independentes: nome, email, telefone, país, carteira de negócios e comissões.",
        "Reservas de guias: nome, email, telefone e nota do viajante, partilhados com o guia depois de ele aceitar.",
        "Guias: dados do perfil público; dados profissionais e fiscais (registo da atividade, seguro, NIF, país fiscal, morada e data de nascimento); a conta bancária é tratada pela Stripe.",
        "Avaliações: estrelas, NPS e comentários, sem o seu nome; os comentários sobre guias podem aparecer no perfil do guia.",
        "Carteira: se entrar com o seu email, guardamos as memórias (fotos e notas), os lugares guardados e os interesses que escolher, para os ter em qualquer dispositivo. Pode apagá-los na própria carteira.",
        "Perfil de viajante (opcional, só para maiores de 16 anos): nome, @nome de utilizador, foto, bio, cidades que segue, quem segue e quem o segue. A conta é privada por defeito; o seu email nunca é mostrado a outros viajantes. Pode bloquear e denunciar perfis, e apagar o seu perfil na carteira a qualquer momento. Analisamos as denúncias e podemos remover perfis que violem as regras da comunidade.",
        "Publicações, vídeos e histórias (opcional): as fotos, os vídeos (convertidos e guardados nos nossos servidores na UE), legendas, cidade e tema que publica, os gostos e os comentários. Num perfil privado só os seguidores aceites as veem; num perfil público, qualquer viajante com sessão iniciada. As histórias são apagadas automaticamente 24 horas depois. Só comentam os seus seguidores e as pessoas que segue. Pode apagar publicações e comentários a qualquer momento; ao apagar o perfil, apagamos tudo isto.",
        "Mensagens privadas (opcional): só entre viajantes que se seguem num dos sentidos. Guardamos o texto, a data e se foi lida, para entregar a conversa nos seus dispositivos. A equipa não lê as conversas, exceto quando um dos participantes as denuncia por abuso ou segurança. Pode anular o envio das suas mensagens, apagar uma conversa do seu lado, bloquear e denunciar; ao apagar o perfil, as suas conversas são apagadas.",
        "Convites (opcional): quando convida um amigo por email, enviamos-lhe um único email em seu nome; por SMS ou WhatsApp, a mensagem sai do seu telemóvel. Não guardamos o email nem o telefone de quem convida — só um código irreversível, para não enviar convites repetidos. Quem entra com um convite passa a seguir quem o convidou."
      ] },
      { h: "Para quê e com que fundamento", p: [
        "Prestar o serviço comprado e calcular a hora de regresso (execução do contrato).",
        "Faturação e obrigações fiscais (obrigação legal).",
        "Guias: comunicação anual dos rendimentos à Autoridade Tributária ao abrigo da Diretiva (UE) 2021/514 (DAC7) (obrigação legal).",
        "Segurança e prevenção de fraude (interesse legítimo).",
        "Não enviamos marketing sem o seu consentimento."
      ] },
      { h: "Durante quanto tempo", p: ["Dados de acesso: até 24 meses após o último acesso. Documentos de faturação e registos DAC7 dos guias: 10 anos, por obrigação legal."] },
      { h: "Com quem partilhamos", p: [
        "Prestadores que tratam dados por nossa conta: Stripe (pagamentos), Hetzner (servidores na UE), Cloudflare (rede e segurança), fornecedor de email transacional, AeroDataBox (estado do voo, só o número do voo) e, se o usar, o fornecedor de login (Google, Apple, Facebook).",
        "Algumas destas entidades podem transferir dados para fora do EEE ao abrigo de cláusulas contratuais-tipo ou decisões de adequação."
      ] },
      { h: "Os seus direitos", p: [
        `Pode pedir acesso, retificação, apagamento, limitação, portabilidade ou opor-se ao tratamento através de ${c.email}.`,
        "Pode também apresentar queixa à Comissão Nacional de Proteção de Dados (cnpd.pt)."
      ] }
    ]
  };
  return {
    title: "Política de cookies",
    sections: [
      { h: "Só cookies essenciais", p: [
        "Usamos apenas cookies necessárias para o serviço funcionar, por isso não pedimos consentimento:",
        "sgct_access — guarda o seu acesso pago neste dispositivo (até 31 dias).",
        "next-auth.* — mantém a sessão quando entra com Google, Apple ou Facebook.",
        "sgct_locale — lembra o idioma escolhido (12 meses)."
      ] },
      { h: "Armazenamento no dispositivo", p: ["O progresso do roteiro (paragens visitadas, extensão ligada) fica guardado só no seu navegador."] },
      { h: "Sem publicidade nem análise de terceiros", p: ["Não usamos cookies de publicidade nem de análise de terceiros. As fontes de letra são servidas pelos nossos próprios servidores."] }
    ]
  };
}

export function legalEN(doc: LegalDoc): { title: string; sections: Section[] } {
  const c = company();
  const who = `${c.name}, company no. ${c.nipc}, registered at ${c.address} (contact: ${c.email})`;
  if (doc === "terms") return {
    title: "Terms and conditions",
    sections: [
      { h: "Who we are", p: [`VOYBU is operated by ${who}.`] },
      { h: "The service", p: [
        "We sell digital access to self-guided city routes with transport directions, estimated costs and a countdown to the recommended time to head back to the airport.",
        "City access lasts 48 hours; the short-break pass (3 days) lasts 72 hours in that city; the All-Cities Pass lasts 30 days in all available cities. Validity starts at payment. Passes include the route, the audio guide and the app tools; museum and monument entry and transport tickets are not included unless expressly stated."
      ] },
      { h: "Prices and payment", p: ["Prices include VAT at the applicable rate. Payments are processed by Stripe; we do not store card details."] },
      { h: "Right of withdrawal", p: [
        "The route is digital content supplied immediately. By paying you expressly request immediate access and acknowledge that you lose the 14-day right of withdrawal.",
        `If access fails for technical reasons on our side, contact ${c.email} and we will refund you.`
      ] },
      { h: "Traveller responsibility", p: [
        "Times, fares and journey durations are indicative and operators may change them without notice. Check locally before buying tickets.",
        "The decision to leave the airport and when to return is yours. Check that your passport and visa allow you to leave and re-enter.",
        "We are not liable for missed flights, transport delays, closed sights or flight schedule changes."
      ] },
      { h: "Merchant offers", p: ["Offers shown on the route are the responsibility of each merchant. We are not party to purchases you make from them."] },
      { h: "Merchants", p: [
        "Featured and QR Partner plans are monthly subscriptions that renew automatically and can be cancelled at any time, effective at the end of the paid period.",
        "On the QR Partner plan we pay 20% of each pass bought through the merchant's QR code, monthly.",
        "We may refuse or remove misleading, unlawful or non-compliant listings."
      ] },
      { h: "Bookings with local guides", p: [
        "Guides listed in the app are independent professionals. The tour contract is made directly between you and the guide. VOYBU only acts as an intermediary: it shows profiles, handles the booking and collects payment on the guide's behalf via Stripe.",
        "When you book, the amount is pre-authorised on your card. It is only charged if the guide accepts within the stated time (up to 48 hours); otherwise the hold is released and nothing is charged.",
        "If the guide cancels or does not show up, you get a full refund. If you cancel, contact us: up to 24 hours before the start we refund in full; after that the amount is due to the guide unless agreed otherwise with them.",
        "The tour, participants' safety and compliance with local rules are the guide's responsibility; guides must have their activity registered and insurance in force. The guide issues the invoice for the tour. VOYBU is not the organiser or travel agent for this service.",
        "As a leisure activity on a specific date, the 14-day right of withdrawal does not apply."
      ] },
      { h: "Complaints and disputes", p: ["You may file a complaint via the Portuguese Electronic Complaints Book (livroreclamacoes.pt) or use an alternative consumer dispute resolution body. Portuguese law applies."] }
    ]
  };
  if (doc === "guides") return {
    title: "Guide terms",
    sections: [
      { h: "Who we are and our role", p: [
        `VOYBU is operated by ${who}.`,
        "The platform is an intermediation service: it shows your profile to travellers, handles booking requests and collects payments on your behalf. Each tour contract is made directly between you and the traveller.",
        "You provide tours as an independent professional, on your own account and at your own risk. There is no employment relationship, subordination or exclusivity: you set your price and availability and accept or decline each request."
      ] },
      { h: "Requirements", p: [
        "Be 18 or older and keep your registration details true and up to date.",
        "Have your activity registered under the law of the country where you guide (in Portugal, registration in the RNAAT under Decree-Law 108/2009) and any applicable licences.",
        "Hold public liability and personal accident insurance suited to the activity, and show the policy when asked.",
        "Meet your own tax and social security obligations and issue the traveller an invoice for the tour."
      ] },
      { h: "Approval and profile", p: [
        "Each application is reviewed before your profile goes live. We may refuse, suspend or remove profiles with false details, consistently poor ratings, substantiated complaints or breaches of these terms.",
        "Your profile content (text, photo, languages, price and meeting point) is your responsibility and must be accurate."
      ] },
      { h: "Bookings", p: [
        "You have up to 48 hours (or until 1 hour before the start, if sooner) to accept or decline each request. Without a reply the request expires and the traveller is not charged.",
        "By accepting, you commit to provide the tour at the booked date, time and length. Repeated cancellations or no-shows may lead to suspension."
      ] },
      { h: "Prices, commission and payouts", p: [
        "You set an hourly price per group. The traveller pays via Stripe and the card is only charged when you accept.",
        "The platform charges a 20% commission on each paid booking. The remaining 80% is transferred to your Stripe Express account on Stripe's schedule. We invoice you for the commission.",
        "To get paid you must complete Stripe onboarding (identity and bank account)."
      ] },
      { h: "Refunds and disputes", p: [
        "If you cancel, do not show up or the tour is not provided as described, the traveller is refunded.",
        "In those cases you authorise us to recover the amount transferred to your Stripe account, and card dispute costs attributable to you."
      ] },
      { h: "Liability", p: [
        "You are solely responsible for providing the tour, for participants' safety during it, for complying with local rules and for any damage you cause.",
        "You agree to indemnify the platform against third-party claims arising from your tours.",
        "The platform is only responsible for the app working, within the limits of the law."
      ] },
      { h: "Reporting to the tax authority (DAC7)", p: [
        "As a platform operator we must collect and verify your identification and tax details and report yearly to the Portuguese tax authority the amounts you received through the platform (Directive (EU) 2021/514). We send you a copy of what we report.",
        "If you do not provide the requested details after two reminders, the law requires us to withhold payouts and suspend your profile until we receive them."
      ] },
      { h: "Ratings", p: ["Travellers may rate the tour after it takes place. Asking for, offering incentives for or manipulating ratings is not allowed."] },
      { h: "Term and termination", p: ["You may leave the platform at any time; bookings already accepted must be honoured. We may end the agreement in the cases above."] },
      { h: "Governing law", p: ["Portuguese law applies. Disputes are settled by the competent Portuguese courts."] }
    ]
  };
  if (doc === "privacy") return {
    title: "Privacy policy",
    sections: [
      { h: "Controller", p: [`${who}.`] },
      { h: "Data we process", p: [
        "Email and name; next flight time and (optional) number; city and plan purchased; payment data handled by Stripe (we never store your card).",
        "If you sign in with Google, Apple or Facebook: your account name and email.",
        "Your location (if you turn it on) and the nationality entered in \"Can I leave?\" stay on your device; we don't store them.",
        "Merchants: business name, contact details, social links and billing data.",
        "Independent sales partners: name, email, phone, country, deal pipeline and commissions.",
        "Guide bookings: traveller name, email, phone and note, shared with the guide once they accept.",
        "Guides: public profile; professional and tax details (activity registration, insurance, tax ID, tax country, address and date of birth); bank details are handled by Stripe.",
        "Ratings: stars, NPS and comments, without your name; comments about guides may appear on the guide's profile.",
        "Wallet: if you sign in with your email, we store your memories (photos and notes), saved places and chosen interests so you have them on any device. You can delete them in the wallet.",
        "Traveller profile (optional, 16+ only): name, @username, photo, bio, cities you follow, who you follow and who follows you. Accounts are private by default; your email is never shown to other travellers. You can block and report profiles, and delete your profile in the wallet at any time. We review reports and may remove profiles that break the community rules.",
        "Posts, videos and stories (optional): the photos, videos (converted and stored on our servers in the EU), captions, city and topic you share, plus likes and comments. On a private profile only approved followers see them; on a public profile, any signed-in traveller can. Stories are deleted automatically after 24 hours. Only your followers and people you follow can comment. You can delete posts and comments at any time; deleting your profile deletes all of this.",
        "Private messages (optional): only between travellers where at least one follows the other. We store the text, the time and whether it was read, so the conversation reaches your devices. Our team does not read chats, except when a participant reports one for abuse or safety. You can unsend your messages, delete a chat on your side, block and report; deleting your profile deletes your chats.",
        "Invites (optional): when you invite a friend by email, we send them a single email on your behalf; by SMS or WhatsApp, the message goes from your own phone. We don't store your friends' email or phone number — only an irreversible code, so we don't send repeated invites. Friends who join with an invite follow the person who invited them."
      ] },
      { h: "Purposes and legal bases", p: [
        "Providing the service and computing your return time (contract).",
        "Invoicing and tax obligations (legal obligation).",
        "Guides: yearly income reporting to the Portuguese tax authority under Directive (EU) 2021/514 (DAC7) (legal obligation).",
        "Security and fraud prevention (legitimate interest).",
        "We do not send marketing without your consent."
      ] },
      { h: "Retention", p: ["Access data: up to 24 months after your last access. Invoicing records and guides' DAC7 records: 10 years, as required by law."] },
      { h: "Processors", p: [
        "Stripe (payments), Hetzner (EU servers), Cloudflare (network and security), our transactional email provider, AeroDataBox (flight status, flight number only) and, if used, your sign-in provider (Google, Apple, Facebook).",
        "Some may transfer data outside the EEA under standard contractual clauses or adequacy decisions."
      ] },
      { h: "Your rights", p: [
        `You may request access, rectification, erasure, restriction, portability or object to processing at ${c.email}.`,
        "You may also complain to the Portuguese data protection authority (cnpd.pt)."
      ] }
    ]
  };
  return {
    title: "Cookie policy",
    sections: [
      { h: "Essential cookies only", p: [
        "We only use cookies needed for the service to work, so we do not ask for consent:",
        "sgct_access — keeps your paid access on this device (up to 31 days).",
        "next-auth.* — keeps you signed in with Google, Apple or Facebook.",
        "sgct_locale — remembers your language (12 months)."
      ] },
      { h: "On-device storage", p: ["Your route progress (visited stops, extension on/off) is stored only in your browser."] },
      { h: "No third-party advertising or analytics", p: ["We use no advertising or third-party analytics cookies. Fonts are served from our own servers."] }
    ]
  };
}
