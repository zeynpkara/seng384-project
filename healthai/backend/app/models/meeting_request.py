import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.post import Post
    from app.models.user import User


class MeetingStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"


class MeetingRequest(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "meeting_requests"

    post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requester_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[MeetingStatus] = mapped_column(
        Enum(MeetingStatus), nullable=False, default=MeetingStatus.pending, index=True
    )
    proposed_times: Mapped[list] = mapped_column(JSONB, nullable=False)
    accepted_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    nda_accepted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)

    post: Mapped["Post"] = relationship("Post", back_populates="meeting_requests")
    requester: Mapped["User"] = relationship("User", back_populates="meeting_requests")

    def __repr__(self) -> str:
        return f"<MeetingRequest id={self.id} status={self.status}>"
