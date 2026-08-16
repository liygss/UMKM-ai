"""
Entry point backend untuk aplikasi desktop (dikemas via PyInstaller).

Menjalankan server FastAPI (uvicorn) dengan host/port dari argumen
atau environment (ELECTRON menyuplai --host/--port).
"""

import argparse
import os

import app.main  # noqa: F401  # pastikan PyInstaller ikut membundle seluruh paket `app`


def main() -> None:
    parser = argparse.ArgumentParser(description="AI Accounting RAG backend")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8000)))
    args = parser.parse_args()

    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=args.host,
        port=args.port,
        log_level="info",
    )


if __name__ == "__main__":
    main()
