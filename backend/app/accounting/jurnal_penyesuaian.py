"""
Jurnal Penyesuaian (Adjusting Entries) — dicatat lewat tabel yang sama dengan
Jurnal Umum, dibedakan lewat kolom `jenis = PENYESUAIAN`.

Modul ini menyediakan:
1. Fungsi generik `catat_penyesuaian()` untuk input bebas.
2. Beberapa "template" untuk penyesuaian yang paling umum di UMKM,
   supaya user tidak perlu tahu pasangan akun debit/kredit yang benar:
   - Perlengkapan yang terpakai
   - Penyusutan aset tetap (garis lurus / straight-line)
   - Beban dibayar di muka yang sudah jadi beban
   - Pendapatan diterima di muka yang sudah jadi pendapatan
"""

from datetime import date

from sqlalchemy.orm import Session

from app.accounting.jurnal_umum import JurnalDetailInputDTO, JurnalError, buat_jurnal
from app.database.models import JenisJurnal, JurnalUmum


def catat_penyesuaian(
    db: Session,
    no_bukti: str,
    tanggal: date,
    deskripsi: str,
    detail: list[JurnalDetailInputDTO],
    created_by_id: str,
) -> JurnalUmum:
    """Input jurnal penyesuaian secara bebas (dua baris atau lebih, harus balance)."""
    return buat_jurnal(
        db,
        no_bukti=no_bukti,
        tanggal=tanggal,
        deskripsi=deskripsi,
        detail=detail,
        created_by_id=created_by_id,
        jenis=JenisJurnal.PENYESUAIAN,
    )


def penyesuaian_perlengkapan_terpakai(
    db: Session,
    no_bukti: str,
    tanggal: date,
    nilai_terpakai: float,
    created_by_id: str,
    kode_akun_perlengkapan: str = "1-1400",
    kode_akun_beban_perlengkapan: str = "5-2300",
) -> JurnalUmum:
    """
    Perlengkapan yang sudah terpakai selama periode dipindahkan dari akun
    Aset (Perlengkapan) ke akun Beban.
        (D) Beban Perlengkapan   xxx
            (K) Perlengkapan         xxx
    """
    if nilai_terpakai <= 0:
        raise JurnalError("Nilai perlengkapan terpakai harus lebih dari 0")

    detail = [
        JurnalDetailInputDTO(kode_akun_beban_perlengkapan, debit=nilai_terpakai, kredit=0),
        JurnalDetailInputDTO(kode_akun_perlengkapan, debit=0, kredit=nilai_terpakai),
    ]
    return catat_penyesuaian(
        db, no_bukti, tanggal, "Penyesuaian: perlengkapan terpakai", detail, created_by_id
    )


def penyesuaian_penyusutan_aset(
    db: Session,
    no_bukti: str,
    tanggal: date,
    harga_perolehan: float,
    nilai_residu: float,
    umur_ekonomis_tahun: float,
    created_by_id: str,
    kode_akun_beban_penyusutan: str = "5-2400",
    kode_akun_akumulasi_penyusutan: str = "1-2100",
    bulan_penyusutan: float = 1,
) -> JurnalUmum:
    """
    Penyusutan garis lurus (straight-line), metode yang paling umum
    dipakai UMKM sesuai SAK EMKM:
        Penyusutan per tahun = (Harga Perolehan - Nilai Residu) / Umur Ekonomis
        Penyusutan per bulan = Penyusutan per tahun / 12
    Jurnal:
        (D) Beban Penyusutan             xxx
            (K) Akumulasi Penyusutan         xxx
    """
    if umur_ekonomis_tahun <= 0:
        raise JurnalError("Umur ekonomis aset harus lebih dari 0 tahun")
    if harga_perolehan < nilai_residu:
        raise JurnalError("Harga perolehan tidak boleh lebih kecil dari nilai residu")

    penyusutan_per_tahun = (harga_perolehan - nilai_residu) / umur_ekonomis_tahun
    nilai_penyusutan = round(penyusutan_per_tahun / 12 * bulan_penyusutan, 2)

    detail = [
        JurnalDetailInputDTO(kode_akun_beban_penyusutan, debit=nilai_penyusutan, kredit=0),
        JurnalDetailInputDTO(kode_akun_akumulasi_penyusutan, debit=0, kredit=nilai_penyusutan),
    ]
    return catat_penyesuaian(
        db,
        no_bukti,
        tanggal,
        f"Penyesuaian: penyusutan aset ({bulan_penyusutan} bulan, garis lurus)",
        detail,
        created_by_id,
    )


def penyesuaian_beban_dibayar_dimuka(
    db: Session,
    no_bukti: str,
    tanggal: date,
    nilai_yang_sudah_jadi_beban: float,
    kode_akun_beban_dibayar_dimuka: str,
    kode_akun_beban: str,
    created_by_id: str,
) -> JurnalUmum:
    """
    Contoh: sewa dibayar di muka untuk 1 tahun, bulan ini porsi yang sudah
    "terpakai" dipindah jadi beban:
        (D) Beban (mis. Beban Sewa)          xxx
            (K) Beban Dibayar di Muka            xxx
    """
    if nilai_yang_sudah_jadi_beban <= 0:
        raise JurnalError("Nilai penyesuaian harus lebih dari 0")

    detail = [
        JurnalDetailInputDTO(kode_akun_beban, debit=nilai_yang_sudah_jadi_beban, kredit=0),
        JurnalDetailInputDTO(kode_akun_beban_dibayar_dimuka, debit=0, kredit=nilai_yang_sudah_jadi_beban),
    ]
    return catat_penyesuaian(
        db, no_bukti, tanggal, "Penyesuaian: beban dibayar di muka", detail, created_by_id
    )


def penyesuaian_pendapatan_diterima_dimuka(
    db: Session,
    no_bukti: str,
    tanggal: date,
    nilai_yang_sudah_jadi_pendapatan: float,
    kode_akun_pendapatan_diterima_dimuka: str,
    kode_akun_pendapatan: str,
    created_by_id: str,
) -> JurnalUmum:
    """
    Contoh: uang muka jasa yang sebagian sudah dikerjakan bulan ini:
        (D) Pendapatan Diterima di Muka      xxx
            (K) Pendapatan                       xxx
    """
    if nilai_yang_sudah_jadi_pendapatan <= 0:
        raise JurnalError("Nilai penyesuaian harus lebih dari 0")

    detail = [
        JurnalDetailInputDTO(
            kode_akun_pendapatan_diterima_dimuka, debit=nilai_yang_sudah_jadi_pendapatan, kredit=0
        ),
        JurnalDetailInputDTO(kode_akun_pendapatan, debit=0, kredit=nilai_yang_sudah_jadi_pendapatan),
    ]
    return catat_penyesuaian(
        db, no_bukti, tanggal, "Penyesuaian: pendapatan diterima di muka", detail, created_by_id
    )
