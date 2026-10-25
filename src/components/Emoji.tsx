"use client";
/**
 * Emojis para as conversas, comentários e legendas: categorias, recentes e procura por palavra.
 * Sem bibliotecas: só os emojis Unicode do próprio telemóvel (leve e com o aspeto nativo).
 */
import { useEffect, useMemo, useRef, useState } from "react";

const CATS: { k: string; icon: string; e: string }[] = [
  { k: "smileys", icon: "😀", e: "😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 🫠 😉 😊 😇 🥰 😍 🤩 😘 😗 ☺️ 😚 😙 🥲 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🫢 🫣 🤫 🤔 🫡 🤐 🤨 😐 😑 😶 🫥 😏 😒 🙄 😬 😮‍💨 🤥 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🤧 🥵 🥶 🥴 😵 🤯 🤠 🥳 🥸 😎 🤓 🧐 😕 🫤 😟 🙁 ☹️ 😮 😯 😲 😳 🥺 🥹 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 ☠️ 💩 🤡 👹 👺 👻 👽 👾 🤖 😺 😸 😹 😻 😼 😽 🙀 😿 😾" },
  { k: "people", icon: "👋", e: "👋 🤚 🖐️ ✋ 🖖 🫱 🫲 🫳 🫴 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝️ 🫵 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 🫶 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦵 🦶 👂 👃 🧠 🫀 👀 👁️ 👅 👄 🫦 👶 🧒 👦 👧 🧑 👱 👨 🧔 👩 🧓 👴 👵 🙍 🙎 🙅 🙆 💁 🙋 🧏 🙇 🤦 🤷 🧑‍✈️ 👮 🕵️ 💂 🥷 👷 🫅 🤴 👸 👳 👲 🧕 🤵 👰 🤰 🤱 👼 🎅 🤶 🦸 🦹 🧙 🧚 🧛 🧜 🧝 💆 💇 🚶 🧍 🧎 🏃 💃 🕺 👯 🧖 🧗 🏇 ⛷️ 🏂 🏌️ 🏄 🚣 🏊 ⛹️ 🏋️ 🚴 🚵 🤸 🤼 🤽 🤾 🤹 🧘 👭 👫 👬 💏 💑 👪" },
  { k: "love", icon: "❤️", e: "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 🩷 🩵 🩶 ❤️‍🔥 ❤️‍🩹 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ♥️ 💋 💌 💐 🌹 🥀 💍 💎 ✨ 🌟 ⭐ 💫 🔥 💯 💥 💢 💦 💨 🕳️ 💬 👁️‍🗨️ 🗨️ 🗯️ 💭 💤" },
  { k: "travel", icon: "✈️", e: "✈️ 🛫 🛬 🛩️ 💺 🚁 🚀 🛸 🚂 🚃 🚄 🚅 🚆 🚇 🚈 🚉 🚊 🚝 🚞 🚋 🚌 🚍 🚎 🚐 🚑 🚒 🚓 🚔 🚕 🚖 🚗 🚘 🚙 🛻 🚚 🚛 🚜 🏎️ 🏍️ 🛵 🚲 🛴 🛹 🛼 🚏 🛣️ 🛤️ ⛽ 🚨 🚥 🚦 🛑 🚧 ⚓ ⛵ 🛶 🚤 🛳️ ⛴️ 🛥️ 🚢 🧳 🗺️ 🧭 🏔️ ⛰️ 🌋 🗻 🏕️ 🏖️ 🏜️ 🏝️ 🏞️ 🏟️ 🏛️ 🏗️ 🏘️ 🏚️ 🏠 🏡 🏢 🏣 🏤 🏥 🏦 🏨 🏩 🏪 🏫 🏬 🏭 🏯 🏰 💒 🗼 🗽 ⛪ 🕌 🛕 🕍 ⛩️ 🕋 ⛲ ⛺ 🌁 🌃 🏙️ 🌄 🌅 🌆 🌇 🌉 🎠 🛝 🎡 🎢 💈 🎪 🗿 🎫 🎟️ 🛂 🛃 🛄 🛅 📍 📌 🏳️ 🏁 🚩" },
  { k: "food", icon: "🍔", e: "🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶️ 🫑 🌽 🥕 🫒 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🧈 🥞 🧇 🥓 🥩 🍗 🍖 🌭 🍔 🍟 🍕 🫓 🥪 🥙 🧆 🌮 🌯 🫔 🥗 🥘 🫕 🥫 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🦪 🍤 🍙 🍚 🍘 🍥 🥠 🥮 🍢 🍡 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 🌰 🥜 🍯 🥛 🍼 🫖 ☕ 🍵 🧃 🥤 🧋 🍶 🍺 🍻 🥂 🍷 🥃 🍸 🍹 🧉 🍾 🧊 🥄 🍴 🍽️ 🥢" },
  { k: "nature", icon: "🌿", e: "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🪱 🐛 🦋 🐌 🐞 🐜 🪰 🐢 🐍 🦎 🐙 🦑 🦐 🦞 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🐘 🦛 🦏 🐪 🐫 🦒 🦘 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🐈 🐓 🦃 🦚 🦜 🦢 🦩 🕊️ 🐇 🦝 🦨 🦡 🦫 🦦 🦥 🐁 🐀 🐿️ 🦔 🌵 🎄 🌲 🌳 🌴 🪵 🌱 🌿 ☘️ 🍀 🎍 🪴 🎋 🍃 🍂 🍁 🍄 🐚 🪨 🌾 💐 🌷 🌹 🥀 🌺 🌸 🌼 🌻 🌞 🌝 🌛 🌜 🌚 🌕 🌖 🌗 🌘 🌑 🌒 🌓 🌔 🌙 🌎 🌍 🌏 🪐 💫 ⭐ 🌟 ✨ ⚡ ☄️ 💥 🔥 🌪️ 🌈 ☀️ 🌤️ ⛅ 🌥️ ☁️ 🌦️ 🌧️ ⛈️ 🌩️ 🌨️ ❄️ ☃️ ⛄ 🌬️ 💨 💧 💦 ☔ ☂️ 🌊 🌫️" },
  { k: "activities", icon: "⚽", e: "⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🥏 🎱 🪀 🏓 🏸 🏒 🏑 🥍 🏏 🪃 🥅 ⛳ 🪁 🏹 🎣 🤿 🥊 🥋 🎽 🛹 🛼 🛷 ⛸️ 🥌 🎿 🏆 🥇 🥈 🥉 🏅 🎖️ 🏵️ 🎗️ 🎫 🎟️ 🎪 🤹 🎭 🩰 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🪘 🎷 🎺 🪗 🎸 🪕 🎻 🎲 ♟️ 🎯 🎳 🎮 🎰 🧩 🎉 🎊 🎈 🎁 🎀 🪅 🎆 🎇 🧨" },
  { k: "objects", icon: "📷", e: "⌚ 📱 💻 ⌨️ 🖥️ 🖨️ 🖱️ 💽 💾 💿 📀 📼 📷 📸 📹 🎥 📽️ 🎞️ 📞 ☎️ 📟 📠 📺 📻 🎙️ ⏱️ ⏲️ ⏰ 🕰️ ⌛ ⏳ 📡 🔋 🔌 💡 🔦 🕯️ 🧯 🛢️ 💸 💵 💴 💶 💷 🪙 💰 💳 🧾 💎 ⚖️ 🧰 🔧 🔨 🛠️ ⛏️ 🔩 ⚙️ 🧱 ⛓️ 🧲 🔫 💣 🧨 🪓 🔪 🗡️ ⚔️ 🛡️ 🚬 ⚰️ 🏺 🔮 📿 🧿 💈 ⚗️ 🔭 🔬 🕳️ 🩹 🩺 💊 💉 🩸 🧬 🦠 🧫 🧪 🌡️ 🧹 🧺 🧻 🚽 🚰 🚿 🛁 🧼 🪥 🪒 🧽 🧴 🛎️ 🔑 🗝️ 🚪 🪑 🛋️ 🛏️ 🧸 🪆 🖼️ 🪞 🪟 🛍️ 🛒 🎁 🎈 🎏 🎀 🪄 🪅 🎊 🎉 🎎 🏮 🎐 🧧 ✉️ 📩 📨 📧 💌 📥 📤 📦 🏷️ 📪 📫 📬 📭 📮 📯 📜 📃 📄 📑 🧾 📊 📈 📉 🗒️ 🗓️ 📆 📅 🗑️ 📇 🗃️ 🗳️ 🗄️ 📋 📁 📂 🗂️ 🗞️ 📰 📓 📔 📒 📕 📗 📘 📙 📚 📖 🔖 🧷 🔗 📎 🖇️ 📐 📏 🧮 📌 📍 ✂️ 🖊️ 🖋️ ✒️ 🖌️ 🖍️ 📝 ✏️ 🔍 🔎 🔏 🔐 🔒 🔓" },
  { k: "symbols", icon: "✅", e: "✅ ☑️ ✔️ ❌ ❎ ➕ ➖ ➗ ✖️ 🟰 ♾️ ‼️ ⁉️ ❓ ❔ ❕ ❗ 〰️ 💱 💲 ⚕️ ♻️ ⚜️ 🔱 📛 🔰 ⭕ 🛑 ⛔ 📵 🚫 🚳 🚭 🚯 🚱 🚷 🔞 ☢️ ☣️ ⬆️ ↗️ ➡️ ↘️ ⬇️ ↙️ ⬅️ ↖️ ↕️ ↔️ ↩️ ↪️ ⤴️ ⤵️ 🔃 🔄 🔙 🔚 🔛 🔜 🔝 🛐 ⚛️ 🕉️ ✡️ ☸️ ☯️ ✝️ ☦️ ☪️ ☮️ 🕎 🔯 ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ ⛎ 🔀 🔁 🔂 ▶️ ⏩ ⏭️ ⏯️ ◀️ ⏪ ⏮️ 🔼 ⏫ 🔽 ⏬ ⏸️ ⏹️ ⏺️ ⏏️ 🎦 🔅 🔆 📶 📳 📴 #️⃣ *️⃣ 0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟 🔠 🔡 🔢 🔣 🔤 🅰️ 🆎 🅱️ 🆑 🆒 🆓 ℹ️ 🆔 Ⓜ️ 🆕 🆖 🅾️ 🆗 🅿️ 🆘 🆙 🆚 🔴 🟠 🟡 🟢 🔵 🟣 🟤 ⚫ ⚪ 🟥 🟧 🟨 🟩 🟦 🟪 🟫 ⬛ ⬜ 🔶 🔷 🔸 🔹 🔺 🔻 💠 🔘 🔳 🔲" },
  { k: "flags", icon: "🏳️", e: "🇵🇹 🇧🇷 🇦🇴 🇲🇿 🇨🇻 🇬🇧 🇮🇪 🇺🇸 🇨🇦 🇪🇸 🇫🇷 🇩🇪 🇮🇹 🇳🇱 🇧🇪 🇨🇭 🇦🇹 🇸🇪 🇳🇴 🇩🇰 🇫🇮 🇵🇱 🇨🇿 🇬🇷 🇹🇷 🇦🇪 🇶🇦 🇸🇦 🇴🇲 🇯🇴 🇪🇬 🇲🇦 🇿🇦 🇳🇬 🇰🇪 🇮🇳 🇨🇳 🇯🇵 🇰🇷 🇸🇬 🇹🇭 🇦🇺 🇳🇿 🇲🇽 🇦🇷 🇨🇴 🇨🇱 🇵🇪 🇺🇦 🇷🇴 🇭🇺 🇮🇸 🇪🇺 🏳️‍🌈 🏴‍☠️ 🏁 🚩" }
];
/** Palavras-chave para a procura (en + pt), nas mais usadas. */
const WORDS: Record<string, string> = {
  "😂": "laugh lol riso rir", "🤣": "laugh rofl rir", "😍": "love heart eyes amor", "🥰": "love amor", "😘": "kiss beijo", "😊": "smile happy sorriso feliz",
  "😭": "cry chorar", "😢": "sad cry triste", "😡": "angry zangado", "😱": "scream shock medo", "🤔": "think pensar", "😎": "cool fixe", "🥳": "party festa",
  "👍": "ok like yes sim", "👎": "no não", "👏": "clap aplauso bravo", "🙏": "thanks please obrigado por favor", "💪": "strong forte", "👋": "hi hello bye olá adeus",
  "❤️": "love heart amor coração", "🔥": "fire hot lit fogo", "✨": "sparkle magic brilho", "💯": "100 perfect perfeito", "🎉": "party celebrate festa",
  "✈️": "plane flight avião voo", "🧳": "luggage bag mala", "🗺️": "map mapa", "📍": "pin location local", "🏖️": "beach praia", "🏛️": "museum museu",
  "🍕": "pizza", "🍔": "burger hamburguer", "☕": "coffee café", "🍷": "wine vinho", "🍺": "beer cerveja", "🥂": "cheers brinde", "🍜": "food noodles comida",
  "🌅": "sunset sunrise pôr do sol", "🌧️": "rain chuva", "☀️": "sun sol", "🚆": "train comboio", "🚌": "bus autocarro", "🚕": "taxi", "📸": "photo foto camera",
  "🇵🇹": "portugal", "🇬🇧": "uk england inglaterra", "🇧🇷": "brasil brazil", "🇦🇴": "angola", "🇫🇷": "france frança", "🇪🇸": "spain espanha"
};
const LAST = "sgct:emoji-recent";

