"""Operasi Qdrant: buat collection, upsert chunk+vector, dan search."""

import uuid

from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchValue,
    PointStruct,
    VectorParams,
)

from app.config.logging import get_logger
from app.config.settings import settings
from app.database.database import get_qdrant_client
from app.llm.embedding_service import embedding_dimensions

logger = get_logger(__name__)


def ensure_collection() -> None:
    client = get_qdrant_client()
    existing = {c.name for c in client.get_collections().collections}
    if settings.QDRANT_COLLECTION_NAME not in existing:
        dims = embedding_dimensions()
        client.create_collection(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            vectors_config=VectorParams(size=dims, distance=Distance.COSINE),
        )
        logger.info("Collection Qdrant '%s' dibuat (dimensi %d).", settings.QDRANT_COLLECTION_NAME, dims)


def upsert_chunks(
    vectors: list[list[float]],
    payloads: list[dict],
) -> list[str]:
    """
    Simpan banyak chunk sekaligus. `payloads[i]` minimal berisi:
        {"content": str, "source_file_id": str, "source_filename": str,
         "chunk_index": int, "category": str}
    Mengembalikan list qdrant_point_id (uuid string) sesuai urutan input.
    """
    ensure_collection()
    client = get_qdrant_client()

    point_ids = [str(uuid.uuid4()) for _ in vectors]
    points = [
        PointStruct(id=point_ids[i], vector=vectors[i], payload=payloads[i])
        for i in range(len(vectors))
    ]

    # Batch upsert: kalau banyak chunk, pecah per 50 supaya tidak timeout
    BATCH_SIZE = 50
    for batch_start in range(0, len(points), BATCH_SIZE):
        batch = points[batch_start:batch_start + BATCH_SIZE]
        client.upsert(collection_name=settings.QDRANT_COLLECTION_NAME, points=batch)

    logger.info("Upsert %d chunk ke Qdrant.", len(points))
    return point_ids


def search(
    query_vector: list[float],
    top_k: int | None = None,
    category: str | None = None,
) -> list[dict]:
    """Cari chunk paling mirip. Mengembalikan list {id, score, payload}."""
    ensure_collection()
    client = get_qdrant_client()

    query_filter = None
    if category:
        query_filter = Filter(must=[FieldCondition(key="category", match=MatchValue(value=category))])

    results = client.search(
        collection_name=settings.QDRANT_COLLECTION_NAME,
        query_vector=query_vector,
        limit=top_k or settings.TOP_K_RETRIEVAL,
        query_filter=query_filter,
        with_payload=True,
    )
    return [{"id": r.id, "score": r.score, "payload": r.payload} for r in results]


def delete_by_source_file(source_file_id: str) -> None:
    """Hapus semua chunk milik satu file (dipakai kalau file dihapus/di-reupload)."""
    client = get_qdrant_client()
    client.delete(
        collection_name=settings.QDRANT_COLLECTION_NAME,
        points_selector=Filter(
            must=[FieldCondition(key="source_file_id", match=MatchValue(value=source_file_id))]
        ),
    )
