"""
Layanan embedding untuk RAG, multi-provider (terpusat di satu tempat):

- fastembed (DEFAULT) — lokal, gratis, tanpa API key. Cocok aplikasi desktop.
  Model default: intfloat/multilingual-e5-small (384 dimensi). Model di-download
  sekali saat pertama dipakai, lalu di-cache di folder model.
- openai — OpenAI-compatible endpoint /v1/embeddings (butuh EMBEDDING_API_KEY).
- ollama — embedding via Ollama lokal (butuh Ollama terpasang).

Semua modul lain (rag/*, services/ingestion/embedding.py) memanggil lewat
`get_embedding` / `get_embeddings_batch` di file ini.
"""

import os
from functools import lru_cache
from pathlib import Path

from app.config.logging import get_logger
from app.config.settings import settings

logger = get_logger(__name__)

EmbeddingError = RuntimeError

_fastembed_model = None


def get_fastembed_model():
    """Lazy singleton TextEmbedding dari fastembed."""
    global _fastembed_model
    if _fastembed_model is None:
        try:
            from fastembed import TextEmbedding
        except ImportError as exc:  # pragma: no cover
            raise EmbeddingError(
                "Package 'fastembed' belum terpasang. Jalankan: pip install fastembed"
            ) from exc

        # Simpan model di folder data supaya tidak mengotori home user
        cache_dir = str(Path(settings.DATA_DIR) / "models")
        os.environ.setdefault("FASTEMBED_CACHE_PATH", cache_dir)

        logger.info("Memuat model embedding %s (pertama kali akan mendownload model)...", settings.EMBEDDING_MODEL)
        _fastembed_model = TextEmbedding(model_name=settings.EMBEDDING_MODEL)
        logger.info("Model embedding siap.")
    return _fastembed_model


def _embed_fastembed(texts: list[str]) -> list[list[float]]:
    model = get_fastembed_model()
    vectors = [v.tolist() for v in model.embed(texts)]
    return vectors


def _embed_openai(texts: list[str]) -> list[list[float]]:
    if not settings.EMBEDDING_API_KEY:
        raise EmbeddingError("EMBEDDING_API_KEY belum diset untuk provider 'openai'.")
    try:
        import httpx
    except ImportError as exc:  # pragma: no cover
        raise EmbeddingError("Package 'httpx' belum terpasang.") from exc

    headers = {
        "Authorization": f"Bearer {settings.EMBEDDING_API_KEY}",
        "Content-Type": "application/json",
    }
    payload: dict = {"model": settings.EMBEDDING_MODEL, "input": texts}
    if settings.EMBEDDING_DIMENSIONS:
        payload["dimensions"] = settings.EMBEDDING_DIMENSIONS

    resp = httpx.post(
        f"{settings.EMBEDDING_BASE_URL.rstrip('/')}/embeddings",
        headers=headers,
        json=payload,
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    results = sorted(data["data"], key=lambda item: item["index"])
    return [item["embedding"] for item in results]


def _embed_ollama(texts: list[str]) -> list[list[float]]:
    from app.llm.ollama_service import get_client

    client = get_client()
    vectors = []
    for t in texts:
        resp = client.embeddings(model=settings.EMBEDDING_MODEL, prompt=t)
        vectors.append(resp["embedding"])
    return vectors


def _get_embeddings(texts: list[str]) -> list[list[float]]:
    provider = settings.EMBEDDING_PROVIDER.lower()
    try:
        if provider == "fastembed":
            return _embed_fastembed(texts)
        if provider == "openai":
            return _embed_openai(texts)
        if provider == "ollama":
            return _embed_ollama(texts)
        raise EmbeddingError(f"EMBEDDING_PROVIDER tidak dikenal: {provider}")
    except EmbeddingError:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.error("Gagal membuat embedding (provider=%s): %s", provider, exc)
        raise EmbeddingError(f"Gagal membuat embedding: {exc}") from exc


def get_embedding(text: str) -> list[float]:
    """Embed satu string. Dipakai untuk query maupun untuk chunk dokumen."""
    return _get_embeddings([text])[0]


def get_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Embed banyak teks sekaligus (fastembed & openai mendukung batch native)."""
    return _get_embeddings(texts)


@lru_cache
def embedding_dimensions() -> int:
    """Dimensi vektor model embedding saat ini (untuk koleksi Qdrant)."""
    probe = get_embedding("probe")
    return len(probe)