export function EmojiPicker({ onPick, labels }: { onPick: (e: string) => void; labels: { search: string; recent: string; cats: Record<string, string> } }) {
  const [cat, setCat] = useState("smileys");
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => { try { setRecent(JSON.parse(localStorage.getItem(LAST) ?? "[]")); } catch { /* ignorar */ } }, []);
  const pick = (e: string) => {
    onPick(e);
    const r = [e, ...recent.filter((x) => x !== e)].slice(0, 24);
    setRecent(r); try { localStorage.setItem(LAST, JSON.stringify(r)); } catch { /* ignorar */ }
  };
  const shown = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (k) return CATS.flatMap((c) => c.e.split(" ")).filter((e, i, a) => a.indexOf(e) === i && (WORDS[e] ?? "").includes(k)).concat(CATS.find((c) => c.k.startsWith(k))?.e.split(" ") ?? []);
    if (cat === "recent") return recent;
    return CATS.find((c) => c.k === cat)?.e.split(" ") ?? [];
  }, [cat, q, recent]);
  return (
    <div className="em" role="dialog" aria-label="Emoji" onMouseDown={(e) => e.preventDefault()}>
      <input className="em-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={labels.search} aria-label={labels.search} onMouseDown={(e) => e.stopPropagation()} />
      <div className="em-grid">{shown.map((e, i) => <button key={`${e}-${i}`} type="button" onClick={() => pick(e)} aria-label={e}>{e}</button>)}</div>
      <div className="em-cats" role="tablist">
        {recent.length > 0 && <button type="button" className={cat === "recent" && !q ? "on" : ""} onClick={() => { setCat("recent"); setQ(""); }} aria-label={labels.recent} title={labels.recent}>🕘</button>}
        {CATS.map((c) => <button key={c.k} type="button" className={cat === c.k && !q ? "on" : ""} onClick={() => { setCat(c.k); setQ(""); }} aria-label={labels.cats[c.k] ?? c.k} title={labels.cats[c.k] ?? c.k}>{c.icon}</button>)}
      </div>
    </div>
  );
}

