# MedAssist AI - Module 1: User Management

FastAPI + PostgreSQL backend, React (Vite) frontend.
Covers: registration, JWT login/logout, protected routes, patient profile, RBAC
(patient / doctor / clinic / admin), medical history tracking.

## 1. Install first (one time)

| Tool | Version | Check |
|---|---|---|
| Python | 3.10 - 3.13 | `python --version` |
| Node.js (includes npm) | 18+ (LTS) | `node --version` |
| PostgreSQL | 14+ (or Docker Desktop) | `psql --version` |
| Git | any | `git --version` |
| VS Code | any | - |
| Postman (optional) | any | or use http://localhost:8000/docs |

## 2. Database (choose ONE)

**A. Docker (easiest):** from this folder run `docker compose up -d`.
Creates DB `medassist` (user `postgres`, password `postgres`). Nothing else to do.

**B. Local PostgreSQL:** open pgAdmin or psql and run:
`CREATE DATABASE medassist;`
Then edit `DATABASE_URL` in `backend/.env` with your postgres password.

## 3. Backend

```bash
cd backend
python -m venv venv
# Windows:  venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # Windows: copy .env.example .env
uvicorn app.main:app --reload
```
- API docs: http://localhost:8000/docs
- Tables + default admin (admin@medassist.com / Admin@12345) are created on first start.
- Change `SECRET_KEY` in `.env` to any long random string.

## 4. Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## 5. Test checklist (demo for Milestone 1)

1. Register a patient -> success message; register same email again -> "account already exists".
2. Register a doctor (different email).
3. Log in as patient -> Profile -> edit age/contact -> save.
4. Medical History -> add / edit / delete a record.
5. Sharing -> grant access using the doctor's email.
6. Log in as doctor -> My Patients -> open patient (read-only history).
7. Try opening /admin as patient -> redirected (RBAC).
8. Log in as admin -> Admin: change a role, deactivate a user.
9. Logout, then reuse old token in /docs -> 401 (token revoked).
10. In pgAdmin check `users.hashed_password` is a bcrypt hash, not plain text.

## 6. Milestone 1 remaining items (outside this code)

- Architecture + DB schema: see the PDF diagram and `docs/DATABASE_SCHEMA.md`.
- UI wireframes: sketch the pages in this app (Figma / draw.io screenshots).
- Datasets: download per `datasets/README.md` and load them in a notebook.
- Symptom collection workflow: belongs to Module 2 (next).
