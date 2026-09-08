"""
Router Feedback / CS:
- user: kirim feedback, lihat daftar & detail
- admin: lihat semua feedback, balas, ubah status, statistik

Catatan: route statis (/admin/feedback/stats, /admin/feedback) didaftarkan
sebelum /{feedback_id} supaya FastAPI tidak menafsirkannya sebagai wildcard.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.config.logging import get_logger
from app.database.database import get_db
from app.database.models import FeedbackCategory, FeedbackStatus, NotificationType, RoleUser, User
from app.middleware.auth import require_active_user, require_admin
from app.schemas.feedback_schema import (
    ExitFeedbackCreate,
    ExitFeedbackResponse,
    FeedbackCreate,
    FeedbackListResponse,
    FeedbackReply,
    FeedbackResponse,
    FeedbackStatsResponse,
    FeedbackWithUser,
)
from app.services import feedback as svc
from app.services.notifications import create_notification

router = APIRouter(prefix="/feedback", tags=["Feedback"])
logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# User endpoints
# ---------------------------------------------------------------------------
@router.post(
    "",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_user),
):
    """User mengirim feedback / komplain."""
    fb = svc.create_feedback(
        db,
        user_id=current_user.id,
        category=payload.category,
        subject=payload.subject,
        message=payload.message,
    )

    # Notifikasi ke semua admin (jangan gagalkan submit bila notif error)
    try:
        admins = db.query(User).filter(User.role == RoleUser.ADMIN).all()
        for admin in admins:
            create_notification(
                db,
                user_id=admin.id,
                sender_id=current_user.id,
                type=NotificationType.ADMIN,
                title="Feedback Baru",
                message=f"{current_user.full_name} mengirim {payload.category.lower()}: {payload.subject}",
                link="/admin/feedback",
                commit=False,
            )
        db.commit()
    except Exception:
        db.rollback()
        logger.warning("Gagal membuat notifikasi untuk feedback %s", fb.id)

    logger.info("User %s mengirim feedback: %s", current_user.email, payload.subject)
    return FeedbackResponse(
        id=fb.id,
        user_id=fb.user_id,
        category=fb.category.value if isinstance(fb.category, FeedbackCategory) else fb.category,
        subject=fb.subject,
        message=fb.message,
        status=fb.status.value if isinstance(fb.status, FeedbackStatus) else fb.status,
        admin_reply=fb.admin_reply,
        replied_at=fb.replied_at,
        replied_by_id=fb.replied_by_id,
        created_at=fb.created_at,
        updated_at=fb.updated_at,
    )


@router.get("", response_model=FeedbackListResponse)
def list_my_feedbacks(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_user),
):
    """User melihat daftar feedback miliknya."""
    items = svc.list_user_feedbacks(db, current_user.id)
    result = []
    for fb in items:
        result.append(FeedbackWithUser(
            id=fb.id,
            user_id=fb.user_id,
            category=fb.category.value,
            subject=fb.subject,
            message=fb.message,
            status=fb.status.value,
            admin_reply=fb.admin_reply,
            replied_at=fb.replied_at,
            replied_by_id=fb.replied_by_id,
            created_at=fb.created_at,
            updated_at=fb.updated_at,
        ))
    return FeedbackListResponse(items=result, total=len(result))


@router.post(
    "/exit",
    response_model=ExitFeedbackResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_exit_feedback(
    payload: ExitFeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_user),
):
    """User mengirim rating singkat saat logout."""
    ef = svc.create_exit_feedback(
        db,
        user_id=current_user.id,
        rating=payload.rating,
        comment=payload.comment,
    )
    logger.info("User %s mengirim exit feedback (rating=%d)", current_user.email, ef.rating)
    return ExitFeedbackResponse(
        id=ef.id,
        user_id=ef.user_id,
        rating=ef.rating,
        comment=ef.comment,
        created_at=ef.created_at,
    )


@router.get("/{feedback_id}", response_model=FeedbackWithUser)
def get_my_feedback(
    feedback_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_user),
):
    """User melihat detail satu feedback miliknya."""
    fb = svc.get_user_feedback(db, feedback_id, current_user.id)
    if not fb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback tidak ditemukan",
        )
    replied_by_name = None
    if fb.replied_by_id:
        admin = db.query(User).filter(User.id == fb.replied_by_id).first()
        if admin:
            replied_by_name = admin.full_name
    return FeedbackWithUser(
        id=fb.id,
        user_id=fb.user_id,
        category=fb.category.value,
        subject=fb.subject,
        message=fb.message,
        status=fb.status.value,
        admin_reply=fb.admin_reply,
        replied_at=fb.replied_at,
        replied_by_id=fb.replied_by_id,
        created_at=fb.created_at,
        updated_at=fb.updated_at,
        replied_by_name=replied_by_name,
    )


# ---------------------------------------------------------------------------
# Admin endpoints — static routes first
# ---------------------------------------------------------------------------
@router.get("/admin/stats", response_model=FeedbackStatsResponse)
def admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Statistik feedback untuk admin."""
    return svc.get_stats(db)


@router.get("/admin/all", response_model=FeedbackListResponse)
def admin_list_all(
    feedback_status: str = Query(None, alias="status"),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin melihat semua feedback (filter status & search)."""
    items = svc.list_all_feedbacks(db, status=feedback_status, search=search)
    return FeedbackListResponse(
        items=[FeedbackWithUser(**item) for item in items],
        total=len(items),
    )


@router.get("/admin/{feedback_id}", response_model=FeedbackWithUser)
def admin_get_detail(
    feedback_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin melihat detail feedback."""
    item = svc.get_feedback_detail(db, feedback_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback tidak ditemukan",
        )
    return FeedbackWithUser(**item)


@router.patch("/admin/{feedback_id}", response_model=FeedbackWithUser)
def admin_reply(
    feedback_id: str,
    payload: FeedbackReply,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin membalas feedback dan mengubah status."""
    fb = svc.reply_to_feedback(
        db,
        feedback_id=feedback_id,
        admin_id=current_user.id,
        admin_reply=payload.admin_reply,
        new_status=payload.status,
    )
    if not fb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feedback tidak ditemukan",
        )

    # Notifikasi ke user yang mengirim feedback
    create_notification(
        db,
        user_id=fb.user_id,
        sender_id=current_user.id,
        type=NotificationType.ADMIN,
        title="Balasan Feedback",
        message=f"Admin membalas feedback \"{fb.subject}\": {payload.admin_reply[:100]}",
        link="/feedback",
        commit=True,
    )

    logger.info("Admin %s membalas feedback %s", current_user.email, feedback_id)
    item = svc.get_feedback_detail(db, feedback_id)
    return FeedbackWithUser(**item)
