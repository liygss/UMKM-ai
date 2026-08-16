"""CORS middleware setup."""

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.config.settings import settings


def setup_cors(app: FastAPI) -> None:
    origins = settings.CORS_ORIGINS
    if settings.DEBUG:
        origins = ["*"]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
