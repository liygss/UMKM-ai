# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec untuk backend AI Accounting RAG (aplikasi desktop).

Hasil build: backend/dist/backend/  (mode onedir — lebih cepat start &
lebih tahan terhadap false-positive antivirus daripada onefile).

Menjalankan: bash packaging/build.sh  (atau pyinstaller packaging/accounting.spec)
"""

import os
from pathlib import Path

# Base folder proyek backend (parent dari folder packaging/)
BACKEND_DIR = Path(SPECPATH).parent

hiddenimports = [
    # Web framework
    "uvicorn",
    "uvicorn.logging",
    "uvicorn.loops",
    "uvicorn.loops.auto",
    "uvicorn.protocols",
    "uvicorn.protocols.http",
    "uvicorn.protocols.http.auto",
    "uvicorn.protocols.http.h11_impl",
    "uvicorn.protocols.http.httptools_impl",
    "uvicorn.protocols.websockets",
    "uvicorn.protocols.websockets.auto",
    "uvicorn.lifespan",
    "uvicorn.lifespan.on",
    "uvicorn.lifespan.off",
    # Qdrant local (embedded mode) via grpc
    "qdrant_client",
    "qdrant_client.local",
    "grpc",
    "grpc_tools",
    # Embedding lokal
    "fastembed",
    "onnxruntime",
    "tokenizers",
    # LLM client
    "ollama",
    # Auth
    "jose",
    "passlib",
    "passlib.handlers.bcrypt",
    "passlib.handlers.sha2_crypt",
    "passlib.handlers.md5_crypt",
    "passlib.handlers.pbkdf2_sha256",
    "bcrypt",
    # Lainnya
    "multipart",
    "pydantic",
    "pydantic_settings",
    "email_validator",
    "tenacity",
    "dotenv",
]

a = Analysis(
    [str(BACKEND_DIR / "packaging" / "run_backend.py")],
    pathex=[str(BACKEND_DIR)],
    binaries=[],
    datas=[
        # Template prompt & dataset keyword mapping dipakai oleh beberapa service.
        # KNOWLEDGE_DIR di set oleh Electron ke resources/knowledge, jadi di
        # binary ini cukup sertakan fallback agar tidak error di CLI/dev.
        (str(BACKEND_DIR.parent / "knowledge" / "datasets" / "keyword_mapping.csv"), "knowledge/datasets"),
    ],
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        "psycopg2",
        "asyncpg",
        "alembic",
        "pytest",
        "tkinter",
        "PyQt5",
        "PySide2",
        "IPython",
    ],
    noarchive=False,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="backend",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,  # jangan buka jendela terminal saat app berjalan
    disable_windowed_traceback=False,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    name="backend",
)
