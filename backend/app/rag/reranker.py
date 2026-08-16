"""
Reranker hasil retrieval.

Pencarian vector (retriever.py) kadang mengembalikan chunk yang mirip
secara semantik tapi kurang tepat sasaran untuk pertanyaan spesifik
(mis. pertanyaan yang menyebut angka/kode akun tertentu). Reranker di
sini memakai skor hybrid: skor vector asli + bonus keyword overlap
literal antara pertanyaan dan isi chunk.

Titik upgrade di masa depan: ganti dengan cross-encoder (mis. via model
reranking khusus di Ollama, atau layanan reranking terpisah) kalau
akurasi hybrid ini dirasa belum cukup.
"""

import re

from app.rag.retriever import RetrievedChunk

_STOPWORDS_ID = {
    "yang", "dan", "di", "ke", "dari", "untuk", "pada", "adalah", "ini", "itu",
    "dengan", "atau", "apa", "bagaimana", "berapa", "saya", "kamu", "akan",
    "juga", "tidak", "ada", "sudah", "belum",
}


def _keywords(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9]+", text.lower())
    return {w for w in words if w not in _STOPWORDS_ID and len(w) > 2}


def rerank(
    query: str,
    chunks: list[RetrievedChunk],
    top_n: int | None = None,
    keyword_weight: float = 0.25,
) -> list[RetrievedChunk]:
    """
    Skor akhir = skor_vector * (1 - keyword_weight) + overlap_ratio * keyword_weight
    `overlap_ratio` = proporsi keyword pertanyaan yang muncul literal di chunk.
    """
    query_keywords = _keywords(query)
    if not query_keywords or not chunks:
        return chunks[:top_n] if top_n else chunks

    scored = []
    for chunk in chunks:
        chunk_keywords = _keywords(chunk.content)
        overlap = len(query_keywords & chunk_keywords)
        overlap_ratio = overlap / len(query_keywords)
        final_score = chunk.score * (1 - keyword_weight) + overlap_ratio * keyword_weight
        scored.append((final_score, chunk))

    scored.sort(key=lambda pair: pair[0], reverse=True)
    hasil = [chunk for _, chunk in scored]
    return hasil[:top_n] if top_n else hasil
