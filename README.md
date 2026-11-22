# MedAssist AI — Team 4

An intelligent healthcare platform supporting patient profiles, clinical medical history tracking, role-based access control, and symptom analysis.

---

## 🏗️ Project Architecture

All source code is maintained inside the [`medassist-ai/`](./medassist-ai/) directory:

* **Backend (`medassist-ai/backend/`)**: FastAPI, SQLAlchemy 2.0, PostgreSQL, PyJWT, Bcrypt.
* **Frontend (`medassist-ai/frontend/`)**: React 18, Vite, React Router v6, Axios.
* **Database (`medassist-ai/docker-compose.yml`)**: PostgreSQL 16.

---

## 🚀 Modules Implemented

### Module 1: User Management & Authentication
* **Multi-Role RBAC**: Patient, Doctor, Clinic, Administrator.
* **Authentication**: Bcrypt password hashing, JWT tokens with server-side revocation on logout.
* **Patient Profiles**: Personal details, contact, emergency info, and blood group.
* **Medical Records**: Conditions, allergies, medications, and surgeries.
* **Access Delegation**: Patient-controlled consent allowing doctors/clinics to review records.
* **Admin Dashboard**: User management, role elevation, and system metrics.

### Module 2: Symptom Analysis (In Progress)
* **Medical History Integration**: Extracts chronic conditions, active allergies, ongoing medications, and evaluates respiratory, cardiovascular, and diabetic risk indicators to provide clinical context for symptom assessments.
* **Context API**: `GET /api/history/context` for patient evaluation and authorized doctor reviews.
* **UI Clinical Widget**: `MedicalContextCard.jsx` embedded in the symptom assessment workflow.

---

## 💻 Quick Start

### 1. Start the Database
```bash
cd medassist-ai
docker compose up -d
```

### 2. Start the Backend API
```bash
cd medassist-ai/backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```
* Interactive API Documentation: http://localhost:8000/docs
* Default Admin: `admin@medassist.com` / `Admin@12345`

### 3. Start the Frontend Application
```bash
cd medassist-ai/frontend
npm install
npm run dev
```
* Web App: http://localhost:5173
