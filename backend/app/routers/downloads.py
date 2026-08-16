"""Router download installer desktop — disajikan langsung, tanpa redirect ke GitHub."""

from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.config.logging import get_logger
from app.config.settings import settings

router = APIRouter(prefix="/downloads", tags=["Downloads"])
logger = get_logger(__name__)


@router.get("", response_model=List[str])
def list_downloads() -> List[str]:
    """Daftar file installer yang tersedia (dipakai landing page untuk
    menampilkan tombol aktif / "Segera hadir" per platform)."""
    base_dir = Path(settings.DOWNLOADS_DIR).resolve()
    if not base_dir.is_dir():
        return []
    return sorted(f.name for f in base_dir.iterdir() if f.is_file())


@router.get("/{filename}")
def download_file(filename: str) -> FileResponse:
    """Sajikan file installer dari folder DOWNLOADS_DIR (mis. AI Accounting RAG-1.0.0-arm64.dmg)."""
    base_dir = Path(settings.DOWNLOADS_DIR).resolve()
    safe_name = Path(filename).name

    if safe_name != filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Nama file tidak valid")

    file_path = (base_dir / safe_name).resolve()
    if not file_path.is_relative_to(base_dir) or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File tidak ditemukan")

    return FileResponse(file_path, filename=safe_name, media_type="application/octet-stream")
