import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.user import UserRole


class UserProfileResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: UserRole
    institution: str | None
    city: str | None
    expertise: str | None
    email_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = None
    institution: str | None = None
    city: str | None = None
    expertise: str | None = None
