"""
Helper untuk membuat tabel dan mengisi data awal (seed).

Untuk prototyping cukup jalankan:
    python -m app.database.migration

Untuk production, sebaiknya migrasi skema pakai Alembic (bukan create_all),
supaya perubahan skema tercatat dan reversible:
    alembic init alembic
    alembic revision --autogenerate -m "init schema"
    alembic upgrade head
create_all() di bawah tetap aman dipanggil bersamaan dengan Alembic karena
ia hanya membuat tabel yang belum ada (idempotent), tapi begitu Alembic
dipakai, jadikan Alembic sebagai satu-satunya sumber kebenaran skema.
"""

from app.config.logging import get_logger, setup_logging
from app.database.database import Base, SessionLocal, engine
from app.database.models import Akun, KategoriAkun, SaldoNormal

logger = get_logger(__name__)

# Daftar akun standar minimal untuk UMKM sesuai SAK EMKM.
# (kode_akun, nama_akun, kategori, sub_kategori, saldo_normal)
DEFAULT_CHART_OF_ACCOUNTS: list[tuple[str, str, KategoriAkun, str, SaldoNormal]] = [
    # ASET
    ("1-1000", "Kas", KategoriAkun.ASET, "Aset Lancar", SaldoNormal.DEBIT),
    ("1-1100", "Bank", KategoriAkun.ASET, "Aset Lancar", SaldoNormal.DEBIT),
    ("1-1200", "Piutang Usaha", KategoriAkun.ASET, "Aset Lancar", SaldoNormal.DEBIT),
    ("1-1300", "Persediaan Barang Dagang", KategoriAkun.ASET, "Aset Lancar", SaldoNormal.DEBIT),
    ("1-1400", "Perlengkapan", KategoriAkun.ASET, "Aset Lancar", SaldoNormal.DEBIT),
    ("1-2000", "Peralatan", KategoriAkun.ASET, "Aset Tetap", SaldoNormal.DEBIT),
    ("1-2100", "Akumulasi Penyusutan Peralatan", KategoriAkun.ASET, "Aset Tetap", SaldoNormal.KREDIT),
    ("1-2200", "Kendaraan", KategoriAkun.ASET, "Aset Tetap", SaldoNormal.DEBIT),
    ("1-2300", "Akumulasi Penyusutan Kendaraan", KategoriAkun.ASET, "Aset Tetap", SaldoNormal.KREDIT),
    # LIABILITAS
    ("2-1000", "Utang Usaha", KategoriAkun.LIABILITAS, "Liabilitas Jangka Pendek", SaldoNormal.KREDIT),
    ("2-1100", "Utang Bank Jangka Pendek", KategoriAkun.LIABILITAS, "Liabilitas Jangka Pendek", SaldoNormal.KREDIT),
    ("2-1200", "Utang Pajak", KategoriAkun.LIABILITAS, "Liabilitas Jangka Pendek", SaldoNormal.KREDIT),
    ("2-2000", "Utang Bank Jangka Panjang", KategoriAkun.LIABILITAS, "Liabilitas Jangka Panjang", SaldoNormal.KREDIT),
    # MODAL
    ("3-1000", "Modal Pemilik", KategoriAkun.MODAL, "Ekuitas", SaldoNormal.KREDIT),
    ("3-2000", "Prive", KategoriAkun.MODAL, "Ekuitas", SaldoNormal.DEBIT),
    ("3-3000", "Laba Ditahan", KategoriAkun.MODAL, "Ekuitas", SaldoNormal.KREDIT),
    # PENDAPATAN
    ("4-1000", "Pendapatan Penjualan", KategoriAkun.PENDAPATAN, "Pendapatan Usaha", SaldoNormal.KREDIT),
    ("4-2000", "Pendapatan Jasa", KategoriAkun.PENDAPATAN, "Pendapatan Usaha", SaldoNormal.KREDIT),
    ("4-9000", "Pendapatan Lain-lain", KategoriAkun.PENDAPATAN, "Pendapatan Lain-lain", SaldoNormal.KREDIT),
    # BEBAN
    ("5-1000", "Harga Pokok Penjualan", KategoriAkun.BEBAN, "Beban Pokok", SaldoNormal.DEBIT),
    ("5-2000", "Beban Gaji", KategoriAkun.BEBAN, "Beban Operasional", SaldoNormal.DEBIT),
    ("5-2100", "Beban Sewa", KategoriAkun.BEBAN, "Beban Operasional", SaldoNormal.DEBIT),
    ("5-2200", "Beban Listrik, Air, dan Telepon", KategoriAkun.BEBAN, "Beban Operasional", SaldoNormal.DEBIT),
    ("5-2300", "Beban Perlengkapan", KategoriAkun.BEBAN, "Beban Operasional", SaldoNormal.DEBIT),
    ("5-2400", "Beban Penyusutan", KategoriAkun.BEBAN, "Beban Operasional", SaldoNormal.DEBIT),
    ("5-2500", "Beban Pajak", KategoriAkun.BEBAN, "Beban Operasional", SaldoNormal.DEBIT),
    ("5-9000", "Beban Lain-lain", KategoriAkun.BEBAN, "Beban Lain-lain", SaldoNormal.DEBIT),
]


