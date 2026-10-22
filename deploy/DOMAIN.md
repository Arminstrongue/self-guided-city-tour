# Mudar o domínio para voybu.com

Siga pela ordem. O site continua a funcionar em hellotravell.com até ao passo 5, e depois disso o domínio antigo redireciona para o novo (os códigos QR já impressos continuam a funcionar).

## 1. Cloudflare: adicionar voybu.com

1. Compre o domínio voybu.com (se ainda não o fez) e adicione-o à Cloudflare: **Add a domain** → plano Free → mude os nameservers no registador para os que a Cloudflare indicar. Espere até a Cloudflare dizer **Active**.
2. **DNS → Records**:
   - `A`  · nome `@`   · `157.90.235.252` · Proxied (nuvem laranja)
   - `CNAME` · nome `www` · `voybu.com` · Proxied
3. **SSL/TLS → Overview**: o mesmo modo que usa em hellotravell.com (Full (strict)).

## 2. Emails @voybu.com

1. Cloudflare → voybu.com → **Email → Email Routing** → ativar.
2. Crie `hello@voybu.com`, `support@voybu.com` e `admin@voybu.com` a reencaminhar para o seu Gmail.
3. Resend → **Domains → Add domain** → `voybu.com` → copie os registos DNS que a Resend mostra para a Cloudflare (DNS) → **Verify**. Só depois os emails da app saem de hello@voybu.com.

## 3. Serviços externos (adicionar o novo domínio, sem apagar o antigo ainda)

- **Stripe** → Developers → Webhooks → o endpoint atual → **Update details** → URL `https://voybu.com/api/stripe/webhook`. O segredo do webhook (whsec_) não muda.
- **Google Cloud** → APIs & Services → Credentials:
  - Cliente OAuth: adicione a origem `https://voybu.com` e o redirect `https://voybu.com/api/auth/callback/google`.
  - OAuth consent screen: adicione `voybu.com` aos domínios autorizados e atualize os links (página inicial, privacidade, termos).
  - Chave do Google Maps do navegador: adicione o referrer `voybu.com/*`.
- **Apple** (se ativo): Services ID → domínio `voybu.com` e Return URL `https://voybu.com/api/auth/callback/apple`.
- **Facebook** (se ativo): Valid OAuth Redirect URI `https://voybu.com/api/auth/callback/facebook`.

## 4. Servidor: mudar o .env

No servidor (`root@sgct-prod-1`), sem mostrar o conteúdo do ficheiro:

```
cd /opt/self-guided-city-tour
cp .env .env.antes-voybu
sed -i '/^ADMIN_EMAILS=/!s/hellotravell\.com/voybu.com/g' .env
grep -q '^SUPPORT_EMAIL=' .env || echo 'SUPPORT_EMAIL=support@voybu.com' >> .env
grep -E '^(DOMAIN|APP_URL|NEXTAUTH_URL|COMPANY_EMAIL|EMAIL_FROM)=' .env
```

A última linha deve mostrar `voybu.com` em todas. O `ADMIN_EMAILS` fica como está, para continuar a entrar no painel com o mesmo email.

## 5. Publicar

```
git pull && nohup docker compose up -d --build --force-recreate > /tmp/deploy.log 2>&1 &
```

Ao fim de 3 a 5 minutos, abra https://voybu.com. O Caddy pede o certificado HTTPS sozinho na primeira visita.

## 6. Redirecionar hellotravell.com → voybu.com

Cloudflare → **hellotravell.com** → **Rules → Redirect Rules → Create rule**:

- Nome: `para voybu.com`
- When incoming requests match: **All incoming requests**
- Then: **Dynamic**, expressão `concat("https://voybu.com", http.request.uri.path)`, código **301**, **Preserve query string** ligado.

Mantenha os registos DNS de hellotravell.com como estão (com a nuvem laranja), para o redirecionamento funcionar. Teste: https://hellotravell.com/pt/c/lis deve abrir https://voybu.com/pt/c/lis.

## 7. Depois

- **Google Search Console**: adicione a propriedade voybu.com, submeta `https://voybu.com/sitemap.xml` e use **Change of address** na propriedade antiga.
- **Apps nas lojas**: as apps já publicadas abrem hellotravell.com e são redirecionadas, por isso continuam a funcionar. Na próxima versão das apps, o endereço já é voybu.com.
- Quando tudo funcionar durante uns dias, pode retirar hellotravell.com dos serviços do passo 3 (mantenha o domínio e o redirecionamento por causa dos QR impressos).
