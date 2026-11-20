from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_roles
from ..models import AccessGrant, MedicalRecord, User
from ..schemas import AdminGrantIn, Message, RoleUpdate, StatusUpdate, UserOut

router = APIRouter(
    prefix="/api/admin", tags=["Administration"], dependencies=[Depends(require_roles("admin"))]
)


def _get_user(db: Session, user_id: int) -> User:
    u = db.get(User, user_id)
    if u is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return u


@router.get("/users", response_model=List[UserOut])
def list_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    skip: int = 0,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
):
    q = select(User).order_by(User.id)
    if search:
        like = f"%{search}%"
        q = q.where(or_(User.full_name.ilike(like), User.email.ilike(like)))
    if role:
        q = q.where(User.role == role)
    return db.execute(q.offset(skip).limit(limit)).scalars().all()


@router.patch("/users/{user_id}/role", response_model=UserOut)
def change_role(
    user_id: int,
    data: RoleUpdate,
    admin: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    if user_id == admin.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You cannot change your own role")
    u = _get_user(db, user_id)
    u.role = data.role
    db.commit()
    db.refresh(u)
    return u


@router.patch("/users/{user_id}/status", response_model=UserOut)
def change_status(
    user_id: int,
    data: StatusUpdate,
    admin: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
):
    if user_id == admin.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "You cannot deactivate your own account")
    u = _get_user(db, user_id)
    u.is_active = data.is_active
    db.commit()
    db.refresh(u)
    return u


@router.post("/access", response_model=Message, status_code=status.HTTP_201_CREATED)
def admin_grant(data: AdminGrantIn, db: Session = Depends(get_db)):
    patient, grantee = _get_user(db, data.patient_id), _get_user(db, data.grantee_id)
    if patient.role != "patient" or grantee.role not in ("doctor", "clinic"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Grant must be from a patient to a doctor/clinic")
    exists = db.execute(
        select(AccessGrant.id).where(AccessGrant.patient_id == patient.id, AccessGrant.grantee_id == grantee.id)
    ).first()
    if exists:
        raise HTTPException(status.HTTP_409_CONFLICT, "Access already granted")
    db.add(AccessGrant(patient_id=patient.id, grantee_id=grantee.id))
    db.commit()
    return Message(message="Access granted")


@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    by_role = dict(db.execute(select(User.role, func.count()).group_by(User.role)).all())
    return {
        "total_users": sum(by_role.values()),
        "active_users": db.scalar(select(func.count()).select_from(User).where(User.is_active.is_(True))),
        "by_role": by_role,
        "medical_records": db.scalar(select(func.count()).select_from(MedicalRecord)),
        "access_grants": db.scalar(select(func.count()).select_from(AccessGrant)),
    }
