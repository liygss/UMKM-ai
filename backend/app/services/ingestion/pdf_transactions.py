"""
Deteksi & ekstraksi data transaksi dari PDF yang berisi baris teks CSV.

Banyak pengguna mengupload PDF yang sebenarnya adalah data transaksi
(dibuat dari CSV/XLSX yang di-print ke PDF). PDF semacam ini harus bisa
langsung dibuatkan jurnal otomatis (masuk dashboard) seperti CSV/XLSX,
bukan hanya masuk knowledge base.

Strategi:
  1. Gabung teks semua halaman dengan '\n' supaya baris yang terpotong di
     batas halaman tidak tersambung jadi satu baris rusak.
  2. Cari baris header yang mirip tabel transaksi (punya kolom tanggal +
     kolom nominal) memakai `_build_column_map` dari csv_to_jurnal.
  3. Kalau ketemu, parse baris sisa jadi DataFrame dan kembalikan.
  4. Kalau bukan (prosa, form, PDF scan tanpa teks) -> None, dan pemanggil
     jatuh ke pipeline knowledge base biasa.

Baris yang jumlah kolomnya tidak sama dengan header (terpotong antar
halaman / ada header/footer) dilewati dengan aman; auto_journal_from_dataframe
sudah toleran terhadap header asing dan baris kosong.
"""

import csv
import re
from dataclasses import dataclass

import pandas as pd

from app.config.logging import get_logger
from app.services.ingestion.csv_to_jurnal import (
    COL_DEBIT,
    COL_JUMLAH,
    COL_KREDIT,
    COL_MASUK,
    COL_KELUAR,
    COL_TANGGAL,
    _build_column_map,
    _parse_date,
)
from app.services.ingestion.file_loader import LoadedDocument

logger = get_logger(__name__)

_AMOUNT_CANONICAL = (COL_JUMLAH, COL_DEBIT, COL_KREDIT, COL_MASUK, COL_KELUAR)

# Minimal jumlah baris data supaya PDF prosa/aturan tidak salah dikira transaksi.
_MIN_DATA_ROWS = 3

# Jumlah baris awal yang dicoba sebagai kandidat header (header bisa saja
# tidak di baris pertama kalau ada judul/deskripsi di atasnya).
_MAX_HEADER_CANDIDATES = 10


@dataclass
class _Candidate:
    header_idx: int
    header: list[str]


def _split_glued_field(field: str) -> list[str]:
    """Pecah field yang tersambung karena baris baru hilang saat ekstraksi.

    Generik berdasarkan marker ID transaksi yang umum (TRX-xxx, TXN-xxx,
    INV-xxx, dsb). ID bisa menempel pada kata sebelumnya (mis. 'KasTRX-00002'),
    jadi tidak memakai word boundary di awal. Kalau ID muncul di posisi 0
    (field memang dimulai dengan ID), berarti tidak ada yang tersambung.
    """
    match = re.search(r"(?:TRX|TXN|INV|INVC|BK|BT|JM)-\d+", field)
    if not match or match.start() == 0:
        return [field]
    return [field[: match.start()], field[match.start():]]


def _glued_rows(rows: list[list[str]], header_len: int) -> list[list[str]]:
    """Rekonstruksi baris yang jumlah kolomnya tidak sesuai header.

    - Baris dgn kolom == header_len -> baris utuh, dipakai langsung.
    - Baris dgn kolom < header_len -> sisa baris yang terpotong antar halaman:
      sambung dengan baris berikut kalau totalnya pas header_len; kalau tidak
      (mis. nomor halaman), dianggap noise dan dilewati.
    - Baris dgn kolom > header_len -> baris tergabung tanpa newline: coba
      pecah lewat marker ID transaksi; kalau tidak bisa, dilewati.
    """
    hasil: list[list[str]] = []
    i = 0
    n = len(rows)
    while i < n:
        row = rows[i]
        l = len(row)
        if l == header_len:
            hasil.append(row)
            i += 1
            continue
        if l > header_len:
            rebuilt: list[str] = []
            for field in row:
                rebuilt.extend(_split_glued_field(field))
            if rebuilt and len(rebuilt) >= header_len and len(rebuilt) % header_len == 0:
                hasil.extend(rebuilt[j:j + header_len] for j in range(0, len(rebuilt), header_len))
            i += 1
            continue
        # l < header_len
        if i + 1 < n and l + len(rows[i + 1]) == header_len:
            hasil.append(row + rows[i + 1])
            i += 2
            continue
        i += 1
    return hasil


