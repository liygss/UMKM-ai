# AI Accounting RAG — Aplikasi Desktop

Aplikasi pembukuan & konsultasi pajak UMKM (SAK EMKM) berbasis RAG, dikemas sebagai aplikasi desktop (Electron).

## Arsitektur

```
┌────────────────────────────────────────────────────────────┐
│  Desktop App (Electron)                                    │
│  ├─ main.js      → spawn backend FastAPI (binary/venv)     │
│  ├─ server.js    → serve frontend/dist + proxy /api        │
│  └─ BrowserWindow → UI (React + Vite build)                │
├────────────────────────────────────────────────────────────┤
│  Backend (FastAPI / Python)                                │
│  ├─ SQLite  → data relasional (users, akun, jurnal, SPT)   │
│  ├─ Qdrant  → vector store (embedded lokal / cloud)        │
│  ├─ Ollama Cloud → chat LLM (ollama.com + API key)         │
│  └─ fastembed    → embedding RAG (lokal, gratis)           │
└────────────────────────────────────────────────────────────┘
```

### Alur data di perangkat user
Data tersimpan di folder app-data (mis. macOS: `~/Library/Application Support/AI Accounting RAG/`):

```
data/ai_accounting.db   ← SQLite
data/qdrant/            ← Qdrant embedded (kalau tanpa cloud key)
data/uploads, markdown, chunks, embeddings
logs/
config.json             ← konfigurasi runtime (secret key, dsb.)
```

## Mode Pengembangan (web)

```bash
# 1. Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # isi OLLAMA_API_KEY kalau mau pakai Ollama Cloud
./start.sh             # atau jalankan manual:
#   uvicorn app.main:app --reload --port 8000  (dari backend/)
#   npm run dev                                (dari frontend/)
```

Buka `http://localhost:5173`. Tabel & chart of accounts dibuat otomatis saat startup; knowledge base di-seed otomatis di background.

## Mode Aplikasi Desktop (Electron)

### Persiapan
```bash
# 1. Backend: install dependensi (sekali)
cd backend && source venv/bin/activate && pip install -r requirements.txt

# 2. Frontend: install dependensi & build static
cd frontend && npm install && npm run build

# 3. Electron: install
cd ../electron && npm install
```

### Menjalankan mode dev Electron
```bash
cd frontend && npm run dev   # terminal 1
cd electron && npm run dev   # terminal 2 (jalankan backend via venv)
```

### Membangun installer (DMG/EXE)
Sisipkan API key Ollama Cloud (Opsi A) saat build — key tidak ikut di-commit:
```bash
cd electron
OLLAMA_API_KEY=sk-xxx npm run build
```

Hasil installer di `electron/release/`.

> Catatan: `npm run build` menjalankan: buat `credentials.json` (dari env) → build frontend → build backend (PyInstaller) → electron-builder. Backend harus sudah punya venv + dependensi sebelum di-build.

## Download untuk Windows / Linux

PyInstaller **tidak bisa cross-compile**: binary backend Windows hanya bisa dibuat di Windows, begitu juga macOS di macOS. Solusinya pakai GitHub Actions (build native di 3 OS):

1. Inisialisasi git & push proyek ke GitHub:
   ```bash
   git init && git add -A && git commit -m "init"
   git remote add origin https://github.com/username/ai-accounting-rag.git
   git push -u origin main
   ```
2. Set secret `OLLAMA_API_KEY` di GitHub: **Settings → Secrets and variables → Actions** (nilai key kamu — dipakai untuk di-bundle ke installer).
3. Buka tab **Actions → Build Desktop Installers → Run workflow** (build manual), atau push tag `git tag v1.0.0 && git push origin v1.0.0` (build otomatis + publish ke Releases).
4. Unduh installer dari artifact Actions atau halaman Releases:
   - macOS: `AI Accounting RAG-*.dmg`
   - Windows: `AI Accounting RAG Setup-*.exe`
   - Linux: `AI Accounting RAG-*.AppImage`

Config lengkap ada di `.github/workflows/release.yml` (target mac/win/linux sudah di `electron/package.json`).

## Download langsung dari halaman landing (tanpa GitHub)

Tombol "Unduh" di halaman landing menyajikan installer **langsung dari backend** (`GET /api/downloads/<file>`), bukan redirect ke GitHub:

1. Salin installer yang sudah dibangun ke folder `downloads/` di root proyek:
   ```bash
   bash scripts/sync-downloads.sh
   ```
   (Skrip ini menyalin dari `electron/release/` — DMG lokal, atau EXE/AppImage hasil unduhan dari GitHub Actions — dengan nama kanonik.)
2. Nama file harus persis sama dengan `PLATFORMS` di `frontend/src/pages/LandingPage.jsx`:
   - macOS: `AI Accounting RAG-1.0.0-arm64.dmg`
   - Windows: `AI Accounting RAG Setup 1.0.0.exe`
   - Linux: `AI Accounting RAG-1.0.0.AppImage`
3. Jalankan backend (web dev): `cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000` → cek `http://localhost:8000/downloads/AI%20Accounting%20RAG-1.0.0-arm64.dmg`.

Landing page otomatis menanyakan `GET /api/downloads` (daftar file yang ada): platform yang file-nya belum tersedia tombolnya tampil **"Segera hadir"** (tidak bisa diklik), dan langsung berubah jadi **"Unduh"** begitu file dimasukkan ke `downloads/` (refresh halaman).

Folder `downloads/` berada di `.gitignore` (binari besar tidak di-commit).

## Konfigurasi penting (`backend/.env`)

| Variabel | Default | Keterangan |
|---|---|---|
| `OLLAMA_BASE_URL` | `https://ollama.com` | Endpoint Ollama Cloud |
| `OLLAMA_API_KEY` | kosong | Key milik kalian (di-bundle ke desktop app) |
| `OLLAMA_MODEL` | `gpt-oss:120b` | Model chat cloud |
| `EMBEDDING_PROVIDER` | `fastembed` | `fastembed` (lokal) / `openai` / `ollama` |
| `EMBEDDING_MODEL` | `paraphrase-multilingual-MiniLM-L12-v2` | Model embedding (384 dimensi) |
| `QDRANT_HOST` + `QDRANT_API_KEY` | — | Isi keduanya untuk Qdrant cloud; kosongkan untuk embedded lokal |
| `QDRANT_COLLECTION_NAME` | `accounting_knowledge_v2` | Koleksi vektor (dimensi 384) |
| `DATABASE_URL_OVERRIDE` | kosong | Opsional, untuk pakai DB lain (mis. PostgreSQL) |

> Penting: dimensi embedding berubah 768 → 384. Koleksi Qdrant lama (`accounting_knowledge`) tidak kompatibel — gunakan `accounting_knowledge_v2` (default) atau hapus koleksi lama. Knowledge base di-seed ulang otomatis saat startup.

## Fitur SPT Tahunan (1770 / 1770S)
Termasuk model `SptTahunan` (data JSON tersimpan di SQLite), router `/spt`, engine perhitungan `app/accounting/spt_engine.py`, dan halaman `SPT` di frontend (isi form, hitung otomatis, simpan draft, cetak PDF).

## Script & Tools
- `backend/packaging/build.sh` — build backend jadi binary PyInstaller
- `electron/scripts/prepare-credentials.js` — generate `credentials.json` dari env
- `python -m app.database.migration` — buat tabel + seed chart of accounts
- `python -m app.services.ingestion.seed_knowledge_base --force` — re-ingest knowledge base
