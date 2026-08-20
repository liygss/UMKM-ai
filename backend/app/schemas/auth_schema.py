"""Schema untuk register, login, dan token JWT."""

import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.database.models import RoleUser


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: str | None = None

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


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: RoleUser
    company_name: str | None = None
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
