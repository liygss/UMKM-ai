"""Schema untuk register, login, dan token JWT."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.database.models import RoleUser


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: str | None = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password minimal 8 karakter")
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
