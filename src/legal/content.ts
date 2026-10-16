/**
 * Textos legais (modelo). Os dados da empresa vêm das variáveis COMPANY_*.
 * IMPORTANTE: rever com um advogado antes do lançamento.
 */
export type LegalDoc = "terms" | "privacy" | "cookies";
export type Section = { h: string; p: string[] };

export function company() {
  const v = (k: string, fallback: string) => process.env[k]?.trim() || fallback;
  return {
    name: v("COMPANY_NAME", "[nome da empresa — a preencher]"),
    nipc: v("COMPANY_NIPC", "[NIPC — a preencher]"),
    address: v("COMPANY_ADDRESS", "[sede — a preencher]"),
    email: v("COMPANY_EMAIL", "hello@selfguidedcitytour.com"),
    updated: "16 de outubro de 2026"
  };
}

export function legalPT(doc: LegalDoc): { title: string; sections: Section[] } {
  const c = company();
  const who = `${c.name}, NIPC ${c.nipc}, com sede em ${c.address} (contacto: ${c.email})`;
  if (doc === "terms") return {
    title: "Termos e condições",
    sections: [
      { h: "Quem somos", p: [`A Self Guided City Tour é explorada por ${who}.`] },
      { h: "O serviço", p: [
        "Vendemos acesso digital a roteiros autoguiados por cidade, com indicações de transporte, custos estimados e uma contagem até à hora recomendada de regresso ao aeroporto.",
        "O acesso a uma cidade é válido durante 48 horas; o Passe Europa é válido durante 30 dias em todas as cidades disponíveis. A contagem começa no momento do pagamento."
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
      { h: "Reclamações e litígios", p: [
        "Pode apresentar reclamação no Livro de Reclamações Eletrónico (livroreclamacoes.pt).",
        "Em caso de litígio, pode recorrer a uma entidade de resolução alternativa de litígios de consumo (lista em consumidor.gov.pt). Aplica-se a lei portuguesa."
      ] }
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
        "Comerciantes: nome do negócio, contacto, redes sociais e dados de faturação."
      ] },
      { h: "Para quê e com que fundamento", p: [
        "Prestar o serviço comprado e calcular a hora de regresso (execução do contrato).",
        "Faturação e obrigações fiscais (obrigação legal).",
        "Segurança e prevenção de fraude (interesse legítimo).",
        "Não enviamos marketing sem o seu consentimento."
      ] },
      { h: "Durante quanto tempo", p: ["Dados de acesso: até 24 meses após o último acesso. Documentos de faturação: 10 anos, por obrigação legal."] },
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
      { h: "Who we are", p: [`Self Guided City Tour is operated by ${who}.`] },
      { h: "The service", p: [
        "We sell digital access to self-guided city routes with transport directions, estimated costs and a countdown to the recommended time to head back to the airport.",
        "City access lasts 48 hours; the Europe Pass lasts 30 days in all available cities, starting at payment."
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
      { h: "Complaints and disputes", p: ["You may file a complaint via the Portuguese Electronic Complaints Book (livroreclamacoes.pt) or use an alternative consumer dispute resolution body. Portuguese law applies."] }
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
        "Merchants: business name, contact details, social links and billing data."
      ] },
      { h: "Purposes and legal bases", p: [
        "Providing the service and computing your return time (contract).",
        "Invoicing and tax obligations (legal obligation).",
        "Security and fraud prevention (legitimate interest).",
        "We do not send marketing without your consent."
      ] },
      { h: "Retention", p: ["Access data: up to 24 months after your last access. Invoicing records: 10 years, as required by law."] },
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
