"""Schema untuk register, login, dan token JWT."""

import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.database.models import PlanUser, RoleUser


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: str | None = None
    plan: PlanUser = PlanUser.FREE

    @field_validator("password", mode="after")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password minimal 8 karakter")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password harus mengandung huruf besar (A-Z)")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password harus mengandung huruf kecil (a-z)")
        if not re.search(r"\d", v):
            raise ValueError("Password harus mengandung angka (0-9)")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str

    @field_validator("password", mode="after")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password minimal 8 karakter")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password harus mengandung huruf besar (A-Z)")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password harus mengandung huruf kecil (a-z)")
        if not re.search(r"\d", v):
            raise ValueError("Password harus mengandung angka (0-9)")
        return v


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: RoleUser
    company_name: str | None = None
    plan: PlanUser = PlanUser.FREE
    maintenance_joined_at: datetime | None = None
    last_seen_at: datetime | None = None
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class AdminUserCreate(BaseModel):
    """Admin membuat user baru (bisa langsung sebagai ADMIN)."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    company_name: str | None = None
    role: RoleUser = RoleUser.OWNER
    plan: PlanUser = PlanUser.FREE


class AdminUserUpdate(BaseModel):
    """Admin mengelola user: role, plan, status aktif."""
    full_name: str | None = None
    company_name: str | None = None
    role: RoleUser | None = None
    plan: PlanUser | None = None
    is_active: bool | None = None
