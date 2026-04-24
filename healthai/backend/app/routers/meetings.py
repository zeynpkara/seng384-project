"""Meeting request routes."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from app.database import get_db
from app.middleware.auth import CurrentUser
from app.schemas.meeting import MeetingAcceptRequest, MeetingRequestCreate, MeetingRequestResponse
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


@router.post("", response_model=MeetingRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_meeting_request(
    body: MeetingRequestCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("", response_model=list[MeetingRequestResponse])
async def list_meetings(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    post_id: str | None = Query(None),
    as_: str | None = Query(None, alias="as"),
):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{meeting_id}", response_model=MeetingRequestResponse)
async def get_meeting(
    meeting_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.patch("/{meeting_id}/accept", response_model=MeetingRequestResponse)
async def accept_meeting(
    meeting_id: str,
    body: MeetingAcceptRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.patch("/{meeting_id}/decline", response_model=MessageResponse)
async def decline_meeting(
    meeting_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.patch("/{meeting_id}/complete", response_model=MessageResponse)
async def complete_meeting(
    meeting_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.patch("/{meeting_id}/cancel", response_model=MessageResponse)
async def cancel_meeting(
    meeting_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    raise HTTPException(status_code=501, detail="Not implemented yet")
