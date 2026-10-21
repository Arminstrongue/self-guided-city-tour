"use client";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Renders children on <body>, so sheets/overlays escape any stacking context
 *  (isolation, backdrop-filter, transform, overflow) of the component that opens them. */
export default function Portal({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => setEl(document.body), []);
  return el ? createPortal(children, el) : null;
}
