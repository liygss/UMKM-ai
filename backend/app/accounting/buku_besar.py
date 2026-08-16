"""
Buku Besar (General Ledger) — dihitung on the fly dari JurnalUmum + JurnalDetail,
bukan tabel tersendiri (lihat catatan di database/models.py).

Untuk setiap akun, baris buku besar diurutkan berdasarkan tanggal jurnal,
dengan saldo berjalan (running balance) yang memperhitungkan saldo normal akun.
"""

from dataclasses import dataclass, field
from datetime import date

from sqlalchemy.orm import Session, joinedload

from app.accounting.akun import get_akun_by_kode, saldo_bertambah_di_debit
from app.database.models import Akun, JurnalDetail, JurnalUmum


@dataclass
class BukuBesarBaris:
    tanggal: date
    no_bukti: str
    deskripsi: str
    keterangan: str | None
    debit: float
    kredit: float
    saldo_berjalan: float


@dataclass
class BukuBesarAkun:
    kode_akun: str
    nama_akun: str
    saldo_awal: float
    baris: list[BukuBesarBaris] = field(default_factory=list)
    saldo_akhir: float = 0.0


def get_buku_besar(
    db: Session,
    kode_akun: str,
    tanggal_mulai: date | None = None,
    tanggal_akhir: date | None = None,
    saldo_awal: float = 0.0,
    user_id: str | None = None,
) -> BukuBesarAkun:
    """
    Buku besar untuk satu akun. `saldo_awal` dipakai kalau ada saldo dari
    periode sebelumnya yang perlu dibawa (carry-forward); default 0 untuk
    UMKM yang baru mulai pembukuan.
    """
    akun = get_akun_by_kode(db, kode_akun)
    if akun is None:
        raise ValueError(f"Akun dengan kode {kode_akun} tidak ditemukan")

    query = (
        db.query(JurnalDetail)
        .join(JurnalUmum)
        .options(joinedload(JurnalDetail.jurnal))
        .filter(JurnalDetail.akun_id == akun.id)
    )
    if user_id:
        query = query.filter(JurnalUmum.created_by_id == user_id)
    if tanggal_mulai:
        query = query.filter(JurnalUmum.tanggal >= tanggal_mulai)
    if tanggal_akhir:
        query = query.filter(JurnalUmum.tanggal <= tanggal_akhir)

    details = query.order_by(JurnalUmum.tanggal, JurnalUmum.created_at).all()

    hasil = BukuBesarAkun(kode_akun=akun.kode_akun, nama_akun=akun.nama_akun, saldo_awal=saldo_awal)
    saldo = saldo_awal
    bertambah_di_debit = saldo_bertambah_di_debit(akun.saldo_normal)

    for d in details:
        debit = float(d.debit)
        kredit = float(d.kredit)
        if bertambah_di_debit:
            saldo += debit - kredit
        else:
            saldo += kredit - debit
        saldo = round(saldo, 2)

        hasil.baris.append(
            BukuBesarBaris(
                tanggal=d.jurnal.tanggal,
                no_bukti=d.jurnal.no_bukti,
                deskripsi=d.jurnal.deskripsi,
                keterangan=d.keterangan,
                debit=debit,
                kredit=kredit,
                saldo_berjalan=saldo,
            )
        )

    hasil.saldo_akhir = saldo
    return hasil


def get_semua_buku_besar(
    db: Session,
    tanggal_mulai: date | None = None,
    tanggal_akhir: date | None = None,
    user_id: str | None = None,
) -> list[BukuBesarAkun]:
    """Buku besar untuk seluruh akun aktif yang punya minimal 1 transaksi di periode ini."""
    akun_list: list[Akun] = db.query(Akun).filter(Akun.is_active.is_(True)).order_by(Akun.kode_akun).all()
    hasil = []
    for akun in akun_list:
        buku_besar = get_buku_besar(db, akun.kode_akun, tanggal_mulai, tanggal_akhir, user_id=user_id)
        if buku_besar.baris:  # skip akun yang tidak ada transaksinya di periode ini
            hasil.append(buku_besar)
    return hasil
