import { getDict } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/core";

/** Dicionário de uma língua como script: carregado uma vez e guardado pelo navegador (o URL leva a versão). */
export async function GET(_req: Request, props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  if (!isLocale(params.locale)) return new Response("", { status: 404 });
  const body = `window.__SGCT_T=${JSON.stringify(getDict(params.locale)).replace(/</g, "\\u003c")};`;
  return new Response(body, { headers: { "Content-Type": "application/javascript; charset=utf-8", "Cache-Control": "public, max-age=31536000, immutable" } });
}
