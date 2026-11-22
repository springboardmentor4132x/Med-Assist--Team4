import re
from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from .symptom_catalog import SYMPTOM_SET

Gender = Literal["male", "female", "other"]
RegisterRole = Literal["patient", "doctor", "clinic"]
AnyRole = Literal["patient", "doctor", "clinic", "admin"]
BloodGroup = Literal["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
PHONE_RE = re.compile(r"^\+?[0-9]{7,15}$")


def _clean_phone(v: Optional[str]) -> Optional[str]:
    if v is None or v.strip() == "":
        return None
    cleaned = re.sub(r"[\s-]", "", v)
    if not PHONE_RE.match(cleaned):
        raise ValueError("Enter a valid phone number (7-15 digits, optional leading +)")
    return cleaned


class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)
    age: int = Field(ge=0, le=120)
    gender: Gender
    contact: Optional[str] = None
    role: RegisterRole = "patient"

    @field_validator("full_name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Full name is too short")
        return v

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must contain at least one letter and one number")
        if len(v.encode()) > 72:
            raise ValueError("Password is too long")
        return v

    @field_validator("contact")
    @classmethod
    def phone(cls, v):
        return _clean_phone(v)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: Optional[AnyRole] = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    age: int
    gender: str
    contact: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    age: Optional[int] = Field(default=None, ge=0, le=120)
    gender: Optional[Gender] = None
    contact: Optional[str] = None
    address: Optional[str] = Field(default=None, max_length=255)
    blood_group: Optional[BloodGroup] = None

    @field_validator("contact")
    @classmethod
    def phone(cls, v):
        return _clean_phone(v)


RecordType = Literal["condition", "allergy", "medication", "surgery", "other"]
RecordStatus = Literal["active", "chronic", "resolved"]


class MedicalRecordIn(BaseModel):
    record_type: RecordType = "condition"
    title: str = Field(min_length=2, max_length=150)
    description: Optional[str] = Field(default=None, max_length=2000)
    diagnosed_on: Optional[date] = None
    status: RecordStatus = "active"


class MedicalRecordOut(MedicalRecordIn):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    created_at: datetime


class GrantIn(BaseModel):
    grantee_email: EmailStr


class AdminGrantIn(BaseModel):
    patient_id: int
    grantee_id: int


class RoleUpdate(BaseModel):
    role: AnyRole


class StatusUpdate(BaseModel):
    is_active: bool


class Message(BaseModel):
    message: str


class SymptomSubmit(BaseModel):
    symptoms: list[str] = Field(max_length=50)

    @field_validator("symptoms")
    @classmethod
    def check_symptoms(cls, v: list[str]) -> list[str]:
        if len(v) == 0:
            raise ValueError("Please select at least one symptom.")
        cleaned = []
        for s in v:
            name = s.strip().lower().replace(" ", "_")
            if not name:
                raise ValueError("Symptom names cannot be blank.")
            cleaned.append(name)
        unknown = sorted({s for s in cleaned if s not in SYMPTOM_SET})
        if unknown:
            raise ValueError("Unsupported symptom(s): " + ", ".join(unknown))
        return cleaned


class SymptomAssessmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    selected_symptoms: list[str]
    validation_status: str
    created_at: datetime


class SymptomSubmitResult(BaseModel):
    assessment: SymptomAssessmentOut
    duplicates_removed: int
    message: str


class SymptomOption(BaseModel):
    name: str
    label: str


