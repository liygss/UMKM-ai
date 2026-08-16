"""
CALK — Catatan atas Laporan Keuangan.

Sesuai SAK EMKM, CALK minimal memuat:
1. Pernyataan bahwa laporan disusun sesuai SAK EMKM
2. Ikhtisar kebijakan akuntansi yang signifikan
3. Rincian/penjelasan pos-pos tertentu di laporan posisi keuangan & laba rugi

Modul ini menghasilkan STRUKTUR data (bukan dokumen jadi) berisi kebijakan
akuntansi standar + rincian akun bernilai material, supaya frontend atau
proses ekspor Word/PDF (lihat skill docx/pdf) yang menyusun tampilan akhirnya.
"""

from dataclasses import dataclass, field
from datetime import date

from sqlalchemy.orm import Session

from app.config.logging import get_logger

logger = get_logger(__name__)

KEBIJAKAN_AKUNTANSI_STANDAR: list[str] = [
    "Laporan keuangan disusun sesuai dengan Standar Akuntansi Keuangan Entitas "
    "Mikro, Kecil, dan Menengah (SAK EMKM).",
    "Dasar penyusunan laporan keuangan adalah biaya historis (historical cost) "
    "dan menggunakan asumsi kelangsungan usaha (going concern).",
    "Laporan keuangan disajikan dalam mata uang Rupiah (Rp).",
    "Pendapatan diakui pada saat barang diserahkan atau jasa diberikan kepada pelanggan.",
    "Beban diakui pada saat terjadi (basis akrual), bukan pada saat kas dibayarkan.",
    "Aset tetap disusutkan menggunakan metode garis lurus (straight-line) "
    "berdasarkan taksiran umur ekonomis dan nilai residunya.",
    "Persediaan dinilai berdasarkan biaya perolehan.",
]


@dataclass
class RincianAkun:
    kode_akun: str
    nama_akun: str
    nilai: float
    catatan: str = ""


@dataclass
class CatatanLaporanKeuangan:
    tanggal_per: date | None
    kebijakan_akuntansi: list[str]
    rincian_aset: list[RincianAkun] = field(default_factory=list)
    rincian_liabilitas: list[RincianAkun] = field(default_factory=list)
    rincian_pendapatan: list[RincianAkun] = field(default_factory=list)
    rincian_beban: list[RincianAkun] = field(default_factory=list)
    catatan_tambahan: list[str] = field(default_factory=list)


def get_calk(
    db: Session,
    tanggal_per: date | None = None,
    ambang_material: float = 0.0,
    user_id: str | None = None,
) -> CatatanLaporanKeuangan:
    """
    `ambang_material`: kalau diisi > 0, hanya akun dengan nilai >= ambang ini
    yang dimasukkan ke rincian (supaya CALK tidak dipenuhi akun kecil).
    """
    from app.accounting.laporan_laba_rugi import get_laporan_laba_rugi
    from app.accounting.laporan_posisi_keuangan import get_laporan_posisi_keuangan

    calk = CatatanLaporanKeuangan(
        tanggal_per=tanggal_per,
        kebijakan_akuntansi=list(KEBIJAKAN_AKUNTANSI_STANDAR),
    )

    try:
        posisi_keuangan = get_laporan_posisi_keuangan(db, tanggal_per, user_id=user_id)
    except Exception as exc:
        logger.error("Gagal memuat laporan posisi keuangan untuk CALK: %s", exc)
        calk.catatan_tambahan.append(f"Gagal memuat data posisi keuangan: {exc}")
        posisi_keuangan = None

    try:
        laba_rugi = get_laporan_laba_rugi(db, tanggal_per, user_id=user_id)
    except Exception as exc:
        logger.error("Gagal memuat laporan laba rugi untuk CALK: %s", exc)
        calk.catatan_tambahan.append(f"Gagal memuat data laba rugi: {exc}")
        laba_rugi = None

    if posisi_keuangan is not None:
        calk.rincian_aset = [
            RincianAkun(b.kode_akun, b.nama_akun, b.nilai)
            for b in posisi_keuangan.aset
            if abs(b.nilai) >= ambang_material
        ]
        calk.rincian_liabilitas = [
            RincianAkun(b.kode_akun, b.nama_akun, b.nilai)
            for b in posisi_keuangan.liabilitas
            if abs(b.nilai) >= ambang_material
        ]
        if not posisi_keuangan.is_balance:
            calk.catatan_tambahan.append(
                "PERINGATAN: Laporan Posisi Keuangan belum balance (Total Aset != "
                "Total Liabilitas + Modal). Periksa kembali jurnal yang sudah diinput."
            )

    if laba_rugi is not None:
        calk.rincian_pendapatan = [
            RincianAkun(b.kode_akun, b.nama_akun, b.nilai)
            for b in laba_rugi.pendapatan
            if abs(b.nilai) >= ambang_material
        ]
        calk.rincian_beban = [
            RincianAkun(b.kode_akun, b.nama_akun, b.nilai)
            for b in (laba_rugi.hpp + laba_rugi.beban_operasional)
            if abs(b.nilai) >= ambang_material
        ]

    return calk
