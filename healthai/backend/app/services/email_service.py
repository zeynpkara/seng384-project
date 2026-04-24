import httpx

from app.config import settings

RESEND_URL = "https://api.resend.com/emails"


async def _send(to: str, subject: str, html: str) -> None:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            RESEND_URL,
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": settings.RESEND_FROM_EMAIL,
                "to": [to],
                "subject": subject,
                "html": html,
            },
        )
        response.raise_for_status()


async def send_verification_email(to: str, token: str) -> None:
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    await _send(
        to=to,
        subject="Verify your HEALTH AI account",
        html=f"""
        <h2>Welcome to HEALTH AI</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="{verify_url}" style="
            background:#2563eb;color:#fff;padding:12px 24px;
            border-radius:6px;text-decoration:none;display:inline-block;
        ">Verify Email</a>
        <p>This link expires in 24 hours.</p>
        """,
    )


async def send_meeting_request_notification(to: str, post_title: str) -> None:
    await _send(
        to=to,
        subject="New meeting request on your post",
        html=f"<p>Someone has sent a meeting request for your post: <strong>{post_title}</strong>. Log in to review it.</p>",
    )


async def send_meeting_confirmed_notification(to: str, post_title: str, confirmed_time: str) -> None:
    await _send(
        to=to,
        subject="Meeting confirmed — HEALTH AI",
        html=f"<p>Your meeting for <strong>{post_title}</strong> has been confirmed for <strong>{confirmed_time}</strong>.</p>",
    )
