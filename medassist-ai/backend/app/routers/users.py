from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import can_view_profile, get_current_user
from ..models import User
from ..schemas import ProfileUpdate, UserOut

router = APIRouter(prefix="/api/users", tags=["Profile"])


@router.get("/me", response_model=UserOut)
def get_my_profile(user: User = Depends(get_current_user)):
    return user


@router.put("/me", response_model=UserOut)
def update_my_profile(
    data: ProfileUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    changes = data.model_dump(exclude_unset=True)
    # name/age/gender are required columns: ignore explicit nulls for them
    for field in ("full_name", "age", "gender"):
        if field in changes and changes[field] is None:
            del changes[field]
    for field, value in changes.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, actor: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not can_view_profile(db, actor, user_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You are not authorised to view this profile")
    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return target
