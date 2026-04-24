"""Post routes — CRUD and lifecycle management."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import CurrentUser
from app.schemas.common import MessageResponse
from app.schemas.post import PostCreate, PostListResponse, PostResponse, PostStatusUpdate, PostUpdate

router = APIRouter(prefix="/api/posts", tags=["posts"])

# Route stubs — full implementation in Phase 2 when backend connects to DB


@router.get("", response_model=PostListResponse)
async def list_posts(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    domain: str | None = Query(None),
    city: str | None = Query(None),
    status: str | None = Query(None),
    expertise: str | None = Query(None),
    q: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    body: PostCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/mine", response_model=PostListResponse)
async def my_posts(current_user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: str, current_user: CurrentUser, db: Annotated[AsyncSession, Depends(get_db)]):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: str,
    body: PostUpdate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.patch("/{post_id}/status", response_model=PostResponse)
async def change_status(
    post_id: str,
    body: PostStatusUpdate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.delete("/{post_id}", response_model=MessageResponse)
async def delete_post(
    post_id: str,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    raise HTTPException(status_code=501, detail="Not implemented yet")
