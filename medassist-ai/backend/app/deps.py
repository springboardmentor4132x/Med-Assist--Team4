import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import get_db
from .models import AccessGrant, RevokedToken, User
from .security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def _unauthorized(detail: str = "Could not validate credentials"):
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_token(token)
    except jwt.ExpiredSignatureError:
        raise _unauthorized("Session expired. Please log in again.")
    except jwt.PyJWTError:
        raise _unauthorized()

    if db.get(RevokedToken, payload.get("jti")):
        raise _unauthorized("Session ended. Please log in again.")

    user = db.get(User, int(payload["sub"]))
    if user is None or not user.is_active:
        raise _unauthorized()
    return user


def require_roles(*roles: str):
    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "You do not have permission for this action")
        return user

    return checker


def has_grant(db: Session, patient_id: int, grantee_id: int) -> bool:
    q = select(AccessGrant.id).where(
        AccessGrant.patient_id == patient_id, AccessGrant.grantee_id == grantee_id
    )
    return db.execute(q).first() is not None


def can_view_profile(db: Session, actor: User, patient_id: int) -> bool:
    return actor.id == patient_id or actor.role == "admin" or has_grant(db, patient_id, actor.id)


def can_view_history(db: Session, actor: User, patient_id: int) -> bool:
    # Admins manage accounts but do not get clinical records by default.
    return actor.id == patient_id or (
        actor.role in ("doctor", "clinic") and has_grant(db, patient_id, actor.id)
    )
