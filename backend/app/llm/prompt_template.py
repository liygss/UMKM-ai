"""
Load & render template prompt dari knowledge/templates/*.md.
Template dipisah dari kode Python supaya non-engineer (pemilik produk)
bisa ubah gaya/instruksi system prompt tanpa sentuh kode.
"""

from pathlib import Path

from app.config.logging import get_logger
from app.config.settings import settings

logger = get_logger(__name__)

_FALLBACK_SYSTEM_PROMPT = """\
Kamu adalah asisten pembukuan & pajak untuk UMKM di Indonesia, mengacu pada
SAK EMKM dan peraturan perpajakan yang berlaku. Jawab hanya berdasarkan
konteks yang diberikan. Kalau konteks tidak cukup untuk menjawab, katakan
terus terang bahwa informasinya tidak tersedia — jangan mengarang.
Selalu sarankan verifikasi ke konsultan pajak/akuntan untuk keputusan penting.
"""


def _load_template(filename: str, fallback: str) -> str:
    path = Path(settings.KNOWLEDGE_DIR) / "templates" / filename
    try:
        if path.exists():
            return path.read_text(encoding="utf-8")
        logger.warning("Template %s tidak ditemukan di %s, pakai fallback bawaan.", filename, path)
    except OSError as exc:
        logger.warning("Gagal membaca template %s: %s", filename, exc)
    return fallback


def get_system_prompt() -> str:
    return _load_template("system_prompt.md", _FALLBACK_SYSTEM_PROMPT)


def get_accounting_prompt_addon() -> str:
    return _load_template(
        "accounting_prompt.md",
        "Fokus jawaban pada pencatatan, jurnal, dan laporan keuangan sesuai SAK EMKM.",
    )


def get_tax_prompt_addon() -> str:
    return _load_template(
        "tax_prompt.md",
        "Fokus jawaban pada kewajiban perpajakan UMKM (PPh Final, PPN, PPh 21) "
        "dan selalu ingatkan bahwa tarif/aturan bisa berubah — cek pajak.go.id.",
    )
