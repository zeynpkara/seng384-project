import uuid
from datetime import datetime

from pydantic import BaseModel, field_validator

from app.models.meeting_request import MeetingStatus


class TimeSlot(BaseModel):
    slot: datetime


class MeetingRequestCreate(BaseModel):
    post_id: uuid.UUID
    nda_accepted: bool
    proposed_times: list[TimeSlot]
    message: str | None = None

    @field_validator("proposed_times")
    @classmethod
    def validate_slots(cls, v: list[TimeSlot]) -> list[TimeSlot]:
        if not (1 <= len(v) <= 3):
            raise ValueError("You must propose between 1 and 3 time slots.")
        return v

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 500:
            raise ValueError("Message cannot exceed 500 characters.")
        return v


class MeetingAcceptRequest(BaseModel):
    accepted_time: datetime


class RequesterSummary(BaseModel):
    id: uuid.UUID
    full_name: str
    institution: str | None
    expertise: str | None

    model_config = {"from_attributes": True}


class MeetingRequestResponse(BaseModel):
    id: uuid.UUID
    post_id: uuid.UUID
    status: MeetingStatus
    proposed_times: list[dict]
    accepted_time: datetime | None
    nda_accepted: bool
    message: str | None
    created_at: datetime
    requester: RequesterSummary

    model_config = {"from_attributes": True}
