"""
Baca isi file mentah (csv/xlsx/pdf) jadi representasi perantara yang seragam,
supaya markdown_generator.py tidak perlu tahu format aslinya.
"""

from dataclasses import dataclass, field

import pandas as pd
from pypdf import PdfReader


@dataclass
class LoadedTable:
    """Untuk csv/xlsx: data tabular mentah."""

    sheet_name: str
    dataframe: pd.DataFrame


@dataclass
class LoadedDocument:
    file_type: str  # csv | xlsx | pdf
    tables: list[LoadedTable] = field(default_factory=list)
    raw_text_pages: list[str] = field(default_factory=list)  # untuk pdf, satu string per halaman

    def get_transaction_dataframe(self):
        """Ambil DataFrame pertama dari file csv/xlsx (untuk auto-journal)."""
        if self.tables:
            return self.tables[0].dataframe.copy()
        return None


def load_csv(path: str) -> LoadedDocument:
    df = _read_csv_tolerant(path)
    return LoadedDocument(file_type="csv", tables=[LoadedTable(sheet_name="Sheet1", dataframe=df)])


def _read_csv_tolerant(path: str) -> pd.DataFrame:
    """Baca CSV dengan fallback encoding (utf-8-sig -> latin-1) supaya file
    dari Excel/Windows dengan BOM atau encoding lama tetap bisa diproses."""
    for encoding in ("utf-8-sig", "utf-8", "latin-1", "cp1252"):
        try:
            return pd.read_csv(path, encoding=encoding)
        except (UnicodeDecodeError, pd.errors.ParserError):
            continue
    raise ValueError(f"Tidak bisa membaca file CSV (encoding tidak dikenal): {path}")


def load_xlsx(path: str) -> LoadedDocument:
    sheets = pd.read_excel(path, sheet_name=None)  # dict {sheet_name: df}
    tables = [LoadedTable(sheet_name=name, dataframe=df) for name, df in sheets.items()]
    return LoadedDocument(file_type="xlsx", tables=tables)


def load_pdf(path: str) -> LoadedDocument:
    reader = PdfReader(path)
    pages = [page.extract_text() or "" for page in reader.pages]
    return LoadedDocument(file_type="pdf", raw_text_pages=pages)


def load_file(path: str, file_type: str) -> LoadedDocument:
    loaders = {"csv": load_csv, "xlsx": load_xlsx, "pdf": load_pdf}
    if file_type not in loaders:
        raise ValueError(f"Tipe file tidak dikenal: {file_type}")
    return loaders[file_type](path)
