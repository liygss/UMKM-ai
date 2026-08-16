"""
Seed / bulk-ingest folder `knowledge/` (markdown + datasets/*.csv) ke Qdrant.

Beda dengan upload lewat API (`routers/upload.py`, untuk file yang di-upload
user seperti data transaksi), script ini untuk mengisi basis pengetahuan
STATIS aplikasi (SAK EMKM, aturan pajak, FAQ, dll) yang sudah dalam bentuk
markdown final — jadi langsung lewat tahap chunk -> embed -> simpan, tanpa
perlu file_loader/normalizer/markdown_generator lagi.

Jalankan dengan:
    python -m app.services.ingestion.seed_knowledge_base

Aman dijalankan berulang kali (idempotent): file yang sudah berhasil
di-ingest sebelumnya akan dilewati, kecuali dipanggil dengan --force untuk
mengulang dari awal (mis. setelah isi file direvisi).
"""

import argparse
import sys
from pathlib import Path

from sqlalchemy.orm import Session

from app.config.logging import get_logger, setup_logging
from app.config.settings import settings
from app.database.database import SessionLocal
from app.database.models import DocumentChunk, RoleUser, StatusUpload, UploadedFile, User
from app.middleware.auth import hash_password
from app.services.ingestion import qdrant_service
from app.services.ingestion.file_loader import load_csv
from app.services.ingestion.ingestion_pipeline import ingest_static_markdown
from app.services.ingestion.markdown_generator import generate_markdown
from app.services.ingestion.metadata_generator import guess_category
from app.services.ingestion.normalizer import normalize_document

logger = get_logger(__name__)

SYSTEM_USER_EMAIL = "system@internal.local"

# Folder markdown yang isinya langsung di-ingest apa adanya (bukan template prompt)
MARKDOWN_FOLDERS = ["accounting", "tax", "sak_emkm", "regulations", "faq"]

# Mapping eksplisit kategori untuk file dataset (nama file belum tentu
# mengandung kata kunci yang bisa ditebak otomatis oleh guess_category)
DATASET_CATEGORY_OVERRIDE = {
    "coa.csv": "accounting",
    "keyword_mapping.csv": "accounting",
    "contoh_transaksi.csv": "accounting",
    "contoh_jurnal.csv": "accounting",
    "tax_rules.csv": "tax",
}


