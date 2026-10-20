/**
 * Filtro de conteúdo ofensivo (exigido pelas lojas de apps para conteúdo de utilizadores).
 * - Insultos de ódio (raça, origem, orientação, deficiência) → bloqueia a publicação.
 * - Palavrões comuns → escondidos com ••• em publicações e comentários públicos.
 * Palavras inteiras, sem acentos, tolerante a l33t simples (4→a, 3→e, 1→i, 0→o, @→a, $→s).
 * Junta-se às denúncias: uma publicação com 3 denúncias abertas deixa de aparecer até ser revista.
 */

// Lista curta e inequívoca (en, pt, es, fr). Sem palavras com outro sentido comum ("bicha" = fila, "retard" = atraso em francês…).
const HATE = [
  "nigger", "nigga", "niggas", "faggot", "fagot", "retarded", "kike", "spic", "chink", "gook", "wetback", "tranny",
  "paki", "coon", "raghead", "towelhead",
  "preto de merda", "paneleiro", "sapatao", "viado", "retardado", "mongoloide",
  "maricon", "sudaca", "negrata", "subnormal",
  "bougnoule", "tapette", "youpin"
];
const PROFANE = [
  "fuck", "fucking", "fucker", "motherfucker", "shit", "bullshit", "bitch", "cunt", "asshole", "pussy", "whore", "slut", "bastard",
  "caralho", "foda", "fodase", "foda-se", "porra", "merda", "puta", "cabrao", "fdp", "filho da puta", "cona", "piroca", "buceta", "corno",
  "joder", "mierda", "puta", "cabron", "gilipollas", "coño", "hostia",
  "putain", "merde", "connard", "salope", "encule", "bordel"
];

const fold = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/4|@/g, "a").replace(/3/g, "e").replace(/1|!/g, "i").replace(/0/g, "o").replace(/\$/g, "s");
const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "[\\s._-]+");
const re = (list: string[]) => new RegExp(`(^|[^a-z])(${list.map((w) => esc(fold(w))).join("|")})(?=$|[^a-z])`, "g");
const HATE_RE = re(HATE);
const PROF_RE = re(PROFANE);

export function isHateful(text: string) {
  HATE_RE.lastIndex = 0;
  return HATE_RE.test(fold(text));
}

/** Esconde palavrões mantendo a primeira letra ("f•••"). Trabalha sobre a versão normalizada para achar as posições. */
export function maskProfanity(text: string) {
  const f = fold(text);
  if (f.length !== text.length) return text; // normalização mudou o tamanho (raro): não arrisca cortar mal
  let out = text;
  PROF_RE.lastIndex = 0;
  for (let m = PROF_RE.exec(f); m; m = PROF_RE.exec(f)) {
    const start = m.index + m[1].length, len = m[2].length;
    out = out.slice(0, start) + out[start] + "•".repeat(Math.max(2, len - 1)) + out.slice(start + len);
  }
  return out;
}

/** Para publicações, comentários e perfis: { ok: false } se tiver ódio; senão o texto com palavrões escondidos. */
export function moderate(text: string, mask = true): { ok: true; text: string } | { ok: false } {
  if (!text) return { ok: true, text };
  if (isHateful(text)) return { ok: false };
  return { ok: true, text: mask ? maskProfanity(text) : text };
}
