from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .config import get_settings
from .database import get_db
from .models import User
from .security import decode_token

settings = get_settings()
bearer = HTTPBearer(auto_error=False)


def _user_from_creds(creds, db):
    if creds is None:
        return None
    payload = decode_token(creds.credentials)
    if not payload or "sub" not in payload:
        return None
    return db.get(User, int(payload["sub"]))


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    user = _user_from_creds(creds, db)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Не авторизован")
    return user


def get_current_user_optional(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User | None:
    return _user_from_creds(creds, db)


def require_overseer(user: User = Depends(get_current_user)) -> User:
    if user.role != "overseer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Только для Смотрителя")
    return user


def require_admin(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
    x_api_key: str | None = Header(default=None),
) -> User | None:
    """Overseer JWT (frontend) OR service X-API-Key (bot)."""
    if x_api_key and settings.bot_api_key and x_api_key == settings.bot_api_key:
        return None
    user = _user_from_creds(creds, db)
    if user is not None and user.role == "overseer":
        return user
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ запрещён")
