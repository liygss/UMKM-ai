"""Bersihkan & strukturkan output mentah dari Ollama sebelum dikirim ke user."""

import re
from dataclasses import dataclass, field

CITATION_PATTERN = re.compile(r"\[\[(.+?)\]\]")  # format sitasi: [[chunk_id]]


@dataclass
class ParsedResponse:
    answer: str
    cited_chunk_ids: list[str] = field(default_factory=list)


def parse_llm_response(raw_text: str) -> ParsedResponse:
    cited_ids = CITATION_PATTERN.findall(raw_text)
    # Sitasi internal [[chunk_id]] dihapus dari teks yang ditampilkan ke user;
    # daftar sumbernya ditampilkan terpisah lewat field `sources` di ChatResponse.
    clean_text = CITATION_PATTERN.sub("", raw_text).strip()
    clean_text = re.sub(r"[ \t]{2,}", " ", clean_text)
    return ParsedResponse(answer=clean_text, cited_chunk_ids=cited_ids)
