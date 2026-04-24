import uuid
from datetime import datetime

from pydantic import BaseModel, field_validator

from app.models.post import Confidentiality, PostStatus, ProjectStage


class PostCreate(BaseModel):
    title: str
    domain: str
    expertise_req: str
    project_stage: ProjectStage
    confidentiality: Confidentiality = Confidentiality.public
    city: str
    description: str
    status: PostStatus = PostStatus.draft

    @field_validator("status")
    @classmethod
    def validate_initial_status(cls, v: PostStatus) -> PostStatus:
        if v not in (PostStatus.draft, PostStatus.active):
            raise ValueError("Initial post status must be 'draft' or 'active'.")
        return v

    @field_validator("title", "domain", "expertise_req", "city")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("This field cannot be empty.")
        return v.strip()

    @field_validator("description")
    @classmethod
    def description_min_length(cls, v: str) -> str:
        if len(v.strip()) < 20:
            raise ValueError("Description must be at least 20 characters.")
        return v.strip()


class PostUpdate(BaseModel):
    title: str | None = None
    domain: str | None = None
    expertise_req: str | None = None
    project_stage: ProjectStage | None = None
    confidentiality: Confidentiality | None = None
    city: str | None = None
    description: str | None = None


class PostStatusUpdate(BaseModel):
    status: PostStatus

    @field_validator("status")
    @classmethod
    def validate_manual_transition(cls, v: PostStatus) -> PostStatus:
        allowed = (PostStatus.active, PostStatus.partner_found)
        if v not in allowed:
            raise ValueError("Manual status change only supports: 'active', 'partner_found'.")
        return v


class OwnerSummary(BaseModel):
    id: uuid.UUID
    full_name: str
    institution: str | None
    city: str | None

    model_config = {"from_attributes": True}


class PostResponse(BaseModel):
    id: uuid.UUID
    title: str
    domain: str
    expertise_req: str
    project_stage: ProjectStage
    confidentiality: Confidentiality
    city: str
    description: str
    status: PostStatus
    expires_at: datetime | None
    created_at: datetime
    updated_at: datetime
    owner: OwnerSummary

    model_config = {"from_attributes": True}


class PostListResponse(BaseModel):
    items: list[PostResponse]
    page: int
    limit: int
    total: int
