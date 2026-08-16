"""
Data Context Service — mendeteksi intent pertanyaan user dan mengambil
data keuangan relevan dari database (PostgreSQL) untuk diberikan sebagai
konteks tambahan ke LLM.

Pendekatan hybrid:
  - Pertanyaan pengetahuan (SAK EMKM, pajak) → RAG Qdrant
  - Pertanyaan data keuangan sendiri → service ini
  - Keduanya digabung di prompt builder
"""

from datetime import date, datetime

from sqlalchemy.orm import Session

from app.config.logging import get_logger
from app.database.models import (
    Akun,
    ChatSession,
    JurnalDetail,
    JurnalUmum,
    UploadedFile,
    User,
)

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Intent detection — keyword-based (cukup untuk MVP, bisa upgrade ke LLM)
# ---------------------------------------------------------------------------

# Keywords → intent mapping
_INTENT_PATTERNS: dict[str, list[str]] = {
    "laba_rugi": [
        "laba rugi", "laba/rugi", "laba bersih", "laba kotor",
        "pendapatan bersih", "untung", "rugi", "profit",
        "income statement", "laporan laba",
    ],
    "posisi_keuangan": [
        "posisi keuangan", "balance sheet", "neraca",
        "total aset", "total liabilitas", "total modal",
        "harta", "kewajiban", "ekuitas",
    ],
    "neraca_saldo": [
        "neraca saldo", "trial balance", "saldo akun",
        "saldo debit", "saldo kredit",
    ],
    "dashboard": [
        "ringkasan", "summary", "kas", "bank",
        "saldo kas", "saldo bank", "total kas",
        "berapa uang", "uang tersisa",
    ],
    "jurnal": [
        "jurnal", "transaksi", "entry", "bukti",
        "catatan transaksi", "riwayat transaksi",
        "transaksi terakhir", "transaksi terbaru",
    ],
    "buku_besar": [
        "buku besar", "general ledger", "ledger",
        "riwayat akun", "pergerakan akun",
    ],
    "upload_summary": [
        "file yang diupload", "data yang diupload", "file upload",
        "csv", "xlsx", "data transaksi",
    ],
}


def _detect_intent(question: str) -> list[str]:
    """Deteksi intent dari pertanyaan user. Mengembalikan list intent yang cocok."""
    lowered = question.lower()
    detected = []
    for intent, keywords in _INTENT_PATTERNS.items():
        if any(kw in lowered for kw in keywords):
            detected.append(intent)
    return detected


# ---------------------------------------------------------------------------
# Financial data fetchers
# ---------------------------------------------------------------------------

def _fmt_rp(value: float) -> str:
    """Format float ke string Rupiah tanpa desimal jika bulat."""
    if value == int(value):
        return f"Rp {value:,.0f}".replace(",", ".")
    return f"Rp {value:,.2f}".replace(",", ".")


def _get_laba_rugi_context(db: Session, tanggal_per: date | None = None, user_id: str | None = None) -> str:
    from app.accounting.laporan_laba_rugi import get_laporan_laba_rugi
    lr = get_laporan_laba_rugi(db, tanggal_per, user_id=user_id)
    lines = ["## Laporan Laba Rugi"]
    if lr.pendapatan:
        lines.append("### Pendapatan")
        for b in lr.pendapatan:
            lines.append(f"- {b.nama_akun}: {_fmt_rp(b.nilai)}")
        lines.append(f"**Total Pendapatan: {_fmt_rp(lr.total_pendapatan)}**")
    if lr.hpp:
        lines.append("### HPP (Beban Pokok Penjualan)")
        for b in lr.hpp:
            lines.append(f"- {b.nama_akun}: {_fmt_rp(b.nilai)}")
        lines.append(f"**Total HPP: {_fmt_rp(lr.total_hpp)}**")
    if lr.beban_operasional:
        lines.append("### Beban Operasional")
        for b in lr.beban_operasional:
            lines.append(f"- {b.nama_akun}: {_fmt_rp(b.nilai)}")
        lines.append(f"**Total Beban Operasional: {_fmt_rp(lr.total_beban_operasional)}**")
    lines.append(f"\n**Laba Kotor: {_fmt_rp(lr.laba_kotor)}**")
    lines.append(f"**Laba Bersih: {_fmt_rp(lr.laba_bersih)}**")
    return "\n".join(lines)


