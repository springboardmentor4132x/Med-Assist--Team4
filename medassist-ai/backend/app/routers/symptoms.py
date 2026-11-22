from typing import List

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import SymptomAssessment, User
from ..schemas import SymptomAssessmentOut, SymptomOption, SymptomSubmit, SymptomSubmitResult
from ..symptom_catalog import SYMPTOMS, label

router = APIRouter(prefix="/api/symptoms", tags=["Symptom Analysis"])


@router.get("", response_model=List[SymptomOption])
def list_symptoms(search: str = Query(default="", max_length=50), _: User = Depends(get_current_user)):
    """Supported symptoms; optional ?search=text filters them."""
    q = search.strip().lower().replace(" ", "_")
    return [{"name": s, "label": label(s)} for s in SYMPTOMS if q in s]


@router.post("/assessments", response_model=SymptomSubmitResult, status_code=status.HTTP_201_CREATED)
def submit_symptoms(data: SymptomSubmit, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Save a validated symptom selection for the logged-in user."""
    unique = list(dict.fromkeys(data.symptoms))  # removes duplicates, keeps the order
    removed = len(data.symptoms) - len(unique)

    assessment = SymptomAssessment(user_id=user.id, selected_symptoms=unique)
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    message = "Symptoms saved."
    if removed:
        message += f" {removed} duplicate(s) removed."
    return SymptomSubmitResult(
        assessment=SymptomAssessmentOut.model_validate(assessment),
        duplicates_removed=removed,
        message=message,
    )


@router.get("/assessments", response_model=List[SymptomAssessmentOut])
def my_assessments(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """The logged-in user's own past assessments, newest first."""
    q = (
        select(SymptomAssessment)
        .where(SymptomAssessment.user_id == user.id)
        .order_by(SymptomAssessment.created_at.desc())
    )
    return db.execute(q).scalars().all()