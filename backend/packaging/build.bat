@echo off
REM Build backend jadi binary (PyInstaller onedir).
REM Hasil: backend\dist\backend\ — di-copy oleh electron-builder ke resources.
setlocal

set PROJECT_DIR=%~dp0..
cd /d "%PROJECT_DIR%"

REM Deteksi Python dari venv
if exist "venv\Scripts\python.exe" (
    set VENV_PY=%PROJECT_DIR%\venv\Scripts\python.exe
) else (
    echo ERROR: venv tidak ditemukan. Jalankan: python -m venv venv
    exit /b 1
)

echo ==^> Menggunakan Python: %VENV_PY%
echo ==^> Memasang pyinstaller...
"%VENV_PY%" -m pip install --quiet pyinstaller

echo ==^> Membangun binary backend dengan PyInstaller...
"%VENV_PY%" -m PyInstaller --clean --noconfirm packaging\accounting.spec

echo ==^> Selesai. Binary di %PROJECT_DIR%\dist\backend\
endlocal
