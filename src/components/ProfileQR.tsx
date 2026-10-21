"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Download, QrCode, Share2, X } from "lucide-react";
import type { Dict } from "@/i18n/dictionaries";
import Portal from "@/components/Portal";
import { toast } from "@/lib/toast";

type Me = { handle: string; name: string; photo: string | null };

const urlOf = (locale: string, handle: string) => `${window.location.origin}/${locale}/u/${handle}`;

/** Mini QR on the wallet's stories row: tap to show the full card for a new follower to scan. */
export function QrTile({ t, locale, me }: { t: Dict; locale: string; me: Me }) {
  const [open, setOpen] = useState(false);
  const [svg, setSvg] = useState("");
  useEffect(() => {
    QRCode.toString(urlOf(locale, me.handle), { type: "svg", margin: 0, errorCorrectionLevel: "L", color: { dark: "#0b0b0d", light: "#ffffff" } }).then(setSvg).catch(() => {});
  }, [locale, me.handle]);
  return (
    <>
      <div className="st-item qr-tile" role="listitem">
        <button type="button" className="qr-mini press" onClick={() => setOpen(true)} aria-label={t.qrMy} aria-haspopup="dialog">
          {svg ? <span className="qr-mini-img" dangerouslySetInnerHTML={{ __html: svg }} /> : <QrCode size={30} aria-hidden="true" />}
          <i aria-hidden="true"><QrCode size={11} strokeWidth={2.6} /></i>
        </button>
        <small>{t.qrMy}</small>
      </div>
      {open && <QrSheet t={t} locale={locale} me={me} onClose={() => setOpen(false)} />}
    </>
  );
}

export function QrSheet({ t, locale, me, onClose }: { t: Dict; locale: string; me: Me; onClose: () => void }) {
  const [svg, setSvg] = useState("");
  const url = urlOf(locale, me.handle);
  useEffect(() => {
    // H = survives the brand mark in the middle.
    QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "H", color: { dark: "#0b0b0d", light: "#ffffff" } }).then(setSvg).catch(() => {});
  }, [url]);

  /** PNG of the whole card (QR + name), for sharing in chats where a link is not enough. */
  const png = async () => {
    const S = 1080, c = document.createElement("canvas"); c.width = S; c.height = S * 1.25;
    const x = c.getContext("2d")!;
    const g = x.createLinearGradient(0, 0, S, c.height); g.addColorStop(0, "#3b5bfd"); g.addColorStop(1, "#a259ff");
    x.fillStyle = g; x.fillRect(0, 0, S, c.height);
    x.fillStyle = "#fff"; x.beginPath(); x.roundRect(90, 110, S - 180, S - 80, 60); x.fill();
    const qr = document.createElement("canvas");
    await QRCode.toCanvas(qr, url, { width: S - 340, margin: 0, errorCorrectionLevel: "H" });
    x.drawImage(qr, 170, 190);
    x.fillStyle = "#fff"; x.textAlign = "center";
    x.font = "800 64px system-ui, -apple-system, sans-serif"; x.fillText(me.name, S / 2, S + 150);
    x.font = "600 44px system-ui, -apple-system, sans-serif"; x.globalAlpha = .8; x.fillText(`@${me.handle} · Self Guided City Tour`, S / 2, S + 220);
    return await new Promise<Blob>((r) => c.toBlob((b) => r(b!), "image/png"));
  };
  const share = async () => {
    try {
      const file = new File([await png()], `${me.handle}-qr.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: me.name, text: `${t.qrScanMe} ${url}` });
      else if (navigator.share) await navigator.share({ title: me.name, url });
      else { await navigator.clipboard.writeText(url); toast(t.qrCopied, { icon: "🔗" }); }
    } catch { /* cancelled */ }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(url); toast(t.qrCopied, { icon: "🔗" }); } catch { /* no clipboard */ } };
  const save = async () => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(await png()); a.download = `${me.handle}-qr.png`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  return (
    <Portal>
      <div className="sheet-bg qr-bg" onClick={onClose}>
        <div className="sheet qr-sheet" role="dialog" aria-label={t.qrMy} onClick={(e) => e.stopPropagation()}>
          <button className="qr-x press" onClick={onClose} aria-label="✕"><X size={18} aria-hidden="true" /></button>
          <div className="qr-card">
            <div className="qr-code" role="img" aria-label={`QR · @${me.handle}`}>
              {svg && <span dangerouslySetInnerHTML={{ __html: svg }} />}
              <span className="qr-av">{me.photo ? <img src={me.photo} alt="" /> : <b>{me.name.slice(0, 1).toUpperCase()}</b>}</span>
            </div>
            <b className="qr-name">{me.name}</b>
            <span className="qr-handle">@{me.handle}</span>
          </div>
          <p className="qr-hint">{t.qrHint}</p>
          <div className="qr-acts">
            <button className="qr-act press" onClick={share}><Share2 size={20} aria-hidden="true" /><span>{t.qrShare}</span></button>
            <button className="qr-act press" onClick={copy}><Copy size={20} aria-hidden="true" /><span>{t.qrCopy}</span></button>
            <button className="qr-act press" onClick={save}><Download size={20} aria-hidden="true" /><span>{t.qrSave}</span></button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