def _get_posisi_keuangan_context(db: Session, tanggal_per: date | None = None, user_id: str | None = None) -> str:
    from app.accounting.laporan_posisi_keuangan import get_laporan_posisi_keuangan
    pk = get_laporan_posisi_keuangan(db, tanggal_per, user_id=user_id)
    lines = ["## Laporan Posisi Keuangan (Neraca)"]
    if pk.aset:
        lines.append("### Aset")
        for b in pk.aset:
            lines.append(f"- {b.nama_akun}: {_fmt_rp(b.nilai)}")
        lines.append(f"**Total Aset: {_fmt_rp(pk.total_aset)}**")
    if pk.liabilitas:
        lines.append("### Liabilitas")
        for b in pk.liabilitas:
            lines.append(f"- {b.nama_akun}: {_fmt_rp(b.nilai)}")
        lines.append(f"**Total Liabilitas: {_fmt_rp(pk.total_liabilitas)}**")
    if pk.modal:
        lines.append("### Modal")
        for b in pk.modal:
            lines.append(f"- {b.nama_akun}: {_fmt_rp(b.nilai)}")
        lines.append(f"Laba/Rugi Berjalan: {_fmt_rp(pk.laba_rugi_berjalan)}")
        lines.append(f"**Total Modal: {_fmt_rp(pk.total_modal)}**")
    lines.append(f"\nApakah Balance: {'Ya' if pk.is_balance else 'Tidak'}")
    return "\n".join(lines)


def _get_neraca_saldo_context(db: Session, tanggal_per: date | None = None, user_id: str | None = None) -> str:
    from app.accounting.neraca_saldo import get_neraca_saldo
    ns = get_neraca_saldo(db, tanggal_per, user_id=user_id)
    lines = ["## Neraca Saldo"]
    lines.append(f"Per: {ns.tanggal_per or 'Sekarang'}")
    lines.append("")
    lines.append("| Nama Akun | Debit | Kredit |")
    lines.append("|-----------|-------|--------|")
    for b in ns.baris:
        d = _fmt_rp(b.debit) if b.debit > 0 else "-"
        k = _fmt_rp(b.kredit) if b.kredit > 0 else "-"
        lines.append(f"| {b.nama_akun} | {d} | {k} |")
    lines.append(f"\n**Total Debit: {_fmt_rp(ns.total_debit)}**")
    lines.append(f"**Total Kredit: {_fmt_rp(ns.total_kredit)}**")
    lines.append(f"Balance: {'Ya' if ns.is_balance else 'Tidak'}")
    return "\n".join(lines)


def _get_dashboard_context(db: Session, tanggal_per: date | None = None, user_id: str | None = None) -> str:
    from app.accounting.dashboard_metrics import get_dashboard_summary
    ds = get_dashboard_summary(db, tanggal_per, user_id=user_id)
    lines = ["## Ringkasan Keuangan (Dashboard)"]
    lines.append(f"Per: {ds.tanggal_per}")
    lines.append(f"- Saldo Kas: {_fmt_rp(ds.saldo_kas)}")
    lines.append(f"- Saldo Bank: {_fmt_rp(ds.saldo_bank)}")
    lines.append(f"- Total Kas & Bank: {_fmt_rp(ds.total_kas_dan_bank)}")
    lines.append(f"- Pendapatan Bulan Ini: {_fmt_rp(ds.pendapatan_bulan_ini)}")
    lines.append(f"- Beban Bulan Ini: {_fmt_rp(ds.beban_bulan_ini)}")
    lines.append(f"- Laba/Rugi Bulan Ini: {_fmt_rp(ds.laba_rugi_bulan_ini)}")
    lines.append(f"- Total Pendapatan Tahun Berjalan: {_fmt_rp(ds.total_pendapatan_tahun_berjalan)}")
    lines.append(f"- Total Beban Tahun Berjalan: {_fmt_rp(ds.total_beban_tahun_berjalan)}")
    lines.append(f"- Laba/Rugi Tahun Berjalan: {_fmt_rp(ds.laba_rugi_tahun_berjalan)}")
    lines.append(f"- Jumlah Transaksi Bulan Ini: {ds.jumlah_transaksi_bulan_ini}")
    return "\n".join(lines)


