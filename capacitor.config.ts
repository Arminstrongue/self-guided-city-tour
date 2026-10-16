import type { CapacitorConfig } from "@capacitor/cli";

/**
 * App nativa (iOS/Android) que abre a app web publicada.
 * Altere APP_URL para o domínio escolhido antes de gerar as apps.
 */
const APP_URL = process.env.APP_URL ?? "https://selfguidedcitytour.com";

const config: CapacitorConfig = {
  appId: "com.selfguidedcitytour.app",
  appName: "Self Guided City Tour",
  webDir: "mobile-shell",
  server: { url: APP_URL, cleartext: false, allowNavigation: [new URL(APP_URL).host, "*.stripe.com", "accounts.google.com", "appleid.apple.com", "*.facebook.com"] },
  backgroundColor: "#1d4aa0",
  // iOS: a página ocupa o ecrã todo e trata o entalhe e a barra inferior com env(safe-area-inset-*).
  ios: { contentInset: "never", scheme: "Self Guided City Tour", backgroundColor: "#1d4aa0" },
  android: { allowMixedContent: false, backgroundColor: "#1d4aa0" },
  plugins: {
    // Barra de estado azul com texto claro, sem sobrepor a página (Android) — igual nos dois sistemas.
    StatusBar: { style: "DARK", backgroundColor: "#1d4aa0", overlaysWebView: false }
  }
};
export default config;
