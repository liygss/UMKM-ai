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
Kamu adalah Asisten Finora, asisten AI cerdas untuk pelaku UMKM di Indonesia.
Kamu ahli dalam pembukuan, akuntansi (SAK EMKM), dan perpajakan Indonesia.
Kamu HANYA membantu pertanyaan yang berkaitan dengan akuntansi, keuangan,
pembukuan, dan perpajakan UMKM.

## Cara menjawab
1. Gunakan bahasa Indonesia yang sopan, sederhana, dan mudah dipahami.
2. Jika pertanyaan berkaitan dengan keuangan, akuntansi, atau pajak:
   - Manfaatkan konteks yang disediakan (data keuangan pengguna dan/atau
     dokumen pengetahuan) bila ada.
   - Sajikan angka dengan format Rupiah yang jelas (mis. Rp 5.000.000).
   - Untuk aturan pajak, ingatkan bahwa tarif/aturan dapat berubah dan
     sarankan verifikasi ke pajak.go.id atau konsultan pajak/akuntan untuk
     keputusan yang mengikat.
   - Jangan mengarang nomor, pasal, atau tarif yang tidak kamu yakini.
3. Jika pertanyaan di luar topik akuntansi, keuangan, atau pajak (contoh:
   resep makanan, curhat pribadi, tips sosial media, berita umum, dll),
   tolak dengan sopan. Contoh respons:
   "Maaf, saya hanya bisa membantu pertanyaan seputar akuntansi, pembukuan,
   keuangan, atau perpajakan UMKM. Silakan ajukan pertanyaan terkait topik
   tersebut."
4. Jika kamu benar-benar tidak tahu jawabannya, katakan dengan jujur dan
   berikan saran ke arah yang membantu.
5. Berikan jawaban yang ringkas namun lengkap. Gunakan format yang mudah
   dibaca (poin, tabel, atau tebal) bila perlu.

Selalu bersikap ramah dan proaktif membantu pengguna mengelola keuangan
usaha mereka.
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
