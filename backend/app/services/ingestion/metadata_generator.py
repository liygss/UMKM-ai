"""
Metadata yang ditempelkan ke setiap chunk sebelum di-embed & disimpan ke
Qdrant. Metadata ini yang dipakai retriever.py untuk filter (mis. hanya
cari di kategori "tax") dan untuk menampilkan sitasi ke user.
"""

from dataclasses import dataclass
from datetime import datetime

CATEGORY_BY_PATH_HINT: dict[str, str] = {
    "tax": "tax",
    "pajak": "tax",
    "accounting": "accounting",
    "akuntansi": "accounting",
    "sak_emkm": "sak_emkm",
    "regulations": "regulations",
    "peraturan": "regulations",
    "faq": "faq",
}


@dataclass
class ChunkMetadata:
    source_file_id: str
    source_filename: str
    chunk_index: int
    category: str
    uploaded_at: str


def guess_category(filename_or_path: str) -> str:
    lowered = filename_or_path.lower()
    for hint, category in CATEGORY_BY_PATH_HINT.items():
        if hint in lowered:
            return category
    return "umum"


def build_chunk_metadata(
    source_file_id: str,
    source_filename: str,
    chunk_index: int,
    category: str | None = None,
) -> ChunkMetadata:
    return ChunkMetadata(
        source_file_id=source_file_id,
        source_filename=source_filename,
        chunk_index=chunk_index,
        category=category or guess_category(source_filename),
        uploaded_at=datetime.utcnow().isoformat(),
    )
