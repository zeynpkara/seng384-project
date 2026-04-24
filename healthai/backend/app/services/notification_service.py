import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


async def create(
    db: AsyncSession,
    user_id: uuid.UUID,
    type_: str,
    message: str,
) -> Notification:
    notif = Notification(user_id=user_id, type=type_, message=message)
    db.add(notif)
    return notif
