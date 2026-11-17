# MedAssist AI: Medical History Tracking module

Next.js 14 (App Router, TypeScript, Tailwind) + FastAPI + SQLAlchemy. SQLite for local dev, PostgreSQL via DATABASE_URL.

## Run it in VS Code (two terminals)
Requires Python 3.10+ and Node 18+.

Terminal 1, API (http://127.0.0.1:8000, docs at /docs):

    cd backend
    python -m venv .venv
    .venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
    pip install -r requirements.txt
    uvicorn app.main:app --reload

Terminal 2, web (http://localhost:3000):

    cd frontend
    npm install
    npm run dev

Open http://localhost:3000. Sample records for patient Priya Nair are seeded on first start.
Use the "Viewing as" dropdown (top bar): Patient, Doctor, or Admin.

## Try the approval flow
1. Viewing as Doctor: "Patient approval required" -> click Request patient approval.
2. Switch to Patient: the "Doctor access" panel shows the request. Untick types to limit it, then Approve.
3. Switch to Doctor: only approved types show; add/edit works; delete works only on records the doctor added.
4. Patient: Revoke access -> the doctor is blocked again.

## Rules (enforced by the API, not just the UI)
- Patient: add, edit, delete own records. Doctor: only with a patient-approved request, only approved record types;
  adds/edits, deletes only own. Admin: read-only. Records show "Added by doctor".
- GET /api/patients/{id}/medical-history/context feeds Symptom Analysis (respects the same approval scope).

## Replace for production (team integration)
- backend/app/auth.py is a DEV stand-in (dev-login endpoint). Swap in the real JWT/RBAC module; medical_history only needs
  get_current_user() -> object with .id, .role ("patient" | "doctor" | "admin"), .name.
- frontend/lib/auth.tsx is the matching dev stand-in; the API client reads the token from localStorage("token").
- backend/app/db.py: set DATABASE_URL=postgresql+psycopg://... and add Alembic migrations
  (tables: medical_history, medical_history_access). Tables are auto-created for dev only.
- AppShell (sidebar/top bar) is a placeholder; delete it if the main app already has navigation.
- Doctors/admins open /medical-history?patient=<id> (defaults to 1).
- Tailwind is installed (preflight off) so the design-system stylesheet in app/globals.css renders exactly as designed.
