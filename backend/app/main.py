from datetime import date
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.db import Base, engine, SessionLocal
from app import auth
from medical_history import router as mh_router
from medical_history.models import MedicalHistory, Category, Status

Base.metadata.create_all(engine)
app = FastAPI(title="MedAssist AI")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_methods=["*"], allow_headers=["*"])
app.include_router(auth.router, prefix="/api")
app.include_router(mh_router, prefix="/api")

SAMPLE = [  # demo data for patient 1 (Priya Nair), only inserted into an empty table
    ("Type 2 diabetes", Category.chronic, Status.managed, "2021-03-14", "Dr. Meera Rao", "Diagnosed after routine blood work. Managed with diet, exercise, and quarterly HbA1c checks."),
    ("Penicillin allergy", Category.allergy, Status.active, "2019-08-02", "Dr. Arjun Shetty", "Rash and mild swelling after amoxicillin. Avoid penicillin-class antibiotics."),
    ("Appendectomy", Category.surgery, Status.resolved, "2023-11-20", "Dr. Kavitha Iyer", "Laparoscopic procedure with no complications. Full recovery within three weeks."),
    ("Tetanus booster", Category.immunization, Status.resolved, "2024-06-10", "City Health Clinic", None),
    ("Left ankle sprain", Category.injury, Status.resolved, "2024-02-18", "Dr. Suresh Pillai", "Grade 2 sprain during a trail run. Six weeks of physiotherapy."),
    ("Seasonal asthma", Category.chronic, Status.active, "2020-04-05", "Dr. Meera Rao", "Flares in spring. Uses a rescue inhaler as needed."),
]
with SessionLocal() as db:
    if not db.scalar(select(MedicalHistory.id).limit(1)):
        for n, c, s, d, p, notes in SAMPLE:
            db.add(MedicalHistory(patient_id=1, name=n, category=c, status=s, onset_date=date.fromisoformat(d), provider=p, notes=notes, created_by=1, created_by_role="patient"))
        db.commit()
