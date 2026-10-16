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
| iPhone | Mac com Xcode, conta Apple Developer (99 US$/ano) |
| Android | Android Studio, conta Google Play Console (25 US$ uma vez) |

## Gerar e publicar

```bash
npm install
npm run mobile:icons        # gera ícones e ecrãs de arranque a partir de assets/
APP_URL=https://selfguidedcitytour.com npm run mobile:sync
npm run mobile:ios          # abre o Xcode: escolher equipa, versão, Product → Archive → enviar para o App Store Connect
npm run mobile:android      # abre o Android Studio: Build → Generate Signed Bundle (.aab) → enviar para o Play Console
```

Antes de enviar às lojas:

1. A app web tem de estar online em `APP_URL` com HTTPS.
2. Preencha nas lojas: descrição, capturas de ecrã (iPhone 6,7" e 6,5"; Android telemóvel), política de privacidade (URL), classificação etária e dados recolhidos (email, nome, hora do voo).
3. Login com Google ou Facebook na app iOS: a Apple pode exigir também "Iniciar sessão com a Apple" — ative `APPLE_ID`/`APPLE_SECRET`.
4. A Apple rejeita apps que sejam só um site embrulhado sem valor próprio. Para reduzir esse risco, o próximo passo é acrescentar funções nativas: notificações de "hora de voltar ao aeroporto" (`@capacitor/local-notifications`) e roteiro disponível sem internet.

Identificador da app: `com.selfguidedcitytour.app` (alterar em `capacitor.config.ts` antes da primeira submissão, se preferir outro).


## Ligações dentro da app

As ligações externas (sites oficiais, direções, WhatsApp) abrem no navegador interno da app com `@capacitor/browser`. Depois de `npm install`, corra `npx cap sync` para o plugin entrar nos projetos iOS e Android.


## Ecrãs iPhone e Android

- A página ocupa o ecrã todo (`viewport-fit=cover`) e respeita o entalhe e a barra inferior do iPhone com `env(safe-area-inset-*)`; no iOS o Capacitor usa `contentInset: "never"`.
- Barra de estado azul com texto claro nos dois sistemas (`@capacitor/status-bar`); no Android a barra de navegação fica clara.
- Telemóveis só em vertical (iPad continua a rodar).
- Campos com 16 px para o iPhone não fazer zoom ao tocar; botões com pelo menos 44 px de altura.
- Depois de atualizar: `npm install` e `npm run mobile:sync` (no Mac também atualiza o projeto iOS com `pod install`).
