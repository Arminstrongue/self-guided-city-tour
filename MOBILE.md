# Apps iOS e Android

As apps nativas (pasta `ios/` e `android/`, geradas com Capacitor 6) abrem a app web publicada em `APP_URL`. Qualquer melhoria publicada no servidor aparece logo nas apps, sem nova submissão às lojas.

## Regra importante sobre pagamentos

A Apple e a Google têm regras próprias para vender conteúdo digital **dentro** das apps (normalmente através dos seus sistemas de pagamento, com comissão). Por isso, nesta versão:

- **Dentro das apps não se vende nada.** O botão de compra e o registo de comerciantes ficam escondidos; aparece "entre com a conta ou o email usados na compra" (componente `src/components/WebOnly.tsx`).
- A compra acontece na web, que é onde o turista chega pelo QR.

Antes de submeter, confirme com as regras em vigor da App Store e do Google Play (incluindo as regras específicas da UE). Se quiser vender dentro das apps, é preciso integrar a compra da Apple/Google (por exemplo com RevenueCat) e ajustar os preços à comissão das lojas.

## O que precisa

| Para | Precisa de |
| --- | --- |
| Android (Google Play) | Android Studio (grátis) no Mac e conta Google Play Console (25 US$ uma vez) |
| iPhone (App Store) | Xcode 16+ no Mac e conta Apple Developer (99 US$/ano) |

Desde a versão com Capacitor 8 (Android API 36, exigido pelo Google Play desde 31/08/2026) o iOS usa Swift Package Manager: já não é preciso CocoaPods.

## Google Play, passo a passo

1. No Mac, na pasta do projeto: `npm install && npx cap sync android && npx cap open android`.
2. No Android Studio, esperar que o Gradle termine (barra em baixo). Depois **Build → Generate Signed App Bundle or APK → Android App Bundle**.
3. **Create new…** chave de assinatura: guardar o ficheiro `.jks` e as palavras-passe fora do projeto e num cofre (sem elas não há atualizações). Escolher **release** → Create. O ficheiro fica em `android/app/release/app-release.aab`.
4. No [Play Console](https://play.google.com/console): **Criar app** → nome, idioma pt-PT, App, Gratuita.
5. Preencher **Configurar a app** com os textos de `store/play-store.md` (ficha, segurança dos dados, classificação, público-alvo, acesso para revisão).
6. **Testes → Teste interno** → criar versão → carregar o `.aab` → aceitar a assinatura de apps do Google Play.
7. Contas pessoais criadas depois de nov/2023: o Google exige **teste fechado com 12 testadores durante 14 dias** antes de pedir acesso à produção.
8. **Produção → Criar versão** com o mesmo `.aab` → enviar para revisão (normalmente 1 a 7 dias).

Para cada atualização nativa: subir `versionCode` (e `versionName`) em `android/app/build.gradle`. Mudanças só no site não precisam de nova versão.

## App Store, passo a passo

1. `npm install && npx cap sync ios && npx cap open ios`.
2. Xcode → target **App** → Signing & Capabilities → escolher a equipa (conta Apple Developer).
3. Product → **Archive** → Distribute App → App Store Connect → Upload.
4. No App Store Connect: criar a app com o mesmo identificador, textos (usar os de `store/play-store.md`), capturas 6,9" e 6,5", política de privacidade e conta de demonstração para a revisão.

## Ligações dentro da app

As ligações externas (sites oficiais, direções, WhatsApp) abrem no navegador interno da app com `@capacitor/browser`. Depois de `npm install`, corra `npx cap sync` para o plugin entrar nos projetos iOS e Android.


## Ecrãs iPhone e Android

- A página ocupa o ecrã todo (`viewport-fit=cover`) e respeita o entalhe e a barra inferior do iPhone com `env(safe-area-inset-*)`; no iOS o Capacitor usa `contentInset: "never"`.
- Barra de estado segue o tema do telemóvel; no Android 15+ a app é de ponta a ponta e o Capacitor 8 (SystemBars) passa as margens para `env(safe-area-inset-*)`.
- Telemóveis só em vertical (iPad continua a rodar).
- Campos com 16 px para o iPhone não fazer zoom ao tocar; botões com pelo menos 44 px de altura.
- O áudio-guia usa a voz nativa (`@capacitor-community/text-to-speech`): no Android, o idioma tem de estar instalado em Definições → Texto para voz.
- Depois de atualizar: `npm install` e `npm run mobile:sync` (no Mac também atualiza o projeto iOS com `pod install`).
