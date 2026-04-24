"""Admin-only routes."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import require_admin
from app.models.user import User
from app.schemas.admin import ActivityLogResponse, SuspendRequest, UserAdminResponse
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/api/admin", tags=["admin"])

AdminUser = Annotated[User, Depends(require_admin)]


@router.get("/users", response_model=list[UserAdminResponse])
async def list_users(
    admin: AdminUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    role: str | None = Query(None),
    is_active: bool | None = Query(None),
):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/users/{user_id}", response_model=UserAdminResponse)
async def get_user(user_id: str, admin: AdminUser, db: Annotated[AsyncSession, Depends(get_db)]):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.patch("/users/{user_id}/suspend", response_model=MessageResponse)
async def suspend_user(
    user_id: str,
    body: SuspendRequest,
    admin: AdminUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.delete("/users/{user_id}", response_model=MessageResponse)
async def delete_user(user_id: str, admin: AdminUser, db: Annotated[AsyncSession, Depends(get_db)]):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/posts")
async def list_all_posts(admin: AdminUser, db: Annotated[AsyncSession, Depends(get_db)]):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.delete("/posts/{post_id}", response_model=MessageResponse)
async def remove_post(post_id: str, admin: AdminUser, db: Annotated[AsyncSession, Depends(get_db)]):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/logs", response_model=list[ActivityLogResponse])
async def get_logs(admin: AdminUser, db: Annotated[AsyncSession, Depends(get_db)]):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/logs/export")
async def export_logs(admin: AdminUser, db: Annotated[AsyncSession, Depends(get_db)]):
    raise HTTPException(status_code=501, detail="Not implemented yet")
