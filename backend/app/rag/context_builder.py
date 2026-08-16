"""
Susun chunk-chunk hasil rerank jadi satu blok konteks yang siap dimasukkan
ke prompt, plus daftar sumber terpisah untuk ditampilkan sebagai sitasi.
"""

from dataclasses import dataclass

from app.rag.retriever import RetrievedChunk

MAX_CONTEXT_WORDS = 2000  # batas kasar supaya prompt tidak kepanjangan


@dataclass
class BuiltContext:
    context_text: str
    sources: list[RetrievedChunk]


def build_context(chunks: list[RetrievedChunk]) -> BuiltContext:
    bagian = []
    used_chunks: list[RetrievedChunk] = []
    total_words = 0

    for chunk in chunks:
        word_count = len(chunk.content.split())
        if total_words + word_count > MAX_CONTEXT_WORDS and used_chunks:
            break  # sudah cukup penuh, jangan potong di tengah kalau belum ada isi sama sekali

        header = "[Dokumen"
        if chunk.heading:
            header += f": {chunk.heading}"
        header += "]"

        bagian.append(f"{header}\n{chunk.content}")
        used_chunks.append(chunk)
        total_words += word_count

    return BuiltContext(context_text="\n\n---\n\n".join(bagian), sources=used_chunks)
