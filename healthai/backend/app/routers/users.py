"""User profile and GDPR routes."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import CurrentUser
from app.schemas.common import MessageResponse
from app.schemas.user import ProfileUpdateRequest, UserProfileResponse

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserProfileResponse)
async def get_profile(current_user: CurrentUser):
    return current_user


@router.put("/me", response_model=UserProfileResponse)
async def update_profile(
    body: ProfileUpdateRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    return current_user


@router.delete("/me", response_model=MessageResponse)
async def delete_account(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/me/export")
async def export_data(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    raise HTTPException(status_code=501, detail="Not implemented yet")
