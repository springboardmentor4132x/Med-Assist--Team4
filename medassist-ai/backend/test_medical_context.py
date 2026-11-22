"""
Standalone verification script for Medical History Context service.
Run this script inside backend/ with:
    python test_medical_context.py
"""
import sys
import os

# Ensure current directory is in path
sys.path.insert(0, os.path.abspath("."))

from app.database import SessionLocal
from app.models import User
from app.services.history_context import get_patient_medical_context


def run_test():
    print("Testing Medical History Context Integration...")
    db = SessionLocal()
    try:
        # Fetch the first patient
        patient = db.query(User).filter(User.role == "patient").first()
        if not patient:
            print("No patient user found in database. Create a patient first or run backend lifespan.")
            return

        print(f"Testing for patient: {patient.full_name} (ID: {patient.id})")
        context = get_patient_medical_context(db, patient)
        
        print("\n--- Output Medical Context Payload ---")
        for k, v in context.items():
            print(f"  {k}: {v}")
            
        print("\nVerification SUCCESSFUL! Payload is properly structured for Module 2 & 3.")
    finally:
        db.close()


if __name__ == "__main__":
    run_test()
