import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.meeting_request import MeetingRequest


class PostStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    meeting_scheduled = "meeting_scheduled"
    partner_found = "partner_found"
    expired = "expired"


class ProjectStage(str, enum.Enum):
    idea = "idea"
    prototype = "prototype"
    research = "research"
    clinical_trial = "clinical_trial"


class Confidentiality(str, enum.Enum):
    public = "public"
    nda = "nda"


class Post(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "posts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    domain: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    expertise_req: Mapped[str] = mapped_column(String(200), nullable=False)
    project_stage: Mapped[ProjectStage] = mapped_column(Enum(ProjectStage), nullable=False)
    confidentiality: Mapped[Confidentiality] = mapped_column(
        Enum(Confidentiality), nullable=False, default=Confidentiality.public
    )
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[PostStatus] = mapped_column(
        Enum(PostStatus), nullable=False, default=PostStatus.draft, index=True
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    owner: Mapped["User"] = relationship("User", back_populates="posts")
    meeting_requests: Mapped[list["MeetingRequest"]] = relationship(
        "MeetingRequest", back_populates="post", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Post id={self.id} title={self.title!r} status={self.status}>"