def _sqlite_typecompilation(col_type):
    t = str(col_type).upper()
    if "STRING" in t or "VARCHAR" in t or "TEXT" in t:
        return "TEXT"
    if "BOOLEAN" in t:
        return "INTEGER"
    if "DATETIME" in t or "TIMESTAMP" in t:
        return "TEXT"
    if "DATE" in t:
        return "TEXT"
    if "NUMERIC" in t or "FLOAT" in t or "DOUBLE" in t:
        return "REAL"
    return "TEXT"


def _safe_default(col):
    t = str(col.type).upper()
    if "BOOLEAN" in t:
        return "0"
    if "INTEGER" in t or "NUMERIC" in t or "FLOAT" in t or "DOUBLE" in t:
        return "0"
    if "DATETIME" in t or "DATE" in t or "TIMESTAMP" in t:
        if col.nullable:
            return "NULL"
        return "''"
    if col.nullable:
        return "NULL"
    return "''"


def _auto_migrate() -> None:
    """Tambah kolom yang hilang pada tabel yang sudah ada (forward-only)."""
    from sqlalchemy import inspect, text

    inspector = inspect(engine)
    migrations_done = 0
    for table_name, table in Base.metadata.tables.items():
        if not inspector.has_table(table_name):
            continue
        existing = {col["name"] for col in inspector.get_columns(table_name)}
        for col in table.columns:
            if col.name not in existing:
                col_type = _sqlite_typecompilation(col.type)
                default_val = _safe_default(col)
                nullable = "" if col.nullable else " NOT NULL"
                with engine.begin() as conn:
                    conn.execute(text(
                        f'ALTER TABLE {table_name} ADD COLUMN {col.name} {col_type} DEFAULT {default_val}{nullable}'
                    ))
                logger.info("Migration: added column %s.%s", table_name, col.name)
                migrations_done += 1
    if migrations_done:
        logger.info("Auto-migration selesai: %d kolom ditambahkan.", migrations_done)
    else:
        logger.info("Tidak ada kolom yang perlu dimigrasi.")


def create_tables() -> None:
    logger.info("Membuat tabel database (jika belum ada)...")
    Base.metadata.create_all(bind=engine)
    _auto_migrate()
    logger.info("Tabel database siap.")


def seed_chart_of_accounts() -> None:
    """Isi akun default kalau tabel akun masih kosong. Aman dipanggil berulang kali."""
    db = SessionLocal()
    try:
        existing_codes = {a.kode_akun for a in db.query(Akun.kode_akun).all()}
        new_accounts = [
            Akun(
                kode_akun=kode,
                nama_akun=nama,
                kategori=kategori,
                sub_kategori=sub,
                saldo_normal=saldo_normal,
            )
            for kode, nama, kategori, sub, saldo_normal in DEFAULT_CHART_OF_ACCOUNTS
            if kode not in existing_codes
        ]
        if new_accounts:
            db.add_all(new_accounts)
            db.commit()
            logger.info("Menambahkan %d akun default (SAK EMKM).", len(new_accounts))
        else:
            logger.info("Chart of accounts sudah terisi, skip seeding.")
    finally:
        db.close()


def run() -> None:
    setup_logging()
    create_tables()
    seed_chart_of_accounts()


if __name__ == "__main__":
    run()
