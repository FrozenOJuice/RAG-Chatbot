import hmac
from typing import Optional

from fastapi import Header, HTTPException, status

from app.core.config import settings


def require_admin_key(x_admin_key: Optional[str] = Header(default=None)) -> None:
    if not x_admin_key or not hmac.compare_digest(x_admin_key, settings.ADMIN_API_KEY):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin key.",
        )
