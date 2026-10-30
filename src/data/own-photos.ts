/**
 * Fotografias próprias da VOYBU (tiradas pela VOYBU). Sem caras identificáveis, crianças nem matrículas:
 * as fotografias com pessoas foram recortadas ou ficaram de fora.
 *
 * Organização (pela ordem do roteiro):
 *   private/own/<cidade>/stops/<n>-<paragem>/<foto>.webp     → só com passe (servidas por /api/own-photo)
 *   private/own/<cidade>/museums/<museu>/<foto>.webp          → só com passe
 *   public/img/own/<cidade>/cover/<n>-<foto>.webp             → capas públicas da cidade
 * Cada fotografia tem a versão grande (1600 px) e a pequena (-480).
 */
export type OwnPhoto = { file: string; w: number; h: number; pt: string; en: string };
export const OWN_CREDIT = "VOYBU · Arminstrongue Huambo";

/** Por cidade e paragem, pela ordem do roteiro (ids de src/data/cities.ts). */
export const OWN_STOP_PHOTOS: Record<string, Record<string, OwnPhoto[]>> = {
  lon: {
    // 1. Westminster e Big Ben
    westminster: [
      { file: "stops/1-westminster/parliament", w: 1280, h: 820, pt: "O Big Ben e o Palácio de Westminster", en: "Big Ben and the Palace of Westminster" },
      { file: "stops/1-westminster/parliament-square", w: 1280, h: 545, pt: "Parliament Square, com o Big Ben à esquerda", en: "Parliament Square, with Big Ben on the left" },
      { file: "stops/1-westminster/big-ben-bus", w: 450, h: 700, pt: "O Big Ben e um autocarro vermelho de dois andares", en: "Big Ben and a red double-decker bus" },
      { file: "stops/1-westminster/thames", w: 1280, h: 960, pt: "O Parlamento e a ponte de Westminster vistos do outro lado do Tamisa", en: "Parliament and Westminster Bridge from across the Thames" },
      { file: "stops/1-westminster/london-eye-bridge", w: 1024, h: 760, pt: "A London Eye e o County Hall vistos da ponte de Westminster", en: "The London Eye and County Hall from Westminster Bridge" },
      { file: "stops/1-westminster/london-eye-pier", w: 1280, h: 720, pt: "A London Eye vista do cais de Westminster", en: "The London Eye from Westminster Pier" }
    ],
    // 3. Buckingham Palace (e St James's Park, ao lado)
    buckingham: [
      { file: "stops/3-buckingham/palace", w: 1280, h: 460, pt: "A fachada de Buckingham Palace", en: "The front of Buckingham Palace" },
      { file: "stops/3-buckingham/victoria-memorial", w: 640, h: 610, pt: "O Victoria Memorial em frente ao palácio", en: "The Victoria Memorial in front of the palace" },
      { file: "stops/3-buckingham/st-james-park-lake", w: 960, h: 1280, pt: "O lago de St James's Park, com a London Eye ao fundo", en: "St James's Park lake, with the London Eye in the distance" },
      { file: "stops/3-buckingham/st-james-park-birds", w: 1280, h: 960, pt: "Gansos e galeirões no lago de St James's Park", en: "Geese and coots on St James's Park lake" }
    ]
  }
};

/** Por museu (ids de src/data/museums.ts). */
export const OWN_MUSEUM_PHOTOS: Record<string, OwnPhoto[]> = {
  nhm: [
    { file: "museums/nhm/front", w: 1280, h: 560, pt: "A fachada do Natural History Museum", en: "The front of the Natural History Museum" },
    { file: "museums/nhm/whale", w: 1150, h: 700, pt: "O esqueleto da baleia-azul no Hintze Hall", en: "The blue whale skeleton in Hintze Hall" },
    { file: "museums/nhm/mastodon", w: 505, h: 1090, pt: "Esqueleto de mastodonte", en: "Mastodon skeleton" }
  ],
  science: [
    { file: "museums/science/soyuz", w: 580, h: 740, pt: "Cápsula Soyuz que regressou da Estação Espacial Internacional", en: "Soyuz capsule that returned from the International Space Station" },
    { file: "museums/science/moon", w: 690, h: 440, pt: "Globo gigante na galeria do espaço", en: "Giant globe in the space gallery" },
    { file: "museums/science/locomotive", w: 1040, h: 960, pt: "Locomotiva a vapor do século XIX", en: "19th-century steam locomotive" },
    { file: "museums/science/bubble-car", w: 1280, h: 960, pt: "BMW Isetta e Vespa dos anos 50", en: "1950s BMW Isetta and Vespa" },
    { file: "museums/science/bubble-cars", w: 1280, h: 960, pt: "Microcarros dos anos 50 e 60", en: "1950s and 60s microcars" },
    { file: "museums/science/televisions", w: 1280, h: 960, pt: "As primeiras televisões", en: "Early television sets" },
    { file: "museums/science/telephones", w: 1280, h: 960, pt: "Telefones antigos", en: "Early telephones" },
    { file: "museums/science/phone-box", w: 960, h: 1280, pt: "Cabine telefónica K6 de 1936", en: "1936 K6 telephone kiosk" }
  ]
};

/** Paragens e museus: só com passe da cidade (a rota verifica o acesso). */
export const ownSrc = (city: string, file: string, small = false) => `/api/own-photo/${city}/${file}${small ? "-480" : ""}`;

/** Capas públicas da cidade (página inicial, página da cidade): substituem as fotografias que não são nossas. */
export const OWN_COVERS: Record<string, OwnPhoto[]> = {
  lon: [
    { file: "cover/1-big-ben-parliament", w: 1280, h: 820, pt: "O Big Ben e o Palácio de Westminster", en: "Big Ben and the Palace of Westminster" },
    { file: "cover/2-london-eye", w: 1024, h: 760, pt: "A London Eye vista da ponte de Westminster", en: "The London Eye from Westminster Bridge" },
    { file: "cover/3-big-ben-bus", w: 450, h: 700, pt: "O Big Ben e um autocarro vermelho", en: "Big Ben and a red bus" }
  ]
};
export const coverSrc = (city: string, file: string, small = false) => `/img/own/${city}/${file}${small ? "-480" : ""}.webp`;
