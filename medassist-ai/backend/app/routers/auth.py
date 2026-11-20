from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user, oauth2_scheme
from ..models import RevokedToken, User
from ..schemas import LoginRequest, Message, TokenOut, UserOut, UserRegister
from ..security import create_access_token, decode_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _authenticate(db: Session, email: str, password: str) -> User:
    user = db.execute(select(User).where(User.email == email.lower())).scalar_one_or_none()
    if user is None or not verify_password(password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This account has been deactivated")
    return user


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    email = data.email.lower()
    if db.execute(select(User.id).where(User.email == email)).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")

    user = User(
        full_name=data.full_name,
        email=email,
        hashed_password=hash_password(data.password),
        age=data.age,
        gender=data.gender,
        contact=data.contact,
        role=data.role,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:  # two simultaneous registrations with the same email
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenOut)
def login(data: LoginRequest, db: Session = Depends(get_db)):
        user = _authenticate(db, data.email, data.password)
        if data.role and data.role != user.role:
         raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            f"This account is registered as '{user.role}', not '{data.role}'. Please select the correct role.",
        )
        return TokenOut(access_token=create_access_token(user.id, user.role), user=user)


@router.post("/token")
def token_for_swagger(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Form-based login used by the 'Authorize' button in /docs (username = email)."""
    user = _authenticate(db, form.username, form.password)
    return {"access_token": create_access_token(user.id, user.role), "token_type": "bearer"}


@router.post("/logout", response_model=Message)
def logout(
    token: str = Depends(oauth2_scheme),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payload = decode_token(token)
    db.merge(
        RevokedToken(
            jti=payload["jti"],
            expires_at=datetime.fromtimestamp(payload["exp"], tz=timezone.utc),
        )
    )
    db.commit()
    return Message(message="Logged out successfully")
