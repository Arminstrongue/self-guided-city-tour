"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** QR code of the current page: on desktop pinned to the hero corner (scan to continue on the phone);
 *  on phones a small code in the hero corner — tap to share, or show it to a friend. */
export default function PageQR({ label, mobileLabel }: { label: string; mobileLabel?: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    const url = window.location.origin + window.location.pathname;
    QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0b0b0d", light: "#ffffff" } })
      .then(setSvg).catch(() => {});
  }, []);
  if (!svg) return null;
  return (
    <figure className="pqr" aria-label={label} onClick={() => {
      // No telemóvel, tocar no código abre a partilha nativa (WhatsApp, Mensagens…).
      const url = window.location.origin + window.location.pathname;
      if (navigator.share && window.matchMedia("(pointer:coarse)").matches) navigator.share({ title: "VOYBU", url }).catch(() => {});
    }}>
      <span className="pqr-img" role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: svg }} />
      <figcaption><span className="pqr-d">{label}</span><span className="pqr-m">{mobileLabel ?? label}</span></figcaption>
    </figure>
  );
}
