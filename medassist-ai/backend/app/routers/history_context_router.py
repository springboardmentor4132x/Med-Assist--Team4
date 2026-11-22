from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import can_view_history, get_current_user, require_roles
from app.models import User
from app.schemas_history_context import PatientMedicalContext
from app.services.history_context import get_patient_medical_context

router = APIRouter(prefix="/api/history", tags=["Medical History Context"])

patient_only = require_roles("patient")


@router.get("/context", response_model=PatientMedicalContext)
def get_my_medical_context(
    user: User = Depends(patient_only),
    db: Session = Depends(get_db),
):
    """
    Returns the summarized medical background of the logged-in patient
    specifically formatted for the Symptom Analysis Module.
    """
    return get_patient_medical_context(db, user)


@router.get("/patient/{patient_id}/context", response_model=PatientMedicalContext)
def get_patient_context_for_doctor(
    patient_id: int,
    actor: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Allows an authorised doctor, clinic, or admin to retrieve a patient's
    medical history context (guarded by Module 1 access consent rules).
    """
    if not can_view_history(db, actor, patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorised to view this patient's medical history",
        )

    patient = db.get(User, patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    return get_patient_medical_context(db, patient)
