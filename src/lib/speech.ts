/**
 * Áudio-guia: leitura clara em cada idioma.
 * Causas da voz "distorcida" que isto resolve:
 *  - a lista de vozes vem vazia na primeira chamada (iOS/Chrome) e o texto era lido pela voz por defeito
 *    de outro idioma → agora esperamos pelas vozes;
 *  - texto num idioma lido por uma voz de outro → escolhemos a voz do idioma do texto e, se o
 *    telemóvel não a tiver, lemos o texto em inglês com voz inglesa;
 *  - textos longos cortados ou acelerados no Chrome → lemos frase a frase;
 *  - a WebView do Android não tem speechSynthesis → nas apps usamos a voz nativa do sistema.
 */

export const VOICE_LANG: Record<string, string> = {
  pt: "pt-PT", en: "en-GB", es: "es-ES", fr: "fr-FR", de: "de-DE", it: "it-IT", zh: "zh-CN", ar: "ar-SA", ja: "ja-JP", tr: "tr-TR", ru: "ru-RU", ko: "ko-KR"
};

/** Limpa símbolos que os motores de voz leem mal (emojis, setas, pontos centrais). */
export function cleanForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[·•→←↗★✓✈]/g, ", ")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,(\s*,)+/g, ",")
    .trim();
}

/** Divide em frases e junta-as em blocos curtos (≤ max caracteres), sem cortar palavras. */
export function chunkText(text: string, max = 220): string[] {
  const sentences = text.match(/[^.!?。！？؟]+[.!?。！？؟]*\s*/gu) ?? [text];
  const out: string[] = [];
  let cur = "";
  for (const s of sentences.map((x) => x.trim()).filter(Boolean)) {
    const joined = (cur + (/[。！？]$/.test(cur) ? "" : " ") + s).trim(); // chinês/japonês sem espaços
    if (joined.length <= max) { cur = joined; continue; }
    if (cur) out.push(cur);
    if (s.length <= max) { cur = s; continue; }
    // frase muito longa: parte por vírgulas / espaços
    let rest = s;
    while (rest.length > max) {
      const cut = Math.max(rest.lastIndexOf(", ", max), rest.lastIndexOf("، ", max), rest.lastIndexOf("，", max), rest.lastIndexOf("、", max), rest.lastIndexOf(" ", max));
      const at = cut > max * 0.4 ? cut + 1 : max;
      out.push(rest.slice(0, at).trim()); rest = rest.slice(at).trim();
    }
    cur = rest;
  }
  if (cur) out.push(cur);
  return out;
}

type VoiceLike = { lang: string; name: string; localService: boolean; default: boolean; voiceURI?: string };

/** Melhor voz para o idioma: mesma variante > mesmo idioma; prefere vozes de alta qualidade e locais. */
export function pickVoice<T extends VoiceLike>(voices: T[], lang: string): T | null {
  const norm = (l: string) => l.toLowerCase().replace("_", "-");
  const want = norm(lang), base = want.slice(0, 2);
  const score = (v: T) => {
    const l = norm(v.lang);
    let s = l === want ? 100 : l.startsWith(base) ? 50 : -1000;
    const id = `${v.name} ${v.voiceURI ?? ""}`;
    // iPhone: vozes "Premium" e "Melhorada" (descarregadas nas Definições) e Siri soam naturais; as "compact" soam a robô.
    if (/premium/i.test(id)) s += 30;
    else if (/enhanced|siri|natural|neural|wavenet/i.test(id)) s += 20;
    else if (/google/i.test(id)) s += 10;
    if (/compact|espeak|robot|eloquence|novelty|bad news|bells|bubbles|cellos|jester|organ|trinoids|whisper|zarvox|albert|bahh|boing|fred|junior|ralph|superstar/i.test(id)) s -= 40;
    if (v.localService) s += 3;
    if (v.default) s += 1;
    return s;
  };
  const best = [...voices].sort((a, b) => score(b) - score(a))[0];
  return best && score(best) > 0 ? best : null;
}

function nativeTTS(): boolean {
  const cap = (globalThis as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

async function webVoices(): Promise<SpeechSynthesisVoice[]> {
  const s = window.speechSynthesis;
  const now = s.getVoices();
  if (now.length) return now;
  return new Promise((resolve) => {
    const done = () => { s.removeEventListener("voiceschanged", done); resolve(s.getVoices()); };
    s.addEventListener("voiceschanged", done);
    setTimeout(done, 1500);
  });
}

export function speechAvailable(): boolean {
  return nativeTTS() || (typeof window !== "undefined" && "speechSynthesis" in window);
}

export type Speaking = { stop: () => void; done: Promise<void>; usedLang: string };

/**
 * Lê um texto. `fallback` (texto em inglês) é usado se não houver voz para o idioma.
 * Devolve o idioma realmente usado, para a app avisar quando caiu para inglês.
 */
export async function speak(text: string, lang: string, fallback?: string): Promise<Speaking> {
  let stopped = false;
  const tag = VOICE_LANG[lang] ?? lang;

  if (nativeTTS()) {
    const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
    let useLang = tag, useText = text;
    try {
      const { supported } = await TextToSpeech.isLanguageSupported({ lang: tag });
      if (!supported && fallback) { useLang = VOICE_LANG.en; useText = fallback; }
    } catch { /* continua com o idioma pedido */ }
    // Escolhe a melhor voz instalada no telemóvel para o idioma (antes usava a voz por defeito, a mais "robótica").
    let voice: number | undefined;
    try {
      const { voices } = await TextToSpeech.getSupportedVoices();
      const best = pickVoice(voices, useLang);
      if (best) voice = voices.indexOf(best);
    } catch { /* fica a voz do sistema */ }
    // Blocos maiores = menos pausas entre frases; ritmo ligeiramente mais calmo soa mais natural.
    const parts = chunkText(cleanForSpeech(useText), 400);
    const done = (async () => {
      for (const p of parts) {
        if (stopped) break;
        await TextToSpeech.speak({ text: p, lang: useLang, rate: 0.95, pitch: 1.0, volume: 1.0, category: "playback", ...(voice !== undefined && voice >= 0 ? { voice } : {}) });
      }
    })();
    return { stop: () => { stopped = true; void TextToSpeech.stop(); }, done, usedLang: useLang.slice(0, 2) };
  }

  const s = window.speechSynthesis;
  s.cancel();
  // Sem internet, só as vozes do próprio telemóvel funcionam (as "online" ficariam caladas).
  const all = await webVoices();
  const voices = typeof navigator !== "undefined" && navigator.onLine === false ? all.filter((v) => v.localService) : all;
  let voice = pickVoice(voices, tag);
  let useText = text, useLang = tag;
  if (!voice && fallback) { voice = pickVoice(voices, VOICE_LANG.en); useText = fallback; useLang = VOICE_LANG.en; }
  const parts = chunkText(cleanForSpeech(useText), 300);
  const done = new Promise<void>((resolve) => {
    let i = 0;
    const next = () => {
      if (stopped || i >= parts.length) return resolve();
      const u = new SpeechSynthesisUtterance(parts[i++]);
      u.lang = voice?.lang ?? useLang;
      if (voice) u.voice = voice;
      u.rate = 0.95; u.pitch = 1.0; u.volume = 1.0;
      u.onend = next;
      u.onerror = () => resolve();
      s.speak(u);
    };
    next();
  });
  return { stop: () => { stopped = true; s.cancel(); }, done, usedLang: useLang.slice(0, 2) };
}
