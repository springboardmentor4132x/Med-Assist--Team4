from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ChronicConditionDetail(BaseModel):
    title: str
    diagnosed_on: Optional[str] = None
    description: Optional[str] = None


class PatientMedicalContext(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    full_name: str
    age: int
    gender: str
    blood_group: Optional[str] = None

    # Categorized clinical history
    active_conditions: List[str] = Field(default_factory=list, description="Currently active health conditions")
    chronic_conditions: List[str] = Field(default_factory=list, description="Long-term chronic illnesses (e.g., Diabetes, Asthma)")
    known_allergies: List[str] = Field(default_factory=list, description="Known drug, food, or environmental allergies")
    current_medications: List[str] = Field(default_factory=list, description="Prescribed medications currently being taken")
    past_surgeries: List[str] = Field(default_factory=list, description="Past surgical procedures")

    # High-risk flags for symptom correlation & triage
    has_respiratory_history: bool = Field(default=False, description="Flag for asthma, COPD, bronchitis")
    has_cardiovascular_history: bool = Field(default=False, description="Flag for hypertension, heart disease")
    has_diabetic_history: bool = Field(default=False, description="Flag for diabetes")

    # Assessment history summary
    total_past_assessments: int = 0
    last_assessment_date: Optional[str] = None
