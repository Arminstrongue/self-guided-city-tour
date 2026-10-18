"use client";
/** Avaliação no fim do roteiro: estrelas, "recomendaria a um amigo?" (NPS 0–10) e comentário opcional. */
import { useEffect, useState } from "react";
import { fmt, type Dict, type Locale } from "@/i18n/dictionaries";
import { track } from "@/lib/track";

export function RatingCard({ cityId, cityLabel, t, locale, onShare }: { cityId: string; cityLabel: string; t: Dict; locale: Locale; onShare?: () => void }) {
  const [stars, setStars] = useState(0);
  const [nps, setNps] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(`/api/ratings?city=${cityId}`).then((r) => r.json()).then((j) => {
      if (!live) return;
      if (j?.rating) { setStars(j.rating.stars); setNps(j.rating.nps); setState("done"); }
      setLoaded(true);
    }).catch(() => setLoaded(true));
    return () => { live = false; };
  }, [cityId]);

  async function send() {
    if (!stars) return;
    setState("sending");
    try {
      const r = await fetch("/api/ratings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ city: cityId, stars, nps, comment, locale }) });
      setState(r.ok ? "done" : "error");
    } catch { setState("error"); }
  }

  if (!loaded) return null;
  if (state === "done") {
    return (
      <div className="card stack rate done" style={{ gap: 8, padding: 16 }}>
        <span className="stars big-stars" aria-label={`${stars} / 5`}>{[1, 2, 3, 4, 5].map((k) => <span key={k} className={k <= stars ? "" : "off"}>★</span>)}</span>
        <b>{t.rateThanks}</b>
        <div className="links-row">
          {stars >= 4 && onShare && <button className="btn tram press" style={{ padding: "10px 16px", fontSize: 15 }} onClick={onShare}>{t.share}</button>}
          <button className="link-btn" onClick={() => setState("idle")}>{t.rateEdit}</button>
        </div>
      </div>
    );
  }
  return (
    <div className="card stack rate" style={{ gap: 12, padding: 16 }}>
      <b style={{ fontSize: 18 }}>{fmt(t.rateTitle, { city: cityLabel })}</b>
      <p className="hint">{t.rateSub}</p>
      <div className="star-pick" role="radiogroup" aria-label={fmt(t.rateTitle, { city: cityLabel })}>
        {[1, 2, 3, 4, 5].map((k) => (
          <button key={k} role="radio" aria-checked={stars === k} aria-label={`${k} / 5`} className={k <= stars ? "on" : ""}
            onClick={() => { if (!stars) track("rating_open", { city: cityId }); setStars(k); }}>★</button>
        ))}
      </div>
      {stars > 0 && (
        <>
          <span className="label">{t.npsQ}</span>
          <div className="nps" role="radiogroup" aria-label={t.npsQ}>
            {Array.from({ length: 11 }, (_, n) => (
              <button key={n} role="radio" aria-checked={nps === n} className={`num ${nps === n ? "on" : ""}`} onClick={() => setNps(n)}>{n}</button>
            ))}
          </div>
          <div className="row-between hint"><span>{t.npsLo}</span><span>{t.npsHi}</span></div>
          <textarea rows={3} maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={stars >= 4 ? t.rateCommentGood : t.rateComment} />
          <button className="btn press" disabled={state === "sending"} onClick={() => void send()}>{t.rateSend}</button>
          {state === "error" && <p className="hint bad-txt">{t.rateError}</p>}
        </>
      )}
    </div>
  );
}
