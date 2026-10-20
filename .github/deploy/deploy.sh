#!/bin/bash
# Se ejecuta EN EL SERVIDOR (cPanel) desde .cpanel.yml tras actualizar el clon de la rama deploy-*.
# Sustituye el código de la app sin tocar .env, .git, node_modules, src/uploads, tmp ni logs,
# instala dependencias y reinicia la app de Node. (El servidor no tiene rsync.)
# Uso: deploy.sh <carpeta de la app relativa al home>
set -euo pipefail

APP_NAME="$1"
APP="/home/i308181/$APP_NAME"
HERE="$(cd "$(dirname "$0")" && pwd)"
SELECTOR=/sbin/cloudlinux-selector

echo "== Desplegando $(cat "$HERE/.deploy-info") en $APP"
[ -d "$APP" ] || { echo "No existe $APP"; exit 1; }

# Borrar el código anterior conservando lo que no viene del repositorio
find "$APP" -mindepth 1 -maxdepth 1 \
  ! -name '.*' ! -name node_modules ! -name src ! -name tmp ! -name '*.log' ! -name '*.sql' \
  -exec rm -rf {} +
if [ -d "$APP/src" ]; then
  find "$APP/src" -mindepth 1 -maxdepth 1 ! -name uploads -exec rm -rf {} +
fi

cp -a "$HERE/app/." "$APP/"
mkdir -p "$APP/src/uploads" "$APP/tmp"

echo "== Instalando dependencias"
"$SELECTOR" install-modules --json --interpreter nodejs --app-root "$APP_NAME"

echo "== Reiniciando la app"
"$SELECTOR" restart --json --interpreter nodejs --app-root "$APP_NAME"

echo "== Despliegue terminado"
