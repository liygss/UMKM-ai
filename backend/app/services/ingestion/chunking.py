"""
Chunking markdown jadi potongan siap-embed.

Strategi:
1. Split dulu berdasarkan heading markdown (#, ##, ###) supaya satu chunk
   tidak memotong satu bagian/pasal/baris transaksi di tengah.
2. Kalau satu bagian hasil split masih lebih panjang dari CHUNK_SIZE,
   baru dipecah lagi berdasarkan jumlah kata dengan overlap, supaya
   konteks di ujung potongan tidak hilang total.

Ukuran dihitung dalam kata (word count) sebagai proxy token count yang
murah dihitung; cukup akurat untuk Bahasa Indonesia (rasio token:kata
biasanya ~1.3, jadi CHUNK_SIZE=800 kata sudah aman untuk model modern).
"""

import re
from dataclasses import dataclass

from app.config.settings import settings

HEADING_PATTERN = re.compile(r"^(#{1,3})\s+.+$", re.MULTILINE)

# Batas aman untuk embedding model (nomic-embed-text: 8192 tokens).
# Dihitung kasar: ~1.3 token per kata Bahasa Indonesia → 512 token ≈ 390 kata.
MAX_CHUNK_WORDS = 400


@dataclass
class Chunk:
    index: int
    content: str
    heading: str | None  # heading terakhir sebelum chunk ini, untuk konteks tambahan


def _split_by_heading(markdown: str) -> list[tuple[str | None, str]]:
    """Kembalikan list (heading_terdekat, isi_bagian)."""
    matches = list(HEADING_PATTERN.finditer(markdown))
    if not matches:
        return [(None, markdown)]

    bagian: list[tuple[str | None, str]] = []
    for i, match in enumerate(matches):
        start = match.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(markdown)
        heading_line = match.group(0).lstrip("#").strip()
        bagian.append((heading_line, markdown[start:end]))
    return bagian


def _split_by_word_count(text: str, chunk_size: int, overlap: int) -> list[str]:
    words = text.split()
    if len(words) <= chunk_size:
        return [text]

    hasil = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        hasil.append(" ".join(words[start:end]))
        if end == len(words):
            break
        start = end - overlap  # mundur sedikit supaya ada overlap
    return hasil


def chunk_markdown(
    markdown: str,
    chunk_size: int | None = None,
    overlap: int | None = None,
) -> list[Chunk]:
    chunk_size = chunk_size or settings.CHUNK_SIZE
    overlap = overlap or settings.CHUNK_OVERLAP

    hasil: list[Chunk] = []
    idx = 0
    for heading, bagian_text in _split_by_heading(markdown):
        sub_chunks = _split_by_word_count(bagian_text.strip(), chunk_size, overlap)
        for sub in sub_chunks:
            if not sub.strip():
                continue
            content = sub.strip()
            word_count = len(content.split())
            if word_count > MAX_CHUNK_WORDS:
                words = content.split()
                content = " ".join(words[:MAX_CHUNK_WORDS])
            hasil.append(Chunk(index=idx, content=content, heading=heading))
            idx += 1
    return hasil
