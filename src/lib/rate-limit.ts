/**
 * Limite simples de pedidos por IP e por minuto, em memória (por instância).
 * Em produção com várias instâncias, a primeira barreira é a regra de rate limiting da Cloudflare.
 */
const buckets = new Map<string, { n: number; reset: number }>();

export function clientIp(req: Request): string {
  const h = req.headers;
  return h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
}

export function rateLimit(req: Request, scope: string, perMinute: number): boolean {
  const key = `${scope}:${clientIp(req)}`;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) { buckets.set(key, { n: 1, reset: now + 60_000 }); sweep(now); return true; }
  b.n += 1;
  return b.n <= perMinute;
}

let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
}
