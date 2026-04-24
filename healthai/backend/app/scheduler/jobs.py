from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select, update

from app.database import AsyncSessionLocal
from app.models.post import Post, PostStatus

scheduler = AsyncIOScheduler()


async def expire_stale_posts() -> None:
    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(Post.id).where(
                Post.status == PostStatus.active,
                Post.expires_at <= now,
            )
        )
        post_ids = result.scalars().all()

        if post_ids:
            await db.execute(
                update(Post)
                .where(Post.id.in_(post_ids))
                .values(status=PostStatus.expired)
            )
            await db.commit()


def start_scheduler() -> None:
    scheduler.add_job(expire_stale_posts, "cron", hour=2, minute=0, id="expire_posts")
    scheduler.start()


def stop_scheduler() -> None:
    scheduler.shutdown()
