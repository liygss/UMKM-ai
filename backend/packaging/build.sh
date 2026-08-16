#!/bin/bash
# Build backend jadi binary (PyInstaller onedir).
# Hasil: backend/dist/backend/ — di-copy oleh electron-builder ke resources.
# Cross-platform: jalan di macOS/Linux (venv/bin) dan Windows (venv/Scripts).
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) VENV_PY="$PROJECT_DIR/venv/Scripts/python.exe" ;;
  *)                   VENV_PY="$PROJECT_DIR/venv/bin/python" ;;
esac

echo "==> Menggunakan Python: $VENV_PY"
echo "==> Memasang pyinstaller..."
"$VENV_PY" -m pip install --quiet pyinstaller

echo "==> Membangun binary backend dengan PyInstaller..."
"$VENV_PY" -m PyInstaller --clean --noconfirm packaging/accounting.spec

echo "==> Selesai. Binary di $PROJECT_DIR/dist/backend/"
