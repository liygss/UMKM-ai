"""
Entry point aplikasi FastAPI.

Jalankan dengan:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Sebelum pertama kali jalan, siapkan database:
    python -m app.database.migration
"""

from contextlib import asynccontextmanager
import threading

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.config.logging import get_logger, setup_logging
from app.config.settings import settings
from app.database.database import check_db_connection, check_qdrant_connection
from app.middleware.cors import setup_cors
from app.routers import accounting, authentication, chatbot, dashboard, downloads, spt, upload

setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s (env=%s)...", settings.APP_NAME, settings.ENV)
    # Pastikan tabel & chart of accounts tersedia (aman dijalankan tiap start).
    from app.database.migration import create_tables, seed_chart_of_accounts

    create_tables()
    seed_chart_of_accounts()
    db_ok = check_db_connection()
    qdrant_ok = check_qdrant_connection()
    if not db_ok:
        logger.warning("Database tidak terhubung saat startup — cek konfigurasi/koneksi.")
    if not qdrant_ok:
        logger.warning("Qdrant tidak terhubung saat startup — fitur RAG tidak akan berfungsi.")

    # Seed knowledge base di background (idempotent — hanya proses file baru).
    # Dengan ini aplikasi desktop langsung bisa dipakai tanpa langkah manual.
    threading.Thread(target=_seed_knowledge_background, daemon=True).start()
    yield
    logger.info("Shutting down %s...", settings.APP_NAME)


def _seed_knowledge_background() -> None:
    try:
        from app.services.ingestion.seed_knowledge_base import run as seed_run

        seed_run()
    except Exception:  # noqa: BLE001
        logger.exception("Seeding knowledge base di background gagal — fitur RAG mungkin kosong.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend AI Accounting RAG untuk pembukuan & konsultasi pajak UMKM (SAK EMKM).",
    lifespan=lifespan,
)

setup_cors(app)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(authentication.router)
app.include_router(accounting.router)
app.include_router(spt.router)
app.include_router(upload.router)
app.include_router(dashboard.router)
app.include_router(chatbot.router)
app.include_router(downloads.router)


@app.get("/", tags=["Root"])
def root() -> dict:
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "env": settings.ENV,
        "docs": "/docs",
    }


@app.get("/health", tags=["Root"])
def health() -> JSONResponse:
    db_ok = check_db_connection()
    qdrant_ok = check_qdrant_connection()
    status_code = 200 if db_ok else 503
    return JSONResponse(
        status_code=status_code,
        content={
            "database": "connected" if db_ok else "disconnected",
            "qdrant": "connected" if qdrant_ok else "disconnected",
        },
    )
