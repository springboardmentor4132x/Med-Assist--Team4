from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import can_view_history, get_current_user, require_roles
from ..models import MedicalRecord, User
from ..schemas import Message, MedicalRecordIn, MedicalRecordOut

router = APIRouter(prefix="/api/history", tags=["Medical History"])

patient_only = require_roles("patient")


def _own_record(db: Session, record_id: int, user: User) -> MedicalRecord:
    rec = db.get(MedicalRecord, record_id)
    if rec is None or rec.patient_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Record not found")
    return rec


@router.get("", response_model=List[MedicalRecordOut])
def my_history(user: User = Depends(patient_only), db: Session = Depends(get_db)):
    q = select(MedicalRecord).where(MedicalRecord.patient_id == user.id).order_by(MedicalRecord.created_at.desc())
    return db.execute(q).scalars().all()


@router.post("", response_model=MedicalRecordOut, status_code=status.HTTP_201_CREATED)
def add_record(data: MedicalRecordIn, user: User = Depends(patient_only), db: Session = Depends(get_db)):
    rec = MedicalRecord(patient_id=user.id, **data.model_dump())
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


@router.put("/{record_id}", response_model=MedicalRecordOut)
def update_record(
    record_id: int, data: MedicalRecordIn, user: User = Depends(patient_only), db: Session = Depends(get_db)
):
    rec = _own_record(db, record_id, user)
    for k, v in data.model_dump().items():
        setattr(rec, k, v)
    db.commit()
    db.refresh(rec)
    return rec


@router.delete("/{record_id}", response_model=Message)
def delete_record(record_id: int, user: User = Depends(patient_only), db: Session = Depends(get_db)):
    rec = _own_record(db, record_id, user)
    db.delete(rec)
    db.commit()
    return Message(message="Record deleted")


@router.get("/patient/{patient_id}", response_model=List[MedicalRecordOut])
def patient_history(patient_id: int, actor: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Own history, or a patient's history for a doctor/clinic they authorised (read-only)."""
    if not can_view_history(db, actor, patient_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "You are not authorised to view this history")
    q = select(MedicalRecord).where(MedicalRecord.patient_id == patient_id).order_by(MedicalRecord.created_at.desc())
    return db.execute(q).scalars().all()
