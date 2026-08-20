"""Endpoint register, login, verifikasi email, dan info user yang sedang login."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.config.logging import get_logger
from app.config.settings import settings
from app.database.database import get_db
from app.database.models import User
from app.middleware.auth import (
    COOKIE_NAME,
    create_access_token,
    get_current_user,
    hash_password,
    validate_password_complexity,
    verify_password,
)
from app.schemas.auth_schema import Token, UserLogin, UserRegister, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = get_logger(__name__)

limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
def register(
    request: Request,
    payload: UserRegister,
    db: Session = Depends(get_db),
) -> User:
    # Validasi password complexity
    try:
        validate_password_complexity(payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email sudah terdaftar")

    # Generate verification token
    from app.middleware.auth import create_download_token
    verification_token = create_download_token("verify:" + payload.email)

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        company_name=payload.company_name,
        verification_token=verification_token,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Kirim email verifikasi (best effort — jangan block registrasi)
    try:
        from app.services.email_service import send_verification_email
        send_verification_email(payload.email, verification_token, payload.full_name)
    except Exception as exc:
        logger.warning("Gagal mengirim email verifikasi ke %s: %s", payload.email, exc)

    logger.info("User baru terdaftar: %s", user.email)
    return user


@router.post("/login", response_model=UserResponse)
@limiter.limit("5/minute")
def login(
    request: Request,
    payload: UserLogin,
    response: Response,
    db: Session = Depends(get_db),
) -> User:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akun tidak aktif")

    access_token = create_access_token(subject=user.id)

    # Set httpOnly cookie (bukan body response)
    is_production = settings.ENV.lower() == "production"
    response.set_cookie(
        key=COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    logger.info("User login: %s", user.email)
    return user


@router.post("/logout")
def logout(response: Response) -> dict:
    """Hapus cookie autentikasi."""
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"detail": "Berhasil logout"}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.get("/verify-email")
def verify_email(
    token: str,
    db: Session = Depends(get_db),
) -> dict:
    """Verifikasi email user via token."""
    from app.middleware.auth import verify_download_token
    try:
        payload = verify_download_token(token, max_age=86400)  # 24 jam
    except HTTPException:
        raise HTTPException(status_code=400, detail="Token verifikasi tidak valid atau sudah kedaluwarsa")

    # Cari user berdasarkan token
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    user.email_verified = True
    user.verification_token = None
    db.commit()

    logger.info("Email diverifikasi: %s", user.email)
    return {"detail": "Email berhasil diverifikasi"}


@router.get("/health")
def health() -> dict:
    return {"status": "ok", "module": "authentication"}