def _get_jurnal_context(db: Session, user_id: str, limit: int = 10) -> str:
    """Ambil jurnal terakhir milik user."""
    jurnals = (
        db.query(JurnalUmum)
        .filter(JurnalUmum.created_by_id == user_id)
        .order_by(JurnalUmum.tanggal.desc(), JurnalUmum.created_at.desc())
        .limit(limit)
        .all()
    )
    if not jurnals:
        return "## Data Jurnal\nTidak ada data jurnal yang tersedia."
    lines = [f"## {len(jurnals)} Transaksi Terakhir"]
    for j in jurnals:
        lines.append(f"\n### {j.no_bukti} — {j.tanggal}")
        lines.append(f"Deskripsi: {j.deskripsi}")
        for d in j.detail:
            side = "Debit" if d.debit > 0 else "Kredit"
            val = d.debit if d.debit > 0 else d.kredit
            lines.append(f"- {d.akun.nama_akun}: {side} {_fmt_rp(float(val))}")
    return "\n".join(lines)


def _get_buku_besar_context(db: Session, user_id: str, question: str) -> str:
    """Ambil buku besar untuk akun yang disebut di pertanyaan (jika ada)."""
    from app.accounting.buku_besar import get_buku_besar

    # Coba deteksi kode akun dari pertanyaan (format: X-XXXX)
    import re
    kode_match = re.search(r'\b(\d-\d{3,4})\b', question)
    if kode_match:
        kode = kode_match.group(1)
        try:
            bb = get_buku_besar(db, kode, user_id=user_id)
            lines = [f"## Buku Besar — {bb.nama_akun}"]
            lines.append(f"Saldo Awal: {_fmt_rp(bb.saldo_awal)}")
            for baris in bb.baris:
                d = _fmt_rp(baris.debit) if baris.debit > 0 else "-"
                k = _fmt_rp(baris.kredit) if baris.kredit > 0 else "-"
                lines.append(f"- {baris.tanggal} | {baris.no_bukti} | {baris.deskripsi} | D: {d} | K: {k} | Saldo: {_fmt_rp(baris.saldo_berjalan)}")
            lines.append(f"\n**Saldo Akhir: {_fmt_rp(bb.saldo_akhir)}**")
            return "\n".join(lines)
        except ValueError:
            pass

    # Fallback: tampilkan daftar akun aktif
    akun_list = db.query(Akun).filter(Akun.is_active.is_(True)).order_by(Akun.kode_akun).all()
    lines = ["## Daftar Akun Aktif (Chart of Accounts)"]
    for a in akun_list:
        lines.append(f"- {a.nama_akun} ({a.kategori.value})")
    lines.append("\nUntuk melihat buku besar akun tertentu, sebutkan nama akunnya.")
    return "\n".join(lines)


def _get_upload_summary_context(db: Session, user_id: str) -> str:
    """Ringkasan file yang sudah diupload user."""
    files = (
        db.query(UploadedFile)
        .filter(UploadedFile.uploaded_by_id == user_id)
        .order_by(UploadedFile.created_at.desc())
        .limit(20)
        .all()
    )
    if not files:
        return "## File Upload\nTidak ada file yang diupload."
    lines = [f"## {len(files)} File yang Diupload"]
    for f in files:
        status = f.status.value if f.status else "UNKNOWN"
        size_kb = f.file_size_bytes / 1024
        lines.append(f"- {f.original_filename} ({f.file_type.upper()}, {size_kb:.1f} KB) — Status: {status}")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def get_financial_context(
    db: Session,
    user_id: str,
    question: str,
) -> str | None:
    """
    Deteksi intent pertanyaan dan kumpulkan data keuangan relevan.
    Mengembalikan string context atau None jika tidak ada data relevan.
    """
    intents = _detect_intent(question)
    if not intents:
        return None

    context_parts = []
    tanggal_per = date.today()

    for intent in intents:
        try:
            if intent == "laba_rugi":
                context_parts.append(_get_laba_rugi_context(db, tanggal_per, user_id=user_id))
            elif intent == "posisi_keuangan":
                context_parts.append(_get_posisi_keuangan_context(db, tanggal_per, user_id=user_id))
            elif intent == "neraca_saldo":
                context_parts.append(_get_neraca_saldo_context(db, tanggal_per, user_id=user_id))
            elif intent == "dashboard":
                context_parts.append(_get_dashboard_context(db, tanggal_per, user_id=user_id))
            elif intent == "jurnal":
                context_parts.append(_get_jurnal_context(db, user_id))
            elif intent == "buku_besar":
                context_parts.append(_get_buku_besar_context(db, user_id, question))
            elif intent == "upload_summary":
                context_parts.append(_get_upload_summary_context(db, user_id))
        except Exception as exc:
            logger.warning("Gagal mengambil data untuk intent '%s': %s", intent, exc)

    if not context_parts:
        return None

    return "\n\n---\n\n".join(context_parts)
