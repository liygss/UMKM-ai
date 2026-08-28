"""Schema untuk dashboard admin monitoring user & paket maintenance."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AdminUserItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: str
    company_name: str | None = None
    plan: str
    is_active: bool
    email_verified: bool
    last_seen_at: datetime | None = None
    maintenance_joined_at: datetime | None = None
    created_at: datetime


class MonthGrowth(BaseModel):
    """Pertumbuhan user per bulan (agregat, tanpa data sensitif)."""
    month: str          # "2026-03"
    label: str          # "Mar 2026"
    total: int
    free: int
    maintenance: int


class AdminSummary(BaseModel):
    total_users: int
    maintenance_users: int
    free_users: int
    new_this_week: int
    new_this_month: int
    unverified_users: int
    monthly_growth: list[MonthGrowth]