"""
Ubah dokumen yang sudah dinormalisasi jadi markdown terstruktur.
Markdown ini yang nantinya di-chunk (chunking.py) dan disimpan sebagai
file di backend/markdown/ (lihat struktur proyek).

- csv/xlsx -> tabel markdown, per baris jadi 1 "unit" pengetahuan
  supaya chatbot bisa menjawab "berapa total penjualan bulan Juni" dari
  data transaksi mentah, bukan cuma dari laporan yang sudah diolah.
- pdf -> heading per halaman dipertahankan sebagai referensi (## Halaman N),
  isi paragraf apa adanya (paragraf pdf biasanya sudah py mengikuti struktur asli)
"""

from app.services.ingestion.file_loader import LoadedDocument


def _tabel_ke_markdown(doc: LoadedDocument, judul: str) -> str:
    bagian = [f"# {judul}\n"]
    for table in doc.tables:
        bagian.append(f"## Sheet: {table.sheet_name}\n")
        bagian.append(table.dataframe.to_markdown(index=False))
        bagian.append("")

        # Selain tabel utuh, tambahkan ringkasan per baris dalam bentuk kalimat.
        # Ini membantu retrieval karena satu baris transaksi jadi 1 chunk yang
        # berdiri sendiri dan gampang di-retrieve untuk pertanyaan spesifik.
        bagian.append("### Rincian per baris\n")
        for _, row in table.dataframe.iterrows():
            deskripsi_baris = ", ".join(f"{col}: {row[col]}" for col in table.dataframe.columns)
            bagian.append(f"- {deskripsi_baris}")
        bagian.append("")
    return "\n".join(bagian)


def _pdf_ke_markdown(doc: LoadedDocument, judul: str) -> str:
    bagian = [f"# {judul}\n"]
    for idx, page_text in enumerate(doc.raw_text_pages, start=1):
        if not page_text.strip():
            continue
        bagian.append(f"## Halaman {idx}\n")
        bagian.append(page_text)
        bagian.append("")
    return "\n".join(bagian)


def generate_markdown(doc: LoadedDocument, judul: str) -> str:
    if doc.file_type == "pdf":
        return _pdf_ke_markdown(doc, judul)
    return _tabel_ke_markdown(doc, judul)
