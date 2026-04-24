import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity_log import ActivityLog


async def log(
    db: AsyncSession,
    action_type: str,
    user_id: uuid.UUID | None = None,
    metadata: dict | None = None,
) -> None:
    entry = ActivityLog(
        user_id=user_id,
        action_type=action_type,
        metadata_=metadata,
    )
    db.add(entry)
