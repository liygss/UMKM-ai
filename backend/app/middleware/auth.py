"""
Utilitas autentikasi: hashing password, pembuatan & verifikasi JWT,
signed download token (itsdangerous), serta dependency `get_current_user`
untuk dipakai di router yang butuh login.

Autentikasi menggunakan httpOnly cookie (bukan Authorization header).
"""

import re
from datetime import datetime, timedelta, timezone

from fastapi import Cookie, Depends, HTTPException, Request, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from app.config.settings import settings
from app.database.database import get_db
from app.database.models import RoleUser, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
_download_serializer = URLSafeTimedSerializer(settings.SECRET_KEY)


# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------
def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def validate_password_complexity(password: str) -> None:
    """Validasi kompleksitas password. Raise ValueError jika tidak valid."""
    if len(password) < 8:
        raise ValueError("Password minimal 8 karakter")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password harus mengandung huruf besar")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password harus mengandung huruf kecil")
    if not re.search(r"\d", password):
        raise ValueError("Password harus mengandung angka")


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------
COOKIE_NAME = "access_token"


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> str:
    """Mengembalikan `sub` (user id) dari token, atau raise HTTPException 401."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah kedaluwarsa",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return user_id
    except JWTError as exc:
        raise credentials_exception from exc


# ---------------------------------------------------------------------------
# Signed download token (itsdangerous) — untuk <a href> download
# ---------------------------------------------------------------------------
def create_download_token(user_id: str) -> str:
    """Buat signed token one-time untuk download file via <a href>."""
    return _download_serializer.dumps({"uid": user_id}, salt="download")


def verify_download_token(token: str, max_age: int = 3600) -> str:
    """Verifikasi signed download token. Mengembalikan user_id."""
    try:
        data = _download_serializer.loads(token, salt="download", max_age=max_age)
        return data["uid"]
    except (BadSignature, SignatureExpired) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token download tidak valid atau sudah kedaluwarsa",
        ) from exc


# ---------------------------------------------------------------------------
# FastAPI dependencies — cookie-based auth
# ---------------------------------------------------------------------------
def _extract_token_from_request(request: Request) -> str | None:
    """Ambil token dari cookie (httpOnly)."""
    return request.cookies.get(COOKIE_NAME)


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """Dependency: ambil user dari cookie. Return 401 jika tidak ada/tidak valid."""
    token = _extract_token_from_request(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tidak terautentikasi",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = decode_access_token(token)
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User tidak ditemukan")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akun tidak aktif")
    return user


def require_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Alias eksplisit untuk dipakai di router: Depends(require_active_user)"""
    return current_user


def require_admin(current_user: User = Depends(require_active_user)) -> User:
    """Hanya user dengan role ADMIN yang boleh mengakses endpoint ini."""
    if current_user.role != RoleUser.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya admin yang bisa mengakses fitur ini",
        )
    return current_user
