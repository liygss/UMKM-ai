"""
Router notifikasi:
- user: daftar / tandai dibaca / tandai semua dibaca
- admin: kirim notifikasi ke user spesifik, lihat daftar user, pemicu
  ringkasan bulanan eksplisit

Catatan: route statis (/send, /admin/..., /monthly, /read-all) didaftarkan
sebelum /{id} supaya FastAPI tidak menafsirkannya sebagai wildcard.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.logging import get_logger
from app.database.database import get_db
from app.database.models import NotificationType, User
from app.middleware.auth import require_active_user, require_admin
from app.schemas.notification_schema import (
    AdminUserItem,
    NotificationCreate,
    NotificationListResponse,
    NotificationResponse,
    NotificationSendSummary,
)
from app.services import notifications as svc

router = APIRouter(prefix="/notifications", tags=["Notifications"])
logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Admin
# ---------------------------------------------------------------------------
@router.get("/admin/users", response_model=list[AdminUserItem])
def admin_list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> list[User]:
    """Daftar user yang bisa dipilih admin sebagai penerima notifikasi."""
    return svc.list_users(db)


@router.post(
    "/send",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
)
def admin_send(
    payload: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> NotificationResponse:
    """Admin mengirim notifikasi ke user spesifik."""
    # Cek user penerima benar-benar ada.
    target = db.query(User).filter(User.id == payload.user_id).first()
    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User penerima tidak ditemukan",
        )

    try:
        notif_type = NotificationType(payload.type)
    except ValueError:
        notif_type = NotificationType.ADMIN

    notif = svc.create_notification(
        db,
        user_id=payload.user_id,
        sender_id=current_user.id,
        type=notif_type,
        title=payload.title,
        message=payload.message,
        link=payload.link,
    )
    logger.info(
        "Admin %s mengirim notifikasi ke %s: %s",
        current_user.email, target.email, payload.title,
    )
    return notif


@router.post("/monthly", response_model=NotificationResponse | None)
def admin_trigger_monthly(
    payload: NotificationSendSummary,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin memicu pembuatan ringkasan bulanan untuk user tertentu.
    Mengembalikan null bila sudah ada untuk periode yang diminta
    (dedup) atau bila user tidak punya transaksi."""
    target = db.query(User).filter(User.id == payload.user_id).first()
    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User penerima tidak ditemukan",
        )
    return svc.generate_monthly_summary(
        db,
        user_id=payload.user_id,
        year=payload.year,
        month=payload.month,
        sender_id=current_user.id,
    )


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
@router.post("/read-all")
def read_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_user),
) -> dict:
    """Tandai semua notifikasi milik user sebagai sudah dibaca."""
    n = svc.mark_all_read(db, current_user.id)
    return {"updated": n}


@router.get("", response_model=NotificationListResponse)
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_user),
) -> NotificationListResponse:
    """Daftar notifikasi user (yang belum dibaca muncul lebih dulu).
    Sekaligus memicu pembuatan Ringkasan Bulanan bila belum ada untuk
    periode bulan ini."""
    # Auto-generate monthly summary untuk bulan lalu (sekali per bulan).
    svc.generate_monthly_summary(db, user_id=current_user.id, commit=True)

    items = svc.list_notifications(db, current_user.id)
    return NotificationListResponse(
        items=[NotificationResponse.model_validate(n) for n in items],
        unread_count=svc.unread_count(db, current_user.id),
    )


@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_user),
) -> NotificationResponse:
    """Tandai satu notifikasi sebagai sudah dibaca (cek kepemilikan)."""
    notif = svc.mark_read(db, notification_id, current_user.id)
    if notif is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notifikasi tidak ditemukan",
        )
    return notif
