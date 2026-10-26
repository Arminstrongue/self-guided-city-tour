/** Imagem do site (responsiva, com foco nas pessoas) e faixa de imagem no topo das páginas. Sem JS no cliente. */
import { SITE_IMAGES, siteImg, type SiteImageKey } from "@/lib/site-images";

export function SiteImage({ k, alt, className, sizes = "100vw", eager }: { k: SiteImageKey; alt: string; className?: string; sizes?: string; eager?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={siteImg(k)} srcSet={`${siteImg(k, 640)} 640w, ${siteImg(k)} 1280w`} sizes={sizes} alt={alt}
      loading={eager ? "eager" : "lazy"} decoding="async" style={{ objectPosition: SITE_IMAGES[k].fp }} />
  );
}

/** Faixa larga com cantos arredondados, logo abaixo do cabeçalho de uma página. */
export function PageBanner({ k, alt }: { k: SiteImageKey; alt: string }) {
  return <figure className="sbn"><SiteImage k={k} alt={alt} sizes="(min-width: 1100px) 1100px, 100vw" eager /></figure>;
}
