#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║     AI Accounting RAG - Starting...      ║${NC}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# Catatan: tidak perlu PostgreSQL / Ollama lokal lagi.
# - Database relasional : SQLite (built-in)
# - Vector store        : Qdrant cloud/embedded (sesuai backend/.env)
# - LLM                 : Ollama Cloud (ollama.com) kalau OLLAMA_API_KEY diisi

# ── 1. Backend ─────────────────────────────────────────────
echo -e "${YELLOW}[1/2]${NC} Menyalakan Backend (uvicorn)..."
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

# ── 2. Frontend ────────────────────────────────────────────
echo -e "${YELLOW}[2/2]${NC} Menyalakan Frontend (Vite)..."
cd "$PROJECT_DIR/frontend"
npm run dev >/tmp/accounting-frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 2

if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "      ${GREEN}✓${NC} Frontend running — ${CYAN}http://localhost:5173${NC}"
else
    echo -e "      ${RED}✗${NC} Frontend gagal. Cek: tail /tmp/accounting-frontend.log"
fi

# ── Done ───────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║          Semua Sudah Ready!              ║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Landing Page :${NC}  http://localhost:5173"
echo -e "  ${BOLD}Backend API  :${NC}  http://localhost:8000"
echo -e "  ${BOLD}Swagger Docs :${NC}  http://localhost:8000/docs"
echo ""
echo -e "  ${YELLOW}Log backend :${NC}  tail -f /tmp/accounting-backend.log"
echo -e "  ${YELLOW}Log frontend:${NC}  tail -f /tmp/accounting-frontend.log"
echo ""
echo -e "  ${RED}Untuk berhenti: Ctrl+C atau kill $BACKEND_PID $FRONTEND_PID${NC}"
echo ""

wait
