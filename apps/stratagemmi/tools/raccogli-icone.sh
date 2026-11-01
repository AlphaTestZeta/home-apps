#!/bin/sh
# Uso (dalla cartella apps/stratagemmi):
#   sh tools/raccogli-icone.sh /percorso/della/repo/Helldivers-2-Stratagems-icons-svg
# Copia tutte le .svg (anche dalle sottocartelle) dentro icons/, tutte nella stessa cartella.
[ -d "$1" ] || { echo "Indica la cartella della repo delle icone"; exit 1; }
find "$1" -name "*.svg" -not -path "*/.git/*" -exec cp {} "$(dirname "$0")/../icons/" \;
echo "Fatto: $(ls "$(dirname "$0")/../icons"/*.svg | wc -l) icone in icons/"
