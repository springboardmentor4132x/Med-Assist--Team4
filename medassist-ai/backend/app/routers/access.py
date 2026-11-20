from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_roles
from ..models import AccessGrant, User
from ..schemas import GrantIn, Message, UserOut

router = APIRouter(prefix="/api/access", tags=["Access Control"])


@router.get("", response_model=List[UserOut])
def my_grantees(user: User = Depends(require_roles("patient")), db: Session = Depends(get_db)):
    """Doctors/clinics this patient has authorised."""
    q = select(User).join(AccessGrant, AccessGrant.grantee_id == User.id).where(AccessGrant.patient_id == user.id)
    return db.execute(q).scalars().all()


@router.post("", response_model=Message, status_code=status.HTTP_201_CREATED)
def grant_access(data: GrantIn, user: User = Depends(require_roles("patient")), db: Session = Depends(get_db)):
    grantee = db.execute(select(User).where(User.email == data.grantee_email.lower())).scalar_one_or_none()
    if grantee is None or grantee.role not in ("doctor", "clinic") or not grantee.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No active doctor or clinic found with that email")
    exists = db.execute(
        select(AccessGrant.id).where(AccessGrant.patient_id == user.id, AccessGrant.grantee_id == grantee.id)
    ).first()
    if exists:
        raise HTTPException(status.HTTP_409_CONFLICT, "Access already granted")
    db.add(AccessGrant(patient_id=user.id, grantee_id=grantee.id))
    db.commit()
    return Message(message=f"Access granted to {grantee.full_name}")


@router.delete("/{grantee_id}", response_model=Message)
def revoke_access(grantee_id: int, user: User = Depends(require_roles("patient")), db: Session = Depends(get_db)):
    grant = db.execute(
        select(AccessGrant).where(AccessGrant.patient_id == user.id, AccessGrant.grantee_id == grantee_id)
    ).scalar_one_or_none()
    if grant is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Access grant not found")
    db.delete(grant)
    db.commit()
    return Message(message="Access revoked")


@router.get("/patients", response_model=List[UserOut])
def my_patients(user: User = Depends(require_roles("doctor", "clinic")), db: Session = Depends(get_db)):
    """Patients who have authorised the current doctor/clinic."""
    q = select(User).join(AccessGrant, AccessGrant.patient_id == User.id).where(AccessGrant.grantee_id == user.id)
    return db.execute(q).scalars().all()
