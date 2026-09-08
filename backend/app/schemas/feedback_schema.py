"""Schema untuk fitur Feedback / CS (komplain user -> admin)."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class FeedbackCreate(BaseModel):
    """Payload user untuk mengirim feedback."""
    category: str = Field("COMPLAINT", description="COMPLAINT, QUESTION, SUGGESTION, OTHER")
    subject: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)


class FeedbackReply(BaseModel):
    """Payload admin untuk membalas feedback."""
    admin_reply: str = Field(..., min_length=1)
    status: Optional[str] = Field("REPLIED", description="REPLIED atau CLOSED")


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    category: str
    subject: str
    message: str
    status: str
    admin_reply: Optional[str] = None
    replied_at: Optional[datetime] = None
    replied_by_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class FeedbackWithUser(FeedbackResponse):
    """Feedback lengkap dengan info user pengirim."""
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    replied_by_name: Optional[str] = None


class FeedbackStatsResponse(BaseModel):
    total: int = 0
    open: int = 0
    replied: int = 0
    closed: int = 0


class FeedbackListResponse(BaseModel):
    items: list[FeedbackWithUser]
    total: int


# ---------------------------------------------------------------------------
# Exit Feedback (rating saat logout)
# ---------------------------------------------------------------------------
class ExitFeedbackCreate(BaseModel):
    """Payload user untuk mengirim exit feedback (rating singkat saat logout)."""
    rating: int = Field(..., ge=1, le=5, description="Rating 1-5")
    comment: Optional[str] = Field(None, max_length=500)


class ExitFeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime
