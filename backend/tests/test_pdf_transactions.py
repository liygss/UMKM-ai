"""Tests ekstraksi & pembukuan data transaksi dari PDF berisi teks CSV.

PDF yang dibuat dari CSV/XLSX (baris-baris teks CSV di dalam PDF) sekarang
langsung dibuatkan jurnal otomatis (masuk dashboard) seperti CSV/XLSX, bukan
hanya masuk knowledge base.
"""

import csv
import os
import tempfile
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
from app.services.ingestion.file_loader import LoadedDocument
from app.services.ingestion.pdf_transactions import extract_transaction_dataframe
from app.services.ingestion.ingestion_pipeline import process_uploaded_file

HEADER = [
    "transaction_id", "tanggal", "waktu", "tipe", "kategori", "deskripsi",
    "total", "akun_debit", "akun_kredit",
]


def _pdf_doc(pages: list[str]) -> LoadedDocument:
    return LoadedDocument(file_type="pdf", raw_text_pages=pages)


def _row(txid, tgl, tipe, kategori, deskripsi, total, debit, kredit) -> str:
    return (
        f"{txid},{tgl},12:00,{tipe},{kategori},{deskripsi},"
        f"{total},{debit},{kredit}"
    )


def _seed_coa(db) -> None:
    from app.config.settings import settings

    coa_path = Path(settings.KNOWLEDGE_DIR) / "datasets" / "coa.csv"
    if not coa_path.exists():
        pytest.skip("coa.csv knowledge tidak ditemukan")
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
        email="pdf-trx@example.com",
        hashed_password="x",
        full_name="PDF Trx",
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


# ---------------------------------------------------------------------------
# Unit: extract_transaction_dataframe
# ---------------------------------------------------------------------------
class TestExtractTransactionDataframe:
    def test_multipage_pdf_parses_csv_rows(self):
        r1 = _row("TRX-00001", "2023-01-01", "Penjualan", "Makanan", "Penjualan Nasi Goreng", "24000", "Kas", "Penjualan")
        r2 = _row("TRX-00002", "2023-01-02", "Beban", "Operasional", "Bayar listrik", "250000", "Beban Gaji", "Kas")
        r3 = _row("TRX-00003", "2023-01-03", "Penjualan", "Makanan", "Penjualan Es Teh", "5300", "Kas", "Penjualan")
        page1 = "\n".join([",".join(HEADER), r1, r2])
        page2 = r3

        df = extract_transaction_dataframe(_pdf_doc([page1, page2]))

        assert df is not None
        assert df.shape == (3, len(HEADER))
        assert list(df.columns) == HEADER
        assert df.loc[1, "deskripsi"] == "Bayar listrik"

    def test_glued_rows_across_page_boundary(self):
        """Baris terakhir halaman 1 menempel dengan baris pertama halaman 2
        (newline hilang saat ekstraksi) -> tetap terpecah jadi 2 baris utuh."""
        f2 = ["TRX-00002", "2023-01-02", "12:00", "Beban", "Operasional", "Bayar listrik", "250000", "Beban Gaji", "Kas"]
        f3 = ["TRX-00003", "2023-01-03", "12:00", "Penjualan", "Makanan", "Penjualan Es Teh", "5300", "Kas", "Penjualan"]
        glued_line = ",".join(f2[:-1]) + "," + f2[-1] + f3[0] + "," + ",".join(f3[1:])

        r1 = _row("TRX-00001", "2023-01-01", "Penjualan", "Makanan", "Penjualan Nasi Goreng", "24000", "Kas", "Penjualan")
        page1 = "\n".join([",".join(HEADER), r1])
        page2 = glued_line

        df = extract_transaction_dataframe(_pdf_doc([page1, page2]))

        assert df is not None
        assert len(df) == 3
        assert df.loc[1, "akun_kredit"] == "Kas"
        assert df.loc[2, "transaction_id"] == "TRX-00003"
        assert df.loc[2, "akun_debit"] == "Kas"

    def test_stray_short_lines_do_not_corrupt_rows(self):
        """Nomor halaman/baris pendek di sela baris data tidak boleh
        menggeser kolom baris transaksi yang valid."""
        r1 = _row("TRX-00001", "2023-01-01", "Penjualan", "Makanan", "Penjualan Nasi Goreng", "24000", "Kas", "Penjualan")
        r2 = _row("TRX-00002", "2023-01-02", "Beban", "Operasional", "Bayar listrik", "250000", "Beban Gaji", "Kas")
        r3 = _row("TRX-00003", "2023-01-03", "Penjualan", "Makanan", "Penjualan Es Teh", "5300", "Kas", "Penjualan")
        text = "\n".join([",".join(HEADER), r1, "1", r2, "2", r3])

        df = extract_transaction_dataframe(_pdf_doc([text]))

        assert df is not None
        assert len(df) == 3
        assert df.loc[1, "deskripsi"] == "Bayar listrik"
        assert df.loc[2, "total"] == "5300"

    def test_header_not_on_first_line(self):
        title = "Laporan Transaksi Toko Berkah Periode Januari 2023"
        r1 = _row("TRX-00001", "2023-01-01", "Penjualan", "Makanan", "Penjualan Nasi Goreng", "24000", "Kas", "Penjualan")
        r2 = _row("TRX-00002", "2023-01-02", "Beban", "Operasional", "Bayar listrik", "250000", "Beban Gaji", "Kas")
        r3 = _row("TRX-00003", "2023-01-03", "Penjualan", "Makanan", "Penjualan Es Teh", "5300", "Kas", "Penjualan")
        text = "\n".join([title, ",".join(HEADER), r1, r2, r3])

        df = extract_transaction_dataframe(_pdf_doc([text]))

        assert df is not None
        assert len(df) == 3

    def test_prose_pdf_is_not_transaction(self):
        pages = [
            "# Pajak Penghasilan Badan\n"
            "Kewajiban pajak badan diatur dalam Undang-Undang Ketentuan Umum dan "
            "Tata Cara Perpajakan. Wajib pajak badan wajib menyelenggarakan "
            "pembukuan dan melaporkan SPT Tahunan paling lambat empat bulan "
            "setelah akhir tahun pajak berjalan.",
        ]
        assert extract_transaction_dataframe(_pdf_doc(pages)) is None

    def test_empty_pdf_is_none(self):
        assert extract_transaction_dataframe(_pdf_doc(["", "", ""])) is None

    def test_too_few_rows_is_none(self):
        text = "\n".join([
            ",".join(HEADER),
            _row("TRX-00001", "2023-01-01", "Penjualan", "Makanan", "Penjualan Nasi Goreng", "24000", "Kas", "Penjualan"),
        ])
        assert extract_transaction_dataframe(_pdf_doc([text])) is None


# ---------------------------------------------------------------------------
# End-to-end: process_uploaded_file membuat jurnal dari PDF transaksi
# ---------------------------------------------------------------------------
class TestPdfTransactionsEndToEnd:
    def test_pdf_transaction_posts_jurnal(self, db, t_user, monkeypatch):
        r1 = _row("TRX-00001", "2023-01-01", "Modal", "Setoran Modal", "Setoran modal awal", "50000000", "Bank", "Modal")
        r2 = _row("TRX-00002", "2023-01-02", "Penjualan", "Sabun", "Penjualan Sabun", "22500", "Kas", "Penjualan")
        r3 = _row("TRX-00003", "2023-01-03", "Beban", "Operasional", "Bayar gaji", "4000000", "Beban Gaji", "Kas")
        pages = [",".join(HEADER), "\n".join([r1, r2]), r3]

        monkeypatch.setattr(
            "app.services.ingestion.ingestion_pipeline.load_file",
            lambda *a, **k: _pdf_doc(pages),
        )
        monkeypatch.setattr(
            "app.services.ingestion.ingestion_pipeline._rag_background",
            lambda *a, **k: None,
        )

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
            path = f.name
        try:
            uf = UploadedFile(
                original_filename=os.path.basename(path),
                stored_path=path,
                file_type="pdf",
                file_size_bytes=os.path.getsize(path),
                uploaded_by_id=t_user.id,
            )
            db.add(uf)
            db.commit()
            db.refresh(uf)

            process_uploaded_file(db, uf)
            db.commit()

            assert uf.status == StatusUpload.POSTED
            assert uf.error_message is None

            jurnals = (
                db.query(JurnalUmum)
                .filter(JurnalUmum.sumber_upload_id == uf.id)
                .order_by(JurnalUmum.tanggal)
                .all()
            )
            assert len(jurnals) == 3

            total_debit = sum(d.debit for j in jurnals for d in j.detail)
            total_kredit = sum(d.kredit for j in jurnals for d in j.detail)
            assert total_debit == 50_000_000 + 22_500 + 4_000_000
            assert total_debit == total_kredit
        finally:
            if os.path.exists(path):
                os.unlink(path)

    def test_pdf_knowledge_not_forced_to_journal(self, db, t_user, monkeypatch):
        """PDF prosa tidak masuk jalur jurnal (uji sampai pemilihan status
        oleh extractor, tanpa embedding)."""
        pages = [
            "# Aturan Pajak UMKM\n"
            "Pengusaha kena pajak wajib memungut, menyetor, dan melaporkan PPn "
            "sesuai ketentuan perundang-undangan yang berlaku di Indonesia.",
        ]
        doc = _pdf_doc(pages)
        assert extract_transaction_dataframe(doc) is None