def _is_transaction_table(header: list[str], df: pd.DataFrame) -> bool:
    """True kalau header+data benar-benar mirip tabel transaksi:
    ada kolom tanggal dan kolom nominal (dari nama kolom ATAU isi data)."""
    if len(header) < 3 or df.empty:
        return False
    if len(df) < _MIN_DATA_ROWS:
        return False

    colmap = _build_column_map(header)
    has_date_by_name = any(c == COL_TANGGAL for c in colmap.values())

    # Validasi isi: kolom tanggal betulan berisi tanggal.
    date_col = None
    for col, canonical in colmap.items():
        if canonical == COL_TANGGAL:
            date_col = col
            break
    if date_col is not None and not _looks_like_date_column(df[date_col]):
        return False

    # Kalau nama header kurang jelas, cek isi data (deteksi oleh
    # auto_journal_from_dataframe yang akan jalan kemudian).
    if has_date_by_name:
        return True
    return _looks_like_date_column(df[df.columns[0]]) or _detect_date_column_name(df)


def _looks_like_date_column(series) -> bool:
    sample = series.dropna().head(20)
    if sample.empty:
        return False
    for v in sample:
        try:
            _parse_date(str(v))
        except Exception:
            return False
    return True


def _detect_date_column_name(df: pd.DataFrame) -> bool:
    """Cari kolom yang isinya berupa tanggal (header apa pun)."""
    for col in df.columns:
        if _looks_like_date_column(df[col]):
            return True
    return False


def _find_header_candidate(lines: list[str]) -> _Candidate | None:
    """Cari baris header transaksi di beberapa baris pertama."""
    for i in range(min(len(lines), _MAX_HEADER_CANDIDATES)):
        line = lines[i].strip()
        if not line:
            continue
        try:
            header = next(csv.reader([line]))
        except Exception:  # noqa: BLE001
            continue
        header = [h.strip() for h in header]
        if len(header) < 3:
            continue
        colmap = _build_column_map(header)
        has_date = any(c == COL_TANGGAL for c in colmap.values())
        has_amount = any(c in _AMOUNT_CANONICAL for c in colmap.values())
        if has_date and has_amount:
            return _Candidate(header_idx=i, header=header)
    return None


def extract_transaction_dataframe(doc: LoadedDocument) -> pd.DataFrame | None:
    """Ekstrak DataFrame transaksi dari teks PDF, atau None kalau bukan
    PDF berciri data transaksi (mis. PDF aturan/prosa/scan tanpa teks)."""
    if doc.file_type != "pdf" or not doc.raw_text_pages:
        return None

    full_text = "\n".join(page for page in doc.raw_text_pages if page and page.strip())
    if len(full_text) < 200:
        return None

    lines = full_text.splitlines()
    candidate = _find_header_candidate(lines)
    if candidate is None:
        return None

    header_len = len(candidate.header)
    body_rows: list[list[str]] = []
    for line in lines[candidate.header_idx + 1:]:
        line = line.strip()
        if not line:
            continue
        try:
            fields = [f.strip() for f in next(csv.reader([line]))]
        except Exception:  # noqa: BLE001
            continue
        if any(f for f in fields):
            body_rows.append(fields)

    rows = _glued_rows(body_rows, header_len)
    if not rows:
        return None

    # Potong baris apa pun yang masih punya kolom berlebih (header/footer).
    rows = [r for r in rows if len(r) == header_len]
    if not rows or len(rows) < _MIN_DATA_ROWS:
        return None

    df = pd.DataFrame(rows, columns=candidate.header)
    if not _is_transaction_table(candidate.header, df):
        return None

    logger.info(
        "PDF terdeteksi sebagai data transaksi: header=%s, %d baris.",
        candidate.header[:6],
        len(df),
    )
    return df