def ensure_system_user(db: Session) -> User:
    """User 'pemilik' dari seluruh dokumen knowledge base (bukan untuk login)."""
    user = db.query(User).filter(User.email == SYSTEM_USER_EMAIL).first()
    if user:
        return user
    user = User(
        email=SYSTEM_USER_EMAIL,
        hashed_password=hash_password(Path.cwd().name + "-system-not-for-login"),
        full_name="System (Knowledge Base)",
        role=RoleUser.ADMIN,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("User sistem untuk knowledge base dibuat: %s", user.email)
    return user


def _get_or_create_upload_record(
    db: Session, system_user: User, relative_path: str, file_type: str, size_bytes: int
) -> tuple[UploadedFile, bool]:
    """Mengembalikan (record, sudah_ada_sebelumnya)."""
    existing = (
        db.query(UploadedFile)
        .filter(
            UploadedFile.uploaded_by_id == system_user.id,
            UploadedFile.original_filename == relative_path,
        )
        .first()
    )
    if existing:
        return existing, True

    record = UploadedFile(
        original_filename=relative_path,
        stored_path=relative_path,  # file asli tetap di knowledge/, bukan di uploads/
        file_type=file_type,
        file_size_bytes=size_bytes,
        uploaded_by_id=system_user.id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record, False


def _reset_previous_ingestion(db: Session, record: UploadedFile) -> None:
    """Hapus chunk & vector lama sebelum re-ingest (dipakai saat --force)."""
    qdrant_service.delete_by_source_file(record.id)
    db.query(DocumentChunk).filter(DocumentChunk.source_file_id == record.id).delete()
    db.commit()


def seed_markdown_folders(db: Session, system_user: User, force: bool) -> dict[str, int]:
    hasil = {"berhasil": 0, "dilewati": 0, "gagal": 0}
    knowledge_dir = Path(settings.KNOWLEDGE_DIR)

    for folder in MARKDOWN_FOLDERS:
        folder_path = knowledge_dir / folder
        if not folder_path.exists():
            logger.warning("Folder %s tidak ditemukan, dilewati.", folder_path)
            continue

        for md_file in sorted(folder_path.glob("*.md")):
            relative_path = f"{folder}/{md_file.name}"
            content = md_file.read_text(encoding="utf-8")
            record, sudah_ada = _get_or_create_upload_record(
                db, system_user, relative_path, "md", len(content.encode("utf-8"))
            )

            if sudah_ada and record.status == StatusUpload.INGESTED and not force:
                logger.info("Lewati (sudah ter-ingest): %s", relative_path)
                hasil["dilewati"] += 1
                continue

            if sudah_ada and force:
                _reset_previous_ingestion(db, record)

            try:
                ingest_static_markdown(db, record, content, category=folder)
                hasil["berhasil"] += 1
            except Exception:  # noqa: BLE001
                logger.exception("Gagal ingest %s", relative_path)
                hasil["gagal"] += 1

    return hasil


def seed_dataset_csvs(db: Session, system_user: User, force: bool) -> dict[str, int]:
    hasil = {"berhasil": 0, "dilewati": 0, "gagal": 0}
    datasets_dir = Path(settings.KNOWLEDGE_DIR) / "datasets"
    if not datasets_dir.exists():
        logger.warning("Folder %s tidak ditemukan, dilewati.", datasets_dir)
        return hasil

    for csv_file in sorted(datasets_dir.glob("*.csv")):
        relative_path = f"datasets/{csv_file.name}"
        record, sudah_ada = _get_or_create_upload_record(
            db, system_user, relative_path, "csv", csv_file.stat().st_size
        )

        if sudah_ada and record.status == StatusUpload.INGESTED and not force:
            logger.info("Lewati (sudah ter-ingest): %s", relative_path)
            hasil["dilewati"] += 1
            continue

        if sudah_ada and force:
            _reset_previous_ingestion(db, record)

        try:
            doc = load_csv(str(csv_file))
            doc = normalize_document(doc)
            markdown_text = generate_markdown(doc, csv_file.stem)
            category = DATASET_CATEGORY_OVERRIDE.get(csv_file.name) or guess_category(csv_file.name)
            ingest_static_markdown(db, record, markdown_text, category=category)
            hasil["berhasil"] += 1
        except Exception:  # noqa: BLE001
            logger.exception("Gagal ingest %s", relative_path)
            hasil["gagal"] += 1

    return hasil


def run(force: bool = False) -> None:
    setup_logging()
    qdrant_service.ensure_collection()

    db = SessionLocal()
    try:
        system_user = ensure_system_user(db)

        logger.info("Mulai ingest folder markdown pengetahuan (%s)...", ", ".join(MARKDOWN_FOLDERS))
        hasil_md = seed_markdown_folders(db, system_user, force)

        logger.info("Mulai ingest dataset csv...")
        hasil_csv = seed_dataset_csvs(db, system_user, force)

        total_berhasil = hasil_md["berhasil"] + hasil_csv["berhasil"]
        total_dilewati = hasil_md["dilewati"] + hasil_csv["dilewati"]
        total_gagal = hasil_md["gagal"] + hasil_csv["gagal"]

        print("\n=== Ringkasan Seeding Knowledge Base ===")
        print(f"Berhasil di-ingest : {total_berhasil}")
        print(f"Dilewati (sudah ada): {total_dilewati}")
        print(f"Gagal              : {total_gagal}")
        if total_gagal > 0:
            print("\nCek logs/error.log untuk detail file yang gagal.")
            sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed knowledge base ke Qdrant")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-ingest ulang semua file meskipun sudah pernah ter-ingest sebelumnya",
    )
    args = parser.parse_args()
    run(force=args.force)
