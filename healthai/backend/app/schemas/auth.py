from pydantic import BaseModel, EmailStr, field_validator, model_validator

from app.models.user import UserRole
from app.utils.validators import is_edu_email


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    full_name: str

    @field_validator("email")
    @classmethod
    def validate_edu_email(cls, v: str) -> str:
        if not is_edu_email(v):
            raise ValueError("Only institutional .edu or .edu.tr email addresses are accepted.")
        return v.lower()

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: UserRole) -> UserRole:
        if v == UserRole.admin:
            raise ValueError("Admin role cannot be self-assigned during registration.")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("Full name is required.")
        return v.strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class VerifyEmailRequest(BaseModel):
    token: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr
