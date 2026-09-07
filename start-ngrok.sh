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
    [ -n "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null || true
    [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null || true
    pkill -f cloudflared 2>/dev/null || true
    echo -e "${GREEN}All stopped.${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║  Finora - Cloudflare Tunnel             ║${NC}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Backend ───────────────────────────────────────
echo -e "${YELLOW}[Backend]${NC} Starting uvicorn..."
cd "$PROJECT_DIR/backend"
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 >/tmp/accounting-backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "      ${GREEN}✓${NC} Backend running — ${CYAN}http://localhost:8000${NC}"
else
    echo -e "      ${RED}✗${NC} Backend gagal. Cek: tail /tmp/accounting-backend.log"
fi

# ── Frontend ──────────────────────────────────────
echo -e "${YELLOW}[Frontend]${NC} Starting Vite..."
cd "$PROJECT_DIR/frontend"
npm run dev >/tmp/accounting-frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 2

if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "      ${GREEN}✓${NC} Frontend running — ${CYAN}http://localhost:5173${NC}"
else
    echo -e "      ${RED}✗${NC} Frontend gagal. Cek: tail /tmp/accounting-frontend.log"
fi

# ── Cloudflare Tunnel ─────────────────────────────
echo -e "${YELLOW}[Tunnel]${NC} Starting Cloudflare Tunnel..."
pkill -f cloudflared 2>/dev/null || true
sleep 1
cloudflared tunnel --url http://localhost:5173 >/tmp/accounting-tunnel.log 2>&1 &
TUNNEL_PID=$!

TUNNEL_URL=""
for i in {1..15}; do
    TUNNEL_URL=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" /tmp/accounting-tunnel.log 2>/dev/null | head -1)
    if [ -n "$TUNNEL_URL" ]; then break; fi
    sleep 2
done

# ── Done ──────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║            Semua Sudah Ready!            ║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Local:${NC}"
echo -e "  • Frontend : ${CYAN}http://localhost:5173${NC}"
echo -e "  • Backend  : ${CYAN}http://localhost:8000${NC}"
echo -e "  • Swagger  : ${CYAN}http://localhost:8000/docs${NC}"
echo ""
if [ -n "$TUNNEL_URL" ]; then
    echo -e "  ${BOLD}${GREEN}Public URL (Cloudflare Tunnel):${NC}"
    echo -e "  ${BOLD}${CYAN}$TUNNEL_URL${NC}"
    echo ""
    echo -e "  ${YELLOW}Note:${NC}"
    echo -e "  - Direct access, no warning page"
    echo -e "  - URL changes on each restart"
    echo ""
fi
echo -e "  ${YELLOW}Logs:${NC}"
echo -e "  • backend:   tail -f /tmp/accounting-backend.log"
echo -e "  • frontend:  tail -f /tmp/accounting-frontend.log"
echo -e "  • tunnel:    tail -f /tmp/accounting-tunnel.log"
echo ""
echo -e "  ${RED}To stop: Ctrl+C${NC}"
echo ""

wait
