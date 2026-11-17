import enum
from datetime import datetime, date
from sqlalchemy import Integer, String, Text, Date, DateTime, Enum, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.db import Base  # INTEGRATION: your shared SQLAlchemy Base


class Category(str, enum.Enum):
    chronic = "chronic"; surgery = "surgery"; allergy = "allergy"
    immunization = "immunization"; injury = "injury"; other = "other"


class Status(str, enum.Enum):
    active = "active"; managed = "managed"; resolved = "resolved"


class MedicalHistory(Base):
    __tablename__ = "medical_history"
    __table_args__ = (Index("ix_mh_patient_date", "patient_id", "onset_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(Integer, index=True)  # FK to patients.id once profile module lands
    name: Mapped[str] = mapped_column(String(120))
    category: Mapped[Category] = mapped_column(Enum(Category))
    status: Mapped[Status] = mapped_column(Enum(Status), default=Status.active)
    onset_date: Mapped[date] = mapped_column(Date)
    provider: Mapped[str | None] = mapped_column(String(100))
    notes: Mapped[str | None] = mapped_column(Text)
    created_by: Mapped[int] = mapped_column(Integer)
    created_by_role: Mapped[str] = mapped_column(String(20), default="patient")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


from sqlalchemy import JSON  # noqa: E402


class GrantStatus(str, enum.Enum):
    pending = "pending"; approved = "approved"; denied = "denied"; revoked = "revoked"


class AccessGrant(Base):
    """A doctor's request to work on a patient's record. Only 'approved' grants give access."""
    __tablename__ = "medical_history_access"
    __table_args__ = (Index("ix_acc_patient_doctor", "patient_id", "doctor_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    patient_id: Mapped[int] = mapped_column(Integer, index=True)
    doctor_id: Mapped[int] = mapped_column(Integer, index=True)
    status: Mapped[GrantStatus] = mapped_column(Enum(GrantStatus), default=GrantStatus.pending)
    categories: Mapped[list | None] = mapped_column(JSON)   # None = all categories; else the categories the patient approved
    message: Mapped[str | None] = mapped_column(String(300))
    doctor_name: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime)
