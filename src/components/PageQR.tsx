"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** QR code of the current page, pinned to the hero's bottom corner on desktop,
 *  so a visitor on a computer can scan and continue on their phone. */
export default function PageQR({ label }: { label: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    const url = window.location.origin + window.location.pathname;
    QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0b0b0d", light: "#ffffff" } })
      .then(setSvg).catch(() => {});
  }, []);
  if (!svg) return null;
  return (
    <figure className="pqr" aria-label={label}>
      <span className="pqr-img" role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: svg }} />
      <figcaption>{label}</figcaption>
    </figure>
  );
}
