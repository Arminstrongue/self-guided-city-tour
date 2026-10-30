#!/usr/bin/env python3
"""
Prepara uma fotografia própria da VOYBU: corrige a rotação, recorta (opcional), tira os metadados (incl. GPS)
e grava em WebP 1600 px + 480 px.
  python3 scripts/own-photo.py ENTRADA.jpg private/own/lon/stops/1-westminster/parliament [x0,y0,x1,y1]
Capas públicas: public/img/own/<cidade>/cover/<n>-<nome>. Paragens e museus: private/own/<cidade>/...
Regra: sem caras identificáveis, crianças nem matrículas — recorte ou não use a fotografia.
"""
import os, sys
from PIL import Image, ImageOps
src, out = sys.argv[1], sys.argv[2]
im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
if len(sys.argv) > 3: im = im.crop(tuple(int(v) for v in sys.argv[3].split(",")))
os.makedirs(os.path.dirname(out), exist_ok=True)
big = im.copy(); big.thumbnail((1600, 1600)); big.save(out + ".webp", "WEBP", quality=82, method=6)
small = im.copy(); small.thumbnail((480, 480)); small.save(out + "-480.webp", "WEBP", quality=78, method=6)
print(out, big.size)
