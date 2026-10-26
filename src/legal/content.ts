/**
 * Textos legais (modelo). Os dados da empresa vêm das variáveis COMPANY_*.
 * IMPORTANTE: rever com um advogado antes do lançamento.
 */
import { env } from "@/lib/env";
export type LegalDoc = "terms" | "privacy" | "cookies" | "guides" | "delete";
export type Section = { h: string; p: string[] };

export function company() {
  const v = (k: string, fallback: string) => process.env[k]?.trim() || fallback;
  return {
    name: v("COMPANY_NAME", "[nome da empresa — a preencher]"),
    nipc: v("COMPANY_NIPC", "[NIPC — a preencher]"),
    address: v("COMPANY_ADDRESS", "[sede — a preencher]"),
    email: v("COMPANY_EMAIL", env.contact),
    updated: "25 de outubro de 2026",
    updatedEn: "25 October 2026"
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
        "Usar a app VOYBU é gratuito: criar e planear roteiros, as ferramentas de viagem e a primeira paragem de cada cidade não têm custo.",
        "O que se paga é um serviço de informação: o acesso digital ao roteiro selecionado (ou, no Passe Todas as Cidades, aos roteiros de todas as cidades), com as paragens, o mapa, o áudio-guia, as indicações de transporte, os tempos e custos estimados e a contagem até à hora recomendada de regresso.",
        "A VOYBU não vende nem inclui bilhetes de transporte, entradas em museus ou monumentos, visitas guiadas, alojamento, reservas ou seguros, e não é agência de viagens nem operador turístico. Esses serviços são contratados e pagos à parte, diretamente a quem os presta.",
        "O acesso a uma cidade é válido durante 48 horas; o passe de férias curtas (3 dias) é válido durante 72 horas nessa cidade; o Passe Todas as Cidades é válido durante 30 dias em todas as cidades disponíveis. A contagem começa quando abre um roteiro pela primeira vez, o que tem de acontecer até 30 dias depois do pagamento; se não o abrir nesse prazo, o passe expira. Os passes incluem o roteiro, o áudio-guia e as ferramentas da app; as entradas em museus e monumentos e os bilhetes de transporte não estão incluídos, salvo indicação expressa."
      ] },
      { h: "Preços e pagamento", p: ["Os preços incluem IVA à taxa aplicável. O pagamento é processado pela Stripe; não guardamos dados de cartões."] },
      { h: "Direito de livre resolução", p: [
        "O roteiro é conteúdo digital fornecido de imediato. Antes de pagar, aceita expressamente estes Termos e a Política de privacidade e pede o acesso imediato, reconhecendo que perde o direito de livre resolução de 14 dias (Decreto-Lei n.º 24/2014, art.º 17.º). Enviamos a confirmação por email.",
        `Se o acesso não funcionar por razões técnicas da nossa parte, contacte ${c.email} e devolvemos o valor pago.`
      ] },
      { h: "Responsabilidade do viajante", p: [
        "As horas, tarifas e tempos de percurso são indicativos e podem mudar sem aviso dos operadores. Confirme no local antes de comprar bilhetes.",
        "A decisão de sair do aeroporto e a hora de regresso são do viajante. Verifique antes que o seu passaporte e visto lhe permitem sair e voltar a entrar.",
        "Não somos responsáveis por voos perdidos, atrasos de transportes, encerramentos de monumentos ou alterações de horários de voo."
      ] },
      { h: "Informação turística e informação de voo", p: [
        "A VOYBU dá informação turística (o que ver, como lá chegar, quanto tempo e quanto custa, em estimativa). Não é uma fonte oficial de informação operacional de voo.",
        "Horários, portas de embarque, terminais e condições de entrada podem mudar a qualquer momento. Confirme sempre com a companhia aérea, o aeroporto e os painéis no local.",
        "Nenhuma estimativa de percurso ou hora de regresso é uma garantia de que chegará a tempo. Deixe sempre margem para filas, controlos de segurança e imprevistos."
      ] },
      { h: "Entrada no país, trânsito e vistos", p: [
        "A VOYBU nunca afirma que pode sair do aeroporto. A ferramenta \"Posso sair?\" é um resumo informativo, com fonte e data, e não substitui a confirmação oficial.",
        "Antes de sair, confirme as condições de entrada e de trânsito que se aplicam a si junto das autoridades oficiais (serviço de fronteiras, embaixada ou consulado) e da sua companhia aérea."
      ] },
      { h: "Preços transparentes", p: [
        "Antes de pagar, mostramos o preço total (com IVA), o que está incluído, a validade do passe e as condições de livre resolução. Não há custos escondidos nem renovação automática nos passes de viajante.",
        "Os custos de terceiros que aparecem no roteiro (transportes, entradas, refeições) são estimativas, pagos diretamente a quem presta o serviço, e podem ser diferentes no local."
      ] },
      { h: "Negócios na app, avaliações e denúncias", p: [
        "Só aparecem na app estabelecimentos registados na VOYBU com a conta ativa. Os guias só aparecem depois de aprovados pela nossa equipa.",
        "As avaliações de negócios são verificadas: só pode avaliar quem teve uma reserva confirmada pelo negócio, depois do dia da visita, através de um link pessoal enviado por email. Os negócios não podem apagar, editar nem pagar avaliações, e não é permitido oferecer contrapartidas por elas.",
        `Se encontrar informação errada, um negócio enganador, uma possível fraude ou abuso, use Perfil → Definições → Ajuda e informações legais → Reportar um problema ou fraude, ou escreva para ${c.email}. Analisamos cada denúncia e podemos corrigir, suspender ou retirar conteúdos e contas.`
      ] },
      { h: "Fontes, atualização e emergências", p: [
        "Nas informações importantes (aeroportos, entrada no país, segurança, emergências) indicamos a origem e a data de atualização. Só publicamos factos verificados em fontes oficiais.",
        "Os contactos de emergência mostrados são os números oficiais de cada país. Numa emergência, ligue diretamente para o número local; não dependa só da app, sobretudo sem rede ou bateria."
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
  if (doc === "delete") return {
    title: "Apagar a conta e os dados (app VOYBU)",
    sections: [
      { h: "Na app ou no site", p: [
        "Abra a VOYBU (app Android, iPhone ou voybu.com) → Perfil → ícone ☰ (Definições) → Apagar a conta. Escreva DELETE para confirmar.",
        "A conta é apagada de imediato, sem precisar de nos contactar."
      ] },
      { h: "Sem acesso à app", p: [
        `Envie um email para ${c.email} a partir do endereço da conta, com o assunto "Apagar a minha conta VOYBU". Apagamos a conta no prazo de 30 dias e confirmamos por email.`
      ] },
      { h: "O que é apagado", p: [
        "Perfil, publicações, histórias, mensagens, notificações, memórias e fotos, planos, lugares guardados, percursos, pontos, preferências de viagem e sessões em todos os dispositivos.",
        "Nas avaliações de guias e de negócios ficam só as estrelas e o comentário, sem o seu nome."
      ] },
      { h: "O que fica (obrigação legal)", p: [
        "Os dados fiscais das compras (faturação) ficam guardados 10 anos, por obrigação legal, sem voo nem plano de viagem."
      ] }
    ]
  };
  if (doc === "privacy") return {
    title: "Política de privacidade",
    sections: [
      { h: "Em resumo", p: [
        "Usar a app é grátis. Guardamos só o necessário para o serviço funcionar, não vendemos dados, não usamos publicidade nem análise de terceiros, e pode apagar a sua conta e os seus dados a qualquer momento em Perfil → Apagar a conta."
      ] },
      { h: "Privacidade por defeito", p: [
        "Recolhemos só os dados necessários para cada função e explicamos para que servem. As funções opcionais (localização, diário de percursos, perfil público, notificações) estão desligadas até as ativar.",
        "A localização nunca é obrigatória: a app funciona com uma cidade ou um ponto escolhido à mão. Não pedimos localização permanente nem em segundo plano.",
        "O perfil de viajante é privado por defeito e o seu email nunca é mostrado. Pode rever e mudar tudo em Perfil → Definições → Privacidade e segurança."
      ] },
      { h: "Responsável pelo tratamento", p: [`${who}.`] },
      { h: "Que dados tratamos", p: [
        "Compra: email, nome, cidade e plano; hora e número do voo (opcionais) e o plano de viagem (início, fim, modalidade e horas). O pagamento é tratado pela Stripe; não guardamos o cartão.",
        "Conta: email e nome; se entrar com Google, Apple ou Facebook, o nome e o email dessa conta.",
        "A nacionalidade indicada em \"Posso sair?\" fica só no seu dispositivo; não a guardamos.",
        "Localização (só se a autorizar): serve para o guiar, mostrar o que está perto e calcular a hora de regresso. Para encontrar lugares perto de si, enviamos uma posição arredondada (cerca de 100 m) ao OpenStreetMap; para dar nome a um sítio onde parou, uma posição arredondada (cerca de 10 m). Não guardamos estas posições.",
        "Diário automático de percursos (opcional): o telemóvel deteta as cidades, os lugares por onde passa, a distância e os passos. Só guardamos um percurso na sua conta depois de o confirmar; pode apagá-lo ou desligar o diário a qualquer momento. Sem sessão iniciada, fica só no telemóvel.",
        "Preferências de viagem (opcional): tipo de viagem, ritmo e necessidades de acessibilidade (por exemplo, evitar escadas ou viajar com carrinho de bebé). Servem só para adaptar roteiros e sugestões, só você as vê, nunca são partilhadas e pode apagá-las a qualquer momento.",
        "Foto de perfil: ao criar um avatar, recortar uma foto ou escolher um momento de um vídeo, o tratamento é feito no seu telemóvel; só a imagem final é enviada. O vídeo e a foto originais não saem do dispositivo.",
        "Entrada por email: enviamos um link e um código de 6 dígitos válidos durante 30 minutos. Não guardamos o código; a sessão fica num cookie necessário, que pode terminar em todos os dispositivos.",
        "Carteira (com sessão): memórias (fotos e notas, com o local se o indicar), lugares guardados, interesses, planos, reservas e bilhetes que adicionar (incluindo a foto do bilhete) e grupos de despesas (com os nomes que escrever para os outros participantes).",
        "Perfil de viajante (opcional, só para maiores de 16 anos): nome, @nome de utilizador, foto, bio, cidades que segue, quem segue e quem o segue. A conta é privada por defeito; o seu email nunca é mostrado a outros viajantes.",
        "Publicações, vídeos e histórias (opcional): fotos, vídeos (convertidos e guardados nos nossos servidores na UE, sem metadados de localização), legendas, cidade, tema, gostos e comentários. As histórias deixam de estar visíveis ao fim de 24 horas; ficam no seu arquivo privado durante 1 ano (ou enquanto estiverem num destaque seu) e depois são apagadas.",
        "Mensagens privadas (opcional): texto, fotos, notas de voz e localização partilhada, com a data e se foi lida. A equipa não lê as conversas, exceto quando um participante as denuncia por abuso ou segurança.",
        "Pedidos de reserva a negócios: nome, email, telefone e nota que escrever são enviados por email ao negócio escolhido. Ficam anónimos ao fim de 12 meses. Se o negócio confirmar, no dia a seguir à visita enviamos um único email a pedir uma avaliação; na avaliação aparece o seu primeiro nome, as estrelas e o comentário.",
        "Reservas de guias: nome, email, telefone e nota, partilhados com o guia depois de ele aceitar. Nas avaliações de guias aparece o seu primeiro nome, as estrelas e o comentário; nas avaliações dos roteiros não aparece o nome.",
        "Problemas reportados numa paragem: o tipo de problema e a nota; se não tiver sessão, um código irreversível derivado do endereço IP, só para contar cada pessoa uma vez (anónimo ao fim de 12 meses).",
        "Convites (opcional): por email enviamos um único email em seu nome; por SMS ou WhatsApp a mensagem sai do seu telemóvel. Não guardamos o contacto de quem convida — só um código irreversível.",
        "Comerciantes, comerciais independentes e guias: os dados de contacto, profissionais e fiscais que indicam ao aderir (os guias também o registo da atividade, seguro, NIF, morada e data de nascimento, por obrigação fiscal); contas bancárias e IBAN são tratados pela Stripe ou só para pagar comissões.",
        "Contagens anónimas de utilização (páginas vistas, início do pagamento, roteiro concluído), sem cookies nem dados pessoais."
      ] },
      { h: "Para quê e com que fundamento", p: [
        "Prestar o serviço que pediu: roteiro, hora de regresso, carteira, perfil e mensagens (execução do contrato).",
        "Funções opcionais (diário de percursos, localização, perfil, publicações): só se as ativar (consentimento, que pode retirar desligando-as).",
        "Faturação e obrigações fiscais, incluindo a comunicação anual dos rendimentos dos guias à Autoridade Tributária (DAC7) (obrigação legal).",
        "Segurança, prevenção de fraude e moderação de denúncias (interesse legítimo).",
        "Não enviamos marketing sem o seu consentimento."
      ] },
      { h: "Durante quanto tempo", p: [
        "Conta, carteira, percursos, memórias e publicações: até os apagar ou apagar a conta.",
        "Voo e plano de viagem de uma compra: apagados 90 dias depois de o passe terminar.",
        "Pedidos de reserva a negócios, notificações e identificação de quem reportou um problema: 12 meses.",
        "Denúncias de moderação: 24 meses. Contagens anónimas: cerca de 25 meses. Registos técnicos do servidor: rodam automaticamente e não guardam o conteúdo dos pedidos.",
        "Faturação (compras) e registos DAC7 dos guias: 10 anos, por obrigação legal; ao apagar a conta ficam só os dados fiscais da compra."
      ] },
      { h: "Com quem partilhamos", p: [
        "Prestadores que tratam dados por nossa conta: Stripe (pagamentos), Hetzner (servidores na UE), Cloudflare (rede e segurança), Resend (envio de emails), AeroDataBox (estado do voo, só o número do voo) e, se o usar, o fornecedor de login (Google, Apple, Facebook).",
        "Mapas e lugares: Google Maps Platform (mapas, pesquisa de moradas e percursos de transporte) e OpenStreetMap (mosaicos do mapa, nomes de sítios e lugares perto, com a posição arredondada). Ao abrir um mapa, o seu navegador liga-se a estes serviços (que recebem o endereço IP).",
        "Notificações: se as ativar, o texto do aviso passa pelo serviço de notificações do seu navegador ou telemóvel (Google, Apple ou Mozilla).",
        "Negócios e guias recebem apenas os dados dos pedidos que lhes enviar.",
        "Alguns destes prestadores estão fora do EEE (por exemplo, nos EUA) e transferem dados ao abrigo do Quadro de Privacidade de Dados UE-EUA ou de cláusulas contratuais-tipo."
      ] },
      { h: "Os seus direitos", p: [
        "Pode exportar os seus dados em Perfil → Definições → Privacidade e segurança → Descarregar os meus dados, e apagar a conta em Perfil → Definições → Apagar a conta.",
        `Pode também pedir acesso, retificação, apagamento, limitação, portabilidade ou opor-se ao tratamento através de ${c.email}.`,
        "Pode apresentar queixa à Comissão Nacional de Proteção de Dados (cnpd.pt)."
      ] }
    ]
  };
  return {
    title: "Política de cookies",
    sections: [
      { h: "Só cookies necessárias ou funcionais", p: [
        "Não usamos cookies de publicidade nem de análise. As cookies que usamos servem para o serviço funcionar ou para lembrar escolhas suas:",
        "sgct_access — o seu acesso e sessão neste dispositivo (31 dias).",
        "next-auth.* — sessão quando entra com Google, Apple ou Facebook.",
        "sgct_locale — idioma escolhido (12 meses); sgct_lang_ok — já respondeu à pergunta do idioma (12 meses); sgct_cl — idioma do país onde está, calculado pela Cloudflare a partir do país do acesso (1 dia).",
        "sgct_currency — moeda escolhida (12 meses).",
        "sgct_ref — só se abrir um link de convite: liga a sua adesão a quem o convidou, para aplicar o desconto (30 dias).",
        "sgct_admin, sgct_merchant, sgct_agent, sgct_guide — sessões das áreas de administração, negócios, comerciais e guias (7 a 30 dias)."
      ] },
      { h: "Armazenamento no dispositivo", p: [
        "O navegador guarda no seu dispositivo o progresso dos roteiros, os planos, a pergunta de boas-vindas, as cidades descarregadas para usar sem internet e, se usar o diário, as paragens por confirmar. Pode limpar tudo nas definições do navegador; ao apagar a conta, a app limpa-o também."
      ] },
      { h: "Mapas", p: ["Ao abrir um mapa, o navegador liga-se ao Google Maps e ao OpenStreetMap para mostrar o mapa; estes serviços recebem o endereço IP. As fontes de letra são servidas pelos nossos próprios servidores."] }
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
        "Using the VOYBU app is free: creating and planning routes, the travel tools and the first stop of every city cost nothing.",
        "What you pay for is an information service: digital access to the selected route (or, with the All-Cities Pass, to the routes of every city), with its stops, map, audio guide, transport directions, estimated times and costs, and the countdown to the recommended time to head back.",
        "VOYBU does not sell or include transport tickets, museum or monument entry, guided tours, accommodation, bookings or insurance, and is not a travel agency or tour operator. Those services are contracted and paid for separately, directly with whoever provides them.",
        "City access lasts 48 hours; the short-break pass (3 days) lasts 72 hours in that city; the All-Cities Pass lasts 30 days in all available cities. Validity starts when you first open a route, which must happen within 30 days of payment; if you don't open it within that time, the pass expires. Passes include the route, the audio guide and the app tools; museum and monument entry and transport tickets are not included unless expressly stated."
      ] },
      { h: "Prices and payment", p: ["Prices include VAT at the applicable rate. Payments are processed by Stripe; we do not store card details."] },
      { h: "Right of withdrawal", p: [
        "The route is digital content supplied immediately. Before paying, you expressly accept these Terms and the Privacy policy and request immediate access, acknowledging that you lose the 14-day right of withdrawal. We send you the confirmation by email.",
        `If access fails for technical reasons on our side, contact ${c.email} and we will refund you.`
      ] },
      { h: "Traveller responsibility", p: [
        "Times, fares and journey durations are indicative and operators may change them without notice. Check locally before buying tickets.",
        "The decision to leave the airport and when to return is yours. Check that your passport and visa allow you to leave and re-enter.",
        "We are not liable for missed flights, transport delays, closed sights or flight schedule changes."
      ] },
      { h: "Tourist information and flight information", p: [
        "VOYBU provides tourist information (what to see, how to get there, how long and how much, as estimates). It is not an official source of operational flight information.",
        "Schedules, gates, terminals and entry conditions can change at any time. Always check with your airline, the airport and the screens on site.",
        "No route estimate or return time is a guarantee that you will be back in time. Always leave a margin for queues, security checks and the unexpected."
      ] },
      { h: "Entry, transit and visas", p: [
        "VOYBU never states that you can leave the airport. The \"Can I leave?\" tool is an informative summary, with its source and date, and does not replace official confirmation.",
        "Before leaving, check the entry and transit conditions that apply to you with the official authorities (border service, embassy or consulate) and your airline."
      ] },
      { h: "Transparent prices", p: [
        "Before you pay, we show the total price (including VAT), what is included, how long the pass lasts and the withdrawal conditions. There are no hidden costs and traveller passes do not renew automatically.",
        "Third-party costs shown on the route (transport, entry tickets, meals) are estimates, paid directly to the provider, and may differ on site."
      ] },
      { h: "Businesses in the app, ratings and reports", p: [
        "Only establishments registered with VOYBU with an active account appear in the app. Guides only appear after our team approves them.",
        "Business reviews are verified: only someone whose booking the business confirmed can leave one, after the day of the visit, through a personal link sent by email. Businesses cannot delete, edit or pay for reviews, and offering incentives for them is not allowed.",
        `If you find wrong information, a misleading business, possible fraud or abuse, use Profile → Settings → Help and legal → Report a problem or fraud, or write to ${c.email}. We review every report and may correct, suspend or remove content and accounts.`
      ] },
      { h: "Sources, updates and emergencies", p: [
        "For important information (airports, entry rules, safety, emergencies) we show where it comes from and when it was last updated. We only publish facts verified from official sources.",
        "The emergency contacts shown are each country's official numbers. In an emergency, call the local number directly; don't rely only on the app, especially without signal or battery."
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
  if (doc === "delete") return {
    title: "Delete your account and data (VOYBU app)",
    sections: [
      { h: "In the app or on the website", p: [
        "Open VOYBU (Android app, iPhone app or voybu.com) → Profile → ☰ icon (Settings) → Delete account. Type DELETE to confirm.",
        "Your account is deleted straight away, without contacting us."
      ] },
      { h: "Without access to the app", p: [
        `Email ${c.email} from your account's address with the subject "Delete my VOYBU account". We delete the account within 30 days and confirm by email.`
      ] },
      { h: "What is deleted", p: [
        "Profile, posts, stories, messages, notifications, memories and photos, plans, saved places, routes, points, travel preferences and sessions on all devices.",
        "Guide and business reviews keep only the stars and the comment, without your name."
      ] },
      { h: "What we keep (legal obligation)", p: [
        "Tax data from purchases (invoicing) is kept for 10 years as required by law, without flight or trip details."
      ] }
    ]
  };
  if (doc === "privacy") return {
    title: "Privacy policy",
    sections: [
      { h: "In short", p: [
        "Using the app is free. We keep only what the service needs, we don't sell data, we use no advertising or third-party analytics, and you can delete your account and data at any time in Profile → Delete account."
      ] },
      { h: "Privacy by default", p: [
        "We only collect the data each feature needs and explain what it is for. Optional features (location, route diary, public profile, notifications) stay off until you turn them on.",
        "Location is never required: the app works with a city or a point you choose yourself. We don't ask for permanent or background location.",
        "The traveller profile is private by default and your email is never shown. You can review and change everything in Profile → Settings → Privacy and security."
      ] },
      { h: "Controller", p: [`${who}.`] },
      { h: "Data we process", p: [
        "Purchase: email, name, city and plan; flight time and number (optional) and the trip plan (start, end, mode and times). Payment is handled by Stripe; we never store your card.",
        "Account: email and name; if you sign in with Google, Apple or Facebook, that account's name and email.",
        "The nationality entered in \"Can I leave?\" stays on your device; we don't store it.",
        "Location (only if you allow it): used to guide you, show what's nearby and work out your return time. To find places near you we send a rounded position (about 100 m) to OpenStreetMap; to name a spot where you stopped, a rounded position (about 10 m). We don't store these positions.",
        "Automatic route diary (optional): your phone detects cities, the places you pass, distance and steps. We only save a route to your account after you confirm it; you can delete it or turn the diary off at any time. Without signing in, it stays on your phone.",
        "Travel preferences (optional): type of trip, pace and accessibility needs (for example avoiding stairs or travelling with a pushchair). They are only used to adapt routes and suggestions, only you can see them, they are never shared and you can delete them at any time.",
        "Profile photo: when you create an avatar, crop a photo or pick a moment from a video, the processing happens on your phone; only the final image is uploaded. The original video and photo never leave your device.",
        "Email sign-in: we send a link and a 6-digit code that work for 30 minutes. We don't store the code; your session is kept in a necessary cookie, which you can end on all devices.",
        "Wallet (signed in): memories (photos and notes, with the place if you add it), saved places, interests, plans, bookings and tickets you add (including the ticket photo) and expense groups (with the names you type for other participants).",
        "Traveller profile (optional, 16+ only): name, @username, photo, bio, cities you follow, who you follow and who follows you. Accounts are private by default; your email is never shown to other travellers.",
        "Posts, videos and stories (optional): photos, videos (converted and stored on our EU servers, without location metadata), captions, city, topic, likes and comments. Stories stop being visible after 24 hours; they stay in your private archive for 1 year (or while they are in one of your highlights) and are then deleted.",
        "Private messages (optional): text, photos, voice notes and shared location, with the time and whether it was read. Our team does not read chats, except when a participant reports one for abuse or safety.",
        "Booking requests to businesses: the name, email, phone and note you enter are emailed to the business you chose. They are anonymised after 12 months. If the business confirms, the day after your visit we send a single email asking for a review; the review shows your first name, the stars and your comment.",
        "Guide bookings: name, email, phone and note, shared with the guide once they accept. Guide reviews show your first name, stars and comment; route ratings don't show your name.",
        "Problems reported at a stop: the kind of problem and the note; if you're not signed in, an irreversible code derived from your IP address, only so each person counts once (anonymised after 12 months).",
        "Invites (optional): by email we send a single email on your behalf; by SMS or WhatsApp the message goes from your own phone. We don't store your friends' contact details — only an irreversible code.",
        "Merchants, independent sales partners and guides: the contact, professional and tax details they give when joining (guides also activity registration, insurance, tax ID, address and date of birth, as required for tax reporting); bank accounts and IBAN are handled by Stripe or used only to pay commissions.",
        "Anonymous usage counts (pages viewed, checkout started, route completed), with no cookies or personal data."
      ] },
      { h: "Purposes and legal bases", p: [
        "Providing the service you asked for: route, return time, wallet, profile and messages (contract).",
        "Optional features (route diary, location, profile, posts): only if you turn them on (consent, which you can withdraw by turning them off).",
        "Invoicing and tax obligations, including yearly reporting of guides' income to the Portuguese tax authority (DAC7) (legal obligation).",
        "Security, fraud prevention and handling reports (legitimate interest).",
        "We do not send marketing without your consent."
      ] },
      { h: "Retention", p: [
        "Account, wallet, routes, memories and posts: until you delete them or your account.",
        "Flight and trip plan of a purchase: deleted 90 days after the pass ends.",
        "Booking requests to businesses, notifications and the identity of who reported a problem: 12 months.",
        "Moderation reports: 24 months. Anonymous counts: about 25 months. Server logs rotate automatically and don't store request contents.",
        "Invoicing (purchases) and guides' DAC7 records: 10 years, as required by law; when you delete your account only the tax details of the purchase remain."
      ] },
      { h: "Who we share data with", p: [
        "Processors acting for us: Stripe (payments), Hetzner (EU servers), Cloudflare (network and security), Resend (email delivery), AeroDataBox (flight status, flight number only) and, if used, your sign-in provider (Google, Apple, Facebook).",
        "Maps and places: Google Maps Platform (maps, address search and transit directions) and OpenStreetMap (map tiles, place names and nearby places, with a rounded position). When you open a map, your browser connects to these services (which receive your IP address).",
        "Notifications: if you turn them on, the notification text goes through your browser's or phone's push service (Google, Apple or Mozilla).",
        "Businesses and guides only receive the details of the requests you send them.",
        "Some of these providers are outside the EEA (for example in the US) and transfer data under the EU-US Data Privacy Framework or standard contractual clauses."
      ] },
      { h: "Your rights", p: [
        "You can export your data in Profile → Settings → Privacy and security → Download my data, and delete your account in Profile → Settings → Delete account.",
        `You may also request access, rectification, erasure, restriction, portability or object to processing at ${c.email}.`,
        "You may complain to the Portuguese data protection authority (cnpd.pt)."
      ] }
    ]
  };
  return {
    title: "Cookie policy",
    sections: [
      { h: "Only necessary or functional cookies", p: [
        "We use no advertising or analytics cookies. Our cookies make the service work or remember your choices:",
        "sgct_access — your access and session on this device (31 days).",
        "next-auth.* — session when you sign in with Google, Apple or Facebook.",
        "sgct_locale — chosen language (12 months); sgct_lang_ok — you've answered the language question (12 months); sgct_cl — the language of the country you're in, worked out by Cloudflare from the country of the connection (1 day).",
        "sgct_currency — chosen currency (12 months).",
        "sgct_ref — only if you open an invite link: links your sign-up to the person who invited you, to apply the discount (30 days).",
        "sgct_admin, sgct_merchant, sgct_agent, sgct_guide — sessions for the admin, business, sales partner and guide areas (7 to 30 days)."
      ] },
      { h: "On-device storage", p: [
        "Your browser stores on your device your route progress, plans, the welcome question, cities downloaded for offline use and, if you use the diary, stops waiting to be confirmed. You can clear it all in your browser settings; when you delete your account, the app clears it too."
      ] },
      { h: "Maps", p: ["When you open a map, your browser connects to Google Maps and OpenStreetMap to show it; these services receive your IP address. Fonts are served from our own servers."] }
    ]
  };
}