/** Insere texto na posição do cursor de um campo controlado. */
export function insertAt(el: HTMLInputElement | HTMLTextAreaElement | null, value: string, add: string, set: (v: string) => void, max = 1000) {
  // Sem foco (ex.: no telemóvel, ao tocar no painel) acrescenta no fim; com foco, onde está o cursor.
  const focused = typeof document !== "undefined" && el && document.activeElement === el;
  const s = focused ? el.selectionStart ?? value.length : value.length, e = focused ? el.selectionEnd ?? value.length : value.length;
  const next = (value.slice(0, s) + add + value.slice(e)).slice(0, max);
  set(next);
  // No telemóvel não volta a abrir o teclado (tapava os emojis); no computador o cursor fica a seguir ao emoji.
  requestAnimationFrame(() => { if (el && !("ontouchstart" in window)) { const p = s + add.length; el.focus({ preventScroll: true }); el.setSelectionRange(p, p); } });
}

/** Botão 😊 que abre o painel por cima do campo. */
export function EmojiButton({ target, value, set, max, labels }: {
  target: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>; value: string; set: (v: string) => void; max?: number;
  labels: { emoji: string; search: string; recent: string; cats: Record<string, string> };
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const out = (e: MouseEvent | TouchEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", out); document.addEventListener("touchstart", out);
    return () => { document.removeEventListener("mousedown", out); document.removeEventListener("touchstart", out); };
  }, [open]);
  return (
    <span className="em-wrap" ref={box}>
      <button type="button" className={`em-btn ${open ? "on" : ""}`} aria-label={labels.emoji} title={labels.emoji} aria-expanded={open} onClick={() => setOpen(!open)}>😊</button>
      {open && <EmojiPicker labels={labels} onPick={(e) => insertAt(target.current, value, e, set, max)} />}
    </span>
  );
}

/** Textos do painel de emojis a partir do dicionário. */
export const emojiLabels = (t: { emEmoji: string; emSearch: string; emRecent: string; emCats: Record<string, string> }) => ({ emoji: t.emEmoji, search: t.emSearch, recent: t.emRecent, cats: t.emCats });
