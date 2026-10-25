/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // Pacotes nativos/WASM ficam fora do bundle do servidor. (instrumentation.ts é estável no Next 15+, sem opção.)
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" }
      ]
    },
    // Dados pessoais nunca ficam em caches partilhadas (Cloudflare, proxies) nem no disco do navegador.
    ...["/api/me/:path*", "/api/chat/:path*", "/api/social/feed", "/api/social/stories", "/api/social/saved", "/api/social/act"].map((source) => ({
      source, headers: [{ key: "Cache-Control", value: "private, no-store" }]
    }))];
  }
};
export default nextConfig;
