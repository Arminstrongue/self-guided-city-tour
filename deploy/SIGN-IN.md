# Entrar com Google / Apple — configuração (HelloTravell)

O código já está pronto: os botões "Continuar com Google" e "Continuar com Apple" aparecem na carteira, na compra e no admin **assim que as chaves estiverem no `.env`** do servidor. Sem chaves, fica só a entrada por email (como hoje).

Antes de começar, confirme no `.env` do servidor:
```
grep -E '^NEXTAUTH_URL=' .env        # deve ser https://hellotravell.com
```

Para pôr cada valor no `.env` sem o mostrar no ecrã (recomendado para segredos):
```
read -rsp "Valor: " V; echo; sed -i "/^NOME=/d" .env; echo "NOME=$V" >> .env; unset V
```
(troque `NOME` pelo nome da variável, p. ex. `GOOGLE_CLIENT_SECRET`)

---

## Google (pode fazer já)
1. **console.cloud.google.com** → o mesmo projeto do Maps → menu **Google Auth Platform** (ou "APIs & Services → OAuth consent screen").
2. **Branding:**
   - App name: `HelloTravell`
   - User support email: hello@hellotravell.com
   - Logo: o ícone da app (opcional — se puser logótipo, a Google faz uma verificação de alguns dias)
   - App domain → Home page: `https://hellotravell.com`
   - Privacy policy: `https://hellotravell.com/en/legal/privacy`
   - Terms of service: `https://hellotravell.com/en/legal/terms`
   - Authorized domains: `hellotravell.com`
3. **Audience:** External → **Publish app** (em produção). Os acessos pedidos (email, nome, foto) não exigem verificação.
4. **Clients → Create client:**
   - Application type: **Web application**, nome `HelloTravell web`
   - Authorized JavaScript origins: `https://hellotravell.com`
   - Authorized redirect URIs: `https://hellotravell.com/api/auth/callback/google`
5. Copie o **Client ID** e o **Client secret** e, no servidor:
   ```
   # GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET com o método "read" acima
   docker compose up -d --force-recreate app
   ```
6. Teste: hellotravell.com/en/wallet → **Continuar com Google**.

> Na app iPhone/Android o botão Google fica escondido (a Google proíbe o login dentro de apps embutidas); lá ficam a Apple e o email.

---

## Apple (precisa da conta Apple Developer ativa — à espera do D-U-N-S)
1. **developer.apple.com → Certificates, Identifiers & Profiles → Identifiers:**
   - Abra o App ID `com.selfguidedcitytour.app` → ative **Sign In with Apple** → Save.
2. **Identifiers → ＋ → Services IDs:**
   - Description `HelloTravell`, Identifier `com.hellotravell.web` → Register.
   - Abra-o → ative **Sign In with Apple** → **Configure**:
     - Primary App ID: `com.selfguidedcitytour.app`
     - Domains: `hellotravell.com`
     - Return URLs: `https://hellotravell.com/api/auth/callback/apple`
3. **Keys → ＋:** nome `HelloTravell Sign in`, ative **Sign In with Apple** → Configure → App ID acima → Register → **Download** o ficheiro `AuthKey_XXXXXXXXXX.p8` (só dá para descarregar UMA vez — guarde-o no gestor de passwords). Anote o **Key ID**.
4. O **Team ID** está em developer.apple.com → Membership details.
5. No Mac, transforme a chave numa linha: `base64 -i ~/Downloads/AuthKey_XXXXXXXXXX.p8 | pbcopy` (fica copiada).
6. No servidor (método "read" acima para a chave):
   ```
   APPLE_ID=com.hellotravell.web
   APPLE_TEAM_ID=XXXXXXXXXX
   APPLE_KEY_ID=XXXXXXXXXX
   APPLE_PRIVATE_KEY=<colar o base64>
   ```
   `docker compose up -d --force-recreate app`

O segredo da Apple (que normalmente expira de 6 em 6 meses) é gerado e renovado automaticamente pela app a partir desta chave — não há nada para repetir.

---

## Facebook (opcional)
developers.facebook.com → Create app → Facebook Login → Valid OAuth Redirect URI `https://hellotravell.com/api/auth/callback/facebook` → `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET`.
