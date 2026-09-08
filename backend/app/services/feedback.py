"""
Service untuk fitur Feedback / CS:
- user: kirim feedback, lihat daftar & detail
- admin: lihat semua feedback, balas, ubah status
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config.logging import get_logger
from app.database.models import (
    ExitFeedback,
    Feedback,
    FeedbackCategory,
    FeedbackStatus,
    Notification,
    NotificationType,
    User,
)

logger = get_logger(__name__)


def _safe_category(value: str) -> FeedbackCategory:
    try:
        return FeedbackCategory(value)
    except ValueError:
        return FeedbackCategory.OTHER


def _safe_status(value: str) -> FeedbackStatus:
    try:
        return FeedbackStatus(value)
    except ValueError:
        return FeedbackStatus.OPEN


# ---------------------------------------------------------------------------
# User: kirim feedback
# ---------------------------------------------------------------------------
def create_feedback(
    db: Session,
    *,
    user_id: str,
    category: str,
    subject: str,
    message: str,
    commit: bool = True,
) -> Feedback:
    fb = Feedback(
        user_id=user_id,
        category=_safe_category(category),
        subject=subject.strip(),
        message=message.strip(),
        status=FeedbackStatus.OPEN,
    )
    db.add(fb)
    if commit:
        db.commit()
        db.refresh(fb)
    return fb


# ---------------------------------------------------------------------------
# User: daftar & detail feedback milik user
# ---------------------------------------------------------------------------
def list_user_feedbacks(db: Session, user_id: str) -> list[Feedback]:
    return (
        db.query(Feedback)
        .filter(Feedback.user_id == user_id)
        .order_by(Feedback.created_at.desc())
        .all()
    )


def get_user_feedback(db: Session, feedback_id: str, user_id: str) -> Optional[Feedback]:
    return (
        db.query(Feedback)
        .filter(Feedback.id == feedback_id, Feedback.user_id == user_id)
        .first()
    )


# ---------------------------------------------------------------------------
# Admin: daftar semua feedback (dengan info user)
# ---------------------------------------------------------------------------
def list_all_feedbacks(
    db: Session,
    *,
    status: Optional[str] = None,
    search: Optional[str] = None,
) -> list[dict]:
    q = db.query(Feedback, User.full_name, User.email).join(
        User, Feedback.user_id == User.id
    )
    if status:
        q = q.filter(Feedback.status == _safe_status(status))
    if search:
        like = f"%{search}%"
        q = q.filter(
            (Feedback.subject.ilike(like))
            | (Feedback.message.ilike(like))
            | (User.full_name.ilike(like))
            | (User.email.ilike(like))
        )
    q = q.order_by(Feedback.created_at.desc())
    rows = q.all()

    results = []
    for fb, user_name, user_email in rows:
        replied_by_name = None
        if fb.replied_by_id:
            admin_user = db.query(User).filter(User.id == fb.replied_by_id).first()
            if admin_user:
                replied_by_name = admin_user.full_name
        results.append({
            "id": fb.id,
            "user_id": fb.user_id,
            "category": fb.category.value if isinstance(fb.category, FeedbackCategory) else fb.category,
            "subject": fb.subject,
            "message": fb.message,
            "status": fb.status.value if isinstance(fb.status, FeedbackStatus) else fb.status,
            "admin_reply": fb.admin_reply,
            "replied_at": fb.replied_at,
            "replied_by_id": fb.replied_by_id,
            "created_at": fb.created_at,
            "updated_at": fb.updated_at,
            "user_name": user_name,
            "user_email": user_email,
            "replied_by_name": replied_by_name,
        })
    return results


def get_feedback_detail(db: Session, feedback_id: str) -> Optional[dict]:
    row = (
        db.query(Feedback, User.full_name, User.email)
        .join(User, Feedback.user_id == User.id)
        .filter(Feedback.id == feedback_id)
        .first()
    )
    if not row:
        return None
    fb, user_name, user_email = row
    replied_by_name = None
    if fb.replied_by_id:
        admin_user = db.query(User).filter(User.id == fb.replied_by_id).first()
        if admin_user:
            replied_by_name = admin_user.full_name
    return {
        "id": fb.id,
        "user_id": fb.user_id,
        "category": fb.category.value if isinstance(fb.category, FeedbackCategory) else fb.category,
        "subject": fb.subject,
        "message": fb.message,
        "status": fb.status.value if isinstance(fb.status, FeedbackStatus) else fb.status,
        "admin_reply": fb.admin_reply,
        "replied_at": fb.replied_at,
        "replied_by_id": fb.replied_by_id,
        "created_at": fb.created_at,
        "updated_at": fb.updated_at,
        "user_name": user_name,
        "user_email": user_email,
        "replied_by_name": replied_by_name,
    }


# ---------------------------------------------------------------------------
# Admin: balas & ubah status
# ---------------------------------------------------------------------------
def reply_to_feedback(
    db: Session,
    *,
    feedback_id: str,
    admin_id: str,
    admin_reply: str,
    new_status: Optional[str] = None,
    commit: bool = True,
) -> Optional[Feedback]:
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not fb:
        return None
    fb.admin_reply = admin_reply.strip()
    fb.replied_by_id = admin_id
    fb.replied_at = datetime.now(timezone.utc)
    fb.status = _safe_status(new_status) if new_status else FeedbackStatus.REPLIED
    if commit:
        db.commit()
        db.refresh(fb)
    return fb


# ---------------------------------------------------------------------------
# Admin: statistik
# ---------------------------------------------------------------------------
def get_stats(db: Session) -> dict:
    total = db.query(func.count(Feedback.id)).scalar() or 0
    open_count = (
        db.query(func.count(Feedback.id))
        .filter(Feedback.status == FeedbackStatus.OPEN)
        .scalar()
        or 0
    )
    replied_count = (
        db.query(func.count(Feedback.id))
        .filter(Feedback.status == FeedbackStatus.REPLIED)
        .scalar()
        or 0
    )
    closed_count = (
        db.query(func.count(Feedback.id))
        .filter(Feedback.status == FeedbackStatus.CLOSED)
        .scalar()
        or 0
    )
    return {"total": total, "open": open_count, "replied": replied_count, "closed": closed_count}


# ---------------------------------------------------------------------------
# Exit Feedback: rating singkat saat user logout
# ---------------------------------------------------------------------------
def create_exit_feedback(
    db: Session,
    *,
    user_id: str,
    rating: int,
    comment: str | None = None,
    commit: bool = True,
) -> ExitFeedback:
    ef = ExitFeedback(
        user_id=user_id,
        rating=max(1, min(5, rating)),
        comment=comment.strip() if comment else None,
    )
    db.add(ef)
    if commit:
        db.commit()
        db.refresh(ef)
    return ef
