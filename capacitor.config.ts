import type { CapacitorConfig } from "@capacitor/cli";

/**
 * App nativa (iOS/Android, Capacitor 8) que abre a app web publicada.
 * Qualquer melhoria publicada no servidor aparece logo nas apps, sem nova submissão às lojas.
 */
const APP_URL = process.env.APP_URL ?? "https://voybu.com";

const config: CapacitorConfig = {
  appId: "com.selfguidedcitytour.app",
  appName: "VOYBU",
  webDir: "mobile-shell",
  server: { url: APP_URL, cleartext: false, allowNavigation: [new URL(APP_URL).host, "*.stripe.com", "accounts.google.com", "appleid.apple.com", "*.facebook.com"] },
  backgroundColor: "#000000",
  // iOS: a página ocupa o ecrã todo e trata o entalhe e a barra inferior com env(safe-area-inset-*).
  ios: { contentInset: "never", scheme: "City Tour", backgroundColor: "#000000" },
  android: { allowMixedContent: false, backgroundColor: "#000000" },
  plugins: {
    // Android 15+ é sempre de ponta a ponta: o Capacitor 8 passa as margens do sistema para env(safe-area-inset-*).
    SystemBars: { insetsHandling: "css", initialViewportFitValueHint: "cover" }
  }
};
export default config;
