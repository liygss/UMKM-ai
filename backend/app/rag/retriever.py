"""Retriever: embed query lalu cari chunk paling relevan di Qdrant."""

from dataclasses import dataclass

from app.config.settings import settings
from app.llm.embedding_service import get_embedding
from app.services.ingestion import qdrant_service


@dataclass
class RetrievedChunk:
    qdrant_point_id: str
    score: float
    content: str
    heading: str | None
    source_filename: str
    source_file_id: str
    category: str


def retrieve(query: str, top_k: int | None = None, category: str | None = None) -> list[RetrievedChunk]:
    query_vector = get_embedding(query)
    results = qdrant_service.search(query_vector, top_k=top_k or settings.TOP_K_RETRIEVAL, category=category)

    return [
        RetrievedChunk(
            qdrant_point_id=str(r["id"]),
            score=r["score"],
            content=r["payload"].get("content", ""),
            heading=r["payload"].get("heading"),
            source_filename=r["payload"].get("source_filename", "unknown"),
            source_file_id=r["payload"].get("source_file_id", ""),
            category=r["payload"].get("category", "umum"),
        )
        for r in results
    ]
