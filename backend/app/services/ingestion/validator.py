"""Validasi file upload sebelum diproses lebih lanjut."""

from dataclasses import dataclass
from pathlib import Path

from app.config.settings import settings

ALLOWED_TYPES = {"csv": "csv", "xlsx": "xlsx", "xls": "xlsx", "pdf": "pdf"}


@dataclass
class ValidationResult:
    is_valid: bool
    file_type: str | None = None
    error: str | None = None


def validate_upload(filename: str, file_size_bytes: int) -> ValidationResult:
    ext = Path(filename).suffix.lower().lstrip(".")
    if ext not in ALLOWED_TYPES:
        return ValidationResult(
            is_valid=False,
            error=f"Tipe file .{ext} tidak didukung. Yang didukung: {', '.join(settings.ALLOWED_UPLOAD_EXTENSIONS)}",
        )

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size_bytes > max_bytes:
        return ValidationResult(
            is_valid=False,
            error=f"Ukuran file {file_size_bytes / 1024 / 1024:.1f}MB melebihi batas {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    if file_size_bytes == 0:
        return ValidationResult(is_valid=False, error="File kosong")

    return ValidationResult(is_valid=True, file_type=ALLOWED_TYPES[ext])
