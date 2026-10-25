/** Nome de uma língua escrito na língua de quem lê (ex.: "Inglês" em pt), com maiúscula inicial. */
export const langLabel = (l: string, inL: string) => {
  try { const n = new Intl.DisplayNames([inL], { type: "language" }).of(l) ?? l; return n.charAt(0).toUpperCase() + n.slice(1); } catch { return l.toUpperCase(); }
};
