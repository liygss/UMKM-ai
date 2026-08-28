"""
Router admin untuk dashboard monitoring:
- statistik pertumbuhan user (agregat)
- daftar / cari / filter user
- buat user baru oleh admin
- ubah role, plan, atau status aktif user
- status kesehatan sistem (DB, Qdrant, seed knowledge base)

Semua endpoint hanya untuk role ADMIN (Depends(require_admin)).
Tidak ada endpoint yang memaparkan data keuangan per-user — hanya statistik
agregat supaya privasi user tetap terjaga.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.config.logging import get_logger
from app.database.database import check_db_connection, check_qdrant_connection, get_db
from app.database.models import PlanUser, RoleUser, User
from app.middleware.auth import (
    hash_password,
    require_admin,
    validate_password_complexity,
)
from app.schemas.admin_schema import AdminSummary, AdminUserItem, MonthGrowth
from app.schemas.auth_schema import AdminUserCreate, AdminUserUpdate

router = APIRouter(prefix="/admin", tags=["Admin"])
logger = get_logger(__name__)

_NAMA_BULAN = {
    1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "Mei", 6: "Jun",
    7: "Jul", 8: "Agu", 9: "Sep", 10: "Okt", 11: "Nov", 12: "Des",
}


def _apply_plan_timestamps(user: User, plan: PlanUser) -> None:
    """Sinkronkan maintenance_joined_at agar mencerminkan status saat ini."""
    if plan == PlanUser.MAINTENANCE and user.plan != PlanUser.MAINTENANCE:
        user.maintenance_joined_at = datetime.now(timezone.utc)
    elif plan == PlanUser.FREE:
        user.maintenance_joined_at = None


def _month_growth(db: Session) -> list[MonthGrowth]:
    """Grafik pertumbuhan 6 bulan terakhir (dari bulan acuan mundur 5 bulan)."""
    anchor = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    months = sorted(
        (anchor - timedelta(days=30 * i)).replace(day=1)
        for i in range(6)
    )
    buckets = {m: {"total": 0, _plan(PlanUser.FREE): 0, _plan(PlanUser.MAINTENANCE): 0} for m in months}

    for created_at, plan in db.query(User.created_at, User.plan).all():
        if created_at is None:
            continue
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        m = created_at.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if m in buckets:
            name = _plan(plan) if plan in (PlanUser.FREE, PlanUser.MAINTENANCE) else _plan(PlanUser.FREE)
            buckets[m]["total"] += 1
            buckets[m][name] += 1

    return [
        MonthGrowth(
            month=m.strftime("%Y-%m"),
            label=f"{_NAMA_BULAN[m.month]} {m.year}",
            total=buckets[m]["total"],
            free=buckets[m]["FREE"],
            maintenance=buckets[m]["MAINTENANCE"],
        )
        for m in months
    ]


def _plan(value: PlanUser) -> str:
    return str(value.value)


# ---------------------------------------------------------------------------
# Statistik ringkasan
# ---------------------------------------------------------------------------
@router.get("/summary", response_model=AdminSummary)
def admin_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> AdminSummary:
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total = db.query(User).count()
    maintenance = db.query(User).filter(User.plan == PlanUser.MAINTENANCE).count()
    new_week = db.query(User).filter(User.created_at >= week_ago).count()
    new_month = db.query(User).filter(User.created_at >= month_start).count()
    unverified = db.query(User).filter(User.email_verified == False).count()  # noqa: E712

    return AdminSummary(
        total_users=total,
        maintenance_users=maintenance,
        free_users=total - maintenance,
        new_this_week=new_week,
        new_this_month=new_month,
        unverified_users=unverified,
        monthly_growth=_month_growth(db),
    )


# ---------------------------------------------------------------------------
# Daftar / cari user (agregat non-sensitif)
# ---------------------------------------------------------------------------
@router.get("/users", response_model=list[AdminUserItem])
def admin_list_users(
    s: Optional[str] = Query(None, description="Cari nama / email / nama usaha"),
    plan: Optional[str] = Query(None, description="Filter paket: FREE | MAINTENANCE"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[User]:
    q = db.query(User)
    if s:
        like = f"%{s.strip()}%"
        q = q.filter(
            or_(
                User.email.ilike(like),
                User.full_name.ilike(like),
                User.company_name.ilike(like),
            )
        )
    if plan:
        try:
            q = q.filter(User.plan == PlanUser(plan))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="plan harus 'FREE' atau 'MAINTENANCE'",
            )
    return q.order_by(User.created_at.desc()).all()


# ---------------------------------------------------------------------------
# Admin membuat user baru
# ---------------------------------------------------------------------------
@router.post("/users", response_model=AdminUserItem, status_code=status.HTTP_201_CREATED)
def admin_create_user(
    payload: AdminUserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> User:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email sudah terdaftar")
    try:
        validate_password_complexity(payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        company_name=payload.company_name,
        role=payload.role,
        plan=payload.plan,
        is_active=True,
        email_verified=True,  # dibuat langsung oleh admin — dianggap terverifikasi
        maintenance_joined_at=datetime.now(timezone.utc) if payload.plan == PlanUser.MAINTENANCE else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("Admin %s membuat user %s (%s)", current_user.email, user.email, user.role.value)
    return user


# ---------------------------------------------------------------------------
# Ubah role / plan / status aktif user
# ---------------------------------------------------------------------------
@router.patch("/users/{user_id}", response_model=AdminUserItem)
def admin_update_user(
    user_id: str,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan")

    # Cegah admin mencabut role admin dirinya sendiri (bisa terkunci keluar).
    if user.id == current_user.id and payload.role and payload.role != RoleUser.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tidak bisa mencabut role admin pada diri sendiri",
        )

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.company_name is not None:
        user.company_name = payload.company_name
    if payload.role is not None:
        user.role = payload.role
    if payload.plan is not None:
        _apply_plan_timestamps(user, payload.plan)
        user.plan = payload.plan
    if payload.is_active is not None:
        user.is_active = payload.is_active

    db.commit()
    db.refresh(user)
    logger.info("Admin %s memperbarui user %s", current_user.email, user.email)
    return user


# ---------------------------------------------------------------------------
# Status kesehatan sistem (DB, Qdrant, seed knowledge base)
# ---------------------------------------------------------------------------
@router.get("/health")
def admin_health(
    current_user: User = Depends(require_admin),
) -> dict:
    from app.main import _seed_status  # lazy import: main.py sudah di-load saat request

    return {
        "database": "connected" if check_db_connection() else "disconnected",
        "qdrant": "connected" if check_qdrant_connection() else "disconnected",
        "seed_status": dict(_seed_status),
    }