"""
Helper query untuk Akun (Chart of Accounts).
Dipisah dari router supaya bisa dipakai ulang oleh buku_besar, neraca_saldo,
laporan_laba_rugi, laporan_posisi_keuangan, dan tax_engine tanpa bergantung
pada FastAPI request/response.
"""

from sqlalchemy.orm import Session

from app.database.models import Akun, KategoriAkun, SaldoNormal


def get_akun_by_kode(db: Session, kode_akun: str) -> Akun | None:
    return db.query(Akun).filter(Akun.kode_akun == kode_akun).first()


def list_akun_by_kategori(db: Session, kategori: KategoriAkun) -> list[Akun]:
    return (
        db.query(Akun)
        .filter(Akun.kategori == kategori, Akun.is_active.is_(True))
        .order_by(Akun.kode_akun)
        .all()
    )


def list_all_akun_aktif(db: Session) -> list[Akun]:
    return db.query(Akun).filter(Akun.is_active.is_(True)).order_by(Akun.kode_akun).all()


def saldo_bertambah_di_debit(saldo_normal: SaldoNormal) -> bool:
    """True kalau debit menambah saldo akun (Aset & Beban), False kalau kredit yang menambah."""
    return saldo_normal == SaldoNormal.DEBIT


def hitung_saldo_akun(akun: Akun, total_debit: float, total_kredit: float) -> float:
    """
    Menghitung saldo akhir akun berdasarkan saldo normalnya.
    - Akun bersaldo normal DEBIT (Aset, Beban): saldo = total_debit - total_kredit
    - Akun bersaldo normal KREDIT (Liabilitas, Modal, Pendapatan): saldo = total_kredit - total_debit
    """
    if saldo_bertambah_di_debit(akun.saldo_normal):
        return round(total_debit - total_kredit, 2)
    return round(total_kredit - total_debit, 2)
