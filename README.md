# MedAssist AI (Team 4)

MedAssist AI is a web-based clinical assistant system designed to help users track their medical history, record symptoms, and prepare structured health information for preliminary insights and disease prediction.

## Overview and Structure

The main codebase is located in the `medassist-ai` directory:

- `backend/`: REST API built with FastAPI, SQLAlchemy 2.0, and PostgreSQL. Handles authentication, profile management, medical records, and symptom analysis context.
- `frontend/`: Client application built with React (Vite) and React Router. Provides interfaces for patients, doctors, and administrators.
- `docker-compose.yml`: Local PostgreSQL database configuration.

## Current Progress

### Module 1: User Management and Authentication
- User registration and login with bcrypt password hashing and JWT authentication.
- Role-based access control with distinct permissions for Patient, Doctor, Clinic, and Admin roles.
- Patient profile management (age, gender, contact details, blood group).
- Clinical history tracking (conditions, allergies, ongoing medications, surgeries).
- Access sharing mechanism allowing patients to grant or revoke medical record view permissions to specific doctors or clinics.
- Admin dashboard to manage user accounts and view system statistics.

### Module 2: Symptom Analysis (Medical History Integration)
- Medical history integration service that extracts chronic conditions, active allergies, medications, and identifies key risk factors (respiratory, cardiovascular, diabetic).
- Dedicated context endpoints (`GET /api/history/context`) to supply structured clinical context to the symptom analysis pipeline.
- Front-end clinical context card component to preview relevant health background before running an assessment.

## Running the Application Locally

### 1. Database Setup
Start the local PostgreSQL container:
```bash
cd medassist-ai
docker compose up -d
```

### 2. Backend Setup
Run the FastAPI development server:
```bash
cd medassist-ai/backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```
The API documentation will be available at http://localhost:8000/docs.

### 3. Frontend Setup
In a separate terminal, start the Vite development server:
```bash
cd medassist-ai/frontend
npm install
npm run dev
```
The application will run at http://localhost:5173.
