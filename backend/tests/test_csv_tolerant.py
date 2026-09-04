"""Tests toleransi upload: nama kolom tanggal/nama beda, format tanggal beragam,
kolom Debit/Kredit terpisah, dan file tanpa tanggal tetap tidak gagal."""

import csv
import os
import tempfile
from datetime import date as date_cls
from datetime import datetime, timedelta
from pathlib import Path

import pytest

from app.database.models import (
    Akun,
    JurnalDetail,
    JurnalUmum,
    KategoriAkun,
    RoleUser,
    SaldoNormal,
    StatusUpload,
    UploadedFile,
    User,
)
from app.services.ingestion.csv_to_jurnal import (
    ALIAS_AKUN_DEBIT,
    COL_JUMLAH,
    COL_TANGGAL,
    JurnalMappingError,
    _amount_header_score,
    _build_column_map,
    _parse_date,
    _parse_float,
)
from app.services.ingestion.ingestion_pipeline import process_uploaded_file


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _seed_coa(db) -> None:
    """Seed COA lengkap dari knowledge/datasets/coa.csv supaya semua akun
    fallback (1-1000, 4-1000, 5-9000, Beban Gaji, Kas, dst.) tersedia."""
    from app.config.settings import settings

    coa_path = Path(settings.KNOWLEDGE_DIR) / "datasets" / "coa.csv"
    with open(coa_path, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            db.add(Akun(
                kode_akun=row["kode_akun"].strip(),
                nama_akun=row["nama_akun"].strip(),
                kategori=KategoriAkun(row["kategori"].strip()),
                sub_kategori=row.get("sub_kategori") or None,
                saldo_normal=SaldoNormal(row["saldo_normal"].strip()),
                is_active=True,
            ))
    db.commit()


def _make_user(db) -> User:
    user = User(
        email="tolerant@example.com",
        hashed_password="x",
        full_name="Tolerant User",
        company_name="T",
        role=RoleUser.OWNER,
        is_active=True,
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def t_user(db):
    _seed_coa(db)
    return _make_user(db)


def _write_csv(path, rows) -> None:
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        for r in rows:
            writer.writerow(r)


def _write_xlsx(path, sheets: dict) -> None:
    from openpyxl import Workbook

    wb = Workbook()
    first = True
    for name, rows in sheets.items():
        ws = wb.active if first else wb.create_sheet(title=name)
        first = False
        for r in rows:
            ws.append(r)
    wb.save(path)


def _process(db, user, data: list[list], suffix="csv") -> tuple[UploadedFile, list[JurnalUmum]]:
    with tempfile.NamedTemporaryFile(suffix=f".{suffix}", delete=False) as f:
        path = f.name
    try:
        if suffix == "csv":
            _write_csv(path, data)
        else:
            _write_xlsx(path, {"Transaksi": data})
        uf = UploadedFile(
            original_filename=os.path.basename(path),
            stored_path=path,
            file_type=suffix,
            file_size_bytes=os.path.getsize(path),
            uploaded_by_id=user.id,
        )
        db.add(uf)
        db.commit()
        db.refresh(uf)
        process_uploaded_file(db, uf)
        db.commit()
        jurnals = (
            db.query(JurnalUmum)
            .filter(JurnalUmum.sumber_upload_id == uf.id)
            .order_by(JurnalUmum.tanggal)
            .all()
        )
        return uf, jurnals
    finally:
        if os.path.exists(path):
            os.unlink(path)


def _total_debit(jurnals) -> float:
    return sum(d.debit for j in jurnals for d in j.detail)


def _total_kredit(jurnals) -> float:
    return sum(d.kredit for j in jurnals for d in j.detail)


def _acc_codes(db, jurnal) -> set[str]:
    ids = [d.akun_id for d in jurnal.detail]
    rows = db.query(Akun.kode_akun).filter(Akun.id.in_(ids)).all()
    return {r[0] for r in rows}


# ---------------------------------------------------------------------------
# Unit: _parse_date toleran
# ---------------------------------------------------------------------------
@pytest.mark.parametrize("raw,expected", [
    ("2025-01-01", date_cls(2025, 1, 1)),
    ("2025/01/01", date_cls(2025, 1, 1)),
    ("01/01/2025", date_cls(2025, 1, 1)),
    ("31/12/2025", date_cls(2025, 12, 31)),
    ("31-12-2025", date_cls(2025, 12, 31)),
    ("31.12.2025", date_cls(2025, 12, 31)),
    ("20251231", date_cls(2025, 12, 31)),
    ("31/12/25", date_cls(2025, 12, 31)),
    ("29-08-2026", date_cls(2026, 8, 29)),
    ("29 Agustus 2026", date_cls(2026, 8, 29)),
    ("29 agustus 2026", date_cls(2026, 8, 29)),
    ("15 Maret 2026", date_cls(2026, 3, 15)),
    ("2025-01-01 10:30:00", date_cls(2025, 1, 1)),
    ("2025-01-01 10:30", date_cls(2025, 1, 1)),
    ("01/01/2025 14:05", date_cls(2025, 1, 1)),
    ("2025-01-01T10:30:00.000000", date_cls(2025, 1, 1)),
    ("2025-01-01 10:30:00 WIB", date_cls(2025, 1, 1)),
    (datetime(2025, 1, 1, 9, 30), date_cls(2025, 1, 1)),
    (date_cls(2025, 1, 1), date_cls(2025, 1, 1)),
    (44567, date_cls(1899, 12, 30) + timedelta(days=44567)),
    ("44567", date_cls(1899, 12, 30) + timedelta(days=44567)),
])
def test_parse_date_tolerant(raw, expected):
    assert _parse_date(raw) == expected


@pytest.mark.parametrize("raw", ["", "  ", "nan", "None", "bukan tanggal", "13/13/2025", "2025-00-99"])
def test_parse_date_rejects_garbage(raw):
    with pytest.raises(JurnalMappingError):
        _parse_date(raw)


# ---------------------------------------------------------------------------
# Nama kolom beda / fuzzy
# ---------------------------------------------------------------------------
class TestHeaderTolerance:
    def test_english_headers_transaction_date_item_description(self, db, t_user):
        uf, jurnals = _process(db, t_user, [
            ["Transaction Date", "Item Description", "Amount"],
            ["2025-01-01", "Penjualan barang", 100000],
        ])
        assert uf.status == StatusUpload.POSTED
        assert uf.error_message is None
        assert len(jurnals) == 1
        assert jurnals[0].tanggal == date_cls(2025, 1, 1)
        assert jurnals[0].deskripsi == "Penjualan barang"

    def test_indonesian_variants_tgl_transaksi_nama(self, db, t_user):
        uf, jurnals = _process(db, t_user, [
            ["tgl transaksi", "Nama", "Jumlah"],
            ["2025-01-02", "Bayar listrik", 50000],
        ])
        assert uf.status == StatusUpload.POSTED
        assert len(jurnals) == 1
        assert jurnals[0].tanggal == date_cls(2025, 1, 2)
        assert jurnals[0].deskripsi == "Bayar listrik"

    def test_fuzzy_headers_tgl_trx_item_desc(self, db, t_user):
        uf, jurnals = _process(db, t_user, [
            ["Tgl_trx", "item_desc", "amount"],
            ["2025-03-01", "Penjualan jasa", 75000],
        ])
        assert uf.status == StatusUpload.POSTED
        assert len(jurnals) == 1
        assert jurnals[0].tanggal == date_cls(2025, 3, 1)
        assert jurnals[0].deskripsi == "Penjualan jasa"


# ---------------------------------------------------------------------------
# Format tanggal beragam, end-to-end
# ---------------------------------------------------------------------------
class TestDateFormatIngestion:
    def test_mixed_date_formats_one_file(self, db, t_user):
        rows = [
            ["tanggal", "deskripsi", "jumlah"],
            ["2026-08-29", "Penjualan barang", 100000],
            ["29-08-2026", "Penjualan barang", 200000],
            ["29.08.2026", "Penjualan barang", 300000],
            ["29 Agustus 2026", "Penjualan barang", 400000],
            ["2026-08-29 10:30:00", "Penjualan barang", 500000],
        ]
        uf, jurnals = _process(db, t_user, rows)
        assert uf.status == StatusUpload.POSTED
        assert uf.error_message is None
        assert len(jurnals) == 5
        assert {j.tanggal for j in jurnals} == {date_cls(2026, 8, 29)}

    def test_xlsx_datetime_cells(self, db, t_user):
        data = [
            ["tanggal", "deskripsi", "jumlah"],
            [datetime(2026, 3, 15), "Penjualan barang", 120000],
            [datetime(2026, 3, 16, 14, 30, 0), "Beli bahan", 75000],
        ]
        uf, jurnals = _process(db, t_user, data, suffix="xlsx")
        assert uf.status == StatusUpload.POSTED
        assert len(jurnals) == 2
        assert jurnals[0].tanggal == date_cls(2026, 3, 15)
        assert jurnals[1].tanggal == date_cls(2026, 3, 16)

    def test_xlsx_excel_serial_date(self, db, t_user):
        serial = 44567
        data = [
            ["tanggal", "deskripsi", "jumlah"],
            [serial, "Penjualan barang", 80000],
        ]
        uf, jurnals = _process(db, t_user, data, suffix="xlsx")
        assert uf.status == StatusUpload.POSTED
        assert len(jurnals) == 1
        assert jurnals[0].tanggal == date_cls(1899, 12, 30) + timedelta(days=serial)


# ---------------------------------------------------------------------------
# Format baku Debit/Kredit
# ---------------------------------------------------------------------------
class TestDebitKreditColumnar:
    def test_debit_kredit_columns(self, db, t_user):
        rows = [
            ["Tanggal", "Keterangan", "Debit", "Kredit"],
            ["2025-01-01", "Bayar sewa gedung", "5000000", ""],
            ["2025-01-02", "Penjualan barang", "", "1500000"],
        ]
        uf, jurnals = _process(db, t_user, rows)
        assert uf.status == StatusUpload.POSTED
        assert uf.error_message is None
        assert len(jurnals) == 2
        assert _total_debit(jurnals) == 6500000
        assert _total_kredit(jurnals) == 6500000


# ---------------------------------------------------------------------------
# Tanpa kolom tanggal -> skip baris, tetap sukses (bukan FAILED)
# ---------------------------------------------------------------------------
class TestGracefulDegradation:
    def test_no_date_column_skips_rows_not_failed(self, db, t_user):
        uf, jurnals = _process(db, t_user, [
            ["deskripsi", "jumlah"],
            ["Penjualan", "100000"],
        ])
        assert uf.status == StatusUpload.POSTED
        assert len(jurnals) == 0
        assert uf.error_message and "tanggal" in uf.error_message.lower()

    def test_garbled_headers_no_date_still_not_failed(self, db, t_user):
        uf, jurnals = _process(db, t_user, [
            ["abc", "xyz"],
            ["Penjualan", "100000"],
        ])
        assert uf.status == StatusUpload.POSTED
        assert uf.error_message

    def test_one_bad_date_row_skipped_others_posted(self, db, t_user):
        uf, jurnals = _process(db, t_user, [
            ["tanggal", "deskripsi", "jumlah"],
            ["2025-01-01", "Penjualan A", 100000],
            ["bukan tanggal", "Penjualan B", 200000],
            ["2025-01-03", "Penjualan C", 300000],
        ])
        assert uf.status == StatusUpload.POSTED
        assert len(jurnals) == 2
        assert "bukan tanggal" in (uf.error_message or "")
        assert _total_debit(jurnals) == 400000

    def test_missing_description_column_default_transaksi(self, db, t_user):
        uf, jurnals = _process(db, t_user, [
            ["tanggal", "jumlah"],
            ["2025-01-01", "100000"],
        ])
        assert uf.status == StatusUpload.POSTED
        assert len(jurnals) == 1
        assert jurnals[0].deskripsi == "Transaksi"


# ---------------------------------------------------------------------------
# Format B dengan nama kolom akun yang beda (mis. "No Akun Debit")
# ---------------------------------------------------------------------------
class TestFormatBFuzzyAccounts:
    def test_account_columns_alias(self, db, t_user):
        rows = [
            ["tgl transaksi", "Keterangan", "Total", "No Akun Debit", "No Akun Kredit"],
            ["2025-01-01", "Bayar gaji karyawan", "500000", "Beban Gaji", "Kas"],
        ]
        uf, jurnals = _process(db, t_user, rows)
        assert uf.status == StatusUpload.POSTED
        assert len(jurnals) == 1
        assert jurnals[0].deskripsi == "Bayar gaji karyawan"
        assert _total_debit(jurnals) == 500000
        assert _total_kredit(jurnals) == 500000


# ---------------------------------------------------------------------------
# Kolom tidak sesuai dibuang: "metode pembayaran", qty, harga satuan, dst.
# ---------------------------------------------------------------------------
class TestAmountColumnDetection:
    def test_header_score_priorities(self):
        assert _amount_header_score("total") == 2.0
        assert _amount_header_score("subtotal") == 1.0
        assert _amount_header_score("nominal") == 2.0
        assert _amount_header_score("pemasukan (rp)") == 2.0
        assert _amount_header_score("pengeluaran (rp)") == 1.0
        assert _amount_header_score("qty") == -1.0
        assert _amount_header_score("harga_satuan") == -1.0
        assert _amount_header_score("diskon") == -1.0
        assert _amount_header_score("ppn") == -1.0
        assert _amount_header_score("saldo_kas_rp") == -1.0
        assert _amount_header_score("metode_pembayaran") == -1.0

    def test_build_column_map_100k_headers_pick_total(self):
        headers = [
            "transaction_id", "tanggal", "waktu", "tipe", "kategori", "deskripsi",
            "pelanggan_supplier", "metode_pembayaran", "qty", "satuan", "harga_satuan",
            "diskon", "subtotal", "ppn", "total", "akun_debit", "akun_kredit",
        ]
        m = _build_column_map(headers)
        assert m["tanggal"] == COL_TANGGAL
        assert m["total"] == COL_JUMLAH
        assert "subtotal" not in m
        assert "metode_pembayaran" not in m
        assert m["akun_debit"] == ALIAS_AKUN_DEBIT

    def test_parse_float_text_message(self):
        with pytest.raises(JurnalMappingError) as exc:
            _parse_float("Transfer")
        assert "Tidak bisa baca nominal" in str(exc.value)


class TestDropUnmatchedColumns:
    def test_format_100k_like_uses_total_skips_metode_pembayaran(self, db, t_user):
        header = [
            "transaction_id", "tanggal", "waktu", "tipe", "kategori", "deskripsi",
            "pelanggan_supplier", "metode_pembayaran", "qty", "satuan", "harga_satuan",
            "diskon", "subtotal", "ppn", "total", "akun_debit", "akun_kredit",
        ]
        rows = [
            header,
            ["1", "2025-01-01", "08:00", "Penjualan", "Makanan", "Penjualan nasi goreng",
             "Budi", "Transfer", "2", "porsi", "12000", "0", "24000", "2800", "26800", "Kas", "Pendapatan Penjualan"],
            ["2", "2025-01-02", "09:00", "Beban", "Operasional", "Bayar listrik",
             "PLN", "QRIS", "1", "bulan", "250000", "0", "250000", "0", "250000", "Beban Listrik", "Kas"],
            ["3", "2025-01-03", "10:00", "Penjualan", "Makanan", "Penjualan es teh",
             "Andi", "Cash", "1", "gelas", "5000", "0", "5000", "300", "5300", "Kas", "Pendapatan Penjualan"],
        ]
        uf, jurnals = _process(db, t_user, rows)
        assert uf.status == StatusUpload.POSTED
        assert len(jurnals) == 3
        assert _total_debit(jurnals) == 26800 + 250000 + 5300
        assert _total_kredit(jurnals) == 26800 + 250000 + 5300

    def test_numeric_payment_method_codes_not_used_as_amount(self, db, t_user):
        rows = [
            ["tanggal", "deskripsi", "metode_pembayaran", "total"],
            ["2025-01-01", "Penjualan tunai", "1", "100000"],
            ["2025-01-02", "Penjualan QRIS", "2", "250000"],
        ]
        uf, jurnals = _process(db, t_user, rows)
        assert uf.status == StatusUpload.POSTED
        assert len(jurnals) == 2
        assert _total_debit(jurnals) == 350000

    def test_text_pembayaran_column_dropped_nominal_used(self, db, t_user):
        rows = [
            ["tanggal", "deskripsi", "pembayaran", "nominal"],
            ["2025-01-01", "Jual", "Transfer", "100000"],
            ["2025-01-02", "Jual", "QRIS", "250000"],
        ]
        uf, jurnals = _process(db, t_user, rows)
        assert uf.status == StatusUpload.POSTED
        assert len(jurnals) == 2
        assert _total_debit(jurnals) == 350000


# ---------------------------------------------------------------------------
# Format Pemasukan (Rp) / Pengeluaran (Rp) tanpa kolom jumlah
# ---------------------------------------------------------------------------
class TestPemasukanPengeluaranPair:
    def test_pemasukan_pengeluaran_pair_direction(self, db, t_user):
        rows = [
            ["No", "Tanggal", "Kategori", "Uraian / Deskripsi", "No. Bukti",
             "Metode Pembayaran", "Pemasukan (Rp)", "Pengeluaran (Rp)", "Saldo Kas (Rp)"],
            ["1", "2025-01-01", "Penjualan", "Penjualan barang B", "B001", "Transfer", "1000000", "", "1000000"],
            ["2", "2025-01-02", "Beban", "Bayar sewa", "B002", "Bank", "", "500000", "500000"],
        ]
        uf, jurnals = _process(db, t_user, rows)
        assert uf.status == StatusUpload.POSTED
        assert len(jurnals) == 2
        assert _total_debit(jurnals) == 1500000
        assert _total_kredit(jurnals) == 1500000
        assert _acc_codes(db, jurnals[0]) == {"1-1000", "4-1000"}
        assert _acc_codes(db, jurnals[1]) == {"5-9000", "1-1000"}


# ---------------------------------------------------------------------------
# Pesan error baris di-cap agar tidak menuh-menuhin UI
# ---------------------------------------------------------------------------
class TestWarningCap:
    def test_many_bad_rows_error_message_capped(self, db, t_user):
        rows = [["tanggal", "deskripsi", "jumlah"]] + [
            ["bukan tanggal", "Transaksi X", 1000] for _ in range(50)
        ]
        uf, jurnals = _process(db, t_user, rows)
        assert uf.status == StatusUpload.POSTED
        assert len(jurnals) == 0
        msg = uf.error_message or ""
        assert "baris lagi" in msg
        assert msg.count("Baris") <= 8