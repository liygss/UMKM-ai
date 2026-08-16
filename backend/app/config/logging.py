"""
Konfigurasi logging terpusat untuk seluruh aplikasi.
Import `setup_logging()` sekali di main.py saat startup.
"""

import logging
import logging.config
import os
from pathlib import Path

from app.config.settings import settings

LOG_DIR = Path(settings.LOG_DIR)
LOG_DIR.mkdir(exist_ok=True, parents=True)

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
        "access": {
            "format": "%(asctime)s | %(levelname)-8s | %(client_addr)s - \"%(request_line)s\" %(status_code)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "level": "DEBUG" if settings.DEBUG else "INFO",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "default",
            "filename": str(LOG_DIR / "app.log"),
            "maxBytes": 10 * 1024 * 1024,  # 10 MB
            "backupCount": 5,
            "encoding": "utf-8",
            "level": "INFO",
        },
        "error_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "default",
            "filename": str(LOG_DIR / "error.log"),
            "maxBytes": 10 * 1024 * 1024,
            "backupCount": 5,
            "encoding": "utf-8",
            "level": "ERROR",
        },
    },
    "loggers": {
        "": {  # root logger
            "handlers": ["console", "file", "error_file"],
            "level": "DEBUG" if settings.DEBUG else "INFO",
        },
        "uvicorn": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "uvicorn.error": {
            "handlers": ["console", "file", "error_file"],
            "level": "INFO",
            "propagate": False,
        },
        "sqlalchemy.engine": {
            "handlers": ["console", "file"],
            "level": "WARNING",  # ganti ke INFO kalau mau lihat semua query SQL
            "propagate": False,
        },
    },
}


def setup_logging() -> None:
    logging.config.dictConfig(LOGGING_CONFIG)
    logger = logging.getLogger(__name__)
    logger.info("Logging berhasil diinisialisasi (env=%s, debug=%s)", settings.ENV, settings.DEBUG)


def get_logger(name: str) -> logging.Logger:
    """Helper supaya module lain tinggal: `logger = get_logger(__name__)`"""
    return logging.getLogger(name)
