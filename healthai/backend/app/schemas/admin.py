import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.user import UserRole


class UserAdminResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: UserRole
    institution: str | None
    city: str | None
    email_verified: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class SuspendRequest(BaseModel):
    is_active: bool


class ActivityLogResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID | None
    action_type: str
    metadata: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}
