"""
Setup koneksi database:
- SQLite via SQLAlchemy (default, untuk aplikasi desktop — tanpa server).
  Masih bisa pakai database lain (mis. PostgreSQL di server) dengan
  meng-override env DATABASE_URL_OVERRIDE.
- Qdrant client untuk vector store RAG:
  * mode embedded lokal (default) — data file-based, tanpa server/Docker
  * mode cloud/server — aktif kalau QDRANT_API_KEY di-set (host + api key)
"""

from typing import Generator

from qdrant_client import QdrantClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config.logging import get_logger
from app.config.settings import settings

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Database (SQLite default)
# ---------------------------------------------------------------------------
_engine_kwargs: dict = {}
if settings.is_sqlite:
    # SQLite butuh check_same_thread=False karena FastAPI multi-thread,
    # dan tidak pakai connection pooling seperti PostgreSQL.
    _engine_kwargs["connect_args"] = {"check_same_thread": False}
    # Pastikan folder tempat file .db berada sudah ada.
    import os
    from pathlib import Path

    db_path = settings.SQLITE_PATH
    parent = Path(db_path).parent
    os.makedirs(parent, exist_ok=True)
else:
    _engine_kwargs.update(pool_pre_ping=True, pool_size=10, max_overflow=20)

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    **_engine_kwargs,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class untuk semua model ORM."""
    pass


def get_db() -> Generator[Session, None, None]:
    """
    Dependency untuk FastAPI:
        def endpoint(db: Session = Depends(get_db)): ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Koneksi database OK (%s)", settings.DATABASE_URL.split(":")[0])
        return True
    except Exception as exc:  # noqa: BLE001
        logger.error("Gagal konek ke database: %s", exc)
        return False


# ---------------------------------------------------------------------------
# Qdrant (vector database)
# ---------------------------------------------------------------------------
_qdrant_client: QdrantClient | None = None


def get_qdrant_client() -> QdrantClient:
    """
    Singleton Qdrant client. Dipakai oleh services/ingestion/qdrant_service.py
    dan rag/retriever.py.

    Cloud/server mode: kalau QDRANT_API_KEY diset, pakai url (https) + api_key.
    Embedded lokal: kalau tidak ada API key, pakai path file (tanpa server).
    """
    global _qdrant_client
    if _qdrant_client is None:
        if settings.QDRANT_API_KEY:
            _qdrant_client = QdrantClient(
                url=f"https://{settings.QDRANT_HOST}",
                api_key=settings.QDRANT_API_KEY,
                timeout=60,
            )
            logger.info("Qdrant client terhubung ke cloud %s", settings.QDRANT_HOST)
        else:
            _qdrant_client = QdrantClient(
                path=settings.QDRANT_LOCAL_PATH,
                timeout=60,
            )
            logger.info("Qdrant client embedded lokal: %s", settings.QDRANT_LOCAL_PATH)
    return _qdrant_client


def check_qdrant_connection() -> bool:
    try:
        client = get_qdrant_client()
        client.get_collections()
        logger.info("Koneksi Qdrant OK")
        return True
    except Exception as exc:  # noqa: BLE001
        logger.error("Gagal konek ke Qdrant: %s", exc)
        return False
