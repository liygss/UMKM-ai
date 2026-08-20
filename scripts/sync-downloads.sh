#!/usr/bin/env bash
# Salin installer desktop yang sudah dibangun ke folder downloads/ (disajikan
# langsung oleh backend via /downloads). Jalankan dari root proyek:
#
#   bash scripts/sync-downloads.sh
#
# Sumber: electron/release/*.dmg, *.exe, *.AppImage (build lokal atau hasil
# unduhan artifact GitHub Actions). Nama file disesuaikan dengan nama kanonik
# yang dipakai landing page (frontend/src/pages/LandingPage.jsx).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/electron/release"
DST="$ROOT/downloads"

mkdir -p "$DST"

copy_file() {
  local src_file="$1"
  local dst_name="$2"
  if [ ! -f "$src_file" ]; then
    echo "SKIP: tidak ada $src_file"
    return
  fi
  cp "$src_file" "$DST/$dst_name"
  echo "OK:   $dst_name ($(du -h "$DST/$dst_name" | cut -f1))"
}

copy_file "$SRC/AI Accounting RAG-1.0.0-arm64.dmg"       "AI.Accounting.RAG-1.0.0-arm64.dmg"
copy_file "$SRC/AI Accounting RAG Setup 1.0.0.exe"        "AI.Accounting.RAG.Setup.1.0.0.exe"
copy_file "$SRC/AI Accounting RAG-1.0.0.AppImage"         "AI.Accounting.RAG-1.0.0.AppImage"

echo
echo "Isi folder downloads/:"
ls -lh "$DST"
