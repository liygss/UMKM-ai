"""Rakit system prompt + konteks retrieval + histori chat + pertanyaan jadi messages untuk LLM."""

from app.llm.prompt_template import (
    get_accounting_prompt_addon,
    get_system_prompt,
    get_tax_prompt_addon,
)
from app.rag.context_builder import BuiltContext

TAX_KEYWORDS = ["pajak", "pph", "ppn", "npwp", "faktur", "spt", "umkm final"]
ACCOUNTING_KEYWORDS = ["jurnal", "neraca", "laba rugi", "buku besar", "akun", "penyusutan"]


def _pilih_prompt_addon(pertanyaan: str) -> str:
    lowered = pertanyaan.lower()
    if any(k in lowered for k in TAX_KEYWORDS):
        return get_tax_prompt_addon()
    if any(k in lowered for k in ACCOUNTING_KEYWORDS):
        return get_accounting_prompt_addon()
    return ""


def build_messages(
    pertanyaan: str,
    context: BuiltContext,
    histori_chat: list[dict[str, str]] | None = None,
    financial_context: str | None = None,
) -> list[dict[str, str]]:
    """
    histori_chat: list of {"role": "user"|"assistant", "content": "..."} dari
    ChatMessage sebelumnya di sesi yang sama (dibatasi beberapa pesan terakhir
    oleh pemanggil supaya prompt tidak membengkak).
    financial_context: data keuangan user dari PostgreSQL (opsional).
    """
    system_prompt = get_system_prompt()
    addon = _pilih_prompt_addon(pertanyaan)
    if addon:
        system_prompt = f"{system_prompt}\n\n{addon}"

    # Tambahkan financial context (data keuangan user) jika ada
    if financial_context:
        system_prompt += (
            "\n\n## Data Keuangan Pengguna yang Tersedia:\n\n"
            f"{financial_context}\n\n"
            "Gunakan data di atas untuk menjawab pertanyaan pengguna tentang "
            " kondisi keuangan usahanya. Sajikan angka dengan format Rupiah yang "
            "jelas. Jika data tidak lengkap untuk menjawab sepenuhnya, "
            "keterangkan bagian mana yang tidak tersedia."
        )

    # Tambahkan knowledge base context (dari Qdrant/RAG)
    if context.context_text:
        system_prompt += (
            "\n\n## Konteks Dokumen Pengetahuan:\n\n"
            f"{context.context_text}"
        )
    else:
        system_prompt += (
            "\n\nTidak ada dokumen pengetahuan relevan yang ditemukan untuk pertanyaan ini. "
            "Jawab berdasarkan data keuangan pengguna (jika tersedia) atau "
            "katakan terus terang bahwa informasinya tidak tersedia."
        )

    messages = [{"role": "system", "content": system_prompt}]
    if histori_chat:
        messages.extend(histori_chat)
    messages.append({"role": "user", "content": pertanyaan})
    return messages
