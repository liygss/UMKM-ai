#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping all services...${NC}"
    [ -n "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null
    [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null
    [ -n "$NGROK_PID" ] && kill $NGROK_PID 2>/dev/null
    echo -e "${GREEN}All stopped.${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║   AI UMKM - Starting with Ngrok Tunnel...   ║${NC}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ── 1. PostgreSQL ──────────────────────────────────────────
echo -e "${YELLOW}[1/5]${NC} Cek PostgreSQL..."
if pg_isready -q 2>/dev/null; then
    echo -e "      ${GREEN}✓${NC} PostgreSQL sudah jalan"
else
    echo -e "      Menyalakan PostgreSQL..."
    brew services start postgresql@16 >/dev/null 2>&1 || true
    sleep 2
    if pg_isready -q 2>/dev/null; then
        echo -e "      ${GREEN}✓${NC} PostgreSQL berhasil dinyalakan"
    else
        echo -e "      ${RED}✗${NC} PostgreSQL gagal. Jalankan: brew services start postgresql@16"
    fi
fi

# ── 2. Ollama ──────────────────────────────────────────────
echo -e "${YELLOW}[2/5]${NC} Cek Ollama..."
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo -e "      ${GREEN}✓${NC} Ollama sudah jalan"
else
    echo -e "      Menyalakan Ollama..."
    ollama serve >/dev/null 2>&1 &
    sleep 3
    if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo -e "      ${GREEN}✓${NC} Ollama berhasil dinyalakan"
    else
        echo -e "      ${RED}✗${NC} Ollama gagal. Buka app Ollama atau jalankan: ollama serve"
    fi
fi

# ── 3. Backend ─────────────────────────────────────────────
echo -e "${YELLOW}[3/5]${NC} Menyalakan Backend (uvicorn)..."
cd "$PROJECT_DIR/backend"
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 >/tmp/accounting-backend.log 2>&1 &
BACKEND_PID=$!
sleep 2

if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "      ${GREEN}✓${NC} Backend running — ${CYAN}http://localhost:8000${NC}"
else
    echo -e "      ${RED}✗${NC} Backend gagal. Cek: tail /tmp/accounting-backend.log"
fi

# ── 4. Frontend ────────────────────────────────────────────
echo -e "${YELLOW}[4/5]${NC} Menyalakan Frontend (Vite)..."
cd "$PROJECT_DIR/frontend"
npm run dev >/tmp/accounting-frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 2

if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "      ${GREEN}✓${NC} Frontend running — ${CYAN}http://localhost:5173${NC}"
else
    echo -e "      ${RED}✗${NC} Frontend gagal. Cek: tail /tmp/accounting-frontend.log"
fi

# ── 5. Ngrok Tunnel ────────────────────────────────────────
echo -e "${YELLOW}[5/5]${NC} Menyalakan Ngrok tunnel..."
ngrok http 5173 --log=stdout >/tmp/accounting-ngrok.log 2>&1 &
NGROK_PID=$!
sleep 3

NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])" 2>/dev/null || echo "")

if [ -n "$NGROK_URL" ]; then
    echo -e "      ${GREEN}✓${NC} Ngrok tunnel active"
else
    echo -e "      ${RED}✗${NC} Ngrok gagal. Cek: tail /tmp/accounting-ngrok.log"
fi

# ── Done ───────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║            Semua Sudah Ready!                ║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Local Frontend :${NC}  http://localhost:5173"
echo -e "  ${BOLD}Local Backend  :${NC}  http://localhost:8000"
echo -e "  ${BOLD}Swagger Docs   :${NC}  http://localhost:8000/docs"
echo ""
if [ -n "$NGROK_URL" ]; then
    echo -e "  ${BOLD}${GREEN}Public URL (share ini):${NC}"
    echo -e "  ${CYAN}${BOLD}  $NGROK_URL${NC}"
    echo ""
    echo -e "  ${YELLOW}Catatan:${NC}"
    echo -e "  - Orang lain klik link, akan ada warning page ngrok"
    echo -e "  - Klik 'Visit Site' untuk masuk"
    echo -e "  - URL berubah setiap restart script"
fi
echo ""
echo -e "  ${YELLOW}Log backend :${NC}  tail -f /tmp/accounting-backend.log"
echo -e "  ${YELLOW}Log frontend:${NC}  tail -f /tmp/accounting-frontend.log"
echo -e "  ${YELLOW}Log ngrok   :${NC}  tail -f /tmp/accounting-ngrok.log"
echo ""
echo -e "  ${RED}Untuk berhenti: Ctrl+C${NC}"
echo ""

wait
