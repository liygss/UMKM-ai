"""CORS middleware setup."""

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.config.logging import get_logger
from app.config.settings import settings

logger = get_logger(__name__)


def setup_cors(app: FastAPI) -> None:
    origins = settings.CORS_ORIGINS

    # Validasi: jangan pernah pakai wildcard di production
    if "*" in origins:
        if settings.ENV.lower() == "production":
            logger.error("CORS wildcard '*' terdeteksi di production! Menggunakan origos kosong.")
            origins = []
        else:
            logger.warning("CORS wildcard '*' aktif (development mode saja).")

    allow_credentials = len(origins) > 0 and origins != ["*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=allow_credentials,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
        allow_headers=["Authorization", "Content-Type", "Accept"],
    )
