#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
BOLD='\033[1m'

echo ""
echo -e "${BOLD}${RED}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${RED}║    AI Accounting RAG - Stopping...       ║${NC}"
echo -e "${BOLD}${RED}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Backend ─────────────────────────────────────────────────
echo -e "${YELLOW}[1/2]${NC} Menghentikan Backend..."
pkill -f "uvicorn app.main:app" 2>/dev/null && echo -e "      ${GREEN}✓${NC} Backend stopped" || echo -e "      ${YELLOW}~${NC} Backend tidak sedang jalan"

# ── Frontend ────────────────────────────────────────────────
echo -e "${YELLOW}[2/2]${NC} Menghentikan Frontend..."
pkill -f "vite" 2>/dev/null && echo -e "      ${GREEN}✓${NC} Frontend stopped" || echo -e "      ${YELLOW}~${NC} Frontend tidak sedang jalan"

echo ""
echo -e "${GREEN}Semua layanan sudah dihentikan.${NC}"
echo -e "Untuk menyalakan lagi: ${BOLD}./start.sh${NC}"
echo ""
