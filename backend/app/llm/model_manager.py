"""
Cek model apa saja yang tersedia di Ollama (lokal atau cloud).

Untuk Ollama Cloud (ollama.com) model tidak perlu di-pull ke mesin lokal,
jadi `ensure_required_models()` otomatis dilewati dan hanya memverifikasi
koneksi + daftar model.
"""

from app.config.logging import get_logger
from app.config.settings import settings
from app.llm.ollama_service import get_client

logger = get_logger(__name__)


def list_available_models() -> list[str]:
    try:
        response = get_client().list()
        return [m["name"] for m in response.get("models", [])]
    except Exception as exc:  # noqa: BLE001
        logger.error("Gagal mengambil daftar model Ollama: %s", exc)
        return []


def is_model_available(model_name: str) -> bool:
    available = list_available_models()
    return any(m == model_name or m.startswith(f"{model_name}:") for m in available)


def ensure_required_models() -> dict[str, bool]:
    """Pastikan model chat yang dipakai tersedia (untuk cloud cukup dicek)."""
    if settings.ollama_is_cloud:
        return {settings.OLLAMA_MODEL: is_model_available(settings.OLLAMA_MODEL)}
    return {settings.OLLAMA_MODEL: is_model_available(settings.OLLAMA_MODEL)}
