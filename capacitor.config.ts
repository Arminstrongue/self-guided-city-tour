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
  ios: { contentInset: "automatic", scheme: "Self Guided City Tour" },
  android: { allowMixedContent: false }
};
export default config;
