from datetime import date, datetime
from pydantic import BaseModel, Field, field_validator
from typing import Literal
from .models import Category, Status, GrantStatus


class MedicalHistoryIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: Category
    status: Status = Status.active
    onset_date: date
    provider: str | None = Field(default=None, max_length=100)
    notes: str | None = Field(default=None, max_length=600)

    @field_validator("name", "provider", "notes", mode="before")
    @classmethod
    def strip(cls, v):
        return v.strip() if isinstance(v, str) else v

    @field_validator("onset_date")
    @classmethod
    def not_future(cls, v):
        if v > date.today():
            raise ValueError("Date can't be in the future")
        return v


class MedicalHistoryOut(MedicalHistoryIn):
    id: int
    patient_id: int
    created_by: int
    created_by_role: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class SymptomContext(BaseModel):
    """Compact payload the Symptom Analysis / Disease Prediction modules consume."""
    patient_id: int
    active_conditions: list[str]
    allergies: list[str]
    chronic_conditions: list[str]


class AccessRequestIn(BaseModel):
    message: str | None = Field(default=None, max_length=300)


class DecisionIn(BaseModel):
    action: Literal["approve", "deny", "revoke"]
    categories: list[Category] | None = None   # approve only; None = all categories


class AccessGrantOut(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    doctor_name: str | None = None
    status: GrantStatus
    categories: list[Category] | None
    message: str | None
    created_at: datetime
    model_config = {"from_attributes": True}
