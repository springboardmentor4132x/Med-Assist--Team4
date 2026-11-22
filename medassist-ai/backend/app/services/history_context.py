from typing import Any, Dict
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import MedicalRecord, User


def get_patient_medical_context(db: Session, user: User) -> Dict[str, Any]:
    """
    Extracts, filters, and formats patient medical history specifically
    for the Module 2 Symptom Analysis and Correlation pipeline.
    """
    records = db.execute(
        select(MedicalRecord)
        .where(MedicalRecord.patient_id == user.id)
        .order_by(MedicalRecord.created_at.desc())
    ).scalars().all()

    active_conditions = []
    chronic_conditions = []
    known_allergies = []
    current_medications = []
    past_surgeries = []

    has_respiratory = False
    has_cardio = False
    has_diabetes = False

    respiratory_keywords = ("asthma", "copd", "bronchitis", "pneumonia", "respiratory", "wheezing")
    cardio_keywords = ("heart", "cardio", "hypertension", "blood pressure", "stroke", "infarction", "angina")
    diabetes_keywords = ("diabetes", "diabetic", "insulin", "hyperglycemia")

    for r in records:
        title_clean = r.title.strip()
        title_lower = title_clean.lower()
        rec_type = (r.record_type or "").lower()
        status = (r.status or "").lower()

        # Check conditions
        if rec_type == "condition":
            if status == "chronic":
                chronic_conditions.append(title_clean)
            elif status == "active":
                active_conditions.append(title_clean)

        # Check allergies (any active/chronic allergy is relevant)
        elif rec_type == "allergy" and status in ("active", "chronic"):
            known_allergies.append(title_clean)

        # Check ongoing medications
        elif rec_type == "medication" and status in ("active", "chronic"):
            current_medications.append(title_clean)

        # Check surgeries
        elif rec_type == "surgery":
            past_surgeries.append(title_clean)

        # Evaluate risk flags
        if any(k in title_lower for k in respiratory_keywords):
            has_respiratory = True
        if any(k in title_lower for k in cardio_keywords):
            has_cardio = True
        if any(k in title_lower for k in diabetes_keywords):
            has_diabetes = True

    # Check for past assessment count if table is present
    total_assessments = 0
    last_assessment_date = None
    try:
        from app.models import SymptomAssessment
        from sqlalchemy import func
        total_assessments = db.scalar(
            select(func.count()).select_from(SymptomAssessment).where(SymptomAssessment.user_id == user.id)
        ) or 0
        latest = db.execute(
            select(SymptomAssessment.created_at)
            .where(SymptomAssessment.user_id == user.id)
            .order_by(SymptomAssessment.created_at.desc())
            .limit(1)
        ).scalar_one_or_none()
        if latest:
            last_assessment_date = latest.isoformat()
    except Exception:
        # Gracefully fall back if teammate hasn't created the table yet
        total_assessments = 0
        last_assessment_date = None

    return {
        "user_id": user.id,
        "full_name": user.full_name,
        "age": user.age,
        "gender": user.gender,
        "blood_group": user.blood_group,
        "active_conditions": list(dict.fromkeys(active_conditions)),
        "chronic_conditions": list(dict.fromkeys(chronic_conditions)),
        "known_allergies": list(dict.fromkeys(known_allergies)),
        "current_medications": list(dict.fromkeys(current_medications)),
        "past_surgeries": list(dict.fromkeys(past_surgeries)),
        "has_respiratory_history": has_respiratory,
        "has_cardiovascular_history": has_cardio,
        "has_diabetic_history": has_diabetes,
        "total_past_assessments": total_assessments,
        "last_assessment_date": last_assessment_date,
    }
