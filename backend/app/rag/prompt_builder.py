"""Rakit system prompt + konteks retrieval + histori chat + pertanyaan jadi messages untuk LLM."""

from app.llm.prompt_template import (
    get_accounting_prompt_addon,
    get_system_prompt,
    get_tax_prompt_addon,
)
from app.rag.context_builder import BuiltContext

TAX_KEYWORDS = [
    "pajak", "pph", "ppn", "npwp", "faktur", "spt", "umkm final", "tarif",
    "formulir", "lapor", "billing", "ntpn", "pph21", "pph23", "ppn12", "ppn 12",
]
ACCOUNTING_KEYWORDS = [
    "jurnal", "neraca", "laba rugi", "buku besar", "akun", "penyusutan",
    "pembukuan", "modal", "arus kas", "debit", "kredit",
]
FINANCE_KEYWORDS = [
    "keuangan", "uang", "kas", "piutang", "utang", "beban", "pendapatan",
    "penjualan", "belanja", "biaya", "laba", " rugi", "aset", "barang",
    "inventaris", "stok", "persediaan", "gaji", "upah", " THR",
    "omset", " revenue", "profit", "cashflow", "laporan", "report",
    "transaksi", "bayar", "tagihan", "invoice", "bon", "kwitansi",
    "budget", "anggaran", "forecast", "proyeksi",
]
ALL_TOPIC_KEYWORDS = TAX_KEYWORDS + ACCOUNTING_KEYWORDS + FINANCE_KEYWORDS


def detect_domain(pertanyaan: str) -> str:
    """Deteksi topik pertanyaan: "tax", "accounting", atau "" (umum)."""
    lowered = pertanyaan.lower()
    if any(k in lowered for k in TAX_KEYWORDS):
        return "tax"
    if any(k in lowered for k in ACCOUNTING_KEYWORDS):
        return "accounting"
    return ""


def is_out_of_topic(pertanyaan: str) -> bool:
    """Cek apakah pertanyaan di luar topik akuntansi/keuangan/pajak."""
    lowered = pertanyaan.lower().strip()
    if not lowered:
        return False
    return not any(k in lowered for k in ALL_TOPIC_KEYWORDS)


def _pilih_prompt_addon(pertanyaan: str) -> str:
    domain = detect_domain(pertanyaan)
    if domain == "tax":
        return get_tax_prompt_addon()
    if domain == "accounting":
        return get_accounting_prompt_addon()
    return ""


def build_messages(
    pertanyaan: str,
    context: BuiltContext,
    histori_chat: list[dict[str, str]] | None = None,
    financial_context: str | None = None,
    page: str | None = None,
) -> list[dict[str, str]]:
    """
    histori_chat: list of {"role": "user"|"assistant", "content": "..."} dari
    ChatMessage sebelumnya di sesi yang sama (dibatasi beberapa pesan terakhir
    oleh pemanggil supaya prompt tidak membengkak).
    financial_context: data keuangan user dari PostgreSQL (opsional).
    page: label halaman aktif user (opsional) agar jawaban lebih kontekstual.
    """
    system_prompt = get_system_prompt()
    addon = _pilih_prompt_addon(pertanyaan)
    if addon:
        system_prompt = f"{system_prompt}\n\n{addon}"

    if page:
        system_prompt += (
            f"\n\nLokasi pengguna saat ini: halaman {page}. "
            "Jika relevan, arahkan jawaban pada fitur/perintah yang ada di "
            "halaman tersebut."
        )

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
            "\n\nTidak ada dokumen pengetahuan spesifik yang ditemukan untuk "
            "pertanyaan ini. Bila pertanyaan menyangkut keuangan/pajak "
            "pengguna, gunakan data keuangan yang tersedia bila ada. "
            "Jika pertanyaan di luar topik akuntansi/keuangan/pajak, "
            "tolak dengan sopan dan arahkan pengguna untuk bertanya "
            "seputar pembukuan, laporan keuangan, atau perpajakan UMKM."
        )

    messages = [{"role": "system", "content": system_prompt}]
    if histori_chat:
        messages.extend(histori_chat)
    messages.append({"role": "user", "content": pertanyaan})
    return messages
