/** Símbolo VOYBU "Route V": origem menta, percurso coral, destino coral. `reverse` = contornos brancos para fundos escuros. */
/** `ring` = "auto" usa a cor do texto (currentColor), para seguir o tema claro/escuro. */
export function BrandMark({ size = 24, reverse = false, ring: ringMode, className }: { size?: number; reverse?: boolean; ring?: "auto"; className?: string }) {
  const ring = ringMode === "auto" ? "currentColor" : reverse ? "#FFFFFF" : "#102A43";
  return (
    <svg className={className} viewBox="1 1 112 112" width={size} height={size} aria-hidden="true" focusable="false">
      <path d="M18 18L54 102L94 28" fill="none" stroke="#FF6B4A" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="18" r="11" fill="#56D8C3" stroke={ring} strokeWidth="4" />
      <circle cx="94" cy="28" r="13" fill="#FF6B4A" stroke={ring} strokeWidth="4" />
      <circle cx="94" cy="28" r="4" fill="#FFF8F0" />
    </svg>
  );
}
