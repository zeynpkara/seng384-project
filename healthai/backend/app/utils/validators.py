import re

EDU_EMAIL_PATTERN = re.compile(r"^[^@]+@[^@]+\.edu(\.tr)?$", re.IGNORECASE)


def is_edu_email(email: str) -> bool:
    return bool(EDU_EMAIL_PATTERN.match(email))
