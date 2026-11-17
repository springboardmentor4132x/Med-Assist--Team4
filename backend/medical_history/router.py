from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, or_
from sqlalchemy.orm import Session
from app.db import get_db                         # INTEGRATION
from app.auth import get_current_user             # INTEGRATION: user with .id and .role (patient | doctor | admin)

from .models import MedicalHistory, Category, Status, AccessGrant, GrantStatus
from .schemas import (MedicalHistoryIn, MedicalHistoryOut, SymptomContext,
                      AccessRequestIn, DecisionIn, AccessGrantOut)

router = APIRouter(tags=["medical-history"])


def scope(db: Session, user, pid: int, write: bool = False):
    """Returns None (all categories) or a set of allowed category values. Raises 403 when there is no access.
    patient: own record | doctor: only with a patient-approved grant | admin: read-only."""
    if user.role == "patient" and user.id == pid:
        return None
    if user.role == "admin" and not write:
        return None
    if user.role == "doctor":
        g = db.scalar(select(AccessGrant).where(AccessGrant.patient_id == pid, AccessGrant.doctor_id == user.id,
                                                AccessGrant.status == GrantStatus.approved))
        if g:
            return set(g.categories) if g.categories else None
        raise HTTPException(403, "Patient approval required. Send an access request first.")
    raise HTTPException(403, "You don't have access to this patient's records")


def ensure_cat(allowed, category: Category):
    if allowed is not None and category.value not in allowed:
        raise HTTPException(403, "The patient's approval doesn't include this category")


def _get(db: Session, record_id: int, user, write=False):
    rec = db.get(MedicalHistory, record_id)
    if not rec:
        raise HTTPException(404, "Record not found")
    allowed = scope(db, user, rec.patient_id, write)
    ensure_cat(allowed, rec.category)
    return rec, allowed


# ---------------- records ----------------
@router.get("/patients/{patient_id}/medical-history", response_model=list[MedicalHistoryOut])
def list_records(patient_id: int, category: Category | None = None, status_: Status | None = Query(None, alias="status"),
                 q: str | None = None, db: Session = Depends(get_db), user=Depends(get_current_user)):
    allowed = scope(db, user, patient_id)
    stmt = select(MedicalHistory).where(MedicalHistory.patient_id == patient_id)
    if allowed is not None: stmt = stmt.where(MedicalHistory.category.in_([Category(c) for c in allowed]))
    if category: stmt = stmt.where(MedicalHistory.category == category)
    if status_: stmt = stmt.where(MedicalHistory.status == status_)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(MedicalHistory.name.ilike(like), MedicalHistory.provider.ilike(like), MedicalHistory.notes.ilike(like)))
    return db.scalars(stmt.order_by(MedicalHistory.onset_date.desc())).all()


@router.post("/patients/{patient_id}/medical-history", response_model=MedicalHistoryOut, status_code=201)
def create_record(patient_id: int, body: MedicalHistoryIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    ensure_cat(scope(db, user, patient_id, write=True), body.category)
    rec = MedicalHistory(**body.model_dump(), patient_id=patient_id, created_by=user.id, created_by_role=user.role)
    db.add(rec); db.commit(); db.refresh(rec)
    return rec


@router.get("/medical-history/{record_id}", response_model=MedicalHistoryOut)
def get_record(record_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return _get(db, record_id, user)[0]


@router.put("/medical-history/{record_id}", response_model=MedicalHistoryOut)
def update_record(record_id: int, body: MedicalHistoryIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    rec, allowed = _get(db, record_id, user, write=True)
    ensure_cat(allowed, body.category)
    for k, v in body.model_dump().items():
        setattr(rec, k, v)
    db.commit(); db.refresh(rec)
    return rec


@router.delete("/medical-history/{record_id}", status_code=204)
def delete_record(record_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    rec, _ = _get(db, record_id, user, write=True)
    if user.role == "doctor" and rec.created_by != user.id:
        raise HTTPException(403, "Doctors can only delete records they added")
    db.delete(rec); db.commit()


@router.get("/patients/{patient_id}/medical-history/context", response_model=SymptomContext)
def symptom_context(patient_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Used by Symptom Analysis ('medical history integration'). Honors the same approval scope."""
    allowed = scope(db, user, patient_id)
    rows = [r for r in db.scalars(select(MedicalHistory).where(MedicalHistory.patient_id == patient_id)).all()
            if allowed is None or r.category.value in allowed]
    return SymptomContext(
        patient_id=patient_id,
        active_conditions=[r.name for r in rows if r.status == Status.active and r.category != Category.allergy],
        allergies=[r.name for r in rows if r.category == Category.allergy],
        chronic_conditions=[r.name for r in rows if r.category == Category.chronic],
    )


# ---------------- patient approval ----------------
@router.post("/patients/{patient_id}/access-requests", response_model=AccessGrantOut, status_code=201)
def request_access(patient_id: int, body: AccessRequestIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role != "doctor":
        raise HTTPException(403, "Only doctors can request access")
    open_ = db.scalar(select(AccessGrant).where(AccessGrant.patient_id == patient_id, AccessGrant.doctor_id == user.id,
                                                AccessGrant.status.in_([GrantStatus.pending, GrantStatus.approved])))
    if open_:
        raise HTTPException(409, f"You already have a {open_.status.value} request for this patient")
    g = AccessGrant(patient_id=patient_id, doctor_id=user.id, doctor_name=getattr(user, "name", None), message=body.message)
    db.add(g); db.commit(); db.refresh(g)
    return g


@router.get("/access-requests", response_model=list[AccessGrantOut])
def my_requests(db: Session = Depends(get_db), user=Depends(get_current_user)):
    col = AccessGrant.patient_id if user.role == "patient" else AccessGrant.doctor_id
    return db.scalars(select(AccessGrant).where(col == user.id).order_by(AccessGrant.created_at.desc())).all()


@router.post("/access-requests/{grant_id}/decision", response_model=AccessGrantOut)
def decide(grant_id: int, body: DecisionIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    g = db.get(AccessGrant, grant_id)
    if not g or user.role != "patient" or g.patient_id != user.id:
        raise HTTPException(404, "Request not found")
    need = GrantStatus.approved if body.action == "revoke" else GrantStatus.pending
    if g.status != need:
        raise HTTPException(409, f"This request is already {g.status.value}")
    g.status = {"approve": GrantStatus.approved, "deny": GrantStatus.denied, "revoke": GrantStatus.revoked}[body.action]
    if body.action == "approve":
        g.categories = [c.value for c in body.categories] if body.categories else None
    g.decided_at = datetime.utcnow()
    db.commit(); db.refresh(g)
    return g
