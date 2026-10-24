"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

/** [frase com *destaques*, entrar ou criar conta, continuar sem conta, fechar] */
const TX: Record<string, [string, string, string, string]> = {
  pt: ["Descubra *novas cidades* com o VOYBU, o seu companheiro de viagem e de *momentos inesquecíveis* com os seus amigos.", "Entrar ou criar conta", "Continuar sem conta", "Fechar"],
  en: ["Discover *new cities* with VOYBU, your companion for travel and *unforgettable moments* with your friends.", "Log in or sign up", "Continue without an account", "Close"],
  es: ["Descubre *nuevas ciudades* con VOYBU, tu compañero de viaje y de *momentos inolvidables* con tus amigos.", "Inicia sesión o regístrate", "Continuar sin cuenta", "Cerrar"],
  fr: ["Découvrez *de nouvelles villes* avec VOYBU, votre compagnon de voyage et de *moments inoubliables* entre amis.", "Se connecter ou s'inscrire", "Continuer sans compte", "Fermer"],
  de: ["Entdecken Sie *neue Städte* mit VOYBU – Ihrem Begleiter für Reisen und *unvergessliche Momente* mit Freunden.", "Anmelden oder registrieren", "Ohne Konto fortfahren", "Schließen"],
  it: ["Scopri *nuove città* con VOYBU, il tuo compagno di viaggio e di *momenti indimenticabili* con gli amici.", "Accedi o registrati", "Continua senza account", "Chiudi"],
  zh: ["与 VOYBU 一起探索*新城市*——您的旅行伙伴，与朋友共享*难忘时刻*。", "登录或注册", "不登录继续浏览", "关闭"],
  ar: ["اكتشف *مدنًا جديدة* مع VOYBU، رفيقك في السفر وفي *لحظات لا تُنسى* مع أصدقائك.", "تسجيل الدخول أو إنشاء حساب", "المتابعة دون حساب", "إغلاق"],
  ja: ["VOYBUで*新しい街*を発見。旅の相棒として、友だちとの*忘れられない瞬間*を。", "ログインまたは登録", "アカウントなしで続ける", "閉じる"],
  ko: ["VOYBU와 함께 *새로운 도시*를 발견하세요. 여행의 동반자이자 친구들과의 *잊지 못할 순간*을 함께합니다.", "로그인 또는 가입", "계정 없이 계속", "닫기"],
  ru: ["Открывайте *новые города* с VOYBU — вашим спутником в путешествиях и *незабываемых моментах* с друзьями.", "Войти или зарегистрироваться", "Продолжить без аккаунта", "Закрыть"],
  tr: ["VOYBU ile *yeni şehirler* keşfedin; seyahatlerde ve arkadaşlarınızla *unutulmaz anlarda* yol arkadaşınız.", "Giriş yap veya kaydol", "Hesapsız devam et", "Kapat"]
};

const SEEN = "sgct:welcome";
/** Páginas onde o ecrã não aparece: área pessoal (já tem entrada), roteiro pago, pagamento, chegada, áreas profissionais e textos legais. */
const SKIP = /^\/[a-z]{2}\/(wallet|tour|success|arrive|admin|merchants|agents|legal|support|contact)(\/|$)/;
export const WELCOME_DONE = "sgct:welcome-done";

/** Guarda a página atual para voltar a ela depois de entrar. */
export function rememberReturn() {
  try { localStorage.setItem("sgct:after-signin", JSON.stringify({ to: location.pathname + location.search + location.hash, at: Date.now() })); } catch { /* ignorar */ }
}

/**
 * Ecrã de boas-vindas (estilo das apps sociais): ao chegar ao site sem sessão, convida a entrar ou criar conta.
 * Fecha-se com ✕ ou "Continuar sem conta" para ver o conteúdo partilhado; aparece uma vez por sessão do navegador.
 */
export function Welcome({ locale }: { locale: string }) {
  const path = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const w = window as unknown as { __sgctWelcome?: boolean };
    let seen = false; try { seen = Boolean(sessionStorage.getItem(SEEN)); } catch { seen = true; }
    if (seen || SKIP.test(path)) return;
    w.__sgctWelcome = true; // o aviso de idioma espera por este ecrã
    let alive = true;
    fetch("/api/me/status", { cache: "no-store" }).then((r) => r.json()).then((j: { signed?: boolean }) => {
      if (!alive) return;
      if (j.signed) finish(false); else setOpen(true);
    }).catch(() => alive && finish(false));
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") finish(true); };
    window.addEventListener("keydown", k);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", k); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function finish(mark: boolean) {
    if (mark) { try { sessionStorage.setItem(SEEN, "1"); } catch { /* ignorar */ } }
    (window as unknown as { __sgctWelcome?: boolean }).__sgctWelcome = false;
    window.dispatchEvent(new Event(WELCOME_DONE));
    setOpen(false);
  }
  if (!open) return null;
  const [line, signIn, skip, close] = TX[locale] ?? TX.en;
  const parts = line.split("*");
  return (
    <div className="wc" role="dialog" aria-modal="true" aria-labelledby="wc-h">
      <button type="button" className="wc-x press" onClick={() => finish(true)} aria-label={close}><X size={22} aria-hidden="true" /></button>
      <div className="wc-in">
        <div className="wc-brand" aria-label="VOYBU">
          <span className="wc-mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><path fillRule="evenodd" d="M12 2a7 7 0 0 0-7 7c0 4.9 5.6 11.6 6.3 12.4a.9.9 0 0 0 1.4 0C13.4 20.6 19 13.9 19 9a7 7 0 0 0-7-7zm0 4.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z" /></svg></span>
          <span className="wc-word">VOY<span>BU</span></span>
        </div>
        <h1 id="wc-h" className="wc-h">{parts.map((p, i) => (i % 2 ? <em key={i} className={i === 1 ? "g1" : "g2"}>{p}</em> : <span key={i}>{p}</span>))}</h1>
        <a className="wc-btn press" href={`/${locale}/wallet?signin=1`} onClick={() => { rememberReturn(); try { sessionStorage.setItem(SEEN, "1"); } catch { /* ignorar */ } }}>{signIn}</a>
        <button type="button" className="wc-skip press" onClick={() => finish(true)}>{skip}</button>
      </div>
    </div>
  );
}
