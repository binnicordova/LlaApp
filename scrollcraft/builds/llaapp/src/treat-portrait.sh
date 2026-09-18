#!/usr/bin/env bash
# Grade a portrait into the page's world: cold, desaturated, lifted blacks so it
# sits on #06080e instead of punching a bright hole in it. The CSS masks it to a
# circle, so this only has to get the crop and the grade right.
#
#   bash src/treat-portrait.sh ~/Downloads/binni.jpg
set -euo pipefail
IN="${1:?usage: treat-portrait.sh <photo>}"
OUT_BUILD="assets/founder.jpg"
OUT_SITE="/Users/binnicordova/github/LlaApp/public/assets/founder.jpg"

ffmpeg -v error -y -i "$IN" -vf "\
crop='min(iw,ih)':'min(iw,ih)':'(iw-min(iw,ih))/2':'(ih-min(iw,ih))/4',\
scale=224:224:flags=lanczos,\
hue=s=0.28,\
eq=contrast=1.06:brightness=-0.015:gamma=0.98,\
curves=r='0/0.015 0.5/0.48 1/0.96':g='0/0.02 0.5/0.50 1/0.98':b='0/0.055 0.5/0.55 1/1'" \
  -q:v 3 "$OUT_BUILD"

cp "$OUT_BUILD" "$OUT_SITE"
echo "treated -> $OUT_BUILD and $OUT_SITE"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$OUT_BUILD"
