"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** QR code of the current page: on desktop pinned to the hero corner (scan to continue on the phone);
 *  on phones shown under the hero buttons, to show to a friend. */
export default function PageQR({ label, mobileLabel }: { label: string; mobileLabel?: string }) {
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
      <figcaption><span className="pqr-d">{label}</span><span className="pqr-m">{mobileLabel ?? label}</span></figcaption>
    </figure>
  );
}
