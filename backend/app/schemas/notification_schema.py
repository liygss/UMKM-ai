"""Schema untuk sistem notifikasi (admin -> user, dan ringkasan bulanan sistem)."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class NotificationCreate(BaseModel):
    """Payload admin untuk mengirim notifikasi ke user spesifik."""

    user_id: str = Field(..., description="ID user penerima")
    title: str = Field(..., min_length=1, max_length=150)
    message: str = Field(..., min_length=1)
    link: Optional[str] = Field(None, max_length=200)
    type: str = Field("ADMIN", description="ADMIN (default) atau SYSTEM")


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    sender_id: Optional[str] = None
    type: str
    title: str
    message: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime


class NotificationListResponse(BaseModel):
    items: list[NotificationResponse]
    unread_count: int


class NotificationSendSummary(BaseModel):
    """Admin memicu pembuatan ringkasan bulanan untuk user tertentu."""
    user_id: str
    # Bulan (1-12) yang diringkas. Default: bulan sebelum sekarang.
    year: Optional[int] = None
    month: Optional[int] = None


class AdminUserItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: str
    company_name: Optional[str] = None
    is_active: bool
