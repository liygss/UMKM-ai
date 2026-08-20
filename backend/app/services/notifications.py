"""
Service untuk sistem notifikasi:
- admin mengirim notifikasi ke user spesifik
- sistem menghasilkan Ringkasan Bulanan otomatis (sekali per bulan per user)
- daftar / tandai dibaca / tandai semua dibaca
"""

from __future__ import annotations

import calendar
from datetime import date, datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.accounting.dashboard_metrics import get_dashboard_summary
from app.config.logging import get_logger
from app.database.models import Notification, NotificationType, User

logger = get_logger(__name__)


def _fmt_rp(value: float) -> str:
    """Format float ke Rupiah tanpa desimal bila bulat (cth: 'Rp 1.250.000')."""
    if value == int(value):
        return f"Rp {value:,.0f}".replace(",", ".")
    return f"Rp {value:,.2f}".replace(",", ".")

# ---------------------------------------------------------------------------
# Buat / simpan
# ---------------------------------------------------------------------------
def create_notification(
    db: Session,
    *,
    user_id: str,
    title: str,
    message: str,
    type: NotificationType = NotificationType.ADMIN,
    link: Optional[str] = None,
    sender_id: Optional[str] = None,
    commit: bool = True,
) -> Notification:
    notif = Notification(
        user_id=user_id,
        sender_id=sender_id,
        type=type,
        title=title,
        message=message,
        link=link,
        is_read=False,
    )
    db.add(notif)
    if commit:
        db.commit()
        db.refresh(notif)
    return notif


# ---------------------------------------------------------------------------
# Daftar / tandai dibaca
# ---------------------------------------------------------------------------
def list_notifications(db: Session, user_id: str) -> list[Notification]:
    """Daftar notifikasi milik user: yang belum dibaca dulu, lalu terbaru."""
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.is_read.asc(), Notification.created_at.desc())
        .all()
    )


def unread_count(db: Session, user_id: str) -> int:
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.is_read == False)  # noqa: E712
        .count()
    )


def mark_read(db: Session, notification_id: str, user_id: str) -> Notification:
    notif = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == user_id)
        .first()
    )
    if notif is None:
        return None
    if not notif.is_read:
        notif.is_read = True
        db.commit()
        db.refresh(notif)
    return notif


def mark_all_read(db: Session, user_id: str) -> int:
    updated = (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.is_read == False)  # noqa: E712
        .update({Notification.is_read: True}, synchronize_session="fetch")
    )
    db.commit()
    return updated


# ---------------------------------------------------------------------------
# Ringkasan Bulanan (sistem)
# ---------------------------------------------------------------------------
def _has_monthly_for_period(db: Session, user_id: str, year: int, month: int) -> bool:
    """Apakah sudah ada notifikasi MONTHLY untuk tahun-bulan ini? Dipakai
    untuk mencegah duplikat (hanya dibuat sekali per bulan)."""
    start = datetime(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    end = datetime(year, month, last_day, 23, 59, 59)
    return (
        db.query(Notification)
        .filter(
            Notification.user_id == user_id,
            Notification.type == NotificationType.MONTHLY,
            Notification.created_at >= start,
            Notification.created_at <= end,
        )
        .first()
        is not None
    )


def generate_monthly_summary(
    db: Session,
    user_id: str,
    *,
    year: Optional[int] = None,
    month: Optional[int] = None,
    sender_id: Optional[str] = None,
    commit: bool = True,
) -> Optional[Notification]:
    """Buat Ringkasan Bulanan untuk user berdasarkan data jurnal.

    - year/month default: bulan sebelum sekarang (e.g., di April 2026 ringkas
      bulan Maret 2026).
    - Tidak dibuat bila sudah ada notifikasi MONTHLY untuk periode itu
      (dedup). Tidak dibuat bila user tidak punya transaksi bulan itu
      supaya tidak spam notifikasi kosong.
    """
    today = date.today()
    if year is None or month is None:
        if today.month == 1:
            y, m = today.year - 1, 12
        else:
            y, m = today.year, today.month - 1
    else:
        y, m = year, month

    if _has_monthly_for_period(db, user_id, y, m):
        return None

    last_day = calendar.monthrange(y, m)[1]
    tanggal_per = date(y, m, last_day)
    summary = get_dashboard_summary(db, tanggal_per, user_id=user_id)

    # Lewati bila tidak ada transaksi di bulan itu (jangan spam notif kosong).
    if summary.jumlah_transaksi_bulan_ini == 0:
        return None

    nama_bulan = _NAMA_BULAN.get(m, str(m))
    pendapatan = _fmt_rp(summary.pendapatan_bulan_ini)
    beban = _fmt_rp(summary.beban_bulan_ini)
    laba = _fmt_rp(summary.laba_rugi_bulan_ini)
    n_tx = summary.jumlah_transaksi_bulan_ini

    if summary.laba_rugi_bulan_ini >= 0:
        pesan = (
            f"Ringkasan {nama_bulan} {y}: pendapatan {pendapatan}, beban {beban}, "
            f"laba {laba} dari {n_tx} transaksi."
        )
    else:
        pesan = (
            f"Ringkasan {nama_bulan} {y}: pendapatan {pendapatan}, beban {beban}, "
            f"rugi {laba} dari {n_tx} transaksi."
        )

    return create_notification(
        db,
        user_id=user_id,
        sender_id=sender_id,
        type=NotificationType.MONTHLY,
        title=f"Ringkasan Bulanan — {nama_bulan} {y}",
        message=pesan,
        link="/dashboard",
        commit=commit,
    )


_NAMA_BULAN = {
    1: "Januari", 2: "Februari", 3: "Maret", 4: "April", 5: "Mei", 6: "Juni",
    7: "Juli", 8: "Agustus", 9: "September", 10: "Oktober", 11: "November", 12: "Desember",
}


# ---------------------------------------------------------------------------
# Admin: daftar user (pemilih penerima)
# ---------------------------------------------------------------------------
def list_users(db: Session) -> list[User]:
    return (
        db.query(User)
        .order_by(User.created_at.asc())
        .all()
    )
