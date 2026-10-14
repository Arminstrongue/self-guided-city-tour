# Self Guided City Tour — app

App web (PWA) para passageiros em escala: lê o QR, indica o voo, paga e segue sozinho o roteiro da cidade, com o transporte mais barato e a hora de voltar ao aeroporto. Inclui registo de comerciantes com assinatura, comissões do Parceiro QR e painel de administração.

**Stack:** Next.js 14 (App Router) · PostgreSQL + Drizzle ORM · Stripe Checkout e assinaturas · NextAuth (Google, Apple, Facebook) · 5 idiomas (PT, EN, ES, FR, DE) · Docker + Caddy para Hetzner.

## Estrutura

```
src/
  app/[locale]/            páginas por idioma
    page.tsx               início: escolher cidade
    c/[city]/              entrada do QR: plano, voo, pagamento
    tour/[city]/           roteiro (só com acesso pago)
    success/               regresso do pagamento
    merchants/             registo de comerciantes + confirmação
    admin/                 painel interno (ADMIN_EMAILS)
  app/api/
    checkout/              cria a sessão Stripe do turista
    merchants/             regista comerciante e cria a assinatura Stripe
    stripe/webhook/        pagamentos e estado das assinaturas
    access/claim|link      guarda o acesso no dispositivo (cookie assinado)
    auth/[...nextauth]/    login social
  data/cities.ts           cidades, paragens e tarifas 2026
  i18n/dictionaries.ts     textos nos 5 idiomas
  lib/route-cost.ts        cálculo do bilhete mais barato e da hora de saída
  lib/orders.ts            registo de acessos e comissões (idempotente)
  lib/db/schema.ts         tabelas: users, accesses, merchants, commissions
drizzle/                   migrações SQL
scripts/                   migrate.ts, seed.ts (dados de demonstração)
```

## Correr localmente

Requisitos: Node 22.

```bash
cp .env.example .env          # DATABASE_URL=pglite:./.data/db usa PostgreSQL embutido, sem servidor
npm install
npm run db:migrate
npm run db:seed               # cria 2 comerciantes de exemplo e imprime um link de acesso de demonstração
npm run dev                   # http://localhost:3000
npm test                      # testes do cálculo de custos, tokens e pagamentos
```

Abra o link impresso pelo `db:seed` para ver um roteiro com acesso, sem pagar.

## Stripe (modo de teste primeiro)

1. Crie a conta em stripe.com e copie a chave `sk_test_…` para `STRIPE_SECRET_KEY`.
2. Ative os métodos de pagamento no painel (cartões, Apple Pay, Google Pay; MB WAY e Bizum se disponíveis na sua conta).
3. Webhook em desenvolvimento: `stripe listen --forward-to localhost:3000/api/stripe/webhook` e copie o `whsec_…` para `STRIPE_WEBHOOK_SECRET`.
4. Em produção, crie o endpoint `https://SEU_DOMINIO/api/stripe/webhook` com os eventos `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.updated` e `customer.subscription.deleted`.
5. Os preços (4,99 €, 9,99 €, 19 €/mês, 49 €/mês) estão em `src/lib/pricing.ts`; não é preciso criar produtos no Stripe.
6. Antes de vender a clientes de outros países da UE, ative o Stripe Tax ou configure o IVA OSS com o contabilista.

## Login social

Cada fornecedor só aparece se as variáveis estiverem definidas.

- **Google:** Google Cloud Console → Credenciais → ID de cliente OAuth. Redirecionamento: `https://SEU_DOMINIO/api/auth/callback/google`.
- **Facebook:** developers.facebook.com → app → Facebook Login. Redirecionamento: `/api/auth/callback/facebook`.
- **Apple:** conta Apple Developer → Services ID + chave. Redirecionamento: `/api/auth/callback/apple`.

Sem login, o turista compra só com o email; o acesso fica no dispositivo e o link segue por email (defina `RESEND_API_KEY` e `EMAIL_FROM` para enviar).

## Instalar na Hetzner

1. Crie um servidor (CX23 chega para o MVP) com Ubuntu e instale Docker.
2. Na Cloudflare, aponte o domínio para o IP do servidor (registo A, proxy ligado, SSL "Full (strict)").
3. No servidor: `git clone …`, `cp .env.example .env`, preencha os valores reais (`APP_URL`, `NEXTAUTH_URL`, `DOMAIN`, `POSTGRES_PASSWORD`, Stripe, login).
4. `docker compose up -d --build` — cria a base de dados, aplica as migrações, arranca a app e o Caddy com certificado HTTPS.
5. Faça backups diários do volume `pgdata` (por exemplo `pg_dump` para um Storage Box).

## Códigos QR

- Aeroporto / genérico: `https://SEU_DOMINIO/lis` (abre a cidade no idioma do telemóvel).
- Comerciante Parceiro QR: `https://SEU_DOMINIO/lis?ref=CODIGO` — o código aparece na página de confirmação e no painel; cada venda por esse QR gera 20% de comissão.

## Administração

`/pt/admin` — vendas por cidade, receita, assinaturas ativas, aprovar ou suspender comerciantes e marcar comissões como pagas. Acesso para os emails em `ADMIN_EMAILS` (entrar com login social).

## Próximos passos

- Backoffice para editar cidades, paragens e tarifas sem mexer no código (hoje em `src/data/cities.ts`).
- Áudio-guia por paragem e fotos próprias.
- Modo offline (service worker) para o roteiro já pago.
- Páginas legais: termos, privacidade (RGPD), política de cookies e aviso de responsabilidade sobre voos.
- Limite de pedidos nas APIs e monitorização (por exemplo Sentry e Uptime Kuma).
- Pagamento automático de comissões (Stripe Connect).
