import { currentTraveller } from "@/lib/wallet";
import { subscribe, touchPresence, type LiveEvent } from "@/lib/live";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Ligação em tempo real (Server-Sent Events): mensagens, "a escrever…", lidas e notificações chegam logo.
 * Um "ping" a cada 25 s mantém a ligação viva (Cloudflare e telemóveis fecham ligações paradas).
 */
export async function GET(req: Request) {
  const me = await currentTraveller();
  if (!me) return new Response("auth", { status: 401 });
  const enc = new TextEncoder();
  let close = () => {};
  const stream = new ReadableStream({
    start(ctrl) {
      const send = (s: string) => { try { ctrl.enqueue(enc.encode(s)); } catch { close(); } };
      send(`retry: 3000\n: hello\n\n`);
      const off = subscribe(me, (ev: LiveEvent) => send(`data: ${JSON.stringify(ev)}\n\n`));
      void touchPresence(me);
      const hb = setInterval(() => { send(`: ping\n\n`); void touchPresence(me); }, 25_000);
      close = () => { clearInterval(hb); off(); void touchPresence(me, false); try { ctrl.close(); } catch { /* já fechada */ } close = () => {}; };
      req.signal.addEventListener("abort", () => close());
    },
    cancel() { close(); }
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" }
  });
}
